import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import "./Tetris.css";
import { colors, shapes, wallKicks, tCorners } from './constants'; // Import colors and shapes

function TetrisGame() {
  const gameContainerRef = useRef(null);

  useEffect(() => {
    // Retrieve controls from local storage
    const savedControls = JSON.parse(localStorage.getItem('tetrisControls')) || {
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      softDrop: 'ArrowDown',
      hardDrop: ' ',
      rotateCW: 'ArrowUp',
      rotateCCW: 'z',
      rotate180: 'a',
      swapHold: 'c',
      retryGame: 'r',
      forfeitGame: 'o',
    };

    // Retrieve handling from local storage
    const savedHandling = JSON.parse(localStorage.getItem('tetrisHandling')) || {
      DAS: 200,
      ARR: 33,
      SDF: 20,
    };

    // Handling
    const DAS = savedHandling.DAS; // Delayed Auto Shift in ms
    const ARR = savedHandling.ARR;  // Auto Repeat Rate in ms
    const SDF = savedHandling.SDF === "Infinity" ? Infinity : savedHandling.SDF;  // Soft Drop Factor
    let keyPressTimes = {}; // Track the time each key was pressed
    let keyRepeatTimers = {}; // Track the repeat timers for each key
    let activeDirection = null; // Track the currently active direction key
    let isSoftDropping = false; // Track if the down arrow key is held
    let lastLockdownTime = 0; // Prevent accidental misdrops

    // Grid and pieces
    const GRID_COLUMNS = 10;
    const GRID_ROWS = 40;
    const CELL_SIZE = 30; // Cell size in px
    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0)); // Empty grid

    // Track held piece info
    let hasHeld = false; // true if hold has been used this piece
    let heldPiece = -1; // piece held in hold slot of pieces

    // Track next piece info
    let nextPieces = generateBag().concat(generateBag()); // Start with 2 bags of pieces    

    let shapeIndex = nextPiece(); // random shape selection
    let rotation = 0;
    let shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
    let shapeY = 20 - (shapes[shapeIndex][0].length - 3); // initial piece appearance height

    // Track previous drops info
    let combo = -1;
    let b2b = -1;

    // Track piece info
    let lastFallTime = 0;
    let grounded = false;
    let lastGroundTime = 0;
    let lastGroundPositionX = -1;
    let lastGroundPositionY = -1;
    let lastGroundRotation = -1;
    let lockdownRule = 15; // lockdown resets left
    let lastMoveIsRotate = false;
    let lastKickForceTspin = false; // See https://tetris.wiki/T-Spin#Current_rules
    let level = 1;
    let lines = 0;
    let score = 0;
    let gameOver = false;
    const gravity = 0.02; // 1G : 1 cell per frame
    let fallSpeed = (1000 / 60) / (gravity * (2 ** (level - 1))); // Fall speed in milliseconds

    let garbageQueue = [];

    // Applies garbage to grid with a hole in a random column
    function applyGarbage(lines) {
      let garbageColumn = Math.floor(Math.random() * 10);
      // Find how many lines can be added (line 30 is KO)
      let maxlines = GRID_ROWS - 10;
      for (let row = 10; row < GRID_ROWS; row++) {
        if (grid[row].some(cell => cell !== 0)) {
          maxlines = row - 10;
          break;
        }
      }
      if (lines > maxlines) gameOver = true;
      else maxlines = lines;
      // Move the grid up by maxlines
      for (let row = 10; row < GRID_ROWS - maxlines; row++) {
        grid[row] = grid[row + maxlines];
      }
      // Fill the bottom maxlines with garbage
      for (let row = GRID_ROWS - maxlines; row < GRID_ROWS; row++) {
        grid[row] = Array(GRID_COLUMNS).fill(0x808080);
        grid[row][garbageColumn] = 0x000000;
      }
    }

    // Checks if there is garbage to be applied in the queue
    function receiveGarbage(time) {
      if (garbageQueue.length === 0) return;
      while (garbageQueue[0][1] < time) {
        applyGarbage(garbageQueue[0][0]);
        garbageQueue.shift();
        if (garbageQueue.length === 0) break;
      }
    }

    // Adds garbage to the queue
    function receiveAttack(lines, arrivalTime) { garbageQueue.push([lines, arrivalTime + 500]); }

    // Draws the 20 lowest rows of the grid
    function drawStoredShapes(scene) {
      for (let row = 20; row < GRID_ROWS; row++) { // Start drawing from row 20
        for (let col = 0; col < GRID_COLUMNS; col++) {
          if (grid[row][col] !== 0) {
            scene.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, (row - 20) * CELL_SIZE + CELL_SIZE / 2,
              CELL_SIZE, CELL_SIZE, grid[row][col]);
          }
        }
      }
    }

    // Saves a shape to the grid
    function saveToGrid(scene, time) {
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
      clearFullLines(scene, time);
      scene.redrawScene();
    }

    // Checks if there are any lines to clear, updates combo, b2b, score, level, and sends garbage
    function clearFullLines(scene, time) {
      let linesCleared = 0;
      let tspinStatus = isTSpin();
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== 0)) {
          grid.splice(row, 1); // Remove the full row
          grid.unshift(Array(GRID_COLUMNS).fill(0)); // Add an empty row at the top
          linesCleared++;
          row++; // Stay at the same row index to check again
        }
      }
      let perfectClear = isPerfectClear();
      if (linesCleared > 0) {
        combo++;
        if (tspinStatus.tspin || linesCleared === 4) b2b++
        else b2b = -1;
      }
      else combo = -1;
      if (perfectClear) b2b += 2;
      // Add score (doesn't have to clear lines)
      score += evaluateScore(linesCleared, tspinStatus, perfectClear);
      lines += linesCleared;
      if (lines >= level * 10) {
        level++;
        fallSpeed = (1000 / 60) / (gravity * (2 ** (level - 1)));
      }
      // Send garbage
      if (linesCleared > 0) {
        let garb = evaluateGarbage(linesCleared, tspinStatus);
        if (garb > 0) sendGarbage(garb, time); // Send garbage if there is any
        if (perfectClear) sendGarbage(5, time); // 5 line flat for perfect clear
      }
      if (linesCleared === 0) receiveGarbage(time); // Receive incoming garbage if no lines cleared
    }

    // Checks for KO by block out (see https://tetris.wiki/Top_out)
    function gameOverCheck() { if (!canMove(0, 0, rotation)) (gameOver = true); }

    function resetPosition(time) {
      rotation = 0;
      shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
      shapeY = 20 - (shapes[shapeIndex][0].length - 3);
      lockdownRule = 15;
      lastKickForceTspin = false;
      lastMoveIsRotate = false;
      lastFallTime = time;
      ungroundPiece(time);
      gameOverCheck();
    }

    // Resets the current piece after placing one
    function resetPiece(time) {
      shapeIndex = nextPiece();
      hasHeld = false;
      resetPosition(time);
    }

    // Takes a piece (from hold) and resets the piece
    function takePiece(piece, time) {
      shapeIndex = piece;
      hasHeld = true;
      resetPosition(time);
    }

    // Checks if a piece can move to a new position with a new rotation
    function canMove(offsetX, offsetY, newRotation) {
      for (let y = 0; y < shapes[shapeIndex][newRotation].length; y++) {
        for (let x = 0; x < shapes[shapeIndex][newRotation][y].length; x++) {
          if (shapes[shapeIndex][newRotation][y][x] === 1) {
            let newX = shapeX + x + offsetX;
            let newY = shapeY + y + offsetY;
            // Check if out of bounds or occupied
            if (newX < 0 || newX >= GRID_COLUMNS || newY >= GRID_ROWS) return false;
            if (grid[newY][newX] !== 0) return false;
          }
        }
      }
      return true;
    }

    // Check if the piece can rotate
    function canRotate(newRotation) {
      // Find kick table to use
      let is180 = (rotation + newRotation) % 2 === 0;
      let kicks = (is180
        ? wallKicks["180"]
        : (shapeIndex === 0
          ? wallKicks["O"]
          : (shapeIndex === 1
            ? wallKicks["I"]
            : wallKicks["JLSTZ"]))
      );

      // Check if the piece can rotate with one of the kicks
      if (is180) {
        for (let i = 0; i < kicks[rotation].length; i++) {
          let offsetX = kicks[rotation][i][0];
          let offsetY = kicks[rotation][i][1];
          if (canMove(offsetX, offsetY, newRotation)) {
            let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
            return { allowed: true, newX: shapeX + offsetX, newY: shapeY + offsetY, kick: kickForceTspin };
          }
        }
        return { allowed: false, newX: shapeX, newY: shapeY, kickForceTspin: false };
      }
      else {
        for (let i = 0; i < kicks[newRotation].length; i++) {
          let offsetX = kicks[rotation][i][0] - kicks[newRotation][i][0];
          let offsetY = kicks[rotation][i][1] - kicks[newRotation][i][1];
          if (canMove(offsetX, offsetY, newRotation)) {
            let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
            return { allowed: true, newX: shapeX + offsetX, newY: shapeY + offsetY, kick: kickForceTspin };
          }
        }
        return { allowed: false, newX: shapeX, newY: shapeY, kickForceTspin: false };
      }
    }

    // Tries to rotate a piece
    function tryRotate(newRotation, time) {
      let res = canRotate(newRotation);
      if (res.allowed) {
        rotation = newRotation;
        shapeX = res.newX;
        shapeY = res.newY;
        if (grounded) {
          lockdownRule--;
          ungroundPiece(time);
        }
        lastKickForceTspin = res.kick;
        lastMoveIsRotate = true;
      }
    }

    // Tries to move a piece
    function tryMove(offsetX, offsetY, time) {
      if (canMove(offsetX, offsetY, rotation)) {
        shapeX += offsetX;
        shapeY += offsetY;
        lastMoveIsRotate = false;
        // If the piece is taken off the ground or moved down, reset the last fall time
        if (grounded || offsetY === 1) lastFallTime = time;
        if (grounded) {
          lockdownRule--;
          ungroundPiece(time);
        }
      }
    }

    // If the piece isn't grounded, grounds it and update the ground values
    function groundPiece(time) {
      if (grounded) return;
      grounded = true;
      lastGroundTime = time;
      lastGroundPositionX = shapeX;
      lastGroundPositionY = shapeY;
      lastGroundRotation = rotation;
    }

    // If the piece is grounded, ungrounds it and update the ground values 
    function ungroundPiece(time) {
      if (!grounded) return;
      grounded = false;
      lastFallTime = time
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

    // Calculates the position of the ghost piece
    function getGhostPosition() {
      let ghostY = shapeY;
      while (canMove(0, ghostY - shapeY, rotation)) ghostY++;
      return ghostY - 1;
    }

    // Tries to hold a piece
    function hold(time) {
      if (hasHeld) return;
      hasHeld = true;
      if (heldPiece === -1) {
        heldPiece = shapeIndex;
        resetPiece(time);
      }
      else {
        let temp = heldPiece;
        heldPiece = shapeIndex;
        takePiece(temp, time);
      }
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
      // If the last move was not a T rotation, it can't be a T-Spin
      if (shapeIndex !== 2) return { tspin: false, mini: false };
      if (!lastMoveIsRotate) return { tspin: false, mini: false };
      let frontCorners = tCorners[rotation][0];
      let backCorners = tCorners[rotation][1];
      let frontCount = 0;
      let backCount = 0;
      // Check how many front and back corners are out of bounds or occupied
      for (let i = 0; i < frontCorners.length; i++) {
        let xf = frontCorners[i][0];
        let yf = frontCorners[i][1];
        let xb = backCorners[i][0];
        let yb = backCorners[i][1];
        // Check if cell is out of bounds, then check if occupied
        if (shapeY + yf >= GRID_ROWS || shapeX + xf >= GRID_COLUMNS || shapeX + xf < 0) frontCount++;
        else if (grid[shapeY + yf][shapeX + xf] !== 0) frontCount++;
        if (shapeY + yb >= GRID_ROWS || shapeX + xb >= GRID_COLUMNS || shapeX + xb < 0) backCount++;
        else if (grid[shapeY + yb][shapeX + xb] !== 0) backCount++;
      }
      // Check if it is a T-Spin or Mini T-Spin
      if ((frontCount === 2 && backCount >= 1)
        || (lastKickForceTspin && backCount === 2 && frontCount >= 1)
      ) return { tspin: true, mini: false };
      if (backCount === 2 && frontCount >= 1) return { tspin: true, mini: true };
      return { tspin: false, mini: false };
    }

    // Returns true if the grid is empty
    function isPerfectClear() {
      for (let row = 0; row < GRID_ROWS; row++) { if (!(grid[row].every(cell => cell === 0))) return false; }
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
    let tspinScores = [[100, 400], [200, 800], [400, 1200], [0, 1600]]; // mini tst is impossible
    let perfectClearScores = [800, 1200, 1800, 2000];
    let perfectClearB2B = 3200;
    // Returns the score to add after a move (does not have to clear lines)
    function evaluateScore(linesCleared, tspinStatus, perfectClear) {
      let sc = 0;
      // Award points if perfectClear
      if (perfectClear) {
        if (b2b > 0) sc += level * perfectClearB2B;
        else sc += level * perfectClearScores[linesCleared - 1];
      }
      // Award points for lines cleared
      let points = lineScores[linesCleared];
      if (tspinStatus.tspin) points = tspinScores[linesCleared][!tspinStatus.mini | 0];
      if (b2b > 0) sc += 1.5 * level * points; // Implicit cast to int
      else sc += level * points;
      // Award points for combo
      if (combo > 0) sc += 50 * level * combo;
      return sc;
    }

    let baseGarbage = [0, 1, 2, 4];
    let tspinGarbage = [[0, 2], [1, 4], [0, 6]];
    function baseValue(linesCleared, tspinStatus) {
      if (tspinStatus.tspin) return tspinGarbage[linesCleared - 1][!tspinStatus.mini | 0];
      else return baseGarbage[linesCleared - 1];
    }
    // Returns the garbage to send after a move that clears lines
    function evaluateGarbage(linesCleared, tspinStatus) {
      let garbage = 0;
      let base = baseValue(linesCleared, tspinStatus);
      if (combo === 1 || base > 0) garbage = base * (1 + 0.25 * combo);
      else garbage = Math.log(1 + 1.25 * combo); // Nerf 4W
      // Add flat b2b bonus
      garbage += Math.ceil(b2b / 5);
      return Math.floor(garbage);
    }

    function sendGarbage(lines, time) {
      let excess = lines
      // Try to remove garbage from queue before sending it
      if (garbageQueue.length > 0) {
        while (excess > 0) {
          if (garbageQueue[0][0] >= excess) {
            garbageQueue[0][0] -= excess;
            excess = 0;
          }
          else {
            excess -= garbageQueue[0][0];
            garbageQueue.shift();
            if (garbageQueue.length === 0) break;
          }
        }
      }
      // For now, send excess garbage to self
      receiveAttack(excess, time);
    }

    function restartGame(time) {
      grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0));
      nextPieces = generateBag().concat(generateBag());
      shapeIndex = nextPiece();
      heldPiece = -1;
      rotation = 0;
      shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
      shapeY = 20 - (shapes[shapeIndex][0].length - 3);
      combo = -1;
      b2b = -1;
      lastFallTime = time;
      lastGroundTime = time;
      grounded = false;
      lastGroundPositionX = -1;
      lastGroundPositionY = -1;
      lastGroundRotation = -1;
      lockdownRule = 15;
      lastMoveIsRotate = false;
      lastKickForceTspin = false;
      level = 1;
      lines = 0;
      score = 0;
      gameOver = false;
      fallSpeed = (1000 / 60) / (gravity * (2 ** (level - 1)));
    }

    class TetrisScene extends Phaser.Scene {
      constructor() {
        super({ key: 'TetrisScene' });
      }

      create() {
        this.drawGrid();
        drawStoredShapes(this);
        this.drawShape();
        this.input.keyboard.on('keydown', (event) => {
          event.preventDefault();
          this.handleKeyDown(event, this.time.now);
        }, this);
        this.input.keyboard.on('keyup', (event) => {
          event.preventDefault();
          this.handleKeyUp(event, this.time.now);
        }, this);
      }

      drawGrid() {
        for (let row = 20; row < GRID_ROWS; row++) { // start drawing from row 20
          for (let col = 0; col < GRID_COLUMNS; col++) {
            let x = col * CELL_SIZE;
            let y = (row - 20) * CELL_SIZE;

            this.add.rectangle(x + CELL_SIZE / 2, y + CELL_SIZE / 2,
              CELL_SIZE, CELL_SIZE, 0x444444)
              .setStrokeStyle(0.25, 0xD3D3D3);
          }
        }
      }

      drawShape() {
        // Draw the stored blocks from the grid
        for (let row = 20; row < GRID_ROWS; row++) { // start drawing from row 20
          for (let col = 0; col < GRID_COLUMNS; col++) {
            if (grid[row][col] !== 0) {
              this.add.rectangle(col * CELL_SIZE + CELL_SIZE / 2, (row - 20) * CELL_SIZE + CELL_SIZE / 2,
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
              let posY = (shapeY + y - 20) * CELL_SIZE;
              let ghostY = (getGhostPosition() + y - 20) * CELL_SIZE;
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
        if (gameOver) restartGame(time);
        groundCheck(time);
        let currentFallSpeed = (isSoftDropping && SDF !== Infinity) ? fallSpeed / SDF : fallSpeed;
        if (grounded) {
          // Piece placed if has been on the ground for 500ms or too many lockdown resets
          if ((lastGroundPositionX === shapeX
            && lastGroundPositionY === shapeY
            && lastGroundRotation === rotation
            && time - lastGroundTime > 500)
            || lockdownRule === 0) {
            lastLockdownTime = time;
            saveToGrid(this, time);
            resetPiece(time);
          }
          // If piece hasn't been placed because of movement (ie time), do not update time
          else {
            if (lockdownRule > 0
              &&
              !(lastGroundPositionX === shapeX
                && lastGroundPositionY === shapeY
                && lastGroundRotation === rotation)) {
            }
          }
        }
        else {
          if (isSoftDropping && SDF === Infinity && !grounded) {
            while (canMove(0, 1, rotation)) {
              tryMove(0, 1, time);
              score++;
            }
            groundPiece(time);
          }
          else if (time - lastFallTime > currentFallSpeed) {
            tryMove(0, 1, time);
            if (isSoftDropping) score++;
            lastFallTime = time;
          }
        }
        this.redrawScene();
      }

      redrawScene() {
        this.children.removeAll(); // Clear all displayed elements
        this.drawGrid(); // Redraw the grid
        this.drawShape(); // Redraw stored blocks and current falling shape
      }

      handleKeyDown(event, time) {
        const key = event.key.toLowerCase();
        if (!keyPressTimes[key]) {
          if ((key === savedControls.moveLeft.toLowerCase() && activeDirection === savedControls.moveRight.toLowerCase()) ||
            (key === savedControls.moveRight.toLowerCase() && activeDirection === savedControls.moveLeft.toLowerCase())) {
            clearTimeout(keyRepeatTimers[activeDirection]);
            clearInterval(keyRepeatTimers[activeDirection]);
            delete keyPressTimes[activeDirection];
            delete keyRepeatTimers[activeDirection];
            activeDirection = null;
          }

          keyPressTimes[key] = time;
          this.handleKey(event, time); // Initial key press

          // DAS only applies to left and right movement
          if ([savedControls.moveLeft.toLowerCase(), savedControls.moveRight.toLowerCase()].includes(key)) {
            keyRepeatTimers[key] = setTimeout(() => this.startKeyRepeat(key, time), DAS);
            activeDirection = key;
          }
          if (key === savedControls.softDrop.toLowerCase()) {
            isSoftDropping = true;
          }
        } else if (![savedControls.moveLeft.toLowerCase(), savedControls.moveRight.toLowerCase(), savedControls.softDrop.toLowerCase()].includes(key)) {
          return; // Ignore other keys if they are already pressed
        }

        // Handle simultaneous down and side key presses
        if (key === savedControls.softDrop.toLowerCase() && (keyPressTimes[savedControls.moveLeft.toLowerCase()] || keyPressTimes[savedControls.moveRight.toLowerCase()])) {
          this.handleKey({ key: keyPressTimes[savedControls.moveLeft.toLowerCase()] ? savedControls.moveLeft.toLowerCase() : savedControls.moveRight.toLowerCase() }, time);
        }
      }

      handleKeyUp(event) {
        const key = event.key.toLowerCase();
        clearTimeout(keyRepeatTimers[key]);
        clearInterval(keyRepeatTimers[key]);
        delete keyPressTimes[key];
        delete keyRepeatTimers[key];
        if (key === activeDirection) {
          activeDirection = null;
        }
        if (key === savedControls.softDrop.toLowerCase()) {
          isSoftDropping = false;
        }
      }

      // ARR only applies to left and right movement
      startKeyRepeat(key, time) {
        this.handleKey({ key }, time);
        keyRepeatTimers[key] = setInterval(() => this.handleKey({ key }, time), ARR);
      }

      handleKey(event, time) {
        const key = event.key.toLowerCase();
        switch (key) {
          case savedControls.rotateCW.toLowerCase(): // clockwise rotation
            let rotationCW = (rotation + 1) % shapes[shapeIndex].length;
            tryRotate(rotationCW, time);
            break;
          case savedControls.rotateCCW.toLowerCase(): // counterclockwise rotation
            let rotationCCW = (rotation - 1 + shapes[shapeIndex].length) % shapes[shapeIndex].length;
            tryRotate(rotationCCW, time);
            break;
          case savedControls.rotate180.toLowerCase(): // 180° rotation
            let rotation180 = (rotation + 2) % shapes[shapeIndex].length;
            tryRotate(rotation180, time);
            break;
          case savedControls.moveLeft.toLowerCase(): // Move left
            tryMove(-1, 0, time);
            break;
          case savedControls.moveRight.toLowerCase(): // Move right
            tryMove(1, 0, time);
            break;
          case savedControls.softDrop.toLowerCase(): // Soft drop, awards points
            if (SDF !== Infinity) {
              tryMove(0, 1, time);
              score++;
              lastFallTime = time;
            }
            break;
          case savedControls.hardDrop.toLowerCase(): // Hard drop, awards points
            if (time - lastLockdownTime < 160) break; // Prevent accidental hard drops 
            while (canMove(0, 1, rotation)) {
              shapeY++;
              score += 2;
              lastFallTime = time;
            }
            saveToGrid(this, time);
            resetPiece(time);
            break;
          case savedControls.retryGame.toLowerCase():
            restartGame(time);
            break;
          case savedControls.swapHold.toLowerCase():
            hold(time);
            break;
          default:
            return; // exit if no relevant key is pressed
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: GRID_COLUMNS * CELL_SIZE,
      height: 20 * CELL_SIZE, // display only the last 20 rows
      backgroundColor: '#000',
      scene: TetrisScene
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };

  }, []);

  return (
    <div ref={gameContainerRef} className="game-container"></div>
  );
}

export default TetrisGame;