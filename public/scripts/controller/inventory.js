// Inventory on the controller

const images = {
  'red potion': 'images/pt1.png',
  'green potion': 'images/pt3.png',
  'blue potion': 'images/pt2.png',
  'orange potion': 'images/pt4.png',
};

const potions = [
  'red potion',
  'green potion',
  'blue potion',

];

const numPotions = {
  'red potion': 0,
  'green potion': 0,
  'blue potion': 0,
};

let gold = 0;

const inventory = [];

const slots = [];

const counters = [];

const controlButtons = [];

let selectedSlot = -1;

// add an item to the inventory
function itemGet(itemString) {
	// gold is formatted in a special way
  if (itemString.substring(0, 4) == 'gold') {
		// extract the amount of gold from the item string
    addGold(parseInt(itemString.substring(5, itemString.length)));

		// done
    return;
  }

	// var validItem = false;

	// add potion to the list
  numPotions[itemString]++;
  updatePotionCounters();

	// add the item
	// if (validItem) {
		// addItemToFirstOpenSlot(itemString);
	// } else {
		// alert("invalid item");
	// }
	// display the current inventory state
}

function drinkPotion(potionName) {
  numPotions[potionName]--;
  updatePotionCounters();
}

// inventory setup
function inventoryInit() {
	// get references to slot html (table column children of element with id "inventory")
  const slotNodes = document.querySelectorAll('#inventory .slot');
  for (var i = 0; i < slotNodes.length; ++i) {
	  slots[i] = slotNodes[i];  // assign to a real array
  }

  const counterNodes = document.querySelectorAll('#inventory .counter');
  for (var i = 0; i < counterNodes.length; ++i) {
	  counters[i] = counterNodes[i];  // assign to a real array
  }

  const btnNodes = document.querySelectorAll('#controls td');
  for (var i = 0; i < btnNodes.length; ++i) {
	  controlButtons[i] = btnNodes[i];  // assign to a real array
  }


  output('creating potions');
	// initialize buttons
  for (var i = 0; i < 3; i++) {
    createPotionSlot(i);
  }

	/* // load images
	for (imageName in images) {
		var url = images[imageName];
		images[imageName] = new Image();
		images[imageName].src = url;
	}*/

	// fill inventory
  for (var i = 0; i < slots.length; i++) {
    inventory[i] = '';
  }
}

// window onload, initialize
// window.addEventListener('load',inventoryInit);

function addItemToFirstOpenSlot(itemName) {
  output(`new item: ${itemName}`);
  for (let i = 0; i < inventory.length; i++) {
    if (!inventory[i] || inventory[i] == '') {
      inventory[i] = itemName;
      updateInventorySlot(i);
      break;
    }
  }
}

function updateInventorySlot(index) {
	// output("updating inventory");
	// output(slots[index].toString());
	// output(images[inventory[index]].toString());

	// create a new div
  const n = document.createElement('div');
	// correct image
  n.style.backgroundImage = `url(${images[inventory[index]]})`;
	// class name = item name
	// n.setAttribute("class",inventory[index]);
  n.setAttribute('class', 'pic');
	// event listener
  n.addEventListener('touchstart', () => {
			// debug
    output(`${inventory[index]} tapped`);

			// if the slot is not selected, select it
    if (selectedSlot != index) {
      updateSelected(index);
			// else deselect it
    } else {
      updateSelected(-1);
    }
		  });

	// add to table
  slots[index].appendChild(n);
}


function createPotionSlot(index) {
	// create a new div
  const n = document.createElement('div');

	// correct image
  n.style.backgroundImage = `url(${images[potions[index]]})`;

	// class name = pic
  n.setAttribute('class', 'pic');

	// event listener
  n.addEventListener('touchstart', () => {
			// debug
    output(`${potions[index]} tapped`);
    if (numPotions[potions[index]] > 0)				{ simulateButtonPress(`drink [${potions[index]}]`); }
		  });

	// add to table
  slots[index].appendChild(n);
}

function addGold(num) {
  gold += num;
  document.getElementById('goldBtn').innerHTML = `Gold:<br>${gold}`;
}

// show highlight on a slot
function updateSelected(newSlot) {
  if (selectedSlot >= 0) {
		// remove the highlight class (see utilities.js)
    removeClass(slots[selectedSlot], 'highlight');
  }
  if (newSlot >= 0) {
    addClass(slots[newSlot], 'highlight');
  }
  selectedSlot = newSlot;
}

// use an item
function removeItem(index) {
	// clear image
  slots[index].innerHTML = '';
	// clear from array
  inventory[index] = '';
}

function updatePotionCounters() {
  counters[0].innerHTML = numPotions['red potion'];
  counters[1].innerHTML = numPotions['green potion'];
  counters[2].innerHTML = numPotions['blue potion'];
}
