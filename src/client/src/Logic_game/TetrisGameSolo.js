import React, { useEffect, useRef, useState } from 'react';
import socket from "../socket.js";
import seedrandom from 'seedrandom';
import "./Tetris.css";
import Grid from './Grid.js';
import Info from './Info.js';
import Hold from './Hold.js';
import Next from './Next.js';
import Garbage from './Garbage.js';
import {
  COLUMNS,
  ROWS,
  shapes,
  wallKicks,
  tCorners
} from './constants.js';
import { playSound } from "../SoundManager.js";

function TetrisGameSolo({ gameMode, roomId, playerId, players, setActivePlayers, multiplayerSeed, multiplayerSeedOffset }) {
  const eGrid = useRef(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const eShapeIndex = useRef(0);
  const eRotation = useRef(0);
  const eShapeX = useRef(0);
  const eShapeY = useRef(0);
  const eGhostY = useRef(0);
  const eHeldPiece = useRef(-1);
  const eHasHeld = useRef(false);
  const eGarbageQueue = useRef([]);
  const eNextPieces = useRef([]);
  const [time, setTime] = useState(performance.now());
  const eLastRestartTime = useRef(performance.now());
  const eLines = useRef(0);
  const eScore = useRef(0);
  const username = localStorage.getItem("username");

  const [nextPlayerId, setNextPlayerId] = useState();

  const eGameOver = useRef(false);
  const eWinCondition = useRef(false);
  const eRestart = useRef(false);
  const eFinalTime = useRef(performance.now());

  useEffect(() => {
    let localPlayers = [];
    if (gameMode === 'Multiplayer') {
      localPlayers = players;
    }
    function handlePlayerLose(loserId) {
      let looserPlayerId = localPlayers.find(player => player.id === loserId);
      if (!looserPlayerId) return;
      localPlayers = localPlayers.filter(player => player.id !== loserId);
      setActivePlayers(localPlayers);
    }

    socket.on("player-lost", (looserPlayerId) => {
      if (gameMode !== 'Multiplayer') return;
      handlePlayerLose(looserPlayerId);
    });

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

    let grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)); // Empty grid

    // RNG Info
    let seed = Math.floor(Math.random() * 1000000);
    let seedOffset = Math.floor(Math.random() * 16);
    if (gameMode === 'Multiplayer') {
      seed = multiplayerSeed;
      seedOffset = multiplayerSeedOffset;
    }
    let bags = 0;

    // Track held piece info
    let hasHeld = false; // true if hold has been used this piece
    let heldPiece = -1; // piece held in hold slot of pieces

    // Track next piece info
    let nextPieces = generateBag().concat(generateBag()); // Start with 2 bags of pieces    

    let shapeIndex = nextPiece(); // random shape selection
    let rotation = 0;
    let shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
    let shapeY = 18 - (shapes[shapeIndex][0].length - 3); // initial piece appearance height

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

    // Game info
    let lastRestartTime = performance.now();
    let level = 1;
    let levelIncrease = 10; // Level increases every 10 lines
    let lines = 0;
    let score = 0;
    let gameOver = false;
    const startGravity = 0.02; // 1G : 1 cell per frame
    const multGravityIncrease = 0.0025; // Gravity increase per second in multiplier
    let lastGravityIncrease = performance.now();
    let gravity = startGravity;
    let fallSpeed = (1000 / 60) / gravity; // Fall speed in milliseconds

    let garbageQueue = [];
    sendDuelData(time);

    // Setup for Cheese mode
    if (gameMode === 'Cheese') {
      for (let i = 0; i < 15; i++) {
        applyGarbage(1);
      }
    }

    // Applies garbage to grid with a hole in a random column
    function applyGarbage(lines) {
      // Find how many lines can be added (line 30 is KO)
      let maxlines = ROWS - 10;
      for (let row = 10; row < ROWS; row++) {
        if (grid[row].some(cell => cell !== 0)) {
          maxlines = row - 10;
          break;
        }
      }
      if (lines > maxlines) setGameOver();
      else maxlines = lines;
      // Move the grid up by maxlines
      for (let row = 10; row < ROWS - maxlines; row++) {
        grid[row] = grid[row + maxlines];
      }
      // Fill the bottom maxlines with garbage
      let garbageColumn = Math.floor(Math.random() * 10);
      for (let row = ROWS - maxlines; row < ROWS; row++) {
        grid[row] = Array(COLUMNS).fill(-1);
        grid[row][garbageColumn] = 0;
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
    function receiveAttack(lines) {
      garbageQueue.push([lines, performance.now() + 500]);
    }

    socket.on("garbage-received", (gridData) => {
      if (gridData.playerId !== playerId) return;
      receiveAttack(gridData.lines);
    });

    // Saves a shape to the grid
    function saveToGrid(time) {
      for (let y = 0; y < shapes[shapeIndex][rotation].length; y++) {
        for (let x = 0; x < shapes[shapeIndex][rotation][y].length; x++) {
          if (shapes[shapeIndex][rotation][y][x] === 1) {
            let newX = shapeX + x;
            let newY = shapeY + y;
            if (newY < ROWS && newX < COLUMNS) {
              grid[newY][newX] = shapeIndex;
            }
          }
        }
      }
      clearFullLines(time);
    }

    // Checks if there are any lines to clear, updates combo, b2b, score, level, and sends garbage
    function clearFullLines(time) {
      let linesCleared = 0;
      let tspinStatus = isTSpin();
      for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== 0)) {
          grid.splice(row, 1); // Remove the full row
          grid.unshift(Array(COLUMNS).fill(0)); // Add an empty row at the top
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
      // Level up for some modes
      if (gameMode === 'Ultra' || gameMode === 'Rush') {
        if (lines >= level * levelIncrease) {
          level++;
          gravity = gravity * 1.5;
          fallSpeed = (1000 / 60) / gravity;
        }
      }
      // Send garbage
      if (linesCleared > 0 && gameMode === 'Multiplayer') {
        let garb = evaluateGarbage(linesCleared, tspinStatus);
        if (garb > 0) sendGarbage(garb, time); // Send garbage if there is any
        if (perfectClear) sendGarbage(5, time); // 5 line flat for perfect clear
      }
      if (linesCleared === 0) receiveGarbage(time); // Receive incoming garbage if no lines cleared
      // Play sound
      if (perfectClear) {
        playSound("perfectclear");
      }
      else if (tspinStatus.tspin) {
        playSound("tspin");
      }
      else if (linesCleared > 0) {
        playSound("clear");
      }
      else {
        playSound("drop");
      }
    }

    // Checks for KO by block out (see https://tetris.wiki/Top_out)
    function gameOverCheck() { 
      if (!canMove(0, 0, rotation)) setGameOver();
    }

    function resetPosition(time) {
      rotation = 0;
      shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
      shapeY = 18 - (shapes[shapeIndex][0].length - 3);
      lockdownRule = 15;
      lastKickForceTspin = false;
      lastMoveIsRotate = false;
      lastFallTime = time;
      ungroundPiece(time);
      gameOverCheck();
      if (gameMode === 'Multiplayer') {
        socket.emit("update-grid", { roomId, playerId: socket.id, grid });
        sendDuelData(time);
      }
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
            if (newX < 0 || newX >= COLUMNS || newY >= ROWS) return false;
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
        ? (shapeIndex === 1
          ? wallKicks["180-O"]
          : wallKicks["180"])
        : (shapeIndex === 1
          ? wallKicks["O"]
          : (shapeIndex === 2
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
        sendDuelData(time);
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
        sendDuelData(time);
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
      if (heldPiece === -1) {
        heldPiece = shapeIndex;
        resetPiece(time);
        hasHeld = true;
      }
      else {
        let temp = heldPiece;
        heldPiece = shapeIndex;
        takePiece(temp, time);
        hasHeld = true;
      }
    }

    function getSeedString() {
      return `${seed}-${bags * seedOffset}`;
    }

    // Fisher-Yates (Knuth) shuffle algorithm from https://rosettacode.org/wiki/Knuth_shuffle#ES5
    function fyShuffle(arr) {
      let s = getSeedString();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(seedrandom(s)() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Generates a bag
    function generateBag() {
      let bag = [];
      for (let i = 1; i < shapes.length; i++) {
        bag.push(i);
      }
      bags += 1;
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
      if (shapeIndex !== 3) return { tspin: false, mini: false };
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
        if (shapeY + yf >= ROWS || shapeX + xf >= COLUMNS || shapeX + xf < 0) frontCount++;
        else if (grid[shapeY + yf][shapeX + xf] !== 0) frontCount++;
        if (shapeY + yb >= ROWS || shapeX + xb >= COLUMNS || shapeX + xb < 0) backCount++;
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
      for (let row = 0; row < ROWS; row++) { if (!(grid[row].every(cell => cell === 0))) return false; }
      return true;
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
      // garbageLines.current = Math.floor(garbage);
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
      if (excess > 0) {
        sendGarbageToNextPlayer(excess);
      }
    }

    function sendGarbageToNextPlayer(lines) {
      let currentPlayerIndex = localPlayers.findIndex(player => player.id === playerId);
      let newPlayerIndex = (currentPlayerIndex + 1) % localPlayers.length;
      let newPlayerId = localPlayers[newPlayerIndex].id;
      setNextPlayerId(newPlayerId);
      socket.emit("send-garbage", {
        roomId: roomId,
        playerId: newPlayerId,
        lines: lines
      });
    }

    function sendAttack(lines) {
      socket.emit("send-attack", { roomId, playerId: nextPlayerId, lines });
    }

    function restartGame(time) {
      eRestart.current = false;
      gameOver = false;
      eGameOver.current = false;
      lastRestartTime = time;
      grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
      nextPieces = generateBag().concat(generateBag());
      shapeIndex = nextPiece();
      hasHeld = false;
      heldPiece = -1;
      rotation = 0;
      shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
      shapeY = 18 - (shapes[shapeIndex][0].length - 3);
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
      gravity = startGravity;
      fallSpeed = (1000 / 60) / gravity;
      garbageQueue = [];
      if (gameMode === 'Cheese') {
        for (let i = 0; i < 15; i++) {
          applyGarbage(1);
        }
      }
      seed = Math.floor(Math.random() * 1000000);
      seedOffset = Math.floor(Math.random() * 16);
      bags = 0;
    }

    // Checks if the bottomline has garbage
    function checkBottomGarbage() {
      for (let i = 0; i < 10; i++) {
        if (grid[ROWS - 1][i] === -1) return true;
      }
      return false;
    }

    function winCondition(time) {
      if (gameMode === 'Cheese' && !checkBottomGarbage()) {
        socket.emit("submit-score", { username, gameMode, score: time - lastRestartTime });
        return true;
      };
      if (gameMode === 'Sprint' && lines >= 40) {
        socket.emit("submit-score", { username, gameMode, score: time - lastRestartTime });
        return true;
      };
      if (gameMode === 'Ultra' && time - lastRestartTime >= 120000) {
        socket.emit("submit-score", { username, gameMode, score });
        return true;
      };
      if (gameMode === 'Rush' && score >= 100000) {
        socket.emit("submit-score", { username, gameMode, score: time - lastRestartTime });
        return true;
      };
      // Training mode has no win condition
      return false;
    }

    function setGameOver() {
      gameOver = true;
      eGameOver.current = true;
      if (gameMode === 'Multiplayer') socket.emit("game-over", { roomId, playerId });
      eFinalTime.current = performance.now();
    }
    
    // Data to send in 1v1
    function sendDuelData(time) {
      if (localPlayers.length !== 2) return;
      let duelData = {
        shapeIndex: shapeIndex,
        rotation: rotation,
        shapeX: shapeX,
        shapeY: shapeY,
        ghostY: getGhostPosition(),
        heldPiece: heldPiece,
        hasHeld: hasHeld,
        nextPieces: peekNextPieces(),
        garbageQueue: garbageQueue,
        time: time
      }
      socket.emit("update-duel", { roomId, playerId, duelData });
    }

    function update() {
      let time = performance.now();
      if (eRestart.current) restartGame(time);
      updateRefs(time);
      setTime(time); // Trigger re-render
      if (gameOver) return;
      if (winCondition(time)) {
        setGameOver();
        eWinCondition.current = true;
      }

      // Update gravity in multiplayer
      if (gameMode === 'Multiplayer') {
        if (time - lastGravityIncrease > 1000) {
          gravity += multGravityIncrease;
          fallSpeed = (1000 / 60) / gravity;
          lastGravityIncrease = time;
        }
      }

      groundCheck(time);
      // Calculate fall speed depending on soft drop activation
      let currentFallSpeed = (isSoftDropping && SDF !== Infinity) ? fallSpeed / SDF : fallSpeed;
      if (grounded) {
        // Piece placed if has been on the ground for 500ms or too many lockdown resets
        if ((lastGroundPositionX === shapeX
          && lastGroundPositionY === shapeY
          && lastGroundRotation === rotation
          && time - lastGroundTime > 500)
          || lockdownRule === 0) {
          lastLockdownTime = time;
          saveToGrid(time);
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
    }

    function updateRefs(time) {
      eGrid.current = grid;
      eShapeIndex.current = shapeIndex;
      eRotation.current = rotation;
      eShapeX.current = shapeX;
      eShapeY.current = shapeY;
      eGhostY.current = getGhostPosition();
      eHeldPiece.current = heldPiece;
      eHasHeld.current = hasHeld;
      eGarbageQueue.current = garbageQueue;
      eNextPieces.current = peekNextPieces();
      eLastRestartTime.current = lastRestartTime;
      eLines.current = lines;
      eScore.current = score;
    }

    function handleKeyDownInternal(event, time) {
      if (gameOver && event.key !== savedControls.retryGame.toLowerCase()) return;
      const key = event.key.toLowerCase();
      if (!keyPressTimes[key]) {
        // Handle left/right switch
        if ((key === savedControls.moveLeft.toLowerCase() && activeDirection === savedControls.moveRight.toLowerCase()) ||
          (key === savedControls.moveRight.toLowerCase() && activeDirection === savedControls.moveLeft.toLowerCase())) {
          clearTimeout(keyRepeatTimers[activeDirection]);
          clearInterval(keyRepeatTimers[activeDirection]);
          delete keyPressTimes[activeDirection];
          delete keyRepeatTimers[activeDirection];
          activeDirection = null;
        }

        keyPressTimes[key] = time;
        handleKey(event, time); // Initial key press

        // DAS only applies to left and right movement
        if ([savedControls.moveLeft.toLowerCase(), savedControls.moveRight.toLowerCase()].includes(key)) {
          keyRepeatTimers[key] = setTimeout(() => startKeyRepeat(key, time), DAS);
          activeDirection = key;
        }
        if (key === savedControls.softDrop.toLowerCase()) {
          isSoftDropping = true;
        }
      }
    }

    function handleKeyUpInternal(event) {
      const key = event.key.toLowerCase();
      clearTimeout(keyRepeatTimers[key]);
      clearInterval(keyRepeatTimers[key]);
      delete keyPressTimes[key];
      delete keyRepeatTimers[key];
      // Handle left/right switch
      if (key === activeDirection) {
        activeDirection = null;
      }
      if (key === savedControls.softDrop.toLowerCase()) {
        isSoftDropping = false;
      }
    }

    // ARR only applies to left and right movement
    function startKeyRepeat(key, time) {
      handleKey({ key }, time);
      keyRepeatTimers[key] = setInterval(() => handleKey({ key }, time), ARR);
    }

    function handleKey(event, time) {
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
          saveToGrid(time);
          resetPiece(time);
          break;
        case savedControls.swapHold.toLowerCase():
          hold(time);
          break;
        case savedControls.retryGame.toLowerCase():
          if (gameMode !== 'Multiplayer') {
            restartGame(time);
          }
          break;
        default:
          return; // Exit if no relevant key is pressed
      }
    }

    function handleKeyDown(event) {
      event.preventDefault(); // Prevent default browser action
      const time = performance.now();
      handleKeyDownInternal(event, time);
    }

    function handleKeyUp(event) {
      event.preventDefault(); // Prevent default browser action
      handleKeyUpInternal(event);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const intervalId = setInterval(update, 1);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(intervalId); // Cleanup interval on component unmount
      socket.off("garbage-received"); // Clean up socket event listener
      socket.off("player-lost");
    };
  }, [gameMode, roomId]);

  return (
    <div className='game-wrapper'>
      {eGameOver.current && gameMode !== 'Multiplayer' && (
        <div className="game-over-popup">
          <h2>Game Over</h2>
          <button onClick={() => eRestart.current = true}>Restart</button>
          <button onClick={() => window.location.href = '/'}>Quit</button>
        </div>
      )}
      <div className="left-container">
        <Hold
          heldPiece={eHeldPiece.current}
          hasHeld={eHasHeld.current}
        />
        <Info
          gameMode={gameMode}
          timer={eGameOver.current
            ? eFinalTime.current - eLastRestartTime.current
            : time - eLastRestartTime.current}
          countdown={eGameOver.current
            ? eLastRestartTime.current + 120000 - eFinalTime.current
            : eLastRestartTime.current + 120000 - time}
          lines={eLines.current}
          score={eScore.current}
        />
      </div>
      <Garbage
        garbageQueue={eGarbageQueue.current}
        time={time}
      />
      <Grid
        grid={eGrid.current}
        shapeIndex={eShapeIndex.current}
        rotation={eRotation.current}
        x={eShapeX.current}
        y={eGameOver.current
          ? 5
          : eShapeY.current}
        ghostY={eGameOver.current
          ? 5
          : eGhostY.current}
        gameOver={eGameOver.current}
      />
      <div className="right-container">
        <Next
          nextPieces={eNextPieces.current}
        />
      </div>
    </div>
  )
}

export default TetrisGameSolo;