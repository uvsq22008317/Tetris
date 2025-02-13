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
    let grounded = false;
    let lastGroundPositionX = -1; // last position of the piece when it grounded
    let lastGroundPositionY = -1; // last position of the piece when it grounded
    let lastGroundRotation = -1; // last rotation of the piece when it grounded
    let lockdownRule = 15; // lockdown resets left

    let hasHeld = false; // true if hold has been used this piece
    let heldPiece = -1; // piece held in hold slot of pieces

    const fallSpeed = 500; // time in ms between each drop

    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0));

    const colors = [0xffff00, 0x00ffff, 0xff00ff, 0xffa500, 0x0000ff, 0xff0000, 0x00ff00];

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
          [0, 0, 0, 0, 0],
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
                linesCleared ++;
                row++; // stay at the same row index to check again
            }
        }
    
        if (linesCleared > 0) {
            scene.redrawScene(); // ensure the grid is updated visually
        }
    }

    function newPiece() {
        return Math.floor(Math.random() * shapes.length);
    }
    
    function resetPiece() {
        shapeIndex = newPiece()
        rotation = 0;
        shapeX = 4;
        shapeY = 0;
        lockdownRule = 15;
        grounded = false;
        hasHeld = false;
    }

    function takePiece(piece) {
        shapeIndex = piece;
        rotation = 0;
        shapeX = 4;
        shapeY = 0;
        lockdownRule = 15;
        grounded = false;
        hasHeld = true;
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

    // Tries to rotate a piece
    function tryRotate(newRotation, time) {
        let res = canRotate(newRotation);
        if (res.allowed) {
            rotation = newRotation;
            shapeX = res.newX;
            shapeY = res.newY;
            if (grounded) lockdownRule--;
        }
        groundCheck(time);
    }

    // Tries to move a piece
    function tryMove(offsetX, offsetY, time) {
        if (canMove(offsetX, offsetY, rotation)) {
            shapeX += offsetX;
            shapeY += offsetY;
            // If the piece is taken off the ground or moved down, reset the last fall time
            if (grounded || offsetY === 1) lastFallTime = time;
            if (grounded) lockdownRule--;	
            groundCheck(time);
        }
    }

    // Grounds the piece if it is on a surface
    function groundCheck(time) {
        if (!canMove(0, 1, rotation)) grounded = true;
        else grounded = false; 
        lastGroundTime = time;
        lastGroundPositionX = shapeX;
        lastGroundPositionY = shapeY;
        lastGroundRotation = rotation;
    }

    function getGhostPosition() {
        let ghostY = shapeY;
        while (canMove(0, ghostY - shapeY, rotation)) {
            ghostY++;
        }
        return ghostY-1;
    }

    function hold() {
        if (hasHeld) return;
        if (heldPiece === -1) {
            heldPiece = shapeIndex;
            resetPiece();
        }
        else {
            let temp = heldPiece;
            heldPiece = shapeIndex;
            takePiece(temp);
        }
        hasHeld = true;
    }

    // Fisher-Yates (Knuth) shuffle algorithm from https://rosettacode.org/wiki/Knuth_shuffle#ES5
    function fyShuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    class TetrisScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TetrisScene' });
        }

        create() {
            this.drawGrid();
            drawStoredShapes(this);
            this.drawShape();
            this.input.keyboard.on('keydown', (event) => this.handleKey(event, this.time.now), this);
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
            // Draw the stored blocks from the grid
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLUMNS; col++) {
                    if (grid[row][col] !== 0) {
                        this.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, row * CELL_SIZE + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, grid[row][col]);
                    }
                }
            }
            
            // Draw the current falling shape
            let color = colors[shapeIndex];
            for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
                for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
                    if (shapes[shapeIndex][rotation][y][x] === 1) {
                        let posX = (shapeX + x) * CELL_SIZE;
                        let posY = (shapeY + y) * CELL_SIZE;
                        let ghostY = (getGhostPosition() + y) * CELL_SIZE;
                        this.add.rectangle(posX + CELL_SIZE / 2, posY + CELL_SIZE / 2, 
                            CELL_SIZE, CELL_SIZE, color);
                        // Draw the ghost piece
                        this.add.rectangle(posX + CELL_SIZE / 2, ghostY + CELL_SIZE / 2,
                            CELL_SIZE, CELL_SIZE, color, 0.2); // 80% transparency
                    }
                }
            }
        }
            
        update(time) {
            console.log("grounded: " + grounded);
            console.log("lastGroundPositionX: " + lastGroundPositionX);
            console.log("lastGroundPositionY: " + lastGroundPositionY);
            console.log("lastGroundRotation: " + lastGroundRotation);
            console.log("shapeX: " + shapeX);
            console.log("shapeY: " + shapeY);
            console.log("rotation: " + rotation);
            console.log("lastGroundTime: " + lastGroundTime);
            console.log("time: " + time);
            if (grounded) {
                // Piece placed if has been on the ground for 500ms or too many lockdown resets
                if ((lastGroundPositionX === shapeX
                        && lastGroundPositionY === shapeY
                        && lastGroundRotation === rotation
                        && time - lastGroundTime > 500) 
                    || lockdownRule === 0) {
                    saveToGrid(this);
                    resetPiece();
                }
                // If piece hasn't been placed because of movement (ie time), do not update time
                else {
                    if (lockdownRule > 0 
                        && 
                        !(lastGroundPositionX === shapeX 
                            && lastGroundPositionY === shapeY 
                            && lastGroundRotation === rotation)) {
                        lockdownRule--;
                    }
                }
            }
            else {
                if (time - lastFallTime > fallSpeed) {
                    tryMove(0, 1, time);
                    lastFallTime = time;
                }
                groundCheck(time);
            }

            this.redrawScene();
        }

        redrawScene() {
            this.children.removeAll(); // clear all displayed elements
            this.drawGrid(); // redraw the grid
            this.drawShape(); // redraw stored blocks and current falling shape
        }        

        handleKey(event, time) {
            switch (event.key) {
                case 'ArrowUp': // clockwise rotation
                    let rotationCW = (rotation + 1) % shapes[shapeIndex].length;
                    tryRotate(rotationCW, time);
                    break;
        
                case 'Control': // counterclockwise rotation
                    let rotationCCW = (rotation - 1 + shapes[shapeIndex].length) % shapes[shapeIndex].length;
                    tryRotate(rotationCCW, time);
                    break;
        
                case 'a': // 180° rotation
                    let rotation180 = (rotation + 2) % shapes[shapeIndex].length;
                    tryRotate(rotation180, time);
                    break;
        
                case 'ArrowLeft': // move left
                    tryMove(-1, 0, time);
                    break;
        
                case 'ArrowRight': // move right
                    tryMove(1, 0, time);
                    break;
        
                case 'ArrowDown': // soft drop
                    tryMove(0, 1, time);
                    break;
                case ' ' : // hard drop
                    while (canMove(0, 1, rotation)) shapeY++;
                    saveToGrid(this);
                    resetPiece();
                    break;
                case 't': //test piece
                    resetPiece();
                    break;
                case 'c': // hold piece
                    hold();
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