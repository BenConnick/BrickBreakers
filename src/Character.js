// Character class
class Character {
  constructor(name) {
    this.name = name; // character's unique id
    // last time this character was updated
    this.lastUpdate = new Date().getTime(); // oldest possible
    this.x = 0; // x location of character on screen
    this.y = 0; // y location of character on screen
    this.prevX = 0; // last known x location of character
    this.prevY = 0; // last known y location of character
    this.destX = 0; // destination x location of character
    this.destY = 0; // destination y location of character
    this.height = 100; // height of character
    this.width = 100; // width of character
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
    this.moveLeft = false; // if character is moving left
    this.moveRight = false; // if character is moving right
    this.moveDown = false; // if character is moving down
    this.moveUp = false; // if character is moving up
    this.vx = 0; // x velocity
    this.vy = 0; // y velocity
    this.color = 'rgb(1,1,1)';
    this.score = 0;
  }
}

module.exports.Character = Character;
