// CONTROLLER VARIABLES

// html elements
let outputDiv;
let controls;
let hpBar;

// sockets and online things
const controllerSocket = io();
let name = 'bob';
let roomKey = '';

// gameplay utils
let waitingMsg;
let failSafe;
let itemInfo = ''; // send item info to the game

// controller properties
let useClickOnly = false;
let useTouchOnly = false;

// CONTROLLER FUNCTIONS

// set up on start
const appInit = () => {
  // get controls table
  controls = document.getElementById('controls');
  // get hp bar
  hpBar = document.getElementById('healthBar');
  // sound
  //yourTurnSound = document.getElementsByTagName('audio')[0];
  // waiting message
  waitingMsg = document.getElementById('waitingForPlayers');
  // hook up name button
  const submit = document.getElementById('submitBtn');
  submit.onclick = function () {
    console.log('join');
    attemptJoin();
  };
  // handles communication with the server
  setupSocketIO();
  // debugging and talking to the player
  outputDiv = document.getElementById('resultsInner');
  // if there is an error, output it so the user can see
  mobileDebug(true);

  // offline
  if (window.location.toString()[0] == 'f') {
    // document.getElementById("nameScreen").style.display = "none";
    // document.getElementById("controllerScreen").style.display = "block";
  }

  //inventoryInit();
};

// join a game
const attemptJoin = () => {
  name = document.getElementById('nameInput').value;
  roomKey = document.getElementById('roomInput').value.toUpperCase();
  const json = `{ "name": "${name}", ` + `"roomKey": "${roomKey}" }`;
  controllerSocket.emit('join', json);
};

// game replied OK
const joinSucceed = () => {
  document.getElementById('nameScreen').style.display = 'none';
  document.getElementById('controllerScreen').style.display = 'block';
  // show welcome msg
  output(`Welcome, ${name}`);
};

// if there was an error, alert
const joinFail = (status) => {
  alert(status);
};

// print to the onscreen log
const output = (str) => {
  outputDiv.innerHTML = `${str}<br>${outputDiv.innerHTML.substring(0, 2000)}`;
};

// start a turn (not used)
const turnStart = () => {
  setControlsVisibility(true);
  yourTurnSound.play();
};

// show the movement controls
const setControlsVisibility = (visible) => {
  if (visible) {
    controls.style.opacity = 1;
    controls.style.pointerEvents = 'auto';
    waitingMsg.style.display = 'none';
    window.clearTimeout(failSafe);
  } else {
    controls.style.opacity = 0;
    controls.style.pointerEvents = 'none';
    waitingMsg.style.display = 'block';
    failSafe = window.setTimeout(updateFailed, 5000);
  }
};

// if the connection times out, the controls might be locked
const updateFailed = () => {
  setControlsVisibility(true);
  alert('failsafe triggered after 5 seconds of no message from the server');
};

// set the healthbar
const setHealthBar = (percent) => {
  hpBar.style.width = `${percent * 100}%`;
};

// debugger
const mobileDebug = (enabled) => {
  if (enabled) {
    window.onerror = function (errorMsg, url, linenumber) { handleErrorMobile(errorMsg, url, linenumber); };
  } else {
    // dbg.style.display = "none";
  }
};

const handleErrorMobile = (errorMsg, url, linenumber) => {
  output(`${errorMsg}: line ${linenumber}`);
};

// When the game gives a response, record it
const handleMessageFromGame = (msg) => {
  // player got an item
  if (msg.indexOf('ITEM GET: ') > -1) {
    // add to inventory (handled in inventory.js)
    //itemGet(msg.substring(10));
  }
};

// window onload, initialize
window.addEventListener('load', appInit);

// button pressed, make quick adjustments
const preSendActions = (btnType) => {
  // if the action involved an inventory item
  if (btnType.indexOf('drink') >= 0) {
    // send item info to the game
    itemInfo = btnType.substring(btnType.indexOf('[') + 1, btnType.indexOf(']'));
  }
};

const postSendActions = (btnType) => {
  if (btnType.indexOf('drink') >= 0) {
    drinkPotion(itemInfo);
    // clear meta
    itemInfo = '';
  }
};

const simulateButtonPress = (buttonString) => {
  // change the item text to fit
  preSendActions(buttonString);

  // create a json string with information about the controller's button press
  const jsonString = `${'{'
      + '"name": "'}${name}", `
      + `"btn": "${buttonString}", `
      + `"item": "${itemInfo}" }`;
  controllerSocket.emit('input', jsonString);

  // empty inventory slot
  postSendActions(buttonString);
};

// setup sockets
const setupSocketIO = () => {
  const buttons = document.querySelectorAll('td');
  for (let i = 0; i < buttons.length; i++) {
      // universal touch event for all buttons
    const setClick = function (btn) {
        // only fire one of these, click or touch, not both
      btn.addEventListener('click', () => {
        if (!useClickOnly && !useTouchOnly) { useClickOnly = true; }
        if (useClickOnly) { simulateButtonPress(btn.textContent); }
        return false;
      });
      // use this for mobile
      // commented out because it doesn't work with mouse
      btn.addEventListener('touchstart', () => {
        if (!useClickOnly && !useTouchOnly) { useTouchOnly = true; }
        if (useTouchOnly) { simulateButtonPress(btn.textContent); }
        return false;
      });
    };
    setClick(buttons[i]);
  }
  controllerSocket.on('output', (msg) => {
    handleMessageFromGame(msg);
    output(msg);
  });
  controllerSocket.on('join status', (status) => {
    if (status == 'success') { joinSucceed(); } else {
      joinFail(status);
    }
  });
};
