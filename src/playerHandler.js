/*
*  playerHandler.js
*  author: Ben Connick
*  last modified: 04/12/17
*  purpose: handle server code related to player management
*/

// include game instance
const gameInstanceModule = require('./GameInstance.js');

// list of sockets and names
const sockets = [];
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
  const el = elemWithProperty(sockets, 'name', name);
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
  const el = elemWithProperty(sockets, 'socket', socket);
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
        gameInstance: new gameInstanceModule.GameInstance(),
      };
    }

    // add to dictionary
    playerDic[join.name] = sockets[sockets.length - 1];

    // join the room
    socket.join(join.roomKey);
    // add player to per-room list
    rooms[join.roomKey].gameInstance.addCharacter(join.name);
    // set room
    sockets[sockets.length - 1].room = join.roomKey;
    // add player avatar to the world
    socket.to(join.roomKey).emit('add player', `{ "name" : "${join.name}"}`);
    // set name
    sockets[sockets.length - 1].name = join.name;
    // success
    socket.emit('join status', 'success');

    // debug
    console.log(`${join.name} joined room ${join.roomKey}`);
  }
};

const trackSocket = (socket) => {
  // add the client
  sockets.push({ socket, name: 'unknown', room: 'no room' });
};

const movePlayer = (data) => {
  // move player using game instance
  getRoomObjectFromPlayerName(data.name).gameInstance.movePlayer(data);
};

// for each room, update simulation for all clients in the room
const updateClients = (io) => {
  const roomKeys = Object.keys(rooms);
  for (let i = 0; i < roomKeys.length; i++) {
    if (Object.prototype.hasOwnProperty.call(rooms, roomKeys[i])) {
      const room = rooms[roomKeys[i]];
      room.gameInstance.updateClients(io, room.key);
    }
  }
};

// kick old players
const checkForOldPlayer = (sock, data) => {
  if (playerDic[data.name] === undefined) {
    // removeSocket(sock);
    // send message to socket to exit old session
    return true;
  }
  return false;
};

const removeSocket = (sock) => {
  const name = getPlayerNameFromSocket(sock);
  // don't bother with players from old sessions
  if (name === undefined || playerDic[name] === undefined) return;
  const socketIndex = sockets.indexOf(sock);
  sock.to(playerDic[name].room).emit('player disconnected', name);
  delete rooms[playerDic[name].room].gameInstance.characters[name];
  delete playerDic[name];
  delete sockets[socketIndex];
  console.log(`${name} left`);
};

module.exports.removeSocket = removeSocket;
module.exports.checkForOldPlayer = checkForOldPlayer;
module.exports.updateClients = updateClients;
module.exports.movePlayer = movePlayer;
module.exports.playerJoined = playerJoined;
module.exports.getPlayerSocketFromName = getPlayerSocketFromName;
module.exports.getPlayerNameFromSocket = getPlayerNameFromSocket;
module.exports.getRandomLetter = getRandomLetter;
module.exports.trackSocket = trackSocket;
