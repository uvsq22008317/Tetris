import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import "./Tetris.css";

function TetrisGame() {
  const gameContainerRef = useRef(null);

  useEffect(() => {

    // Handling
    const DAS = 130; // Delayed Auto Shift in ms
    const ARR = 0;  // Auto Repeat Rate in ms
    const SDF = Infinity;  // Soft Drop Factor
    let keyPressTimes = {}; // Track the time each key was pressed
    let keyRepeatTimers = {}; // Track the repeat timers for each key
    let activeDirection = null; // Track the currently active direction key
    let isSoftDropping = false; // Track if the down arrow key is held

    // Grid and pieces
    const GRID_COLUMNS = 10;  // number of columns
    const GRID_ROWS = 20;    // number of rows
    const CELL_SIZE = 30;   // cell size in px
    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0));

    const colors = [0xffff00, 0x00ffff, 0xff00ff, 0xffa500, 0x0000ff, 0xff0000, 0x00ff00];
    const shapes = [
        // O (square)
        [[[0, 1, 1],
          [0, 1, 1],
          [0, 0, 0]],
         [[0, 0, 0],
          [0, 1, 1],
          [0, 1, 1]],
         [[0, 0, 0],
          [1, 1, 0],
          [1, 1, 0]],
         [[1, 1, 0],
          [1, 1, 0],
          [0, 0, 0]]],
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

    // Track held piece info
    let hasHeld = false; // true if hold has been used this piece
    let heldPiece = -1; // piece held in hold slot of pieces

    // Track next piece info
    let nextPieces = generateBag().concat(generateBag()); // Start with 2 bags of pieces    
    
    let shapeIndex = nextPiece(); // random shape selection
    let rotation = 0;
    let shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
    let shapeY = 0;

    // Track previous drops info
    let combo = 0;
    let b2b = 0;
    
    // Track piece info
    let lastFallTime = 0; // time of the last piece drop
    let lastGroundTime = 0; // time of the last piece grounding
    let grounded = false;
    let lastGroundPositionX = -1; // last position of the piece when it grounded
    let lastGroundPositionY = -1; // last position of the piece when it grounded
    let lastGroundRotation = -1; // last rotation of the piece when it grounded
    let lockdownRule = 15; // lockdown resets left
    let lastMoveIsRotate = false; // true if the last move was a rotation
    let lastKickForceTspin = false; // last kick offset
    let level = 1;
    let lines = 0;
    let score = 0;
    const gravity = 0.02; // 1G : 1 cell per frame
    let fallSpeed = (1000/60)/(gravity*(2**(level-1))); // Fall speed in milliseconds

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
        let tspinStatus = isTSpin();
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

        let perfectClear = isPerfectClear();
        if (linesCleared > 0) {
            combo++;
            if (tspinStatus.tspin || linesCleared === 4) {
                b2b++;
            }
            else b2b = 0;
        }
        else {
            combo = 0;
        }
        console.log("Cleared : %s", evaluateString(linesCleared, tspinStatus, perfectClear));
        console.log("Combo : %s", combo);
        console.log("Back to Back : %s", b2b);
        score += evaluateScore(linesCleared, tspinStatus, perfectClear);
        console.log("Score : %s", score);
        lines += linesCleared;
        console.log("Lines : %s", lines);
        if (lines >= level * 10) {
            level++;
            fallSpeed = (1000/60)/(gravity*(2**(level-1)));
        }
    }
    
    function resetPiece(time) {
        shapeIndex = nextPiece();
        rotation = 0;
        shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
        shapeY = 0;
        lockdownRule = 15;
        grounded = false;
        hasHeld = false;
        lastKickForceTspin = false;
        groundCheck(time);
    }

    function takePiece(piece) {
        shapeIndex = piece;
        rotation = 0;
        shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
        shapeY = 0;
        lockdownRule = 15;
        grounded = false;
        hasHeld = true;
        lastKickForceTspin = false;
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

    
    const wallKicks = {
        // Super Rotation System @ https://tetris.wiki/Super_Rotation_System#How_Guideline_SRS_Really_Works
        "JLSTZ": [
            [[0 , 0 ], [0 , 0 ], [0 , 0 ], [0 , 0 ], [0 , 0 ]], // 0
            [[0 , 0 ], [1 , 0 ], [1 , 1 ], [0 , -2], [1 , -2]], // R
            [[0 , 0 ], [0 , 0 ], [0 , 0 ], [0 , 0 ], [0 , 0 ]], // 2
            [[0 , 0 ], [-1, 0 ], [-1, 1 ], [0 , -2], [-1, -2]]  // L
        ],
        "I": [
            [[0 , 0 ], [-1, 0 ], [2 , 0 ], [-1, 0 ], [2 , 0 ]], // 0
            [[-1, 0 ], [0 , 0 ], [0 , 0 ], [0 , -1], [0 , 2 ]], // R
            [[-1, -1], [1 , -1], [-2, -1], [1 , 0 ], [-2, 0 ]], // 2
            [[0 , -1], [0 , -1], [0 , -1], [0 , 1 ], [0 , -2]]  // L
        ],
        "O": [
            [[0 , 0 ]],
            [[0 , 1 ]],
            [[-1, 1 ]],
            [[-1, 0 ]]
        ],
        // Custom kicks for 180 spin
        "180": [
            [[0 , 0 ], [0 , -1], [1 , -1], [-1, -1], [1 , 0 ], [-1, 0 ]], // 0 -> 2
            [[0 , 0 ], [1 , 0 ], [1 , -2], [1 , -1], [0 , -2], [0 , -1]], // R -> L
            [[0 , 0 ], [0 , 1 ], [-1, 1 ], [1 , 1 ], [-1, 0 ], [1 , 0 ]], // 2 -> 0
            [[0 , 0 ], [-1, 0 ], [-1, -2], [-1, -1], [0 , -2], [0 , -1]]  // L -> R
        ]
    };
    
    // check if the piece can rotate with the SRS rules
    function canRotate(newRotation) {
        let is180 = (rotation + newRotation) % 2 === 0;
        let kicks = (is180
                        ? wallKicks["180"]
                        : (shapeIndex === 0
                            ? wallKicks["O"]
                            : (shapeIndex === 1
                                ? wallKicks["I"]
                                : wallKicks["JLSTZ"]))           
                    );
        if (is180) {
            for (let i = 0; i < kicks[rotation].length; i++) {
                let offsetX = kicks[rotation][i][0];
                let offsetY = kicks[rotation][i][1];
                if (canMove(offsetX, offsetY, newRotation)) {
                    let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
                    return {allowed:true, newX : shapeX+offsetX, newY : shapeY+offsetY, kick: kickForceTspin};
                }
            }
            return {allowed:false, newX : shapeX, newY : shapeY, kickForceTspin: false};
        }

        // adjust rotation index to correctly access the wall kick table when rotating between last and first state    
        else  {
            for (let i = 0; i < kicks[newRotation].length; i++) {
                let offsetX = kicks[rotation][i][0] - kicks[newRotation][i][0];
                let offsetY = kicks[rotation][i][1] - kicks[newRotation][i][1];
                if (canMove(offsetX, offsetY, newRotation)) {
                    let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
                    return {allowed:true, newX : shapeX+offsetX, newY : shapeY+offsetY, kick: kickForceTspin};
                }
            }
            return {allowed:false, newX : shapeX, newY : shapeY, kickForceTspin: false};
        }
    }

    // Tries to rotate a piece
    function tryRotate(newRotation, time) {
        let res = canRotate(newRotation);
        if (res.allowed) {
            rotation = newRotation;
            shapeX = res.newX;
            shapeY = res.newY;
            if (grounded) lockdownRule--;
            lastKickForceTspin = res.kick;
            lastMoveIsRotate = true;
            groundCheck(time);
        }
    }

    // Tries to move a piece
    function tryMove(offsetX, offsetY, time) {
        if (canMove(offsetX, offsetY, rotation)) {
            shapeX += offsetX;
            shapeY += offsetY;
            // If the piece is taken off the ground or moved down, reset the last fall time
            if (grounded || offsetY === 1) lastFallTime = time;
            if (grounded) lockdownRule--;	
            lastMoveIsRotate = false;
            groundCheck(time);
        }
    }

    function groundPiece(time) {
        grounded = true;
        lastGroundTime = time;
        lastGroundPositionX = shapeX;
        lastGroundPositionY = shapeY;
        lastGroundRotation = rotation;
    }

    function ungroundPiece(time) {
        grounded = false;
        lastGroundTime = time;
        lastGroundPositionX = shapeX;
        lastGroundPositionY = shapeY;
        lastGroundRotation = rotation;
    }

    // Grounds the piece if it is on a surface
    function groundCheck(time) {
        if (!canMove(0, 1, rotation)) groundPiece(time);
        else ungroundPiece(time);
    }

    function getGhostPosition() {
        let ghostY = shapeY;
        while (canMove(0, ghostY - shapeY, rotation)) {
            ghostY++;
        }
        return ghostY-1;
    }

    function hold(time) {
        if (hasHeld) return;
        if (heldPiece === -1) {
            heldPiece = shapeIndex;
            resetPiece(time);
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

    // Generates a bag
    function generateBag() {
        let bag = [];
        for (let i = 0; i < shapes.length; i++) {
            bag.push(i);
        }
        return fyShuffle(bag);
    }

    // Returns the next piece to be played, refills the bag if necessary
    function nextPiece() {
        if (nextPieces.length < 8) nextPieces = nextPieces.concat(generateBag());
        return nextPieces.shift();
    }

    // Returns the next 5 pieces to be played
    function peekNextPieces() {
        return nextPieces.slice(0, 5); // Slice returns a copy
    }

    // Returns the T-Spin status
    function isTSpin() {
        if (shapeIndex !== 2) return {tspin:false, mini:false};
        // If the last move was not a rotation, it can't be a T-Spin
        if (!lastMoveIsRotate) return {tspin:false, mini:false};
        // Switch on rotation state to evaluate front and back corners
        let frontCorners = [];
        let backCorners = [];
        let frontCount = 0;
        let backCount = 0;
        switch (rotation) {
            case 0:
                frontCorners = [[0, 0], [2, 0]];
                backCorners = [[0, 2], [2, 2]];
                break;
            case 1:
                frontCorners = [[2, 0], [2, 2]];
                backCorners = [[0, 0], [0, 2]];
                break;
            case 2:
                frontCorners = [[0, 2], [2, 2]];
                backCorners = [[0, 0], [2, 0]];
                break;
            case 3:
                frontCorners = [[0, 0], [0, 2]];
                backCorners = [[2, 0], [2, 2]];
                break;
            default:
                break;
        }
        
        for (let i = 0; i < frontCorners.length; i++) {
            let x = frontCorners[i][0];
            let y = frontCorners[i][1];
            // Check if cell is out of bounds, then check if occupied
            if (shapeY + y >= GRID_ROWS || shapeX + x >= GRID_COLUMNS || shapeX + x < 0) frontCount++;
            else if (grid[shapeY + y][shapeX + x] !== 0) frontCount++;
        }
        for (let i = 0; i < backCorners.length; i++) {
            let x = backCorners[i][0];
            let y = backCorners[i][1];
            // Check if cell is out of bounds, then check if occupied
            if (shapeY + y >= GRID_ROWS || shapeX + x >= GRID_COLUMNS || shapeX + x < 0) backCount++;
            else if (grid[shapeY + y][shapeX + x] !== 0) backCount++;
        }

        if ((frontCount === 2 
                && backCount >= 1)
            ||(lastKickForceTspin
                && backCount === 2
                && frontCount >= 1)
            ) return {tspin:true, mini:false};
        if (backCount === 2 && frontCount >= 1) return {tspin:true, mini:true};
        return {tspin:false, mini:false};
    }

    function isPerfectClear() {
        for (let row = 0; row < GRID_ROWS; row++) {
            if (!(grid[row].every(cell => cell === 0))) return false;
        }
        return true;
    }

    let lineNames = ["", "Single", "Double", "Triple", "Quad"];

    // Returns the string to display after a move (does not have to clear lines)
    function evaluateString(linesCleared, tspinStatus, perfectClear) {
        let string = lineNames[linesCleared];
        if (tspinStatus.tspin) {
            string = "T-Spin " + string;
            if (tspinStatus.mini) string = "Mini " + string;
        }
        if (perfectClear) string = "Perfect Clear!";
        return string;
    }

    let lineScores = [0, 100, 300, 500, 800];
    let tspinScores = [[100,400],[200,800],[400,1200],[0,1600]]; // mini tst is impossible
    let perfectClearScores = [800,1200,1800,2000];
    let perfectClearB2B = 3200;
    let comboMult = 50;
    let b2bMult = 1.5;

    function evaluateScore(lineCleared, tspinStatus, perfectClear) {
        let sc = 0;
        // Award points if perfectClear
        if (perfectClear) {
            if (b2b > 0) sc += level*perfectClearB2B;
            else sc += level*perfectClearScores[lineCleared-1];
        }
        // Award points for tspins
        if (tspinStatus.tspin) {
            // Check row 0 if tspin, row 1 if mini tspin
            if (b2b > 0) sc += b2bMult*level*tspinScores[lineCleared][!tspinStatus.mini | 0]; // Implicit cast to int
            else sc += level*tspinScores[lineCleared][!tspinStatus.mini | 0];
        }
        // Award points for line clears that aren't tspins
        else {
            if (b2b > 0) sc += b2bMult*level*lineScores[lineCleared];
            else sc += level*lineScores[lineCleared];
        }
        // Award points for combo
        if (combo > 0) sc += comboMult*level*combo;
        return sc; 
    }

    class TetrisScene extends Phaser.Scene {
        constructor() {
            super({ key: 'TetrisScene' });
        }

        create() {
            this.drawGrid();
            drawStoredShapes(this);
            this.drawShape();
            this.input.keyboard.on('keydown', (event) => this.handleKeyDown(event, this.time.now), this);
            this.input.keyboard.on('keyup', (event) => this.handleKeyUp(event), this);
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
            let currentFallSpeed = isSoftDropping && SDF !== Infinity ? fallSpeed / SDF : fallSpeed;

            if (grounded) {
                // Piece placed if has been on the ground for 500ms or too many lockdown resets
                if ((lastGroundPositionX === shapeX
                        && lastGroundPositionY === shapeY
                        && lastGroundRotation === rotation
                        && time - lastGroundTime > 500) 
                    || lockdownRule === 0) {
                    saveToGrid(this);
                    resetPiece(time);
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
                if (time - lastFallTime > currentFallSpeed) {
                    tryMove(0, 1, time);
                    if (isSoftDropping) score++;
                    lastFallTime = time;
                }
                if (isSoftDropping && SDF === Infinity && !grounded) {
                    while (canMove(0, 1, rotation)) {
                        tryMove(0, 1, time);
                        score++;
                    }
                    lastFallTime = time;
                }
            }
            this.redrawScene();
        }

        redrawScene() {
            this.children.removeAll(); // clear all displayed elements
            this.drawGrid(); // redraw the grid
            this.drawShape(); // redraw stored blocks and current falling shape
        }        

        handleKeyDown(event, time) {
            if (!keyPressTimes[event.key]) {
                if ((event.key === 'ArrowLeft' && activeDirection === 'ArrowRight') ||
                    (event.key === 'ArrowRight' && activeDirection === 'ArrowLeft')) {
                  clearTimeout(keyRepeatTimers[activeDirection]);
                  clearInterval(keyRepeatTimers[activeDirection]);
                  delete keyPressTimes[activeDirection];
                  delete keyRepeatTimers[activeDirection];
                  activeDirection = null;
                }
        
                keyPressTimes[event.key] = time;
                this.handleKey(event, time); // Initial key press
        
                if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
                    keyRepeatTimers[event.key] = setTimeout(() => this.startKeyRepeat(event.key, time), DAS);
                    activeDirection = event.key;
                }
                if (event.key === 'ArrowDown') {
                    isSoftDropping = true;
                }
              } else if (!['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
                return; // Ignore other keys if they are already pressed
              }
        
              // Handle simultaneous down and side key presses
              if (event.key === 'ArrowDown' && (keyPressTimes['ArrowLeft'] || keyPressTimes['ArrowRight'])) {
                this.handleKey({ key: keyPressTimes['ArrowLeft'] ? 'ArrowLeft' : 'ArrowRight' }, time);
              }
        }

        handleKeyUp(event) {
            clearTimeout(keyRepeatTimers[event.key]);
            clearInterval(keyRepeatTimers[event.key]);
            delete keyPressTimes[event.key];
            delete keyRepeatTimers[event.key];
            if (event.key === activeDirection) {
              activeDirection = null;
            }
            if (event.key === 'ArrowDown') {
              isSoftDropping = false;
            }
        }

        startKeyRepeat(key, time) {
            this.handleKey({ key }, time);
            keyRepeatTimers[key] = setInterval(() => this.handleKey({ key }, this.time.now), ARR);
        }

        handleKey(event, time) {
            switch (event.key) {
                case 'ArrowUp': // clockwise rotation
                    let rotationCW = (rotation + 1) % shapes[shapeIndex].length;
                    tryRotate(rotationCW, time);
                    break;
        
                case 'z': // counterclockwise rotation
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
                    if (SDF !== Infinity) {
                        tryMove(0, 1, time);
                    }
                    break;
                case ' ' : // hard drop
                    while (canMove(0, 1, rotation)) {
                        shapeY++;
                        score += 2;
                    }
                    saveToGrid(this);
                    resetPiece(time);
                    break;
                case 't': //test piece
                    resetPiece(time);
                    break;
                case 'Shift': // hold piece
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
        parent : gameContainerRef.current,
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
    <div ref={gameContainerRef} className = "game-container"></div>
  );
}

export default TetrisGame;