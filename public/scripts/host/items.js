// *** ITEM CLASSES ***

const weapons = {
  stick: {
    name: 'stick',
    power: 1,
  },
  broomhandle: {
    name: 'broomhandle',
    power: 2,
  },
};

// which color does what? randomized at start
const potionTypes = {
  'red potion': 'health potion',
  'green potion': 'strength potion',
  'blue potion': 'lightning potion',
};

// possible potion effects
const potionEffectsList = [
  'healing potion',
  'strength potion',
  'lightning potion',
];

// Item base class
class Item extends GameObject {
  constructor(x, y, name) {
    super(x, y);
    // GameObject.call(this,x,y);
    this.name = name || 'no name';
    this.roomNum = -1;
    this.image = undefined;
  }
  setRoomNum(num) {
    this.roomNum = num;
  }
  draw() {
    ctx.drawImage(this.image, this.x * constants.tileSize, this.y * constants.tileSize);
  }
  removeFromFloor() {
    this.roomNum = -1;
    currentFloor.items.splice(currentFloor.items.indexOf(this), 1);
  }
}
// inherit from parent
// Item.prototype = Object.create(GameObject.prototype);
// Item.prototype.constructor = Item;

// the standard constructor for a gold pile
class GoldPile extends Item {
  constructor(x_, y_, num_) {
    super(x_, y_, 'gold');
    this.num = num_;
    this.image = new Image();
    this.image.src = 'images/Gold.png';
  }
}
// inherit from parent
// GoldPile.prototype = Object.create(Item.prototype);
// GoldPile.prototype.constructor = GoldPile;

// a magical potion of wonders
class Potion extends Item {
  constructor(x_, y_, type_) {
    super(x_, y_, `${type_ || 'red'} potion`);
    this.type = type_ || 'red';
    this.image = new Image();
    this.image.src = `images/${this.type}potion.png`;
  }
}
// inherit from parent
// Potion.prototype = Object.create(Item.prototype);
// Potion.prototype.constructor = Potion;

