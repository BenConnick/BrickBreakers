// *** global scope character data ***

// how much xp is needed to reach this level
const xpRequirements = [
  5, 15, 30, 50, 75, 100,
];
// store all possible images
const characterImages = [];
// load all the images
const createDwarfImg = (i) => {
  const img = new Image();
  img.src = `images/dwarf${i}.png`;
  characterImages.push(img);
};
window.addEventListener('load', () => {
  for (let i = 1; i < 7; i++) {
    createDwarfImg(i);
  }
});

// *** PLAYER CLASS ***
class Player extends Character {
  constructor(name_, type_) {
    // call parent constructor
    super(name_);

    // *** character rpg attributes ***
    // name
    this.name = name_ || 'unnamed';
    // lvl
    this.lvl = 1;
    // xp
    this.xp = 0;
    // hp
    this.maxHp = 15;
    this.hp = 15;
    // strength
    this.strength = 4;
    // intelligence
    this.intelligence = 1;
    // defense
    this.defense = 2; // dodge chance


    // define as player
    this.isPlayer = true;
    // class (type)
    this.type = type_ || 'Strong Murderhobo';
    // weapon
    this.weapon = weapons.stick;
    // differentiate characters
    this.color = Math.floor(Math.random() * 5);
    this.image = characterImages[this.color];
    this.inventory = [];
    // drawing
    this.visible = true;
  }

  dodge(attackerdefense) {
    return (Math.random() < this.defense / (this.defense + attackerdefense * 10));
  }

  // add xp for
  addXp(val) {
    this.xp += val;
    this.checkForLvlUp();
  }

  // check to see if the player has enough xp
  checkForLvlUp() {
    if (this.lvl < this.xp - xpRequirements[this.lvl - 1]) {
      // level up!!!
      this.lvl++;
      this.hp += Math.ceil(this.hp / (this.maxHp + 10));
      this.maxHp += 10;
      this.strength += 2;
      this.defense += 2;
      this.intelligence += 2;
      // this.hp = this.maxHp; mwahaha, no more free hp for you
    }
  }

  // throw an item (currently limited to potions)
  throwItem(itemName, direction) {
    // debug
    console.log(`throwing ${itemName} ${direction}`);
    // remove from inventory
    const item = this.inventory.splice(this.inventory.indexOf(itemName), 1);
    // find out where the potion will land
    const landingSpot = this.getProjection(direction);
    // which effect?
    const effect = potionTypes[itemName];
    // apply effect based on what the item hits
    const target = gameTools.checkForEnemy(landingSpot.x, landingSpot.y);
    // if the target exists and so does the effect
    if (target && effect) {
      target.applyEffect(effect, this);
    } else if (effect === 'lightning potion') {
      powers.lightningBurst(this, landingSpot.x, landingSpot.y);
    }
  }

  // apply a potion's effect to the player
  drinkPotion(itemName) {
    // debug
    console.log(`drinking ${itemName}`);

    // remove from inventory
    const item = this.inventory.splice(this.inventory.indexOf(itemName), 1);
    // check valid
    if (!item) { return; }
    // which effect?
    const effect = potionTypes[itemName];
    // apply
    if (effect) this.applyEffect(effect, this);
  }

  checkAndResolveCollision(x, y) {
    // look for enemy
    let target = gameTools.checkForEnemy(x, y);
    // attack
    if (target) {
      this.attack(target);
      return true;
    }

    // look for loot
    target = gameTools.checkForItem(x, y);
    if (target) {
      // if potion, use immediately
      if (target.name.indexOf("potion" > -1)) {
        this.drinkPotion(target.name);
      } else {
        let msg = `ITEM GET: ${target.name}`;
        if (target.name === 'gold') {
          this.gold += target.num;
          msg += ` ${target.num}`;
        } else {
          this.inventory.push(target);
        }
        // update the controller inventory
        send(this.name, msg);
      }
      // remove from floor
      target.removeFromFloor();
      return true;
    }
  }

  hitWall() {
    // message phone
    send(this.name, 'you hit a wall');
  }

  death() {
    // kill
    console.log('you died');
    send(this.name, 'you died');
    // this.reset();
    this.gold = 0;
    // respawn
    this.x = spawn.x;
    this.y = spawn.y;
    this.hp = this.maxHp;
  }
  reset() {
    // lvl
    this.lvl = 1;
    // xp
    this.xp = 0;
    // hp
    this.maxHp = 15;
    this.hp = 15;
    // strength
    this.strength = 4;
    // defense
    this.defense = 2;
    // respawn
    this.x = spawn.x;
    this.y = spawn.y;
  }
}
// inheritance
// Player.prototype = Object.create(Character.prototype);
// Player.prototype.constructor = Player;

