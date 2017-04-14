/*
*  GameInstance.js
*  author: Ben Connick
*  last modified: 03/14/17
*  purpose: represent the state of the game
*/

const characterModule = require('./Character.js');

// ball class, copy of client-side
class Ball {
  constructor() {
    // position (animated)
    this.x = 400;
    this.y = 400;
    // velocity
    this.vx = 3;
    this.vy = 3;
    this.prevX = 400; // last known x location of ball
    this.prevY = 400; // last known y location of ball
    this.destX = 400; // destination x location of ball
    this.destY = 400; // destination y location of ball
    this.ownerName = undefined; // owner name
    this.alpha = 0;
    this.flags = {};
  }
}

class Brick {
  constructor(_x, _y) {
    this.x = _x; // x pos
    this.y = _y; // y pos
    this.w = 60; // width
  }
}

// a single instance of the simuation, server-side
class GameInstance {
  constructor() {
    this.bricks = [];
    this.characters = {};
    this.ball = new Ball();
    this.numCharacters = 0;

    this.bW = 10; // ball width
    this.cW = 50; // character width

    const numRows = 5;
    const numCols = 10;
    const brickDist = 80;
    let count = 0;
    for (let i = 0; i < numCols; i++) {
      const x = (i * brickDist);
      for (let j = 0; j < numRows; j++) {
        const y = (j * brickDist);
        this.bricks[count] = new Brick(x, y);
        count += 1;
      }
    }
  }

  addCharacter(name) {
    this.characters[name] = new characterModule.Character();
    this.numCharacters += 1;
  }

  movePlayer(data) {
    // save score
    const score = this.characters[data.name].score;
    // trust incoming data
    this.characters[data.name] = data;
    // use server's score
    if (score) this.characters[data.name].score = score;
  }

  rebound(b, x, y, width) {
    const ball = b;
    const relativeX = (ball.prevX + (this.bW / 2)) - (x + (width / 2));
    const relativeY = (ball.prevY + (this.bW / 2)) - (y + (width / 2));

    // horizontal collision
    if (Math.abs(relativeX) > Math.abs(relativeY)) {
      if (relativeX < 0) { // ball left of character
        ball.vx = -3; // "magic number" for velocity :(
      } else { // to the right
        ball.vx = 3; // "magic number" for velocity :(
      }
    // vertical collision
    } else if (relativeY < 0) { // ball below
      ball.vy = -3; // "magic number" for velocity :(
    } else { // to the above
      ball.vy = 3; // "magic number" for velocity :(
    }
    ball.hit = true;
  }

  static boxCollision(ax, ay, aw, bx, by, bw) {
    // test box collision
    if ((ax <= bx + bw && ax >= bx) || (ax + aw <= bx + bw && ax + aw >= bx)) {
      if ((ay <= by + bw && ay >= by) || (ay + aw <= by + bw && ay + aw >= by)) {
        return true;
      }
    }
    return false;
  }

  checkCollisions() {
    const ball = this.ball;

    let collision = false;
    ball.hit = false;
    // loop through characters
    const names = Object.keys(this.characters);
    for (let i = 0; i < names.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this.characters, names[i])) {
        const character = this.characters[names[i]];

        collision = GameInstance.boxCollision(
          ball.prevX,
          ball.prevY,
          this.bW,
          character.prevX,
          character.prevY,
          this.cW);

        /* // check if ball collided with a player
        if ((ball.prevX <= character.prevX+this.cW &&
            ball.prevX >= character.prevX) ||
              (ball.prevX + this.bW <= character.prevX+this.cW &&
                ball.prevX + this.bW >= character.prevX)) {
          if ((ball.prevY <= character.prevY+this.cW &&
            ball.prevY >= character.prevY) ||
              (ball.prevY + this.bW <= character.prevY+this.cW &&
                ball.prevY + this.bW >= character.prevY)) {
            collision = true;
          }
        }*/

        if (collision) {
          this.rebound(ball, character.prevX, character.prevY, this.cW);
          ball.ownerName = character.name;
          break;
        }
      }
    }

    // loop through bricks
    this.bricks.forEach((brick) => {
      collision = GameInstance.boxCollision(
          ball.prevX,
          ball.prevY,
          this.bW,
          brick.x,
          brick.y,
          brick.w);

      // bounce off and destroy brick
      if (collision) {
        // bounce ball
        this.rebound(ball, brick.x, brick.y, brick.w);
        // destroy brick
        this.bricks.splice(this.bricks.indexOf(brick), 1);
        // give points to the player who last hit the ball (if they exist)
        if (ball.ownerName && this.characters[ball.ownerName]) {
          // increase score
          this.characters[ball.ownerName].score += 1;
        }
      }
    });
  }

  checkForWinner() {
    // loop through characters
    const names = Object.keys(this.characters);
    for (let i = 0; i < names.length; i++) {
      if (Object.prototype.hasOwnProperty.call(this.characters, names[i])) {
        const character = this.characters[names[i]];
        if (character.score > this.bricks.length) {
          // winner found, end game
          this.flags.winner = character.name;
        }
      }
    }
  }

  updateBall() {
    const ball = this.ball;
    const max = 800;
    const axisSpeed = 3;
    // update position
    ball.prevX = ball.destX;
    ball.prevY = ball.destY;
    ball.destX = ball.prevX + ball.vx;
    ball.destY = ball.prevY + ball.vy;
    // bounding
    if (ball.destX > max) ball.vx = -axisSpeed;
    if (ball.destX < 0) ball.vx = axisSpeed;
    if (ball.destY > max) ball.vy = -axisSpeed;
    if (ball.destY < 0) ball.vy = axisSpeed;
    // collision
    this.checkCollisions();
  }

  update() {
    this.updateBall();
    this.checkForWinner();
  }

  updateClients(io, key) {
    this.flags = {};
    this.update();
    // emit the list of characters to each room
    const output = {
      bricks: this.bricks,
      characters: this.characters,
      ball: this.ball,
      flags: this.flags,
    };
    io.to(key).emit('output', output);
  }
}

module.exports.GameInstance = GameInstance;
