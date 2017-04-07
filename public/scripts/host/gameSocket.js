let output;
let gameSocket;

const setupGameSocketIO = () => {
  gameSocket = io();
  gameSocket.emit('assert game', 'I am the game host');

  // handles player input, global func in game.js
  gameSocket.on('output', (msg) => {
    handlePlayerInput(msg);
  });

  gameSocket.on('add player', (msg) => {
  	// new player
    const o = JSON.parse(msg);
	// add and track avatar
    addPlayer(o.name, o.type);
  });
  gameSocket.on('key', (msg) => {
    document.querySelector('.follow').innerHTML = `${document.querySelector('.follow').innerHTML}<br>room key: ${msg}`;
  });
};

const initSocket = () => {
  if (!offline) setupGameSocketIO();
  output = document.getElementById('resultsInner');
  console.log('Ready to begin');
};
const send = (recipientName, msg) => {
  if (offline) return;
  const json = `{ "name": "${recipientName}", "message": "${msg}"}`;
  gameSocket.emit('feedback', json);
};

window.addEventListener('load', initSocket);
