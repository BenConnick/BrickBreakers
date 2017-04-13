/*
*  server.js
*  author: Ben Connick
*  last modified: 04/12/17
*  purpose: handle socket events, serve files to the clients
*/

const http = require('http');
const socketio = require('socket.io');
const fileHandler = require('./fileHandler.js');
const playerHandler = require('./playerHandler.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle requests
const onRequest = (request, response) => {
  switch (request.url) {
    case '/':
      fileHandler.servePage(response);
      break;
    default:
      // scripts
      if (request.url.indexOf('.js') > -1) {
        fileHandler.serveScript(request.url, response);
      // images
      } else if (request.url.indexOf('.png') > -1) {
        // ONLY WORKS FOR PNG RIGHT NOW
        fileHandler.serveImage(request.url, response);
      // invalid request
      } else {
        response.end();
      }
  }
};

const app = http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);

// pass in the http server into socketio and grab the websocket server
const io = socketio(app);

// object to hold all of our connected users
const users = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    // handle player joining game
    playerHandler.playerJoined(socket, data);
  });
};

const onInput = (sock) => {
  const socket = sock;

  socket.on('input', (data) => {
    // parse message
    playerHandler.parsePlayerInput(socket, data);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    // remove socket and emit message
    playerHandler.removeSocket(socket);
    // clear user from list
    delete users[socket.name];
  });
};

const onPosition = (sock) => {
  const socket = sock;
  socket.on('position', (data) => {
    // move player if the player is registered
    if (!playerHandler.checkForOldPlayer(sock, data)) { playerHandler.movePlayer(data); }
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  playerHandler.trackSocket(socket);

  onJoined(socket);
  onPosition(socket);
  onInput(socket);
  onDisconnect(socket);
});

const sendUpdateToClients = () => {
  playerHandler.updateClients(io);
};

// tick rate 20ms
setInterval(sendUpdateToClients, 20);

console.log('websocket server started');
