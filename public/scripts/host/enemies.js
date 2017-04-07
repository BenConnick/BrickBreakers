// *** static functions ***
const createRandomEnemy = (lvlMin, lvlMax) => {
  lvlMin = lvlMin || 0;
  lvlMax = lvlMax || 1000000;
  const idxMin = lvlMin;
  const idxMax = lvlMax;
  /* for (let i=0; i<enemyTypes.length; i++) {
    if (enemyTypes[i].lvl > lvlMin) {
      idxMin = i;
    }
    if (enemyTypes[i].lvl < lvlMax) {
      idxMax = i;
    }
  }*/
  const a = idxMin + Math.floor(Math.random() * (idxMax - idxMin + 1));
  console.log(`a: ${a}`);
  return createEnemyByTypeIndex(a);
};

const createEnemyByTypeIndex = (idx) => {
  switch (idx) {
    case 0:
    case 1:
      return new Rat();
      break;
    case 2:
      return new Slime();
      break;
    default:
      return new Rat();
      break;
  }
};

// *** ENEMY CLASSES ***

// base class
class Enemy extends Character {
  constructor() {
    // call parent constructor
    super();

    // *** basic interactions ***
    this.awake = false; // sleeping until the player wakes it up

    // which room (relative to floor)
    this.roomNum = -1;
    // setter
    this.setRoomNum = function (num) { this.roomNum = num; };

    this.path = [];
  }

  // overwrite this for more complex behaviors
  updateBehavior() {
    this.seekClosestPlayer();
  }

  // move towards closest player
  seekClosestPlayer() {
    // player to pursue
    let target;
    let playerAlreadyFoundInSameRoom = false;
    const room = currentFloor.rooms[getRoomIdxFromTile(currentFloor.rooms, this.x, this.y)];
    let minDist = 1000000;
    // reference to this enemy inside anon func
    const e = this;
    // players is a global var
    players.forEach(function (p) {
      // player is in the same room as enemy
      if (currentFloor.rooms[getRoomIdxFromTile(currentFloor.rooms, p.x, p.y)] === room) {
        if (!playerAlreadyFoundInSameRoom) {
          target = p;
          const distSq = (p.x - e.x) * (p.x - e.x) + (p.y - e.y) * (p.y - e.y);
          minDist = distSq;
          playerAlreadyFoundInSameRoom = true;
        } else {
          const distSq = (p.x - e.x) * (p.x - e.x) + (p.y - e.y) * (p.y - e.y);
          if (distSq < minDist) {
            minDist = distSq;
            target = p;
          }
        }
      } else if (!playerAlreadyFoundInSameRoom) {
        const distSq = (p.x - this.x) * (p.x - this.x) + (p.y - this.y) * (p.y - this.y);
        if (distSq < minDist) {
          minDist = distSq;
          target = p;
        }
      }
    });

    // if there is no target, escape
    if (!target) return;

    // let map = nodeMap[currentFloorNum];
    /* let closestPointToPlayer
    this.path = Astar(
      map,
      map[this.x][this.y],
      map[target.x][target.y],
      dungeon.floors[currentFloorNum].width);
    */

    let dir;
    let vert = 0;
    let horiz = 0;
    if (this.x > target.x) {
      dir = 'LEFT';
      horiz = -1;
    } else if (this.x < target.x) {
      dir = 'RIGHT';
      horiz = 1;
    } else if (this.y < target.y) {
      dir = 'DOWN';
      vert = -1;
    } else if (this.y > target.y) {
      dir = 'UP';
      vert = +1;
    } else {
      // on top of player
    }
    let result;
    if (dir) { result = this.move(dir, dungeon.floors[currentFloorNum]); }
    if (result === 'wall') {
      /* for (let i=0; i<50; i++) {
        //currenFloor.grid[
      }*/
    }
  }
}
// inherit from parent
// Enemy.prototype = Object.create(Character.prototype);
// Enemy.prototype.constructor = Enemy;

const ratImg = new Image();
ratImg.src = 'images/rat.png';
// rat class
class Rat extends Enemy {
  constructor() {
    // call parent constructor
    super();

    // image
    this.image = ratImg;

    // *** enemy rpg attributes ***
    this.name = 'Rat';
    // threat level
    this.lvl = 1;
    // xp when killed
    this.xp = 1;
    // weapon
    this.weapon = weapons.stick; // start with a basic weapon
    // hp
    this.hp = 4;
    this.maxHp = 4;
    // strength
    this.strength = 4;
    // defense
    this.defense = 2; // dodge chance

    // draw with offset because the sprite is short
    this.offsetY = 10;
  }

  updateBehavior() {
    this.seekClosestPlayer();
  }
}
// inherit from parent
// Rat.prototype = Object.create(Enemy.prototype);
// Rat.prototype.constructor = Rat;
Rat.prototype.lvl = 1; // used by the createRandomEnemy func

const slimeImg = new Image();
slimeImg.src = 'images/slime.png';
// slime class
class Slime extends Enemy {
  constructor() {
    // call parent constructor
    super();

    // image
    this.image = slimeImg;

    // *** enemy rpg attributes ***
    this.name = 'Green Slime';
    // threat level
    this.lvl = 2;
    // xp when killed
    this.xp = 3;
    // weapon
    this.weapon = weapons.stick; // start with a basic weapon
    // hp
    this.hp = 10;
    this.maxHp = 10;
    // strength
    this.strength = 8;
    // defense
    this.defense = 2; // dodge chance

    // draw with offset because the sprite is short
    this.offsetY = 10;
  }

  updateBehavior() {
    this.seekClosestPlayer();
  }
}
// inherit from parent
// Slime.prototype = Object.create(Enemy.prototype);
// Slime.prototype.constructor = Slime;
Slime.prototype.lvl = 2; // used by the createRandomEnemy func

// list of the types of enemies
const enemyTypes = [
  Rat,
  Slime,
];
