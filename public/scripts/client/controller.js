// sockets and online things
const controllerSocket = io();
let myName = 'bob';
let roomKey = '';

// set up on start
const appInit = () => {
  // hook up name button
  const submit = document.getElementById('submitBtn');
  submit.onclick = function () {
    console.log('join');
    attemptJoin();
  };
  // handles communication with the server
  setupSocketIO();
};

// join a game
const attemptJoin = () => {
  myName = document.getElementById('nameInput').value;
  roomKey = document.getElementById('roomInput').value.toUpperCase();
  const json = `{ "name": "${myName}", ` + `"roomKey": "${roomKey}" }`;
  controllerSocket.emit('join', json);
};

// game replied OK
const joinSucceed = () => {
  document.getElementById('nameScreen').style.display = 'none';
  initGame();
};

// if there was an error, alert
const joinFail = (status) => {
  alert(status);
};

// 
const send = (msgType, msg) => {
  controllerSocket.emit(msgType, msg);
}

// window onload, initialize
window.addEventListener('load', appInit);

// setup sockets
const setupSocketIO = () => {
  controllerSocket.on('output', (msg) => {
    handleMessageFromServer(msg);
  });
  controllerSocket.on('player disconnected', (msg) => {
    removeAvatar(msg);
  });
  controllerSocket.on('join status', (status) => {
    if (status == 'success') { joinSucceed(); } else {
      joinFail(status);
    }
  });
};
