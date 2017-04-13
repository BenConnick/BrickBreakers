// *** GAME SCRIPT ***

// canvas elem
let canvas;
let ctx;
// the dictionary of players
const players = {};
// reference to the ball
const ball = new Ball();
// list of the bricks
const bricks = [];

const directions = {
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
const draw = () => {
  // clear color
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  // draw bricks
  ctx.fillStyle = "#444444";
  bricks.forEach((b) => {
      ctx.fillRect(b.x,b.y,b.w,b.w);
  });
  
  // draw players
  for (let name in players) {
    if (players.hasOwnProperty(name)) {
        const p = players[name];
        ctx.fillStyle = p.color;
        ctx.fillText(`${name}(${p.score})`, p.x + 5,p.y + 65);
        ctx.fillRect(p.x,p.y,50,50);
    }
  }
  
  // draw ball
  if (players[ball.ownerName]) {
    ctx.fillStyle = players[ball.ownerName].color;
  } else {
    ctx.fillStyle = "white";
  }
  let size = 10;
  if (ball.hit) size = 20;
  ctx.fillRect(ball.x,ball.y,size,size);
};

// get a random color
const randC = () => {
  return Math.floor(Math.random() * 255) + 100;
}

// player disconnected, stop drawing their avatar
const removeAvatar = (name) => {
  delete players[name];
}

const handleMessageFromServer = (msg) => {
  // update ball
  ball = msg.ball;
  // update blocks
  bricks = msg.bricks;
  // update other players
  for (let characterName in msg.characters) {
    if (characterName === myName) {
      players[characterName].score = msg.characters[characterName].score;
      continue;
    }
    if (msg.characters.hasOwnProperty(characterName)) {
      const c = msg.characters[characterName];
      players[characterName] = c;
    }
  }
}

// add a new player
const addPlayer = (name) => {
  // already added
  if (players[name]) return;
  players[name] = new Character(name);
  players[name].color = `rgb(${randC()},${randC()},${randC()})`;
  console.log(players[name].color);
};

//handle for key down events
const keyDownHandler = (e) => {
  let keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    players[myName].moveUp = true;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    players[myName].moveLeft = true;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    players[myName].moveDown = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    players[myName].moveRight = true;
  }
};

//handler for key up events
const keyUpHandler = (e) => {
  let keyPressed = e.which;

  // W OR UP
  if(keyPressed === 87 || keyPressed === 38) {
    players[myName].moveUp = false;
  }
  // A OR LEFT
  else if(keyPressed === 65 || keyPressed === 37) {
    players[myName].moveLeft = false;
  }
  // S OR DOWN
  else if(keyPressed === 83 || keyPressed === 40) {
    players[myName].moveDown = false;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    players[myName].moveRight = false;
  }
};

const SendPositionUpdate = () => {
  send("position",players[myName]);
}

const lerpCharacter = (square) => {
  //if alpha less than 1, increase it by 0.01
  if(square.alpha < 1) square.alpha += 0.05;

  //calculate lerp of the x/y from the destinations
  square.x = lerp(square.prevX, square.destX, square.alpha);
  square.y = lerp(square.prevY, square.destY, square.alpha);
}

// modify tick-based game values
const update = () => {
  // move me
  players[myName].move();
  // move players
  for (let name in players) {
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
const gameLoop = () => {
  update();
  draw();
  window.requestAnimationFrame(gameLoop);
};

// canvas fullscreen (all supported browsers)
const fullScreen = () => {
  const elem = canvas;
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

const linkEvents = () => {
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
}

// initialize variables
const initGame = () => {
  canvas = document.querySelector('canvas');
  canvas.onclick = fullScreen;
  ctx = canvas.getContext('2d');
  
  // misc.
  ctx.font="20px Arial";
  
  // add self
  addPlayer(myName);
  
  // link events
  linkEvents();
  // let the games begin
  gameLoop();
};
//window.addEventListener('load', init);
