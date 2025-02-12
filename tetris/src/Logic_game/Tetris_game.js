import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

function TetrisGame() {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    const GRID_COLUMNS = 10;  // number of columns
    const GRID_ROWS = 20;    // number of rows
    const CELL_SIZE = 30;   // cell size in px

    let lastFallTime = 0; // time of the last piece drop
    let lastGroundTime = 0; // time of the last piece grounding
    let lastGroundPositionX = -1; // last position of the piece when it grounded
    let lastGroundPositionY = -1; // last position of the piece when it grounded
    let lastGroundRotation = -1; // last rotation of the piece when it grounded
    let lockdownRule = 14; // lockdown resets left
    const fallSpeed = 500; // time in ms between each drop

    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0));

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff];

    const shapes = [
        // O (square)
        [[[1, 1],
          [1, 1]],
         [[1, 1],
          [1, 1]]],

        // I
        [[[0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1],
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0]],

         [[0, 0, 0, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0]],
          
         [[0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [1, 1, 1, 1, 0],
          [0, 0, 0, 0, 0]
          [0, 0, 0, 0, 0]],
          
         [[0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 1, 0, 0],
          [0, 0, 0, 0, 0]]],

        // T
        [[[0, 1, 0],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 1],
          [0, 1, 0]],

         [[0, 0, 0],
          [1, 1, 1],
          [0, 1, 0]],

         [[0, 1, 0],
          [1, 1, 0],
          [0, 1, 0]]],

        // L 
        [[[0, 0, 1],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 0],
          [0, 1, 1]],

         [[0, 0, 0],
          [1, 1, 1],
          [1, 0, 0]],

         [[1, 1, 0],
          [0, 1, 0],
          [0, 1, 0]]],

        // J
        [[[1, 0, 0],
          [1, 1, 1],
          [0, 0, 0]],

         [[0, 1, 1],
          [0, 1, 0],
          [0, 1, 0]],

         [[0, 0, 0],
          [1, 1, 1],
          [0, 0, 1]],

         [[0, 1, 0],
          [0, 1, 0],
          [1, 1, 0]]],

        // Z
        [[[1, 1, 0],
          [0, 1, 1],
          [0, 0, 0]],

         [[0, 0, 1],
          [0, 1, 1],
          [0, 1, 0]],
          
         [[0, 0, 0],
          [1, 1, 0],
          [0, 1, 1]],

         [[0, 1, 0],
          [1, 1, 0],
          [1, 0, 0]]],

        // S
        [[[0, 1, 1],
          [1, 1, 0],
          [0, 0, 0]],

         [[0, 1, 0],
          [0, 1, 1],
          [0, 0, 1]],
        
         [[0, 0, 0],
          [0, 1, 1],
          [1, 1, 0]],
    
         [[1, 0, 0],
          [1, 1, 0],
          [0, 1, 0]]]
    ];

    let shapeIndex = Math.floor(Math.random() * shapes.length); // random shape selection
    let rotation = 0;
    let shapeX = 4;
    let shapeY = 0;

    function drawStoredShapes(scene) {
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLUMNS; col++) {
                if (grid[row][col] !== 0) {
                    scene.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 
                        CELL_SIZE, CELL_SIZE, grid[row][col]);
                }
            }
        }
    }

    function saveToGrid(scene) {
        for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                if (shapes[shapeIndex][rotation][y][x] === 1) {
                    let newX = shapeX + x;
                    let newY = shapeY + y;
                    if (newY < GRID_ROWS && newX < GRID_COLUMNS) {
                        grid[newY][newX] = colors[shapeIndex]; 
                    }
                }
            }
        }
    
        clearFullLines(scene); // check and remove full lines after placing a piece
    }

    function clearFullLines(scene) {
        let linesCleared = 0;
        for (let row = GRID_ROWS - 1; row >= 0; row--) {
            if (grid[row].every(cell => cell !== 0)) { 
                grid.splice(row, 1); // remove the full row
                grid.unshift(Array(GRID_COLUMNS).fill(0)); // add an empty row at the top
                row++; // stay at the same row index to check again
                linesCleared ++;
                row++; // stay at the same row index to check again
                linesCleared = true;
            }
        }
    
        if (linesCleared > 0) {
            scene.redrawScene(); // ensure the grid is updated visually
        }
    }
    
    function resetPiece() {
        shapeIndex = Math.floor(Math.random() * shapes.length);
        rotation = 0;
        shapeX = 4;
        shapeY = 0;
    }

    function canMove(offsetX, offsetY, newRotation) {
        for (let y = 0; y < shapes[shapeIndex][newRotation].length; y++) {
            for (let x = 0; x < shapes[shapeIndex][newRotation][y].length; x++) {
                if (shapes[shapeIndex][newRotation][y][x] === 1) {
                    let newX = shapeX + x + offsetX;
                    let newY = shapeY + y + offsetY;
    
                    // check if out of bounds
                    if (newX < 0 || newX >= GRID_COLUMNS || newY >= GRID_ROWS) {
                        return false;
                    }
                    //check if the cell is occupied
                    if (grid[newY][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // according SRS system in "https://tetris.wiki/Super_Rotation_System"
    const wallKicks = {
        "JLOSTZ": [
            [[0 , 0 ], [0 , 0 ], [0 , 0 ], [0, 0 ], [0 , 0 ]], // 0
            [[0 , 0 ], [1 , 0 ], [1 , 1 ], [0, -2], [1 , -2]], // R
            [[0 , 0 ], [0 , 0 ], [0 , 0 ], [0 , 0 ], [1 , 2 ]], // 2
            [[0 , 0 ], [-1, 0 ], [-1, 1 ], [0, -2], [-1, -2]]  // L
        ],
        "I": [
            [[0 , 0 ], [-1, 0 ], [2 , 0 ], [-1, 0 ], [2 , 0 ]], // 0
            [[-1, 0 ], [0 , 0 ], [0 , 0 ], [0 , 1 ], [0 , 2 ]], // R
            [[-1, -1], [1 , -1], [2 , -1], [1 , 0 ], [-2, 0 ]], // 2
            [[0 , -1], [0 , -1], [0 , -1], [0 , 1 ], [0, -2 ]]  // L
        ],
    };
    
    // check if the piece can rotate with the SRS rules
    function canRotate(newRotation) {
        if (shapeIndex === 0) return {allowed:true, newX : shapeX, newY : shapeY}; // square shape can always rotate
        let kicks = ((shapeIndex === 1) ? wallKicks["I"] : wallKicks["JLOSTZ"]);

        // adjust rotation index to correctly access the wall kick table when rotating between last and first state    
        for (let i = 0; i < kicks[newRotation].length; i++) {
            let offsetX = kicks[rotation][i][0] - kicks[newRotation][i][0];
            let offsetY = kicks[rotation][i][1] - kicks[newRotation][i][1];
            if (canMove(offsetX, offsetY, newRotation)) {
                return {allowed:true, newX : shapeX+offsetX, newY : shapeY+offsetY};
            }
        }
        return {allowed:false, newX : shapeX, newY : shapeY};
    }

    function tryRotate(newRotation) {
        let res = canRotate(newRotation);
        if (res.allowed) {
            rotation = newRotation;
            shapeX = res.newX;
            shapeY = res.newY;
        }
    }

    class TetrisScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TetrisScene' });
        }

        create() {
            this.drawGrid();
            drawStoredShapes(this);
            this.drawShape();
            this.input.keyboard.on('keydown', this.handleKey, this);
        }

        drawGrid() {
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                    let x = col * CELL_SIZE;
                    let y = row * CELL_SIZE;

                    this.add.rectangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 
                        CELL_SIZE, CELL_SIZE, 0x444444)
                        .setStrokeStyle(0.25, 0xD3D3D3);
                }
            }
        }

        drawShape() {
            // draw the stored blocks from the grid
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                    if (grid[row][col] !== 0) {
                        this.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, grid[row][col]);
                    }
                }
            }
        
            // draw the current falling shape
            let color = colors[shapeIndex];
            for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
                for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                    if (shapes[shapeIndex][rotation][y][x] === 1) {
                        let posX = (shapeX + x) * CELL_SIZE;
                        let posY = (shapeY + y) * CELL_SIZE;
        
                        this.add.rectangle(posX + CELL_SIZE / 2, posY + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, color);
                    }
                }
            }
        }
        

        update(time) {
            if (!canMove(0, 1, rotation)) { // Piece is on ground
                // Piece placed if has been on the ground for 500ms or too many lockdown resets
                if ((lastGroundPositionX === shapeX && lastGroundPositionY === shapeY && lastGroundRotation === rotation && time - lastGroundTime > 500) || lockdownRule === 0) {
                    lastGroundPositionX = -1;
                    lastGroundPositionY = -1;
                    lastGroundRotation = -1;
                    lockdownRule = 15;
                    saveToGrid(this);
                    resetPiece();
                }
                // If piece hasn't been placed , update new ground data
                else {
                    lockdownRule--;
                    lastGroundTime = time;
                    lastGroundPositionX = shapeX;
                    lastGroundPositionY = shapeY;
                    lastGroundRotation = rotation;
                }
            }
            else if (time - lastFallTime > fallSpeed) {
                shapeY++; // Move the piece down
                lastFallTime = time;
                lastGroundTime = time;
                lastGroundPositionX = shapeX;
                lastGroundPositionY = shapeY;
                lastGroundRotation = rotation;
            }
            
            this.redrawScene();
        }

        redrawScene() {
            this.children.removeAll(); // clear all displayed elements
            this.drawGrid(); // redraw the grid
            this.drawShape(); // redraw stored blocks and current falling shape
        }        

        handleKey(event) {
            switch (event.key) {
                case 'ArrowUp': // clockwise rotation
                    let newRotation = (rotation + 1) % shapes[shapeIndex].length;
                    tryRotate(newRotation);
                    break;
        
                case 'Control': // counterclockwise rotation
                    let counterRotation = (rotation - 1 + shapes[shapeIndex].length) % shapes[shapeIndex].length;
                    tryRotate(counterRotation);
                    break;
        
                case 'a': // 180° rotation
                    let doubleRotation = (rotation + 2) % shapes[shapeIndex].length;
                    tryRotate(doubleRotation);
                    break;
        
                case 'ArrowLeft': //move left
                    if (canMove(-1, 0, rotation)) shapeX--;
                    break;
        
                case 'ArrowRight': //move right
                    if (canMove(1, 0, rotation)) shapeX++;
                    break;
        
                case 'ArrowDown': // move down
                    if (canMove(0, 1, rotation)) shapeY++;
                    break;
        
                case 't': //test piece
                    shapeIndex = (shapeIndex + 1) % shapes.length;
                    rotation = 0;
                    shapeX = 4;
                    shapeY = 0;
                    break;
                default:
                    return; // exit if no relevant key is pressed
            }
            this.update();
        }
    }

    const config = {
        type: Phaser.AUTO,
        width: GRID_COLUMNS * CELL_SIZE,
        height: GRID_ROWS * CELL_SIZE,
        backgroundColor: '#000',
        scene: TetrisScene
    };
     
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };

  }, []);
  
  return (
    <div ref={gameContainerRef}></div>
  );
}

export default TetrisGame;