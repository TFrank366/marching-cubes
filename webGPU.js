// webgpu.js
// handles the webgpu api
// generating mesh and rendering

export {setupMarch, march, setupRenderer, createBuffers, updateBuffers, renderView, deleteBuffers, clearScreen};
const WGSize = {
    x: 4,
    y: 4,
    z: 4
}

const vertCoordTable = [
    0, 0, 0, // 0
    1, 0, 0, // 1
    1, 1, 0, // 2
    0, 1, 0, // 3
    0, 0, 1, // 4
    1, 0, 1, // 5
    1, 1, 1, // 6
    0, 1, 1, // 7
];

// table of active edges for a specific vertex code
// in order
const edgeTable = [
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,3,8,9,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,8,10,-1,-1,-1,-1,-1,-1,
    0,2,9,10,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,8,9,10,-1,-1,-1,-1,-1,-1,-1,
    2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,8,11,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,9,11,-1,-1,-1,-1,-1,-1,
    1,2,8,9,11,-1,-1,-1,-1,-1,-1,-1,
    1,3,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,8,10,11,-1,-1,-1,-1,-1,-1,-1,
    0,3,9,10,11,-1,-1,-1,-1,-1,-1,-1,
    8,9,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,7,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,7,8,9,-1,-1,-1,-1,-1,-1,
    1,3,4,7,9,-1,-1,-1,-1,-1,-1,-1,
    1,2,4,7,8,10,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,7,10,-1,-1,-1,-1,-1,
    0,2,4,7,8,9,10,-1,-1,-1,-1,-1,
    2,3,4,7,9,10,-1,-1,-1,-1,-1,-1,
    2,3,4,7,8,11,-1,-1,-1,-1,-1,-1,
    0,2,4,7,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,7,8,9,11,-1,-1,-1,
    1,2,4,7,9,11,-1,-1,-1,-1,-1,-1,
    1,3,4,7,8,10,11,-1,-1,-1,-1,-1,
    0,1,4,7,10,11,-1,-1,-1,-1,-1,-1,
    0,3,4,7,8,9,10,11,-1,-1,-1,-1,
    4,7,9,10,11,-1,-1,-1,-1,-1,-1,-1,
    4,5,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,5,8,9,-1,-1,-1,-1,-1,-1,
    0,1,4,5,-1,-1,-1,-1,-1,-1,-1,-1,
    1,3,4,5,8,-1,-1,-1,-1,-1,-1,-1,
    1,2,4,5,9,10,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,5,8,9,10,-1,-1,-1,
    0,2,4,5,10,-1,-1,-1,-1,-1,-1,-1,
    2,3,4,5,8,10,-1,-1,-1,-1,-1,-1,
    2,3,4,5,9,11,-1,-1,-1,-1,-1,-1,
    0,2,4,5,8,9,11,-1,-1,-1,-1,-1,
    0,1,2,3,4,5,11,-1,-1,-1,-1,-1,
    1,2,4,5,8,11,-1,-1,-1,-1,-1,-1,
    1,3,4,5,9,10,11,-1,-1,-1,-1,-1,
    0,1,4,5,8,9,10,11,-1,-1,-1,-1,
    0,3,4,5,10,11,-1,-1,-1,-1,-1,-1,
    4,5,8,10,11,-1,-1,-1,-1,-1,-1,-1,
    5,7,8,9,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,7,9,-1,-1,-1,-1,-1,-1,-1,
    0,1,5,7,8,-1,-1,-1,-1,-1,-1,-1,
    1,3,5,7,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,5,7,8,9,10,-1,-1,-1,-1,-1,
    0,1,2,3,5,7,9,10,-1,-1,-1,-1,
    0,2,5,7,8,10,-1,-1,-1,-1,-1,-1,
    2,3,5,7,10,-1,-1,-1,-1,-1,-1,-1,
    2,3,5,7,8,9,11,-1,-1,-1,-1,-1,
    0,2,5,7,9,11,-1,-1,-1,-1,-1,-1,
    0,1,2,3,5,7,8,11,-1,-1,-1,-1,
    1,2,5,7,11,-1,-1,-1,-1,-1,-1,-1,
    1,3,5,7,8,9,10,11,-1,-1,-1,-1,
    0,1,5,7,9,10,11,-1,-1,-1,-1,-1,
    0,3,5,7,8,10,11,-1,-1,-1,-1,-1,
    5,7,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    5,6,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,6,8,10,-1,-1,-1,-1,-1,-1,
    0,1,5,6,9,10,-1,-1,-1,-1,-1,-1,
    1,3,5,6,8,9,10,-1,-1,-1,-1,-1,
    1,2,5,6,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,5,6,8,-1,-1,-1,-1,-1,
    0,2,5,6,9,-1,-1,-1,-1,-1,-1,-1,
    2,3,5,6,8,9,-1,-1,-1,-1,-1,-1,
    2,3,5,6,10,11,-1,-1,-1,-1,-1,-1,
    0,2,5,6,8,10,11,-1,-1,-1,-1,-1,
    0,1,2,3,5,6,9,10,11,-1,-1,-1,
    1,2,5,6,8,9,10,11,-1,-1,-1,-1,
    1,3,5,6,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,5,6,8,11,-1,-1,-1,-1,-1,-1,
    0,3,5,6,9,11,-1,-1,-1,-1,-1,-1,
    5,6,8,9,11,-1,-1,-1,-1,-1,-1,-1,
    4,5,6,7,8,10,-1,-1,-1,-1,-1,-1,
    0,3,4,5,6,7,10,-1,-1,-1,-1,-1,
    0,1,4,5,6,7,8,9,10,-1,-1,-1,
    1,3,4,5,6,7,9,10,-1,-1,-1,-1,
    1,2,4,5,6,7,8,-1,-1,-1,-1,-1,
    0,1,2,3,4,5,6,7,-1,-1,-1,-1,
    0,2,4,5,6,7,8,9,-1,-1,-1,-1,
    2,3,4,5,6,7,9,-1,-1,-1,-1,-1,
    2,3,4,5,6,7,8,10,11,-1,-1,-1,
    0,2,4,5,6,7,10,11,-1,-1,-1,-1,
    0,1,2,3,4,5,6,7,8,9,10,11,
    1,2,4,5,6,7,9,10,11,-1,-1,-1,
    1,3,4,5,6,7,8,11,-1,-1,-1,-1,
    0,1,4,5,6,7,11,-1,-1,-1,-1,-1,
    0,3,4,5,6,7,8,9,11,-1,-1,-1,
    4,5,6,7,9,11,-1,-1,-1,-1,-1,-1,
    4,6,9,10,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,6,8,9,10,-1,-1,-1,-1,-1,
    0,1,4,6,10,-1,-1,-1,-1,-1,-1,-1,
    1,3,4,6,8,10,-1,-1,-1,-1,-1,-1,
    1,2,4,6,9,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,6,8,9,-1,-1,-1,-1,
    0,2,4,6,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,4,6,8,-1,-1,-1,-1,-1,-1,-1,
    2,3,4,6,9,10,11,-1,-1,-1,-1,-1,
    0,2,4,6,8,9,10,11,-1,-1,-1,-1,
    0,1,2,3,4,6,10,11,-1,-1,-1,-1,
    1,2,4,6,8,10,11,-1,-1,-1,-1,-1,
    1,3,4,6,9,11,-1,-1,-1,-1,-1,-1,
    0,1,4,6,8,9,11,-1,-1,-1,-1,-1,
    0,3,4,6,11,-1,-1,-1,-1,-1,-1,-1,
    4,6,8,11,-1,-1,-1,-1,-1,-1,-1,-1,
    6,7,8,9,10,-1,-1,-1,-1,-1,-1,-1,
    0,3,6,7,9,10,-1,-1,-1,-1,-1,-1,
    0,1,6,7,8,10,-1,-1,-1,-1,-1,-1,
    1,3,6,7,10,-1,-1,-1,-1,-1,-1,-1,
    1,2,6,7,8,9,-1,-1,-1,-1,-1,-1,
    0,1,2,3,6,7,9,-1,-1,-1,-1,-1,
    0,2,6,7,8,-1,-1,-1,-1,-1,-1,-1,
    2,3,6,7,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,6,7,8,9,10,11,-1,-1,-1,-1,
    0,2,6,7,9,10,11,-1,-1,-1,-1,-1,
    0,1,2,3,6,7,8,10,11,-1,-1,-1,
    1,2,6,7,10,11,-1,-1,-1,-1,-1,-1,
    1,3,6,7,8,9,11,-1,-1,-1,-1,-1,
    0,1,6,7,9,11,-1,-1,-1,-1,-1,-1,
    0,3,6,7,8,11,-1,-1,-1,-1,-1,-1,
    6,7,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    6,7,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,6,7,8,11,-1,-1,-1,-1,-1,-1,
    0,1,6,7,9,11,-1,-1,-1,-1,-1,-1,
    1,3,6,7,8,9,11,-1,-1,-1,-1,-1,
    1,2,6,7,10,11,-1,-1,-1,-1,-1,-1,
    0,1,2,3,6,7,8,10,11,-1,-1,-1,
    0,2,6,7,9,10,11,-1,-1,-1,-1,-1,
    2,3,6,7,8,9,10,11,-1,-1,-1,-1,
    2,3,6,7,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,6,7,8,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,6,7,9,-1,-1,-1,-1,-1,
    1,2,6,7,8,9,-1,-1,-1,-1,-1,-1,
    1,3,6,7,10,-1,-1,-1,-1,-1,-1,-1,
    0,1,6,7,8,10,-1,-1,-1,-1,-1,-1,
    0,3,6,7,9,10,-1,-1,-1,-1,-1,-1,
    6,7,8,9,10,-1,-1,-1,-1,-1,-1,-1,
    4,6,8,11,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,6,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,6,8,9,11,-1,-1,-1,-1,-1,
    1,3,4,6,9,11,-1,-1,-1,-1,-1,-1,
    1,2,4,6,8,10,11,-1,-1,-1,-1,-1,
    0,1,2,3,4,6,10,11,-1,-1,-1,-1,
    0,2,4,6,8,9,10,11,-1,-1,-1,-1,
    2,3,4,6,9,10,11,-1,-1,-1,-1,-1,
    2,3,4,6,8,-1,-1,-1,-1,-1,-1,-1,
    0,2,4,6,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,6,8,9,-1,-1,-1,-1,
    1,2,4,6,9,-1,-1,-1,-1,-1,-1,-1,
    1,3,4,6,8,10,-1,-1,-1,-1,-1,-1,
    0,1,4,6,10,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,6,8,9,10,-1,-1,-1,-1,-1,
    4,6,9,10,-1,-1,-1,-1,-1,-1,-1,-1,
    4,5,6,7,9,11,-1,-1,-1,-1,-1,-1,
    0,3,4,5,6,7,8,9,11,-1,-1,-1,
    0,1,4,5,6,7,11,-1,-1,-1,-1,-1,
    1,3,4,5,6,7,8,11,-1,-1,-1,-1,
    1,2,4,5,6,7,9,10,11,-1,-1,-1,
    0,1,2,3,4,5,6,7,8,9,10,11,
    0,2,4,5,6,7,10,11,-1,-1,-1,-1,
    2,3,4,5,6,7,8,10,11,-1,-1,-1,
    2,3,4,5,6,7,9,-1,-1,-1,-1,-1,
    0,2,4,5,6,7,8,9,-1,-1,-1,-1,
    0,1,2,3,4,5,6,7,-1,-1,-1,-1,
    1,2,4,5,6,7,8,-1,-1,-1,-1,-1,
    1,3,4,5,6,7,9,10,-1,-1,-1,-1,
    0,1,4,5,6,7,8,9,10,-1,-1,-1,
    0,3,4,5,6,7,10,-1,-1,-1,-1,-1,
    4,5,6,7,8,10,-1,-1,-1,-1,-1,-1,
    5,6,8,9,11,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,6,9,11,-1,-1,-1,-1,-1,-1,
    0,1,5,6,8,11,-1,-1,-1,-1,-1,-1,
    1,3,5,6,11,-1,-1,-1,-1,-1,-1,-1,
    1,2,5,6,8,9,10,11,-1,-1,-1,-1,
    0,1,2,3,5,6,9,10,11,-1,-1,-1,
    0,2,5,6,8,10,11,-1,-1,-1,-1,-1,
    2,3,5,6,10,11,-1,-1,-1,-1,-1,-1,
    2,3,5,6,8,9,-1,-1,-1,-1,-1,-1,
    0,2,5,6,9,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,5,6,8,-1,-1,-1,-1,-1,
    1,2,5,6,-1,-1,-1,-1,-1,-1,-1,-1,
    1,3,5,6,8,9,10,-1,-1,-1,-1,-1,
    0,1,5,6,9,10,-1,-1,-1,-1,-1,-1,
    0,3,5,6,8,10,-1,-1,-1,-1,-1,-1,
    5,6,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    5,7,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,7,8,10,11,-1,-1,-1,-1,-1,
    0,1,5,7,9,10,11,-1,-1,-1,-1,-1,
    1,3,5,7,8,9,10,11,-1,-1,-1,-1,
    1,2,5,7,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,5,7,8,11,-1,-1,-1,-1,
    0,2,5,7,9,11,-1,-1,-1,-1,-1,-1,
    2,3,5,7,8,9,11,-1,-1,-1,-1,-1,
    2,3,5,7,10,-1,-1,-1,-1,-1,-1,-1,
    0,2,5,7,8,10,-1,-1,-1,-1,-1,-1,
    0,1,2,3,5,7,9,10,-1,-1,-1,-1,
    1,2,5,7,8,9,10,-1,-1,-1,-1,-1,
    1,3,5,7,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,5,7,8,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,7,9,-1,-1,-1,-1,-1,-1,-1,
    5,7,8,9,-1,-1,-1,-1,-1,-1,-1,-1,
    4,5,8,10,11,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,5,10,11,-1,-1,-1,-1,-1,-1,
    0,1,4,5,8,9,10,11,-1,-1,-1,-1,
    1,3,4,5,9,10,11,-1,-1,-1,-1,-1,
    1,2,4,5,8,11,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,5,11,-1,-1,-1,-1,-1,
    0,2,4,5,8,9,11,-1,-1,-1,-1,-1,
    2,3,4,5,9,11,-1,-1,-1,-1,-1,-1,
    2,3,4,5,8,10,-1,-1,-1,-1,-1,-1,
    0,2,4,5,10,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,5,8,9,10,-1,-1,-1,
    1,2,4,5,9,10,-1,-1,-1,-1,-1,-1,
    1,3,4,5,8,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,5,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,5,8,9,-1,-1,-1,-1,-1,-1,
    4,5,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,7,9,10,11,-1,-1,-1,-1,-1,-1,-1,
    0,3,4,7,8,9,10,11,-1,-1,-1,-1,
    0,1,4,7,10,11,-1,-1,-1,-1,-1,-1,
    1,3,4,7,8,10,11,-1,-1,-1,-1,-1,
    1,2,4,7,9,11,-1,-1,-1,-1,-1,-1,
    0,1,2,3,4,7,8,9,11,-1,-1,-1,
    0,2,4,7,11,-1,-1,-1,-1,-1,-1,-1,
    2,3,4,7,8,11,-1,-1,-1,-1,-1,-1,
    2,3,4,7,9,10,-1,-1,-1,-1,-1,-1,
    0,2,4,7,8,9,10,-1,-1,-1,-1,-1,
    0,1,2,3,4,7,10,-1,-1,-1,-1,-1,
    1,2,4,7,8,10,-1,-1,-1,-1,-1,-1,
    1,3,4,7,9,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,7,8,9,-1,-1,-1,-1,-1,-1,
    0,3,4,7,-1,-1,-1,-1,-1,-1,-1,-1,
    4,7,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    8,9,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,9,10,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,8,10,11,-1,-1,-1,-1,-1,-1,-1,
    1,3,10,11,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,8,9,11,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,9,11,-1,-1,-1,-1,-1,-1,
    0,2,8,11,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,11,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,8,9,10,-1,-1,-1,-1,-1,-1,-1,
    0,2,9,10,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,8,10,-1,-1,-1,-1,-1,-1,
    1,2,10,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,3,8,9,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,9,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,8,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
];

// converts from an edge number to the numbers of the vertices it connects
const edgeToVertsTable = [
    0, 1, // 0
    1, 2, // 1
    2, 3, // 2
    0, 3, // 3
    4, 5, // 4
    5, 6, // 5
    6, 7, // 6
    4, 7, // 7
    0, 4, // 8
    1, 5, // 9
    2, 6, // 10
    3, 7, // 11
    
];

// triangulation table created from: https://github.com/KineticTactic/marching-cubes-js
const triTable = [
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,1,3,2,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,3,1,2,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,1,3,0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,1,0,4,2,4,3,2,-1,-1,-1,-1,-1,-1,
    1,2,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,1,2,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,4,0,2,3,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,1,0,3,4,3,2,4,-1,-1,-1,-1,-1,-1,
    1,2,0,3,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,1,0,2,3,2,4,3,-1,-1,-1,-1,-1,-1,
    1,2,0,1,4,2,4,3,2,-1,-1,-1,-1,-1,-1,
    1,0,2,2,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,1,0,3,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,5,4,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,0,4,2,3,0,3,1,0,-1,-1,-1,-1,-1,-1,
    0,1,5,4,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    3,4,5,3,0,4,1,2,6,-1,-1,-1,-1,-1,-1,
    5,1,6,5,0,1,4,2,3,-1,-1,-1,-1,-1,-1,
    0,5,4,0,4,3,0,3,1,3,4,2,-1,-1,-1,
    4,2,3,1,5,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,2,3,4,1,2,1,0,2,-1,-1,-1,-1,-1,-1,
    7,0,1,6,4,5,2,3,8,-1,-1,-1,-1,-1,-1,
    2,3,5,4,2,5,4,5,1,4,1,0,-1,-1,-1,
    1,5,0,1,6,5,3,4,2,-1,-1,-1,-1,-1,-1,
    1,5,4,1,2,5,1,0,2,3,5,2,-1,-1,-1,
    2,3,4,5,0,7,5,7,6,7,0,1,-1,-1,-1,
    0,1,4,0,4,2,2,4,3,-1,-1,-1,-1,-1,-1,
    2,1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    5,3,2,0,4,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,2,1,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,3,2,4,1,3,1,0,3,-1,-1,-1,-1,-1,-1,
    0,1,5,4,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    3,0,6,1,2,8,4,7,5,-1,-1,-1,-1,-1,-1,
    3,1,4,3,2,1,2,0,1,-1,-1,-1,-1,-1,-1,
    0,5,3,1,0,3,1,3,2,1,2,4,-1,-1,-1,
    4,3,2,0,1,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,6,1,0,4,6,2,5,3,-1,-1,-1,-1,-1,-1,
    0,5,4,0,1,5,2,3,6,-1,-1,-1,-1,-1,-1,
    1,0,3,1,3,4,1,4,5,2,4,3,-1,-1,-1,
    5,1,6,5,0,1,4,3,2,-1,-1,-1,-1,-1,-1,
    2,5,3,0,4,1,4,6,1,4,7,6,-1,-1,-1,
    3,2,0,3,0,5,3,5,4,5,0,1,-1,-1,-1,
    1,0,2,1,2,3,3,2,4,-1,-1,-1,-1,-1,-1,
    3,1,2,0,1,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,1,0,4,2,1,2,3,1,-1,-1,-1,-1,-1,-1,
    0,3,4,0,1,3,1,2,3,-1,-1,-1,-1,-1,-1,
    0,2,1,1,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    5,3,4,5,2,3,6,0,1,-1,-1,-1,-1,-1,-1,
    7,1,2,6,4,0,4,3,0,4,5,3,-1,-1,-1,
    4,0,1,4,1,2,4,2,3,5,2,1,-1,-1,-1,
    0,4,2,0,2,1,1,2,3,-1,-1,-1,-1,-1,-1,
    3,5,2,3,4,5,1,6,0,-1,-1,-1,-1,-1,-1,
    4,2,3,4,3,1,4,1,0,1,3,5,-1,-1,-1,
    2,3,7,0,1,6,1,5,6,1,4,5,-1,-1,-1,
    4,1,0,4,0,3,3,0,2,-1,-1,-1,-1,-1,-1,
    5,2,4,4,2,3,6,0,1,6,1,7,-1,-1,-1,
    2,3,0,2,0,4,3,6,0,1,0,5,6,5,0,
    6,5,0,6,0,1,5,2,0,4,0,3,2,3,0,
    3,2,0,1,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,1,2,5,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,0,1,2,5,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,1,0,5,4,2,6,3,-1,-1,-1,-1,-1,-1,
    0,3,2,1,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,5,4,1,2,5,3,0,6,-1,-1,-1,-1,-1,-1,
    4,3,2,4,0,3,0,1,3,-1,-1,-1,-1,-1,-1,
    2,5,4,2,4,0,2,0,3,1,0,4,-1,-1,-1,
    0,1,5,4,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    6,0,4,6,1,0,5,3,2,-1,-1,-1,-1,-1,-1,
    0,1,6,2,3,8,4,7,5,-1,-1,-1,-1,-1,-1,
    2,6,3,0,5,1,5,7,1,5,4,7,-1,-1,-1,
    3,1,4,3,2,1,2,0,1,-1,-1,-1,-1,-1,-1,
    0,4,5,0,5,2,0,2,1,2,5,3,-1,-1,-1,
    1,5,3,0,1,3,0,3,2,0,2,4,-1,-1,-1,
    1,0,3,1,3,4,4,3,2,-1,-1,-1,-1,-1,-1,
    1,5,2,0,3,4,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,1,0,2,5,1,4,3,6,-1,-1,-1,-1,-1,-1,
    1,7,0,3,8,4,6,2,5,-1,-1,-1,-1,-1,-1,
    7,4,3,0,6,5,0,5,1,5,6,2,-1,-1,-1,
    4,0,1,4,3,0,2,5,6,-1,-1,-1,-1,-1,-1,
    1,2,5,5,2,6,3,0,4,3,4,7,-1,-1,-1,
    6,2,5,7,0,3,0,4,3,0,1,4,-1,-1,-1,
    5,1,6,5,6,2,1,0,6,3,6,4,0,4,6,
    1,8,0,5,6,2,7,4,3,-1,-1,-1,-1,-1,-1,
    3,6,4,2,5,1,2,1,0,1,5,7,-1,-1,-1,
    0,1,9,4,7,8,2,3,11,5,10,6,-1,-1,-1,
    6,1,0,6,8,1,6,2,8,5,8,2,3,7,4,
    6,2,5,1,7,3,1,3,0,3,7,4,-1,-1,-1,
    3,1,6,3,6,4,1,0,6,5,6,2,0,2,6,
    0,3,7,0,4,3,0,1,4,8,4,1,6,2,5,
    2,1,4,2,4,5,0,3,4,3,5,4,-1,-1,-1,
    3,0,2,1,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,6,3,2,5,6,0,4,1,-1,-1,-1,-1,-1,-1,
    4,0,1,4,3,0,3,2,0,-1,-1,-1,-1,-1,-1,
    4,1,0,4,0,3,4,3,2,3,0,5,-1,-1,-1,
    0,2,4,0,1,2,1,3,2,-1,-1,-1,-1,-1,-1,
    3,0,6,1,2,7,2,4,7,2,5,4,-1,-1,-1,
    0,1,2,2,1,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,1,0,4,0,2,2,0,3,-1,-1,-1,-1,-1,-1,
    5,2,4,5,3,2,6,0,1,-1,-1,-1,-1,-1,-1,
    0,4,1,1,4,7,2,5,6,2,6,3,-1,-1,-1,
    3,7,2,0,1,5,0,5,4,5,1,6,-1,-1,-1,
    3,2,0,3,0,5,2,4,0,1,0,6,4,6,0,
    4,3,2,4,1,3,4,0,1,5,3,1,-1,-1,-1,
    4,6,1,4,1,0,6,3,1,5,1,2,3,2,1,
    1,4,3,1,3,0,0,3,2,-1,-1,-1,-1,-1,-1,
    1,0,2,3,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,4,0,1,2,4,2,3,4,-1,-1,-1,-1,-1,-1,
    0,3,1,0,5,3,0,4,5,2,3,5,-1,-1,-1,
    5,2,3,1,5,3,1,3,4,1,4,0,-1,-1,-1,
    4,2,3,4,3,0,0,3,1,-1,-1,-1,-1,-1,-1,
    0,1,2,0,2,4,0,4,5,4,2,3,-1,-1,-1,
    2,4,6,2,6,1,4,5,6,0,6,3,5,3,6,
    3,4,0,3,0,2,2,0,1,-1,-1,-1,-1,-1,-1,
    3,1,0,2,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,7,6,2,4,6,4,5,4,2,3,-1,-1,-1,
    1,0,3,1,3,6,0,4,3,2,3,5,4,5,3,
    1,6,0,1,5,6,1,7,5,4,5,7,2,3,8,
    5,1,0,5,0,3,4,2,0,2,3,0,-1,-1,-1,
    4,5,2,4,2,3,5,0,2,6,2,1,0,1,2,
    0,4,1,5,2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    3,4,0,3,0,2,1,5,0,5,2,0,-1,-1,-1,
    1,2,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,0,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,0,4,5,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,5,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,0,5,4,1,0,6,3,2,-1,-1,-1,-1,-1,-1,
    4,0,1,2,5,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,7,3,0,6,4,8,5,-1,-1,-1,-1,-1,-1,
    1,4,0,1,5,4,2,6,3,-1,-1,-1,-1,-1,-1,
    2,7,3,0,6,1,6,4,1,6,5,4,-1,-1,-1,
    3,0,1,2,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    3,0,4,3,2,0,2,1,0,-1,-1,-1,-1,-1,-1,
    2,5,4,2,3,5,0,1,6,-1,-1,-1,-1,-1,-1,
    0,2,1,0,4,2,0,5,4,4,3,2,-1,-1,-1,
    4,3,2,4,0,3,0,1,3,-1,-1,-1,-1,-1,-1,
    5,3,2,1,3,5,1,4,3,1,0,4,-1,-1,-1,
    0,1,3,0,3,5,0,5,4,2,5,3,-1,-1,-1,
    1,0,4,1,4,2,2,4,3,-1,-1,-1,-1,-1,-1,
    1,2,0,3,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,3,4,1,0,3,0,2,3,-1,-1,-1,-1,-1,-1,
    4,3,6,4,2,3,5,0,1,-1,-1,-1,-1,-1,-1,
    4,2,3,4,3,1,4,1,0,5,1,3,-1,-1,-1,
    3,4,2,3,6,4,1,5,0,-1,-1,-1,-1,-1,-1,
    1,2,6,3,0,7,0,5,7,0,4,5,-1,-1,-1,
    2,7,4,2,3,7,0,1,5,1,6,5,-1,-1,-1,
    5,4,1,5,1,0,4,2,1,6,1,3,2,3,1,
    4,0,1,4,2,0,2,3,0,-1,-1,-1,-1,-1,-1,
    0,2,1,2,3,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,7,0,2,3,4,2,4,5,4,3,6,-1,-1,-1,
    0,4,2,0,2,1,1,2,3,-1,-1,-1,-1,-1,-1,
    4,0,1,4,3,0,4,2,3,3,5,0,-1,-1,-1,
    4,1,0,4,0,3,3,0,2,-1,-1,-1,-1,-1,-1,
    2,3,1,2,1,4,3,6,1,0,1,5,6,5,1,
    3,2,0,1,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,1,3,2,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,6,1,2,7,3,8,5,4,-1,-1,-1,-1,-1,-1,
    3,0,1,3,2,0,5,4,6,-1,-1,-1,-1,-1,-1,
    7,5,4,6,1,2,1,3,2,1,0,3,-1,-1,-1,
    6,3,2,7,0,1,5,4,8,-1,-1,-1,-1,-1,-1,
    6,11,7,1,2,10,0,8,3,4,9,5,-1,-1,-1,
    5,4,7,3,2,6,2,1,6,2,0,1,-1,-1,-1,
    1,2,6,1,3,2,1,0,3,7,3,0,8,5,4,
    5,0,1,5,4,0,3,2,6,-1,-1,-1,-1,-1,-1,
    7,3,2,0,6,4,0,4,1,4,6,5,-1,-1,-1,
    3,6,2,3,7,6,1,5,0,5,4,0,-1,-1,-1,
    4,1,6,4,6,5,1,0,6,2,6,3,0,3,6,
    6,3,2,7,0,4,0,5,4,0,1,5,-1,-1,-1,
    1,4,8,1,5,4,1,0,5,6,5,0,7,3,2,
    2,0,6,2,6,3,0,1,6,4,6,5,1,5,6,
    3,2,5,3,5,4,1,0,5,0,4,5,-1,-1,-1,
    1,3,0,1,4,3,4,2,3,-1,-1,-1,-1,-1,-1,
    1,3,5,0,3,1,0,2,3,0,4,2,-1,-1,-1,
    0,5,4,0,2,5,0,1,2,2,3,5,-1,-1,-1,
    3,4,1,3,1,2,2,1,0,-1,-1,-1,-1,-1,-1,
    0,1,6,5,2,7,5,7,4,7,2,3,-1,-1,-1,
    0,8,3,0,5,8,0,6,5,4,5,6,1,2,7,
    6,4,2,6,2,3,4,0,2,5,2,1,0,1,2,
    3,5,1,3,1,2,0,4,1,4,2,1,-1,-1,-1,
    2,4,5,2,0,4,2,3,0,1,4,0,-1,-1,-1,
    4,2,3,4,3,0,0,3,1,-1,-1,-1,-1,-1,-1,
    1,4,6,1,6,0,4,5,6,3,6,2,5,2,6,
    0,2,3,1,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,3,0,3,6,1,4,3,2,3,5,4,5,3,
    5,1,0,5,0,3,4,2,0,2,3,0,-1,-1,-1,
    0,1,4,2,3,5,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    3,0,2,1,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    6,2,5,6,3,2,4,1,0,-1,-1,-1,-1,-1,-1,
    2,6,3,2,5,6,1,4,0,-1,-1,-1,-1,-1,-1,
    6,3,2,6,7,3,5,4,0,4,1,0,-1,-1,-1,
    4,0,1,4,3,0,3,2,0,-1,-1,-1,-1,-1,-1,
    0,6,3,1,2,5,1,5,4,5,2,7,-1,-1,-1,
    4,3,2,4,1,3,4,0,1,1,5,3,-1,-1,-1,
    3,2,0,3,0,6,2,5,0,1,0,4,5,4,0,
    0,2,4,0,1,2,1,3,2,-1,-1,-1,-1,-1,-1,
    4,1,0,4,2,1,4,3,2,5,1,2,-1,-1,-1,
    6,0,1,4,7,3,4,3,5,3,7,2,-1,-1,-1,
    5,4,1,5,1,0,4,3,1,6,1,2,3,2,1,
    0,1,2,1,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,3,0,3,1,1,3,2,-1,-1,-1,-1,-1,-1,
    4,0,1,4,1,2,2,1,3,-1,-1,-1,-1,-1,-1,
    3,2,1,0,3,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,0,1,3,2,3,4,2,-1,-1,-1,-1,-1,-1,
    3,0,2,3,5,0,3,4,5,5,1,0,-1,-1,-1,
    0,1,5,4,2,6,4,6,7,6,2,3,-1,-1,-1,
    5,6,2,5,2,3,6,1,2,4,2,0,1,0,2,
    1,3,0,1,4,3,1,5,4,2,3,4,-1,-1,-1,
    0,4,6,0,6,3,4,5,6,2,6,1,5,1,6,
    0,1,3,0,3,5,1,6,3,2,3,4,6,4,3,
    4,2,3,0,5,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,3,5,1,3,0,1,2,3,1,4,2,-1,-1,-1,
    3,4,1,3,1,2,2,1,0,-1,-1,-1,-1,-1,-1,
    3,8,2,3,5,8,3,6,5,4,5,6,0,1,7,
    3,5,1,3,1,2,0,4,1,4,2,1,-1,-1,-1,
    4,2,3,4,3,1,1,3,0,-1,-1,-1,-1,-1,-1,
    0,2,3,1,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    4,2,3,4,3,1,5,0,3,0,1,3,-1,-1,-1,
    2,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,4,1,0,2,4,2,3,4,-1,-1,-1,-1,-1,-1,
    0,4,1,2,5,3,5,7,3,5,6,7,-1,-1,-1,
    1,4,5,1,5,2,1,2,0,3,2,5,-1,-1,-1,
    1,0,2,1,2,4,0,5,2,3,2,6,5,6,2,
    2,5,3,4,5,2,4,1,5,4,0,1,-1,-1,-1,
    7,5,4,7,8,5,7,1,8,2,8,1,0,6,3,
    4,3,2,4,2,1,1,2,0,-1,-1,-1,-1,-1,-1,
    5,3,2,5,2,0,4,1,2,1,0,2,-1,-1,-1,
    0,4,5,0,3,4,0,1,3,3,2,4,-1,-1,-1,
    5,6,3,5,3,2,6,1,3,4,3,0,1,0,3,
    3,5,6,3,6,2,5,4,6,1,6,0,4,0,6,
    0,5,1,4,3,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,4,0,2,0,3,3,0,1,-1,-1,-1,-1,-1,-1,
    2,5,1,2,1,3,0,4,1,4,3,1,-1,-1,-1,
    2,0,1,3,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,2,0,2,3,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,0,2,1,2,4,4,2,3,-1,-1,-1,-1,-1,-1,
    0,1,3,0,3,2,2,3,4,-1,-1,-1,-1,-1,-1,
    1,0,2,3,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,4,0,4,3,3,4,2,-1,-1,-1,-1,-1,-1,
    3,0,4,3,4,5,1,2,4,2,5,4,-1,-1,-1,
    0,1,3,2,0,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    1,0,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,0,2,4,4,2,3,-1,-1,-1,-1,-1,-1,
    2,3,1,0,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    2,3,4,2,4,5,0,1,4,1,5,4,-1,-1,-1,
    0,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,3,0,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,2,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    0,1,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
];

const tablesLength = vertCoordTable.length + edgeTable.length + edgeToVertsTable.length + triTable.length;


const shaderCode = `
    [[block]]
    struct Uniform {
        pMat : mat4x4<f32>;
        mvMat : mat4x4<f32>;
    };

    struct VertexOut {
        [[builtin(position)]] position : vec4<f32>;
        [[location(0)]] normal : vec3<f32>;
        [[location(1)]] eye : vec3<f32>;
    };

    struct Light {
        dir : vec3<f32>;
        color : vec3<f32>;
    };

    [[group(0), binding(0)]] var<uniform> u : Uniform;

    
    [[stage(vertex)]]
    fn vertex_main([[location(0)]] position: vec3<f32>,
                    [[location(1)]] normal: vec3<f32>) -> VertexOut
    {
        var out : VertexOut;
        var vert : vec4<f32> = u.mvMat * vec4<f32>(position, 1.0);
        
        out.position = u.pMat * vert;
        out.normal = normal;
        out.eye = -vec3<f32>(vert.xyz);

        return out;
    }

    [[stage(fragment)]]
    fn fragment_main(data: VertexOut) -> [[location(0)]] vec4<f32>
    {
        var light1 : Light;
        light1.dir = vec3<f32>(0.0, 0.0, -1.0);
        light1.color = vec3<f32>(1.0);

        let diffuseColor = vec3<f32>(0.1, 0.7, 0.6);
        let specularColor = vec3<f32>(1.0);
        let shininess : f32 = 150.0;

        var E = normalize(data.eye);
        var N = normalize(data.normal);
        
        var diffuseFac = max(dot(-N, light1.dir), 0.0);
        
        var diffuse : vec3<f32>;
        var specular : vec3<f32>;
        var ambient : vec3<f32> = diffuseColor*0.3;
        
        var reflected : vec3<f32>;

        if (diffuseFac > 0.0) {
            diffuse = diffuseColor*light1.color*diffuseFac;

            reflected = reflect(light1.dir, N);
            var specularFac : f32 = pow(max(dot(reflected, E), 0.0), shininess);
            specular = specularColor*light1.color*specularFac;
        }
        
        return vec4<f32>(diffuse + specular + ambient, 1.0);
    }          
`

const enumerateCode = `

    [[block]] struct Data {
        size : vec3<u32>;
        data : array<f32>;
    };
    [[block]] struct Arr {
        data : array<i32>;
    };
    [[block]] struct Vars {
        threshold : f32;
        vertCount : atomic<u32>;
        indexCount : atomic<u32>;
    };
    [[block]] struct Tables {
        vertCoord : array<array<u32, 3>, 8>;
        edge : array<array<i32, 12>, 256>;
        edgeToVerts : array<array<i32, 2>, 12>;
        tri : array<array<i32, 15>, 256>;
    };
    [[group(0), binding(0)]] var<storage, read> d : Data;
    [[group(0), binding(1)]] var<storage, read> tables : Tables;

    [[group(1), binding(0)]] var<storage, read_write> vars : Vars;
    
    fn getIndex3d(coord : vec3<u32>, size : vec3<u32>) -> u32 {
        return size.y * size.z * coord.x + size.z * coord.y + coord.z;
    }

    fn getIndex2d(coord : vec2<u32>, size : vec2<u32>) -> u32 {
        return size.y * coord.x + coord.y;
    }

    fn getVertCount(code : u32) -> u32 {
        var i = 0u;
        loop {
            if (i == 12u || tables.edge[code][i] == -1) {
                break;
            }
            i = i + 1u;
        }
        return i;
    }
    fn getIndexCount(code : u32) -> u32 {
        var i = 0u;
        loop {
            if (i == 15u || tables.tri[code][i] == -1) {
                break;
            }
            i = i + 1u;
        }
        return i;
    }
    
    [[stage(compute), workgroup_size(${WGSize.x}, ${WGSize.y}, ${WGSize.z})]]
    fn main([[builtin(global_invocation_id)]] id : vec3<u32>) {         

        // if outside of data, return
        var cells : vec3<u32> = vec3<u32>(d.size.x - 1u, d.size.y - 1u, d.size.z - 1u);
        if (id.x >= cells.x || id.y >= cells.y || id.z >= cells.z) {
            return;
        }

        var code : u32 = 0u;        
        var c : array<u32, 3>;
        var i = 0u;
        loop {
            if (i == 8u) {
                break;
            }
            // the coordinate of the vert being looked at
            c = tables.vertCoord[i];
            var a : u32 = getIndex3d(vec3<u32>(id.x + c[0], id.y + c[1], id.z + c[2]), d.size);
            var val : f32 = d.data[a];
            if (val > vars.threshold) {
                code = code | (1u << i);
            }
            continuing {
                i = i + 1u;
            }
        }
        if (code == 0u || code == 255u) {
            return;
        }

        // the index of the cell
        // var index : u32 = getIndex3d(vec3<u32>(id.x, id.y, id.z), d.size);

        // add to the others
        ignore(atomicAdd(&vars.vertCount, getVertCount(code)));
        ignore(atomicAdd(&vars.indexCount, getIndexCount(code)));
    }
`;

const marchCode = `
    [[block]] struct Data {
        size : vec3<u32>;
        data : array<f32>;
    };
    [[block]] struct Vars {
        threshold : f32;
        currVert : atomic<u32>;
        currIndex : atomic<u32>;
    };
    [[block]] struct Tables {
        vertCoord : array<array<u32, 3>, 8>;
        edge : array<array<i32, 12>, 256>;
        edgeToVerts : array<array<i32, 2>, 12>;
        tri : array<array<i32, 15>, 256>;
    };
    [[block]] struct F32Buff {
        buffer : array<f32>;
    };
    [[block]] struct U32Buff {
        buffer : array<u32>;
    };
    [[block]] struct Atoms {
        vert : atomic<u32>;
        index : atomic<u32>;
    };

    [[group(0), binding(0)]] var<storage, read> d : Data;
    [[group(0), binding(1)]] var<storage, read> tables : Tables;

    [[group(1), binding(0)]] var<storage, read_write> vars : Vars;

    [[group(2), binding(0)]] var<storage, read_write> verts : F32Buff;
    [[group(2), binding(1)]] var<storage, read_write> normals : F32Buff;
    [[group(2), binding(2)]] var<storage, read_write> indices : U32Buff;

    fn getIndex3d(coord : vec3<u32>, size : vec3<u32>) -> u32 {
        return size.y * size.z * coord.x + size.z * coord.y + coord.z;
    }



    [[stage(compute), workgroup_size(${WGSize.x}, ${WGSize.y}, ${WGSize.z})]]
    fn main([[builtin(global_invocation_id)]] id : vec3<u32>) {         

        // if outside of data, return
        var cells : vec3<u32> = vec3<u32>(d.size.x - 1u, d.size.y - 1u, d.size.z - 1u);
        if (id.x >= cells.x || id.y >= cells.y || id.z >= cells.z) {
            return;
        }
        // calculate the code
        var code : u32 = 0u;        
        var c : array<u32, 3>;
        var i = 0u;
        loop {
            if (i == 8u) {
                break;
            }
            // the coordinate of the vert being looked at
            c = tables.vertCoord[i];
            var a : u32 = getIndex3d(vec3<u32>(id.x + c[0], id.y + c[1], id.z + c[2]), d.size);
            var val : f32 = d.data[a];
            if (val > vars.threshold) {
                code = code | (1u << i);
            }
            continuing {
                i = i + 1u;
            }
        }
        if (code == 0u || code == 255u) {
            return;
        }
        verts.buffer[0] = 1.0;

        var vertNum : u32 = 0u;
        var indexNum : u32 = 0u;

        // get vertices
        var thisVerts : array<f32, 36>;
        var edges : array<i32, 12> = tables.edge[code];
        i = 0u;
        loop {
            if (i == 12u || edges[i] == -1) {
                break;
            }
            var connected : array<i32, 2> = tables.edgeToVerts[edges[i]];
            var a : array<u32, 3> = tables.vertCoord[connected[0]];
            var b : array<u32, 3> = tables.vertCoord[connected[1]];
            var va : f32 = d.data[getIndex3d(vec3<u32>(id.x + a[0], id.y + a[1], id.z + a[2]), d.size)];
            var vb : f32 = d.data[getIndex3d(vec3<u32>(id.x + b[0], id.y + b[1], id.z + b[2]), d.size)];
            var fac : f32 = (vars.threshold - va)/(vb - va);
            thisVerts[3u*i + 0u] = f32(a[0])*(1. - fac) + f32(b[0])*fac + f32(id.x);
            thisVerts[3u*i + 1u] = f32(a[1])*(1. - fac) + f32(b[1])*fac + f32(id.y);
            thisVerts[3u*i + 2u] = f32(a[2])*(1. - fac) + f32(b[2])*fac + f32(id.z);
            continuing {
                i = i + 1u;
            }
        }

        vertNum = i;

        // get the offset to write into the vertex and normal buffers
        var currVert = atomicAdd(&vars.currVert, vertNum);

        i = 0u;
        loop {
            if (i == vertNum) {
                break;
            }
            verts.buffer[3u*(currVert + i) + 0u] = thisVerts[3u*i + 0u];
            verts.buffer[3u*(currVert + i) + 1u] = thisVerts[3u*i + 1u];
            verts.buffer[3u*(currVert + i) + 2u] = thisVerts[3u*i + 2u];
            continuing {
                i = i + 1u;
            }
        }

        var thisIndices : array<u32, 15>;

        i = 0u;
        loop {
            if (i == 15u || tables.tri[code][i] == -1) {
                break;
            }
            thisIndices[i] = bitcast<u32>(tables.tri[code][i]) + currVert;
            continuing {
                i = i + 1u;
            }
        }

        indexNum = i;

        // add the indices number to the current offset
        var currIndex = atomicAdd(&vars.currIndex, indexNum);

        i = 0u;
        loop {
            if (i == indexNum) {
                break;
            }
            indices.buffer[currIndex + i] = thisIndices[i];
            continuing {
                i = i + 1u;
            }
        }
    }
`;

function getNewBufferId() {
    var id = Object.keys(buffers).length;
        while (buffers.hasOwnProperty(String(id))) {
            id++;
        };
        return String(id);
}

const clearColor = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

// webgpu objects
var adapter;
var device;

var renderPipeline;
var marchPipeline;
var enumeratePipeline

// specific buffers for each mesh loaded
var buffers = {};
// contains matrices for rendering
var uniformBuffer;
// contains the threshold value + #vert + #ind
var marchVarsBuffer

var marchVertBuffer;
var marchNormalBuffer;
var marchIndexBuffer;

var marchVertReadBuffer;
var marchNormalReadBuffer;
var marchIndexReadBuffer;

var marchIndicesNumber = 0;

var constantsBindGroup;
var marchVarsBindGroup;
var countReadBuffer;

var bindGroup;


// incomplete
function setupMarch(dataObj) {
    if (dataObj.data.constructor != Float32Array) {
        console.log("only float32 data values supported so far");
        return;
    }
    // create the enumaeration and marching cubes pipelines
    enumeratePipeline = createEnumeratePipeline();
    marchPipeline = createMarchPipeline(); 

    createBindGroups(dataObj);

    countReadBuffer = device.createBuffer({
        size: 2 * Uint32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    })
}

function createConstantsBindGroupLayout() {
    return  device.createBindGroupLayout({
        entries: [
            // dims + data
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage",
                }
            },
            // tables 
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "read-only-storage",
                }
            }
        ]
    });
}

function createEnumeratePipeline() {
    var enumerateModule = device.createShaderModule({
        code: enumerateCode
    });

    // first bind group is for the constant data (data, dimensions)
    var bindGroupLayout0 = createConstantsBindGroupLayout();

    // second is for holding threshold + vert + indices number
    var bindGroupLayout1 = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            }
        ]
    });

    var pipelineLayout = device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout0, bindGroupLayout1]});

    return device.createComputePipeline({
        layout: pipelineLayout,
        compute: {
            module: enumerateModule,
            entryPoint: "main"
        }
    });
}

function createBindGroups(dataObj) {
    // set the data and its dimensions
    var dataBuffer = device.createBuffer({
        size: 3 * Uint32Array.BYTES_PER_ELEMENT + dataObj.volume * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    }); 

    var range = dataBuffer.getMappedRange()

    new Uint32Array(range, 0, 3).set(dataObj.size);
    new Float32Array(range, 3 * Uint32Array.BYTES_PER_ELEMENT, dataObj.volume).set(dataObj.data);
    dataBuffer.unmap();


    //set the various tables needed
    var tableBuffer = device.createBuffer({
        size: tablesLength * Uint32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    });

    console.log(tablesLength);

    var range = tableBuffer.getMappedRange();
    var currOff = 0;
    for (let t of [vertCoordTable, edgeTable, edgeToVertsTable, triTable]) { 
        new Uint32Array(range, currOff*4, t.length).set(t);
        currOff += t.length;
    };

    tableBuffer.unmap();

    constantsBindGroup = device.createBindGroup({
        layout: enumeratePipeline.getBindGroupLayout(0),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: dataBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: tableBuffer
                }
            }
        ]
    });

    // create the buffer for threshold + #verts and #ind
    marchVarsBuffer = device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT + Uint32Array.BYTES_PER_ELEMENT*2,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        mappedAtCreation: true
    });

    // temporary ###########################################
    var range = marchVarsBuffer.getMappedRange();
    new Float32Array(range, 0, 1).set([0.5]);
    marchVarsBuffer.unmap()
    // #####################################################

    marchVarsBindGroup = device.createBindGroup({
        layout: enumeratePipeline.getBindGroupLayout(1),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: marchVarsBuffer
                }
            }
        ]
    });
}

function createMarchPipeline() {
    const shaderModule = device.createShaderModule({
        code: marchCode
    });

    // 0 bind group is for the constant data
    var bindGroupLayout0 = createConstantsBindGroupLayout();

    // 1 is for vars (threshold, vert num, index num)
    var bindGroupLayout1 = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            }
        ]
    });

    
    // 2 is for writing vert pos, norm + indices
    var bindGroupLayout2 = device.createBindGroupLayout({
        entries: [
            // vert buffer
            {
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            },
            // normal buffer
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            },
            // index buffer
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: {
                    type: "storage",
                }
            }
        ]
    });

    var pipelineLayout = device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout0, bindGroupLayout1, bindGroupLayout2]});

    return device.createComputePipeline({
        layout: pipelineLayout,
        compute: {
            module: shaderModule,
            entryPoint: "main"
        }
    });
}

function createMarchOutputBindGroup(vertNum, indexNum) {
    marchVertBuffer = device.createBuffer({
        size: 3 * vertNum * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    }); 
    marchNormalBuffer = device.createBuffer({
        size: 3 * vertNum * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    marchIndexBuffer = device.createBuffer({
        size: indexNum * Uint32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    
    return device.createBindGroup({
        layout: marchPipeline.getBindGroupLayout(2),
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: marchVertBuffer
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: marchNormalBuffer
                }
            },
            {
                binding: 2,
                resource: {
                    buffer: marchIndexBuffer
                }
            },
        ]
    })
}

function createMarchReadBuffers(vertNum, indexNum) {
    marchVertReadBuffer = device.createBuffer({
        size: 3 * vertNum * Float32Array.BYTES_PER_ELEMENT,
        usage:  GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    }); 
    marchNormalReadBuffer = device.createBuffer({
        size: 3 * vertNum * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    marchIndexReadBuffer = device.createBuffer({
        size: indexNum * Uint32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
}

async function march(dataObj, meshObj, threshold) {
    var commandEncoder = device.createCommandEncoder();
    device.queue.writeBuffer(marchVarsBuffer, 0, new Float32Array([threshold, 0, 0]));

    await commandEncoder;
    var passEncoder = commandEncoder.beginComputePass();
    
    passEncoder.setPipeline(enumeratePipeline);
    passEncoder.setBindGroup(0, constantsBindGroup);
    passEncoder.setBindGroup(1, marchVarsBindGroup);
    passEncoder.dispatch(
        Math.ceil(dataObj.size[0]/WGSize.x),
        Math.ceil(dataObj.size[1]/WGSize.y),
        Math.ceil(dataObj.size[2]/WGSize.z)
    );
    passEncoder.endPass();
    commandEncoder.copyBufferToBuffer(marchVarsBuffer, 4, countReadBuffer, 0, 8);

    device.queue.submit([commandEncoder.finish()])

    // marching pass =====================================================================

    await countReadBuffer.mapAsync(GPUMapMode.READ, 0, 8)
    // get the length of the vert, index and normal buffers
    const lengths = new Uint32Array(countReadBuffer.getMappedRange());
    var vertNum = lengths[0];
    var indNum = lengths[1];
    countReadBuffer.unmap();

    if (vertNum == 0 || indNum == 0) {
        meshObj.verts = new Float32Array();
        meshObj.normals = new Float32Array();
        meshObj.indices = new Float32Array();
        return;
    }
    var marchOutBindGroup = createMarchOutputBindGroup(vertNum, indNum);
    createMarchReadBuffers(vertNum, indNum);

    commandEncoder = device.createCommandEncoder();
    device.queue.writeBuffer(marchVarsBuffer, 0, new Float32Array([threshold, 0, 0]));

    await commandEncoder;
    passEncoder = commandEncoder.beginComputePass();
    
    passEncoder.setPipeline(marchPipeline);
    passEncoder.setBindGroup(0, constantsBindGroup);
    passEncoder.setBindGroup(1, marchVarsBindGroup);
    passEncoder.setBindGroup(2, marchOutBindGroup);
    passEncoder.dispatch(
        Math.ceil(dataObj.size[0]/WGSize.x),
        Math.ceil(dataObj.size[1]/WGSize.y),
        Math.ceil(dataObj.size[2]/WGSize.z)
    );
    passEncoder.endPass();

    commandEncoder.copyBufferToBuffer(marchVertBuffer, 0, marchVertReadBuffer, 0, vertNum * 3 * 4);
    commandEncoder.copyBufferToBuffer(marchNormalBuffer, 0, marchNormalReadBuffer, 0, vertNum * 3 * 4);
    commandEncoder.copyBufferToBuffer(marchIndexBuffer, 0, marchIndexReadBuffer, 0, indNum * 4);

    device.queue.submit([commandEncoder.finish()])

    await marchVertReadBuffer.mapAsync(GPUMapMode.READ);
    meshObj.verts = new Float32Array(marchVertReadBuffer.getMappedRange()).slice(0);
    marchVertReadBuffer.unmap();

    await marchNormalReadBuffer.mapAsync(GPUMapMode.READ)
    meshObj.normals = new Float32Array(marchNormalReadBuffer.getMappedRange()).slice(0);
    marchNormalReadBuffer.unmap();

    await marchIndexReadBuffer.mapAsync(GPUMapMode.READ)
    meshObj.indices = new Uint32Array(marchIndexReadBuffer.getMappedRange()).slice(0);
    marchIndexReadBuffer.unmap();

    // delete all the temporary buffers
    destroyBuffer(marchVertBuffer);
    destroyBuffer(marchNormalBuffer);
    destroyBuffer(marchIndexBuffer);
    destroyBuffer(marchVertReadBuffer);
    destroyBuffer(marchNormalReadBuffer);
    destroyBuffer(marchIndexReadBuffer);
    

}

// rendering functions ====================================================================

async function setupRenderer(canvas) {
    adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();

    var ctx = canvas.getContext("webgpu");

    // setup swapchain
    ctx.configure({
        device: device,
        format: 'bgra8unorm'
    });

    // TODO: seperate pipeline for rendering views and copying to main texture

    renderPipeline = createRenderPipeline();

    uniformBuffer = device.createBuffer({
        size: 16*2*Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    
    bindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer
            }
        }]
    });

    return ctx;
}

function createRenderPipeline() {
    // compile shader code
    const shaderModule = device.createShaderModule({
        code: shaderCode
    });

    const vertexLayout = [
        {
            attributes: [{
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3'
            }],
            arrayStride: 12,
            stepMode: 'vertex'
        },
        {
            attributes: [{
                shaderLocation: 1,
                offset: 0,
                format: 'float32x3'
            }],
            arrayStride: 12,
            stepMode: 'vertex'
        }
    ];

    var bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.VERTEX,
            buffer: {
                type: "uniform",
            }
        }]
    });

    var pipelineLayout = device.createPipelineLayout({bindGroupLayouts: [bindGroupLayout]})
    
    // pipeline descriptor
    const pipelineDescriptor = {
        layout: pipelineLayout,
        vertex: {
            module: shaderModule,
            entryPoint: 'vertex_main',
            buffers: vertexLayout
        },
        fragment: {
            module: shaderModule,
            entryPoint: 'fragment_main',
            targets: [{
                format: 'bgra8unorm'
            }]
        },
        primitive: {
            topology: 'triangle-list'
        },
        depthStencil: {
            format: 'depth32float',
            depthWriteEnabled : true,
            depthCompare: 'less'
        }
    };

    // create the rendering pipeline
    return device.createRenderPipeline(pipelineDescriptor);
}

function createBuffers() {
    const id = getNewBufferId()
    buffers[id] = {
        vertex: {
            buffer: null,
            byteLength: 0
        },
        normal: {
            buffer: null,
            byteLength: 0
        },
        index: {
            buffer: null,
            byteLength: 0
        }
    }
    return id;
}

function createFilledBuffer(type, data, usage) {
    const byteLength = data.byteLength;
    var buffer = device.createBuffer({
        size: byteLength,
        usage: usage,
        mappedAtCreation: true
    });
    if (type == "f32") {
        new Float32Array(buffer.getMappedRange()).set(data);
    } else if (type == "u32") {
        new Uint32Array(buffer.getMappedRange()).set(data);
    } else if (type = "u8") {
        new Uint8Array(buffer.getMappedRange()).set(data);
    }
    
    buffer.unmap();
    return buffer;
}

function updateBuffers(mesh, id) {
    destroyBuffer(buffers[id].vertex.buffer);
    buffers[id].vertex.buffer = createFilledBuffer("f32", mesh.verts, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

    destroyBuffer(buffers[id].normal.buffer);
    buffers[id].normal.buffer = createFilledBuffer("f32", mesh.normals, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

    destroyBuffer(buffers[id].index.buffer);
    buffers[id].index.buffer = createFilledBuffer("u32", mesh.indices, GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);
}

function destroyBuffer(buffer) {
    if (buffer !== null) {
        buffer.destroy();
    }
}

function deleteBuffers(id) {
    buffers?.[id].vertex.buffer?.destroy();
    buffers?.[id].normal.buffer?.destroy();
    buffers?.[id].index.buffer?.destroy();
    delete buffers[id];
};

function clearScreen() {};

async function renderView(ctx, projMat, modelViewMat, box, indicesNum, id) {
    if (!buffers[id] || !buffers[id].vertex.buffer) return;

    var commandEncoder = device.createCommandEncoder();
    // provide details of load and store part of pass
    // here there is one color output that will be cleared on load

    var depthStencilTexture = device.createTexture({
        size: {
          width: ctx.canvas.width,
          height: ctx.canvas.height,
          depth: 1
        },
        dimension: '2d',
        format: 'depth32float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const renderPassDescriptor = {
        colorAttachments: [{
            loadValue: clearColor,
            storeOp: "store",
            view: ctx.getCurrentTexture().createView()
        }],
        depthStencilAttachment: {
            depthLoadValue: 1.0,
            depthStoreOp: 'discard',
            stencilLoadValue: 0,
            stencilStoreOp: 'store',
            view: depthStencilTexture.createView()
          }
    };

    // write uniforms to buffer
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([...projMat, ...modelViewMat]))

    await commandEncoder;
    
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setViewport(box.left, box.top, box.width, box.height, 0, 1);
    passEncoder.setScissorRect(box.left, box.top, box.width, box.height);
    passEncoder.setPipeline(renderPipeline);
    passEncoder.setIndexBuffer(buffers[id].index.buffer, "uint32");
    passEncoder.setVertexBuffer(0, buffers[id].vertex.buffer);
    passEncoder.setVertexBuffer(1, buffers[id].normal.buffer);
    passEncoder.setBindGroup(0, bindGroup);
    passEncoder.drawIndexed(indicesNum);
    passEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);

    depthStencilTexture.destroy();
}

async function renderFrame() {
    var commandEncoder = device.createCommandEncoder();
    var canvasTexture = ctx.getCurrentTexture();
    const renderPassDescriptor = {
        colorAttachments: [{
            loadValue: clearColor,
            storeOp: "store",
            view: canvasTexture.createView()
        }]
    };

    await commandEncoder;

    // need different pass descriptor
    //const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    
    for (view in Object.keys(/*view storage object*/)) {
        if (view.frameTexture) {
            passEncoder.copyTextureToTexture(view.frameTexture, canvasTexture, )
        }
    }
    passEncoder.endPass();

    device.queue.submit([commandEncoder.finish()]);

    // create a textureview for the whole canvas
    // access the framebuffers for each view
    // for (view in views) {
    // device.
    // copy each 
}