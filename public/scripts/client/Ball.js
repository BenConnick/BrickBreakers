class Ball {
  constructor() {
    // position (animated)
    this.x = 400;
    this.y = 400;
    // velocity
    this.vx = 3;
    this.vy = 3;
    this.prevX = 0; // last known x location of ball
    this.prevY = 0; // last known y location of ball
    this.destX = 0; // destination x location of ball
    this.destY = 0; // destination y location of ball
    this.ownerName = undefined; // owner name
    this.alpha = 0;
  }
}