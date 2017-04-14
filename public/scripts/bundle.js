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
  this.score = 0;
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
// html elements
var sound = void 0;

// set up on start
var appInit = function appInit() {
  // hook up name button
  var submit = document.getElementById('submitBtn');
  submit.onclick = function () {
    console.log('join');
    attemptJoin();
  };
  setupSocketIO(); // handles communication with the server
  PrepareSounds();
  document.addEventListener('keydown', enterKeyDown);
};

var enterKeyDown = function enterKeyDown(e) {
  //handle enter key pressed
  var keyPressed = e.which;

  // ENTER
  if (keyPressed === 13) {
    console.log("asdf");
    if (!playing) attemptJoin();
  }
};

var PrepareSounds = function PrepareSounds() {
  sound = document.querySelector("audio");
  /*createjs.Sound.addEventListener("fileload", handleLoadComplete);
  createjs.Sound.registerSound({src:"sounds/Powerup.wav", id:"sound"});
  const handleLoadComplete = (event) => {
    createjs.Sound.play("sound");
  }*/
};

var playSound = function playSound(name) {
  var mediaElem = undefined;
  switch (name) {
    case "hit":
      mediaElem = sound;
  }
  if (mediaElem && mediaElem.paused) {
    mediaElem.play();
  }
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
  controllerSocket.on('player disconnected', function (msg) {
    removeAvatar(msg);
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
// reference to the ball
var ball = new Ball();
// list of the bricks
var bricks = [];
// game started
var playing = false;

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

  // draw bricks
  ctx.fillStyle = "#444444";
  bricks.forEach(function (b) {
    ctx.fillRect(b.x, b.y, b.w, b.w);
  });

  // draw players
  for (var name in players) {
    if (players.hasOwnProperty(name)) {
      var p = players[name];
      ctx.fillStyle = p.color;
      ctx.fillText(name + "(" + p.score + ")", p.x + 5, p.y + 72);
      if (ball.hit && ball.ownerName == p.name) {
        ctx.fillRect(p.x - 5, p.y - 5, 60, 60);
      } else {
        ctx.fillRect(p.x, p.y, 50, 50);
      }
    }
  }

  // draw ball
  if (players[ball.ownerName]) {
    ctx.fillStyle = players[ball.ownerName].color;
  } else {
    ctx.fillStyle = "white";
  }
  var size = 10;
  var offset = 0;
  if (ball.hit) {
    size = 20;
    offset = -5;
  }
  ctx.fillRect(ball.x + offset, ball.y + offset, size, size);
};

// get a random color
var randC = function randC() {
  return Math.floor(Math.random() * 255) + 100;
};

// player disconnected, stop drawing their avatar
var removeAvatar = function removeAvatar(name) {
  delete players[name];
};

var handleMessageFromServer = function handleMessageFromServer(msg) {
  // update ball
  ball = msg.ball;
  // update blocks
  bricks = msg.bricks;
  // update other players
  for (var characterName in msg.characters) {
    if (characterName === myName) {
      players[characterName].score = msg.characters[characterName].score;
      continue;
    }
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

  // check hit for sound
  if (ball.hit) playSound("hit");

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
  // note
  playing = true;
};
//window.addEventListener('load', init);
"use strict";

var lerp = function lerp(x, y, a) {
  return (y - x) * a + x;
};
