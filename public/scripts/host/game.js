// *** GAME SCRIPT ***

// canvas elem
let canvas;
let ctx;
// the dungeon object
let dungeon;
// the spawn point on the current floor
const spawn = { x: 0, y: 0 };
// the lowest floor the player has been to
let bottomFloorNum = -1;
// the current floor index
let currentFloorNum = -1;
// floor reference
let currentFloor;
// the list of players
const players = [];
// A* nodes
const nodeMap = [];
// timer
let startTime = 0;
let gameTime = 0;
let skippedTime = 0;
let turnCount = 0;
const turnInterval = 500;
// offline if file url
const offline = (window.location.toString()[0] === 'f');
console.log(offline);
const gridDimensions = { x: 18, y: 12 };

// initialize variables
const init = () => {
  canvas = document.querySelector('canvas');
  document.querySelector('#fullscreenBtn').onclick = fullScreen;
  canvas.onclick = fullScreen;
  ctx = canvas.getContext('2d');

  dungeon = new Dungeon();
  startGame();
};
window.addEventListener('load', init);

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

const startGame = () => {
  // start the timer
  gameTime = startTime = Date.now();

  // enter a dungeon
  goToFloor(0);

  // if off-line create a character and activate keyboard controls
  if (offline) activateOfflineCharacter();

  gameLoop();
};

const activateOfflineCharacter = () => {
  addPlayer('offline');
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      // go down stairs
      handlePlayerInput('{ "name": "offline", "btn": "use [stairs]" }');
    }
  });
  window.addEventListener('keypress', (e) => {
    console.log(e.keyCode);
    switch (e.keyCode) {
      case 97:
      case 37:
        // left
        handlePlayerInput('{ "name": "offline", "btn": "LEFT" }');
        break;
      case 119:
      case 38:
        // up
        handlePlayerInput('{ "name": "offline", "btn": "UP" }');
        break;
      case 100:
      case 39:
        // right
        handlePlayerInput('{ "name": "offline", "btn": "RIGHT" }');
        break;
      case 115:
      case 40:
        // down
        handlePlayerInput('{ "name": "offline", "btn": "DOWN" }');
        break;
    }
  });
};

// every tick
const gameLoop = () => {
  // console.log("lop");
  gameTime = skippedTime + Date.now() - startTime;
  if (gameTime - turnCount * turnInterval > turnInterval) {
    turnCount++;
    update();
  }
  draw();
  // window.setTimeout(gameLoop,250);
  window.requestAnimationFrame(gameLoop);
};

// modify turn-based game values
const update = () => {
  currentFloor.enemies.forEach((enemy) => {
    if (currentFloor.rooms[enemy.roomNum].visible) { enemy.updateBehavior(); }
  });
  players.forEach((player) => {
    player.actionsLeft = 1;
    // send(player.name,"Your turn. Health: "+(player.hp/player.maxHp)); // send the controller an update
    // send(player.name,"Your turn "+Date.now()); // send the controller an update
    // player.x = player.futurePos.x;
    // player.y = player.futurePos.y;
  });
};

// draw to the screen
const draw = () => {
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
};

// generate a new dungeon floor
// or go back to a previous one
const goToFloor = (level) => {
  // error checking
  if (!level || level < 0) level = 0;

  // set floor
  currentFloorNum = level;

  // if up
  if (level <= bottomFloorNum) {
    // load floors[level]
  }
  // if down
  else {
    // bottom is deeper
    bottomFloorNum++;
    // generate new floor
    dungeon.addFloor(gridDimensions.x, gridDimensions.y);
    /* nodeMap.length
    // create nodes
    let map = [];
    // create a grid with [width] columns
    for (let i=0; i<currentFloor.width; i++) {
      let col = [];
      // create a column with [height] tiles
      for (let j=0; j<currentFloor.height; j++) {
        col.push(new Node(i,j));
      }
      // double nested
      map.push(col);
    }
    // triple nested
    nodeMap.push(map);
    */
  }

  // set current reference
  currentFloor = dungeon.floors[currentFloorNum];

  // adjust spawn point
  spawn.x = currentFloor.spawn.x;
  spawn.y = currentFloor.spawn.y;
};

// deals with controller inputs
const handlePlayerInput = (msg) => {
  console.log(`input: ${msg}`);
  const inputData = JSON.parse(msg);
  let p = getPlayer(inputData.name);
  if (!p) p = addPlayer(inputData.name);
  if (inputData.btn.indexOf('THROW') >= 0) {
    // extract direction (after THROW_)
    const direction = inputData.btn.substring(6, inputData.btn.length);
    // throw the item
    p.throwItem(inputData.item, direction);
  } else if (inputData.btn.indexOf('drink') >= 0) {
    // drink the potion
    p.drinkPotion(inputData.item);
  } else {
    p.move(inputData.btn, currentFloor);
  }
  checkForAllReady();
};

// chech that all players have no moves left
const checkForAllReady = () => {
  let done = true;
  players.forEach((player) => {
    if (player.actionsLeft > 0) done = false;
  });
  // if done, skip to turn end
  if (done) {
    // shorthand
    const gameTime = skippedTime + Date.now() - startTime;
    // skip ahead to next turn
    skippedTime += (turnInterval - (gameTime - turnCount * turnInterval));
  }
};

// retrieves a player with a given name
const getPlayer = (name) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].name === name) { return players[i]; }
  }
};

// add a new player
const addPlayer = (name, type) => {
  if (getPlayer(name)) return;
  console.log(`added ${name}`);
  const newb = new Player(name, type);
  newb.x = spawn.x;
  newb.y = spawn.y;
  newb.prevPos.x = spawn.x;
  newb.prevPos.y = spawn.y;
  players.push(newb);
  return newb;
  console.log(players);
};

// draw the turn timer
const drawTimer = (ctx, pos, percent) => {
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI * (percent), true);
  ctx.lineTo(pos.x, pos.y);
  ctx.closePath();
  ctx.globalAlpha = 0.1;
  ctx.fill();
  ctx.restore();
};
