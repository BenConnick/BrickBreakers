// functions for visual effects
const effectsManager = {
  hitMarkers: [],
  sparks: [],
  addHitMarker(num, pos, color,multiplier) {
    this.hitMarkers.push(new HitMarker(num, pos, 1000, color,multiplier));
  },
  addSpark(pos, color) {
    this.sparks.push(new Spark(pos, 1000, color));
  },
  updateAll() {
    for (let i = this.hitMarkers.length - 1; i > -1; i--) {
      if (this.hitMarkers[i].checkExpiry() === 'expired') { this.hitMarkers.splice(i, 1); }
    }
    for (let i = this.sparks.length - 1; i > -1; i--) {
      if (this.sparks[i].checkExpiry() === 'expired') { this.sparks.splice(i, 1); }
    }
  },
  drawAll(ctx) {
    this.hitMarkers.forEach((hm) => {
      hm.draw(ctx);
    });
    this.sparks.forEach((s) => {
      s.draw(ctx);
    });
  },
};

class HitMarker {
  constructor(num, pos, lifetime, color, multiplier) {
    this.color = color || 'red';
    this.num = num;
    this.pos = pos;
    this.startTime = Date.now();
    this.lifetime = lifetime;
    this.offset = { x: Math.random() * 5, y: Math.random() * 10 };
    this.checkExpiry = function () {
      // console.log("killTime: "+(this.startTime + this.lifetime));
      // console.log("currentTime: "+Date.now());
      if (Date.now() > this.startTime + this.lifetime) return 'expired';
    };

    if (multiplier) {
      // bubble text
      this.txt = `x${this.num}`;
    } else {
      // bubble text
      this.txt = `-${this.num}`;
      // check for whiff
      if (this.num === 0) this.txt = 'miss';
      // check for HP potion
      if (this.num < 0) {
        const posNum = -1 * this.num;
        this.txt = `+${posNum}`;
      }
    }
  }

  draw(ctx) {
    const percent = (this.startTime + this.lifetime - Date.now()) / this.lifetime;
    ctx.save();
    // fade out
    ctx.globalAlpha = percent;
    // background
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x + this.offset.x + percent * 5 + 7, this.pos.y + this.offset.y + percent * 5 - 5, 15, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    // red
    ctx.fillStyle = 'white';
    // draw and slowly drift away
    ctx.font = '12px Verdana';
    ctx.fillText(this.txt, this.pos.x + this.offset.x + percent * 5, this.pos.y + this.offset.y + percent * 5);
    // reset
    ctx.restore();
  }
}

class Spark {
  constructor(pos, lifeTime, color) {
    this.pos = pos;
    this.startTime = Date.now();
    this.lifetime = lifeTime;

    if (color) {
      this.color = color;
    } else {
      this.color = '#55f';
    }
  }

  checkExpiry() {
    // console.log("killTime: "+(this.startTime + this.lifetime));
    // console.log("currentTime: "+Date.now());
    if (Date.now() > this.startTime + this.lifetime) return 'expired';
  }

  draw(ctx) {
    // percent of life
    const percent = (this.startTime + this.lifetime - Date.now()) / this.lifetime;

    // contain draw
    ctx.save();
    // fade out
    ctx.globalAlpha = percent;
    // color
    ctx.fillStyle = this.color;
    // pos
    ctx.translate(this.pos.x + percent * 5 + 7, this.pos.y + percent * 5 - 5);
    // rotate
    ctx.rotate(percent * 2 * Math.PI);
    // scale
    ctx.scale(1 + 2 * percent, 1 + 2 * percent);
    // draw 4 pointed star
    ctx.beginPath();
    ctx.moveTo(0, 15);
    ctx.lineTo(5, 5);
    ctx.lineTo(15, 0);
    ctx.lineTo(5, -5);
    ctx.lineTo(0, -15);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-15, 0);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    // fill
    ctx.fill();
    // reset context
    ctx.restore();
  }

}
