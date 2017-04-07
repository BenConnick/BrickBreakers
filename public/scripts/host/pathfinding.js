class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.gScore = 0;
    this.fScore = 0;
    this.cameFrom = undefined;
  }
}

/*
function Astar(nodes, start, goal, width) {
    // The set of nodes already evaluated.
    var closedSet = [];
    // The set of currently discovered nodes still to be evaluated.
    // Initially, only the start node is known.
    var openSet = [start];
    // For each node, which node it can most efficiently be reached from.
    // If a node can be reached from many nodes, cameFrom will eventually contain the
    // most efficient previous step.
    var cameFrom = start; // the empty map

    // For each node, the cost of getting from the start node to that node.
    var gScore = 1000000000; // map with default value of Infinity
    // The cost of going from start to start is zero.
    gScore[start] = 0;
    // For each node, the total cost of getting from the start node to the goal
    // by passing by that node. That value is partly known, partly heuristic.
    var fScore = 1000000000; // map with default value of Infinity
    // For the first node, that value is completely heuristic.
    fScore[start] = 0; // heuristic_cost_estimate(start, goal);

    while (openSet.length != 0) {
    var current = start;
    // find the node in openSet having the lowest fScore[] value
    for (var i=0; i<openSet.length; i++) {
      if (openSet[i].fScore < current.fScore)
        current = openSet[i];
    }
    // made it!
        if (current === goal)
            return reconstruct_path(current)

        openSet.splice(openSet.indexOf(current),1);
        closedSet.push(current);
        for (var i=0; i<4; i++) { // for each neighbor of current
      var neighbor;
      switch(i) {
        case 0:
          neighbor = nodes[current.x-1][current.y];
          break;
        case 1:
          neighbor = nodes[current.x][current.y-1];
          break;
        case 2:
          neighbor = nodes[current.x+1][current.y];
          break;
        case 3:
          neighbor = nodes[current.x][current.y+1];
          break;
      }
      if (neighbor === undefined) continue;
      if (dungeon.floors[currentFloorNum].grid[neighbor.x][neighbor.y] === tileTypes.WALL) continue;
            if (closedSet.indexOf(neighbor) > -1)
                continue;    // Ignore the neighbor which is already evaluated.
            // The distance from start to a neighbor
            var tentative_gScore = current.gScore + dist_between(current, neighbor);
            if (openSet.indexOf(neighbor) === -1) {  // Discover a new node
        console.log(neighbor);
        debugger;
                openSet.push(neighbor);
      }
            else if (tentative_gScore >= neighbor.gScore)
                continue;    // This is not a better path.

            // This path is the best until now. Record it!
      neighbor.cameFrom = current;
            neighbor.gScore = tentative_gScore;
            neighbor.fScore = neighbor.gScore + heuristic_cost_estimate(neighbor, goal);
    }
  }
    return false;
}
*/
/*
const dist_between = (a,b) => {
  // if they are neighbors then the dist is 1
  return 1;
  //return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
}

const heuristic_cost_estimate = (a,b) => {
  return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y));
}

const reconstruct_path = (current) => {
    total_path = [current];
    while (current.cameFrom != undefined) {
        current = current.cameFrom;
        total_path.push(current);
    }
    return total_path;
}
*/
