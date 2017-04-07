// *** THE DUNGEON ***

const tileTypes = { FLOOR: 0, WALL: 1, DOOR: 2, WATER: 3, STAIRS_DOWN: 4, STAIRS_UP: 5 };
Object.freeze(tileTypes);
// const tileColors = ['grey', 'red', 'yellow', 'blue'];
const images = {
  tileset: undefined,
};
images.tileset = new Image();
images.tileset.src = 'images/rothens_tiles_2.png';
const tileImgWidth = 32;
const minRoomDimension = 5;


// partition class
class Partition {
  constructor(x, y, width, height) {
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;

    this.left = undefined;
    this.right = undefined;
  }
}

// try to create children partitions all the way down
const SubdivideRecursively = (cell, horiz, min, random) => {
  const children = Subdivide(cell, horiz, min);
  if (children != undefined) {
    cell.left = children[0];
    cell.right = children[1];
    let o1 = 0;
    let o2 = 0;
    if (random) {
      const r1 = Math.floor(Math.random() * 4);
      const r2 = Math.floor(Math.random() * 4);
      if (r1 > 1) o1 = r1;
      if (r2 > 1) o2 = r2;
    }
    SubdivideRecursively(cell.left, !horiz, min + o1);
    SubdivideRecursively(cell.right, !horiz, min + o2);
  }
  return cell;
};

// create children partitions of this cell
const Subdivide = (cell, horiz, min) => {
  if ((horiz && cell.width < min) || (!horiz && cell.height < min)) {
  // console.log("could not divide");
    return;
  }
  const children = [];
  if (horiz) {
    const div = 3 + Math.ceil(Math.random() * (cell.width - 6));
    // console.log("divided horizontally at "+div);
    children[0] = new Partition(cell.x, cell.y, div, cell.height);
    children[1] = new Partition(cell.x + div, cell.y, cell.width - div, cell.height);
  } else {
    const div = 3 + Math.ceil(Math.random() * (cell.height - 6));
    // console.log("divided vertically at "+div);
    children[0] = new Partition(cell.x, cell.y, cell.width, div);
    children[1] = new Partition(cell.x, cell.y + div, cell.width, cell.height - div);
  }
  return children;
};

// get teh leaf nodes
// (root)
const listRooms = (rootPartition) => {
  const rooms = [];
  traverseTree(rooms, rootPartition);
  return rooms;
};

// recurse and add the the list when you hit bottom
const traverseTree = (list, node) => {
  if (node.left === undefined && node.right === undefined) {
    list.push(node);
  } else {
    if (node.left !== undefined) traverseTree(list, node.left);
    if (node.right !== undefined) traverseTree(list, node.right);
  }
};

// given coordinates, find which room contains those coordinates
const getRoomIdxFromTile = (x, y, rooms) => {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].x <= x && x < rooms[i].x + rooms[i].width) {
      if (rooms[i].y <= y && y < rooms[i].y + rooms[i].height) {
        return i;
      }
    }
  }
};

// a floor object (tile map)
class Floor {
  constructor(w_, h_) {
    this.width = w_;
    this.height = h_;
    // tile representation
    this.grid = [];
    // enemies
    // list of enemies
    this.enemies = [];
    // create a grid with [width] columns
    for (let i = 0; i < w_; i++) {
      const col = [];
      // create a column with [height] tiles
      for (let j = 0; j < h_; j++) {
        col.push(tileTypes.FLOOR);
      }
      this.grid.push(col);
    }
    // the root node
    this.root = undefined;

    // list of the rooms
    this.rooms = [];
  }

  // create the walls and whatnot
  generate() {
    // create the root
    const root = new Partition();
    root.width = this.width - 1;
    root.height = this.height - 1;

    // pickups on this floor
    this.items = [];
    // enemies on this floor
    this.enemies = [];

    // create the room binary tree
    this.root = SubdivideRecursively(root, true, minRoomDimension, true);

    // fill list of rooms
    this.rooms = listRooms(this.root);
    this.rooms.forEach((room) => {
      room.visible = false;
    });

    // add walls
    this.createWalls(this.rooms);

    // add doors
    this.createDoors(this.root, true);

    // create down stairs
    const endNum = Math.floor(Math.random() * (this.rooms.length - 1));
    // if (endNum >= startNum) endNum++; // don't end in the same room as start
    const dsx = this.rooms[endNum].x + Math.floor(this.rooms[endNum].width / 2);
    const dsy = this.rooms[endNum].y + Math.floor(this.rooms[endNum].height / 2);
    this.grid[dsx][dsy] = tileTypes.STAIRS_DOWN;
    this.stairsPos = { x: dsx, y: dsy };

    // start in random room
    let startNum = Math.floor(Math.random() * this.rooms.length);
    // random room that is not the same as the end room
    for (let l = 0; l < 100; l++) {
      if (startNum === endNum) {
        startNum = Math.floor(Math.random() * this.rooms.length);
      } else {
        break;
      }
    }
    // create up stairs
    this.rooms[startNum].visible = true;
    this.spawn = { x: this.rooms[startNum].x + 1, y: this.rooms[startNum].y + 1 };
    spawn.x = this.spawn.x;
    spawn.y = this.spawn.y;

    // create up stairs
    this.grid[spawn.x][spawn.y] = tileTypes.STAIRS_UP;

    // populate rooms
    this.populateRooms(this.rooms, startNum);

    // create up stairs
    this.grid[spawn.x][spawn.y] = tileTypes.STAIRS_UP;
  }

  populateRooms(rooms, startRoomNum) {
    for (let i = 0; i < rooms.length; i++) {
      if (i === startRoomNum) continue;
      // decide how many and how powerful enemies in this room could potentially be
      let roomThreatLevel = Math.ceil(currentFloorNum * (rooms[i].width * rooms[i].height / 200.0) * (players.length + 1)); // 1 to 4 inclusive + floorNum
      console.log(`room${i} threat level: ${roomThreatLevel}`);
      // decide how many pieces of loot in this room
      const lootHere = Math.random() * rooms[i].width * rooms[i].height / 5.0;
      // place loot
      for (let j = 0; j < Math.floor(lootHere); j++) {
        const x = rooms[i].x + 1 + Math.floor(Math.random() * (rooms[i].width - 1));
        const y = rooms[i].y + 1 + Math.floor(Math.random() * (rooms[i].height - 1));
        const num = Math.ceil(Math.random() * (currentFloorNum + 1));
        const lootType = Math.floor(Math.random() * 4);
        let item;
        switch (lootType) {
          case 0:
            item = new GoldPile(x, y, num);
            break;
          case 1:
            item = new Potion(x, y, 'red');
            break;
          case 2:
            item = new Potion(x, y, 'green');
            break;
          case 3:
            item = new Potion(x, y, 'blue');
            break;
        }

        item.setRoomNum(i);
        this.items.push(item);
      }
      // spawn enemies
      while (roomThreatLevel > 0) {
        const x = rooms[i].x + 1 + Math.floor(Math.random() * (rooms[i].width - 1));
        const y = rooms[i].y + 1 + Math.floor(Math.random() * (rooms[i].height - 1));
        const enemy = createRandomEnemy(0, roomThreatLevel);
        roomThreatLevel -= enemy.lvl;
        enemy.x = x; enemy.y = y;
        enemy.setRoomNum(i);
        this.enemies.push(enemy);
      }
    }
  }

  // changes the tiles to wall tiles
  createWalls(rooms) {
    const thisFloor = this;
    rooms.forEach((room) => {
      for (let i = room.y; i < (room.y + room.height + 1); i++) {
        thisFloor.grid[room.x][i] = tileTypes.WALL;
        thisFloor.grid[room.x + room.width][i] = tileTypes.WALL;
      }
      for (let i = room.x; i < (room.x + room.width + 1); i++) {
        thisFloor.grid[i][room.y] = tileTypes.WALL;
        thisFloor.grid[i][room.y + room.height] = tileTypes.WALL;
      }
    });
  }

  // puts gaps in the walls
  createDoors(root, horiz) {
    if (root.left && root.right) {
      this.addDoor(root, horiz);
      this.createDoors(root.left, !horiz);
      this.createDoors(root.right, !horiz);
    }
  }

  addDoor(cell, horiz) {
    if (horiz) {
      let found = false;
      let tries = 0;
      while (!found && tries < 100) {
        const h = cell.left.y + Math.floor(Math.random() * (cell.left.height - 1));
        const w = cell.left.x + cell.left.width;
        // console.log("" + this.grid[w+1,h] + "," + this.grid[w,h] + "," + this.grid[w-1,h]);
        if (this.grid[w + 1][h] === tileTypes.FLOOR &&
          this.grid[w - 1][h] === tileTypes.FLOOR) {
          // create door
          this.grid[w][h] = tileTypes.DOOR;
          found = true;
        }
        tries++;
      }
    } else {
      let found = false;
      let tries = 0;
      while (!found && tries < 100) {
        const w = cell.left.x + Math.floor(Math.random() * (cell.left.width - 1));
        const h = cell.left.y + cell.left.height;
        if (w > 19) {
          // console.log(w);
        }
        if (this.grid[w][h + 1] === tileTypes.FLOOR &&
          this.grid[w][h - 1] === tileTypes.FLOOR) {
          // create door
          this.grid[w][h] = tileTypes.DOOR;
          found = true;
        }
        tries++;
      }
    }
  }

  openDoor(x, y) {
    if (this.grid[x][y] === tileTypes.DOOR) {
      this.rooms[getRoomIdxFromTile(x, y, this.rooms)].visible = true;
      this.rooms[getRoomIdxFromTile(x - 1, y - 1, this.rooms)].visible = true;
    }
  }

  display(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // how big tiles normally look
    const tileSize = constants.tileSize;
    // tile size is proportional to the amount of space (what?)
    // let screenTileSize = Math.min(canvas.width/this.width, canvas.height/this.height);
    // scale the whole thing based on how many tiles can fit
    // let scale = screenTileSize / tileSize;
    // first move the grid so that the center is in the center
    ctx.save();
    // ctx.translate(-1*this.width*this.tileSize / 2, -1*this.height*this.tileSize / 2);
    // ctx.scale(scale, scale);

    // get floor reference for use in anonymous func
    const floor = this;

    // loop through rooms
    this.rooms.forEach((room) => {
      // ctx.fillRect((room.x+1)*tileSize, (room.y+1)*tileSize, (room.width-1)*tileSize, (room.height-1)*tileSize);
      // only draw visible rooms
      if (room.visible) {
        // loop through room
        for (let i = 0; i < room.width + 1; i++) {
          for (let j = 0; j < room.height + 1; j++) {
            // ctx.fillStyle = tileColors[floor.grid[room.x+i][room.y+j]];
            const type = floor.grid[room.x + i][room.y + j];
            // ctx.fillRect((room.x+i)*tileSize,(room.y+j)*tileSize,tileSize,tileSize);
            ctx.drawImage(images.tileset, tileImgWidth * type, 0, 32, 32, (room.x + i) * tileSize, (room.y + j) * tileSize, tileSize, tileSize);
          }
        }
      }
    });
    // console.log(i*j);
    ctx.restore();
  }

}


class Dungeon {
  constructor() {
    // list of tile maps
    this.floors = [];
  }
  addFloor(w_, h_) {
    const f = new Floor(w_, h_);
    f.generate(); // procedurally create walls and doors
    this.floors.push(f);
  }
}
