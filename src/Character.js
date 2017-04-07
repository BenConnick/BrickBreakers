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
    this.color = "rgb(1,1,1)";
    this.move = () => {
      const square = this;
      
      // apply friction
      square.vx *= 0.8;
      square.vy *= 0.8;
    
      //move the last x/y to our previous x/y variables
      square.prevX = square.x;
      square.prevY = square.y;

      //if user is jumping, decrease y velocity
      if(square.moveUp) {
        square.vy = -5;
      }
      //if user is moving down, increase y velocity
      if(square.moveDown) {
        square.vy = 5;
      }
      //if user is moving left, decrease x velocity
      if(square.moveLeft) {
        square.vx = -5;
      }
      //if user is moving right, increase x velocity
      if(square.moveRight) {
        square.vx = 5;
      }

      // add velocity with dt to get desired position
      square.destY = square.prevY + square.vy;
      square.destX = square.prevX + square.vx;

      // clamp bounds
      // ---------------------------------------
      if(square.destY < 0) {
        square.destY = 0;
      }
      if(square.destY > canvas.width) {
        square.destY = canvas.width;
      }
      if(square.destX < 0) {
        square.destX = 0;
      }
      if(square.destX > canvas.height) {
        square.destX = canvas.height;
      }
      // ---------------------------------------
      
      // set pos
      square.x = square.destX;
      square.y = square.destY;
    }
    this.lerp = () => {
      const square = this;

      //if alpha less than 1, increase it by 0.01
      if(square.alpha < 1) square.alpha += 0.05;

      //calculate lerp of the x/y from the destinations
      square.x = lerp(square.prevX, square.destX, square.alpha);
      square.y = lerp(square.prevY, square.destY, square.alpha);
      }
  }
}