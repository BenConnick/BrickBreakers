"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ball = function Ball() {
  _classCallCheck(this, Ball);

  // position (animated)
  this.x = 400;
  this.y = 400;
  // velocity
  this.vx = 3;
  this.vy = 3;
  this.prevX = 0; // last known x location of ball
  this.prevY = 0; // last known y location of ball
  this.destX = 0; // destination x location of ball
  this.destY = 0; // destination y location of ball
  this.ownerName = undefined; // owner name
  this.alpha = 0;
};
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Character class
var Character = function Character(name) {
  var _this = this;

  _classCallCheck(this, Character);

  this.name = name; // character's unique id
  // last time this character was updated
  this.lastUpdate = new Date().getTime(); // oldest possible
  this.x = 0; // x location of character on screen
  this.y = 0; // y location of character on screen
  this.prevX = 0; // last known x location of character
  this.prevY = 0; // last known y location of character
  this.destX = 0; // destination x location of character
  this.destY = 0; // destination y location of character
  this.height = 100; // height of character
  this.width = 100; // width of character
  this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
  this.moveLeft = false; // if character is moving left
  this.moveRight = false; // if character is moving right
  this.moveDown = false; // if character is moving down
  this.moveUp = false; // if character is moving up
  this.vx = 0; // x velocity
  this.vy = 0; // y velocity
  this.color = "rgb(1,1,1)";
  this.move = function () {
    var square = _this;

    // apply friction
    square.vx *= 0.8;
    square.vy *= 0.8;

    //move the last x/y to our previous x/y variables
    square.prevX = square.x;
    square.prevY = square.y;

    //if user is jumping, decrease y velocity
    if (square.moveUp) {
      square.vy = -5;
    }
    //if user is moving down, increase y velocity
    if (square.moveDown) {
      square.vy = 5;
    }
    //if user is moving left, decrease x velocity
    if (square.moveLeft) {
      square.vx = -5;
    }
    //if user is moving right, increase x velocity
    if (square.moveRight) {
      square.vx = 5;
    }

    // add velocity with dt to get desired position
    square.destY = square.prevY + square.vy;
    square.destX = square.prevX + square.vx;

    // clamp bounds
    // ---------------------------------------
    if (square.destY < 0) {
      square.destY = 0;
    }
    if (square.destY > canvas.width) {
      square.destY = canvas.width;
    }
    if (square.destX < 0) {
      square.destX = 0;
    }
    if (square.destX > canvas.height) {
      square.destX = canvas.height;
    }
    // ---------------------------------------

    // set pos
    square.x = square.destX;
    square.y = square.destY;
  };
  this.lerp = function () {
    var square = _this;

    //if alpha less than 1, increase it by 0.01
    if (square.alpha < 1) square.alpha += 0.05;

    //calculate lerp of the x/y from the destinations
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);
  };
};
'use strict';

// sockets and online things
var controllerSocket = io();
var myName = 'bob';
var roomKey = '';

// set up on start
var appInit = function appInit() {
  // hook up name button
  var submit = document.getElementById('submitBtn');
  submit.onclick = function () {
    console.log('join');
    attemptJoin();
  };
  // handles communication with the server
  setupSocketIO();
};

// join a game
var attemptJoin = function attemptJoin() {
  myName = document.getElementById('nameInput').value;
  roomKey = document.getElementById('roomInput').value.toUpperCase();
  var json = '{ "name": "' + myName + '", ' + ('"roomKey": "' + roomKey + '" }');
  controllerSocket.emit('join', json);
};

// game replied OK
var joinSucceed = function joinSucceed() {
  document.getElementById('nameScreen').style.display = 'none';
  initGame();
};

// if there was an error, alert
var joinFail = function joinFail(status) {
  alert(status);
};

// 
var send = function send(msgType, msg) {
  controllerSocket.emit(msgType, msg);
};

// window onload, initialize
window.addEventListener('load', appInit);

// setup sockets
var setupSocketIO = function setupSocketIO() {
  controllerSocket.on('output', function (msg) {
    handleMessageFromServer(msg);
  });
  controllerSocket.on('join status', function (status) {
    if (status == 'success') {
      joinSucceed();
    } else {
      joinFail(status);
    }
  });
};
"use strict";

// *** GAME SCRIPT ***

// canvas elem
var canvas = void 0;
var ctx = void 0;
// the dictionary of players
var players = {};
var ball = new Ball();

var directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7
};

// draw to the screen
var draw = function draw() {
  // clear color
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw players
  for (var name in players) {
    if (players.hasOwnProperty(name)) {
      var p = players[name];
      ctx.fillStyle = p.color;
      ctx.fillText("" + name, p.x + 5, p.y + 65);
      ctx.fillRect(p.x, p.y, 50, 50);
    }
  }

  // draw ball
  if (players[ball.owner]) {
    ctx.fillStyle = players[ball.owner].color;
  } else {
    ctx.fillStyle = "white";
  }
  var size = 10;
  if (ball.hit) size = 15;
  ctx.fillRect(ball.x, ball.y, size, size);

  /*
  // reset transform (scale 3)
  const gScale = 2;
  ctx.setTransform(gScale, 0, 0, gScale, 0, gScale);
  // draw floor
  currentFloor.display(ctx);
   // asfdasdfasfd
  let index = 0;
  // draw players
  players.forEach((player) => {
    index++;
    if (player.visible) {
      player.draw(ctx);
    }
    if (player.actionsLeft === 0) {
      console.log(player.actionsLeft);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      console.log(i);
      // ctx.arc(100,100,30,0,2*Math.PI,true);
      ctx.arc(canvas.width / 2 - 40, 10 + 15 * index, 10, 0, 2 * Math.PI, true);
      // ctx.arc(canvas.width - 40,20+20*i,10,0,2*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.fillText(`P${index}`, canvas.width / 2 - 46, 14 + 15 * index);
    }
  });
  // draw enemies
  currentFloor.enemies.forEach((enemy) => {
    if (currentFloor.rooms[enemy.roomNum].visible) { enemy.draw(ctx); }
  });
  currentFloor.items.forEach((item) => {
    if (currentFloor.rooms[item.roomNum].visible) { item.draw(ctx); }
  });
  // draw the effects
  effectsManager.updateAll();
  effectsManager.drawAll(ctx);
  // draw the "timer" indicator
  // drawTimer(ctx,{x: 600, y: 50},gameTime%turnInterval/turnInterval);
  */
};

// get a random color
var randC = function randC() {
  return Math.floor(Math.random() * 255) + 100;
};

var handleMessageFromServer = function handleMessageFromServer(msg) {
  // update ball
  ball = msg.ball;
  // update other players
  for (var characterName in msg.characters) {
    if (characterName === myName) continue;
    if (msg.characters.hasOwnProperty(characterName)) {
      var c = msg.characters[characterName];
      players[characterName] = c;
    }
  }
};

// add a new player
var addPlayer = function addPlayer(name) {
  // already added
  if (players[name]) return;
  players[name] = new Character(name);
  players[name].color = "rgb(" + randC() + "," + randC() + "," + randC() + ")";
  console.log(players[name].color);

  /*if (getPlayer(name)) return;
  console.log(`added ${name}`);
  const newb = new Player(name, type);
  newb.x = spawn.x;
  newb.y = spawn.y;
  newb.prevPos.x = spawn.x;
  newb.prevPos.y = spawn.y;
  players.push(newb);
  return newb;
  console.log(players);*/
};

//handle for key down events
var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    players[myName].moveUp = true;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      players[myName].moveLeft = true;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        players[myName].moveDown = true;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          players[myName].moveRight = true;
        }
};

//handler for key up events
var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;

  // W OR UP
  if (keyPressed === 87 || keyPressed === 38) {
    players[myName].moveUp = false;
  }
  // A OR LEFT
  else if (keyPressed === 65 || keyPressed === 37) {
      players[myName].moveLeft = false;
    }
    // S OR DOWN
    else if (keyPressed === 83 || keyPressed === 40) {
        players[myName].moveDown = false;
      }
      // D OR RIGHT
      else if (keyPressed === 68 || keyPressed === 39) {
          players[myName].moveRight = false;
        }
};

var SendPositionUpdate = function SendPositionUpdate() {
  send("position", players[myName]);
};

var lerpCharacter = function lerpCharacter(square) {
  //if alpha less than 1, increase it by 0.01
  if (square.alpha < 1) square.alpha += 0.05;

  //calculate lerp of the x/y from the destinations
  square.x = lerp(square.prevX, square.destX, square.alpha);
  square.y = lerp(square.prevY, square.destY, square.alpha);
};

// modify tick-based game values
var update = function update() {
  // move me
  players[myName].move();
  // move players
  for (var name in players) {
    if (players.hasOwnProperty(name)) {
      lerpCharacter(players[name]);
    }
  }
  // move ball
  lerpCharacter(ball);

  // update serve on my position
  SendPositionUpdate();
};

// every tick
var gameLoop = function gameLoop() {
  update();
  draw();
  window.requestAnimationFrame(gameLoop);
};

// canvas fullscreen (all supported browsers)
var fullScreen = function fullScreen() {
  var elem = canvas;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
};

var linkEvents = function linkEvents() {
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

// initialize variables
var initGame = function initGame() {
  canvas = document.querySelector('canvas');
  canvas.onclick = fullScreen;
  ctx = canvas.getContext('2d');

  // misc.
  ctx.font = "20px Arial";

  // add self
  addPlayer(myName);

  // link events
  linkEvents();
  // let the games begin
  gameLoop();
};
//window.addEventListener('load', init);
"use strict";

var lerp = function lerp(x, y, a) {
  return (y - x) * a + x;
};
