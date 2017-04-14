// sockets and online things
const controllerSocket = io();
let myName = 'bob';
let roomKey = '';
// html elements
let sound;

// set up on start
const appInit = () => {
  // hook up name button
  const submit = document.getElementById('submitBtn');
  submit.onclick = function () {
    console.log('join');
    attemptJoin();
  };
  setupSocketIO(); // handles communication with the server
  PrepareSounds();
  document.addEventListener('keydown',enterKeyDown);
};

const enterKeyDown = (e) => {
  //handle enter key pressed
  let keyPressed = e.which;
  
  // ENTER
  if (keyPressed === 13) {
    console.log("asdf");
    if (!playing)
      attemptJoin();
  }
}

const PrepareSounds = () => {
  sound = document.querySelector("audio");
  /*createjs.Sound.addEventListener("fileload", handleLoadComplete);
  createjs.Sound.registerSound({src:"sounds/Powerup.wav", id:"sound"});
  const handleLoadComplete = (event) => {
    createjs.Sound.play("sound");
  }*/
}

const playSound = (name) => {
  let mediaElem = undefined;
  switch(name) {
    case "hit":
      mediaElem = sound;
  }
  if (mediaElem && mediaElem.paused) {
    mediaElem.play();
  }
}

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
