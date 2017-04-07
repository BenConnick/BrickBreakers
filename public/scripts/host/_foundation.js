// foundational and base classes as well as misc.

// game object base class
class GameObject {
  constructor(x_, y_) {
    this.x = x_ || 1;
    this.y = y_ || 1;
  }
}

// *** CHARACTER BASE CLASS ***
class Character extends GameObject {
  constructor(name) {
    // call parent constructor
    super();

    // *** RPG ATTRIBUTES ***
    // name
    this.name = name || 'unnamed';
    // lvl
    this.lvl = 1;
    // xp
    this.xp = 1;
    // hp
    this.maxHp = 1;
    this.hp = 1;
    // strength
    this.strength = 1;
    // defense
    this.defense = 1; // dodge chance
    this.dodge = function (attackerdefense) {
      return (Math.random() < this.defense / (this.defense + attackerdefense * 10));
    };
    this.zapped = false;


    // *** CHARACTER UTILITY ***
    // player only boolean
    this.isPlayer = false;
    // don't allow player input if the player has already acted this turn
    this.actionsLeft = 1;
    // store player input here until it can be used
    this.futurePos = { x: this.x, y: this.y };

    // *** DRAWING AND ANIMATION ***
    // base sprite
    this.image = undefined;
    // offset for drawing
    this.offsetX = 0;
    this.offsetY = 0;
    // when hit by an attack
    this.shakingTimer = 0; // not implemented
    // when attacking
    this.attackDirection = 0; // not implemented
    this.attackDirection = -1; // directions 0 to 3
    // moving
    this.prevPos = { x: 0, y: 0 };
    this.moveTransitionStart = 0;
    this.moveTransitionDuration = 100;
  }

  // *** METHODS ***
  // move one space given a direction and grid info
  move(dir, floor) {
    // check for able to act
    if (this.actionsLeft < 1) return;
    // subtract action
    // if (this.isPlayer) this.actionsLeft--; MOVEMENT IS NO LONGER TURN BASED
    if (dir === 'use [stairs]') {
      // Go DOWN
      if (this.x === currentFloor.stairsPos.x && this.y === currentFloor.stairsPos.y) {
        // if standing on stairs "ready"
        if (this.visible) { this.visible = false; }
        // unready
        else { this.visible = true; }

        // check if all players are ready
        for (var i = 0; i < players.length; i++) {
          if (players[i].visible) {
            return; // player is not ready, do not go down a floor
          }
        }
        // if all ready
        goToFloor(currentFloorNum + 1);
        players.forEach((p) => {
          p.x = currentFloor.spawn.x;
          p.y = currentFloor.spawn.y;
          p.visible = true;
        });
      // Go UP
      } else if (this.x === spawn.x && this.y === spawn.y && currentFloorNum > 0) {
        // if standing on stairs "ready"
        if (this.visible) { this.visible = false; }
        // unready
        else { this.visible = true; }
        // check if all players are ready
        for (var i = 0; i < players.length; i++) {
          if (players[i].visible) {
            return; // player is not ready, do not go up a floor
          }
        }
        // if all ready
        goToFloor(currentFloorNum - 1);
        players.forEach((p) => {
          p.x = currentFloor.stairsPos.x;
          p.y = currentFloor.stairsPos.y;
          p.visible = true;
        });
      }
      return;
    }

    // don't let invisible characters walk around
    if (this.visible === false) return;

    const projection = this.getProjection(dir);

    // moving is an attack if the space is occupied
    const collisionOccured = (this.checkAndResolveCollision(projection.x, projection.y));
    if (collisionOccured) {
      // do nothing more, handled in checkAndResolveCollision
    } else if (floor.grid[projection.x][projection.y] === tileTypes.WALL) {
      if (this.hitWall) this.hitWall();
    } else {
      this.prevPos.x = this.x;
      this.prevPos.y = this.y;
      this.x = projection.x;
      this.y = projection.y;
      this.moveTransitionStart = Date.now();
      currentFloor.openDoor(this.x, this.y);
    }

    // clear residual effects
    this.zapped = false;
  }

  getProjection(dir) {
    const projection = { x: this.x, y: this.y };
    switch (constants.directions[dir]) {
      case constants.directions.LEFT:
        projection.x = this.x - 1;
        break;
      case constants.directions.UP:
        projection.y = this.y - 1;
        break;
      case constants.directions.RIGHT:
        projection.x = this.x + 1;
        break;
      case constants.directions.DOWN:
        projection.y = this.y + 1;
        break;
    }
    return projection;
  }

  checkAndResolveCollision(x, y) {
    // get target of the appropriate type
    const target = gameTools.checkForOpponent(this.isPlayer, x, y);
    // attack
    if (target) {
      this.attack(target);
      return true;
    }
  }

  damage(num, xpCallback) {
    this.hp -= num;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
    if (this.hp <= 0) {
      console.log(`${this.name} ded`);
      // if there is an xpCallback
      if (xpCallback) xpCallback(this.xp);
      if (!this.isPlayer) { currentFloor.enemies.splice(currentFloor.enemies.indexOf(this), 1); }
      // if there exists a death function
      if (this.death) this.death();
    }
    const color = this.isPlayer ? 'blue' : 'red';
    effectsManager.addHitMarker(num, { x: this.x * constants.tileSize, y: this.y * constants.tileSize }, color);
  }

  // attack target
  attack(target) {
    // if the target is invalid, escape
    if (target.hp === undefined) return;
    // roll for dodge
    if (target.dodge(this.defense)) {
      target.damage(0);
      return;
    }
    // check for weapon
    const power = this.weapon ? this.strength + this.weapon.power : this.strength;
    // roll for damage
    const damage = Math.ceil(power / 2 + Math.random() * power / 2);
    // deal damage
    const ref = this;
    target.damage(damage, (val) => { if (ref.addXp) ref.addXp(val); });
  }

  // draw on the screen
  draw(ctx) {
    ctx.save();

    // transition percent
    const p = Math.min(1, (Date.now() - this.moveTransitionStart) / this.moveTransitionDuration);

    // where to draw
    const drawPosX = this.x * constants.tileSize * p + this.prevPos.x * constants.tileSize * (1 - p) + this.offsetX;
    const drawPosY = this.y * constants.tileSize * p + this.prevPos.y * constants.tileSize * (1 - p) + this.offsetY;

    // draw the character sprite
    ctx.drawImage(this.image, drawPosX, drawPosY);

    // health bar background
    ctx.fillStyle = 'black';
    ctx.fillRect(drawPosX, drawPosY, 30, 2);

    // health bar percent
    ctx.fillStyle = 'red';
    ctx.fillRect(drawPosX, drawPosY, 30 * this.hp / this.maxHp, 2);

    // show status
    if (this.actionsLeft === 0) {
      ctx.globalAlpha = 0.6;
    }

    // name tag
    ctx.fillStyle = 'white';
    ctx.font = '8px Verdana';
    ctx.fillText(`${this.name} Lvl.${this.lvl}`, drawPosX, drawPosY - 2);

    // restore
    ctx.restore();
  }

  applyEffect(effectName, origin) {
    // debug
    console.log(`potion effect: ${effectName}`);

    switch (effectName) {
      case 'strength potion':
        this.temporaryStatBoost(
          this.addStrength, 10, 30000);
        break;
      case 'defense potion':
        this.temporaryStatBoost(
          this.multiplyDefense, 10, 30000);
        break;
      case 'lightning potion':
        this.lightningBurst(origin);
        break;
      case 'health potion':
        this.damage(-20, () => {});
        break;
    }
  }

  // damage all of the spaces around a character (chain reaction)
  // origin is the character that started the lightning chain
  lightningBurst(origin) {
    // visual
    const pos = { x: this.x * constants.tileSize, y: this.y * constants.tileSize };
    // debug
    console.log(`${this.name} is zapping everything`);
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        effectsManager.addSpark({ x: pos.x + x * constants.tileSize, y: pos.y + y * constants.tileSize });
        const target = gameTools.checkForEnemy(this.x + x, this.y + y);
        if (target) {
          // prevent infinite loop
          if (!target.zapped) {
            // mark as zapped
            target.zapped = true;
            // apply lightning damage to target, add xp if it dies
            target.lightningBurst(origin);
          }
        }
      }
    }
    // damage self last
    // this.damage(constants.lightningDamage,function(val) { if (origin.addXp) origin.addXp(val); });
  }

  // boost a stat for a set duration
  temporaryStatBoost(func, amount, duration) {
    // change stat
    func(this, amount);
    // reference to self
    const self = this;
    // if duration <= 0 the effect is permanent
    if (duration > 0) {
      // apply the opposite effect in time = duration
      window.setTimeout(() => { self.temporaryStatBoost(func, -1 * amount, -1); }, duration);
    }
  }

  // strength boost or nerf
  addStrength(target, amount) {
    const color = '#3a5';
    effectsManager.addHitMarker(-1 * amount, { x: target.x * constants.tileSize, y: target.y * constants.tileSize }, color);
    target.strength += amount;
  }

  // defense boost or nerf
  addDefense(target, amount) {
    const color = 'yellow';
    effectsManager.addHitMarker(amount, { x: target.x * constants.tileSize, y: target.y * constants.tileSize }, color);
    target.defense += amount;
  }
}
// inheritance
// Character.prototype = Object.create(GameObject.prototype);
// Character.prototype.constructor = Character;

// container for helper functions
const gameTools = {
  checkForOpponent(isPlayer, x, y) {
    if (isPlayer) {
      return gameTools.checkForEnemy(x, y);
    }
    return gameTools.checkForPlayer(x, y);
  },

  checkForPlayer(x, y) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].x === x && players[i].y === y) {
        return players[i];
      }
    }
  },
  checkForEnemy(x, y) {
    for (let i = 0; i < currentFloor.enemies.length; i++) {
      if (currentFloor.enemies[i].x === x && currentFloor.enemies[i].y === y) {
        return currentFloor.enemies[i];
      }
    }
  },
  checkForItem(x, y) {
    for (let i = 0; i < currentFloor.items.length; i++) {
      if (currentFloor.items[i].x === x && currentFloor.items[i].y === y) {
        return currentFloor.items[i];
      }
    }
  },
};

// container for powers
const powers = {
  lightningBurst(originPlayer, xStart, yStart) {
    const pos = { x: xStart * constants.tileSize, y: yStart * constants.tileSize };
    effectsManager.addSpark(pos);
    for (let x = -1; x < 2; x++) {
      for (let y = -1; y < 2; y++) {
        const target = gameTools.checkForEnemy(xStart + x, yStart + y);
        if (target) {
          // prevent infinite loop
          if (!target.zapped) {
            // mark as zapped
            target.zapped = true;
            // apply lightning damage to target, add xp if it dies
            target.lightningBurst(originPlayer);
          }
        }
      }
    }
  },
};
