/*
*  playerHandler.js
*  author: Ben Connick
*  last modified: 03/14/17
*  purpose: handle server code related to player management
*/

class Ball {
  constructor() {
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
  }
}

// list of sockets and names
const players = [];
// player dictionary by name
const playerDic = {};

// dictionary of rooms
const rooms = {};

// functions for tracking players
// ---------------------------------------

// roomcode generator
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const getRandomLetter = () => letters[Math.floor(Math.random() * 26)];

// search an array for an object with a given property == a value
/* const indexOfElemWithProperty = (arrayOfObjects, propertyName, match) => {
  // loop
  for (let i = 0; i < arrayOfObjects.length; i++) {
    // match found
    if (match === arrayOfObjects[i][propertyName]) {
      return i;
    }
  }
  // no match found
  return -1;
};*/

// search an array for an object with a given property == a value
const elemWithProperty = (arrayOfObjects, propertyName, match) => {
  // loop
  for (let i = 0; i < arrayOfObjects.length; i++) {
    // match found
    if (match === arrayOfObjects[i][propertyName]) {
      return arrayOfObjects[i];
    }
  }
  // no match found
  return undefined;
};

const getPlayerSocketFromName = (name) => {
  const el = elemWithProperty(players, 'name', name);
  if (el) {
    return el.socket;
  }
  return undefined;
};

// get any socket from the room (if there is one)
/* const getSocketFromRoom = (room) => {
  const el = elemWithProperty(players, 'room', room);
  if (el) return el.socket;
};*/

const getPlayerNameFromSocket = (socket) => {
  const el = elemWithProperty(players, 'socket', socket);
  if (el) {
    return el.name;
  }

  return undefined;
};

const getRoomObjectFromPlayerName = name => rooms[playerDic[name].room];

const playerJoined = (socket, msg) => {
  // parse join args
  const join = JSON.parse(msg);
  // if the name is already taken
  if (playerDic[join.name]) {
    socket.emit('join status', 'name taken');
  } else {
    // if the room does not exist
    if (rooms[join.roomKey] === undefined) {
      console.log(`creating room ${join.roomKey}`);
      // create room object
      rooms[join.roomKey] = {
        key: join.roomKey,
        players: {},
        characters: {},
        ball: new Ball(),
      };
    }

    // add to dictionary
    playerDic[join.name] = players[players.length - 1];

    // join the room
    socket.join(join.roomKey);
    // add player to per-room list
    rooms[join.roomKey].players[join.name] = players[players.length - 1];
    // set room
    players[players.length - 1].room = join.roomKey;
    // add player avatar to the world
    socket.to(join.roomKey).emit('add player', `{ "name" : "${join.name}"}`);
    // set name
    players[players.length - 1].name = join.name;
    // success
    socket.emit('join status', 'success');

    // debug
    console.log(`${join.name} joined room ${join.roomKey}`);
  }
};

const trackSocket = (socket) => {
  // add the client
  players.push({ socket, name: 'unknown', room: 'no room' });
};

const movePlayer = (data) => {
  if (playerDic[data.name] === undefined) {
    throw new Error('player from a previous session rejoined');
  }
  // trust incoming data
  getRoomObjectFromPlayerName(data.name).characters[data.name] = data;
};

const checkCollisions = (b, characters) => {
  const ball = b;
  const bW = 10; // ball width
  const cW = 50; // character width
  let collision = false;
  ball.hit = false;
  // loop through characters
  const names = Object.keys(characters);

  for (let i = 0; i < names.length; i++) {
    if (Object.prototype.hasOwnProperty.call(characters, names[i])) {
      const character = characters[names[i]];
      /* if (ball.prevX <= character.prevX+cW && ball.prevX >= character.prevX
      || ball.prevX + bW <= character.prevX+cW && ball.prevX + bW >= character.prevX) {
        if (ball.prevY <= character.prevY+cW && ball.prevY >= character.prevY
        || ball.prevY + bW <= character.prevY+cW && ball.prevY + bW >= character.prevY) {
          collision = true;
        }
      }*/
      if (ball.prevX <= character.prevX + cW && ball.prevX >= character.prevX) {
        if (ball.prevY <= character.prevY + cW && ball.prevY >= character.prevY) {
          collision = true;
        }
      }
      if (collision) {
        const relativeX = (ball.prevX + (bW / 2)) - (character.prevX + (cW / 2));
        const relativeY = (ball.prevY + (bW / 2)) - (character.prevY + (cW / 2));

        // horizontal collision
        if (Math.abs(relativeX) > Math.abs(relativeY)) {
          if (relativeX < 0) { // ball left of character
            ball.vx = -3; // "magic number" for velocity :(
          } else { // to the right
            ball.vx = 3; // "magic number" for velocity :(
          }
        // vertical collision
        } else if (relativeY < 0) { // ball below
          ball.vy = -3; // "magic number" for velocity :(
        } else { // to the above
          ball.vy = 3; // "magic number" for velocity :(
        }
        ball.owner = character.name;
        ball.hit = true;
        // debug
        // console.log(`hit! bX: ${ball.prevX}, bY: ${ball.prevY},
        // cX: ${character.prevX}, cY: ${character.prevY}`);
        break;
      }
    }
  }
};

const updateBall = (b, characters) => {
  const ball = b;
  const max = 800;
  const axisSpeed = 3;
  // update position
  ball.prevX = ball.destX;
  ball.prevY = ball.destY;
  ball.destX = ball.prevX + ball.vx;
  ball.destY = ball.prevY + ball.vy;
  // bounding
  if (ball.destX > max) ball.vx = -axisSpeed;
  if (ball.destX < 0) ball.vx = axisSpeed;
  if (ball.destY > max) ball.vy = -axisSpeed;
  if (ball.destY < 0) ball.vy = axisSpeed;
  // collision
  checkCollisions(ball, characters);
};

const updateClients = (io) => {
  const roomKeys = Object.keys(rooms);

  for (let i = 0; i < roomKeys.length; i++) {
    if (Object.prototype.hasOwnProperty.call(rooms, roomKeys[i])) {
      const room = rooms[roomKeys[i]];
      updateBall(room.ball, room.characters);
      // emit the list of characters to each room
      const output = {
        characters: room.characters,
        ball: room.ball,
      };
      io.to(room.key).emit('output', output);
    }
  }
};

module.exports.updateClients = updateClients;
module.exports.movePlayer = movePlayer;
module.exports.playerJoined = playerJoined;
module.exports.getPlayerSocketFromName = getPlayerSocketFromName;
module.exports.getPlayerNameFromSocket = getPlayerNameFromSocket;
module.exports.getRandomLetter = getRandomLetter;
module.exports.trackSocket = trackSocket;
