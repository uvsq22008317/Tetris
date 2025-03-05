import { useEffect, useRef, useState } from 'react';
import { ROWS, COLUMNS, shapes, wallKicks, tCorners } from '../Logic_game/constants';

const useGameLogic = (handling) => {
  const [isSoftDropping, setIsSoftDropping] = useState(false);
  const lastLockdownTime = useRef(performance.now());
  const [grounded, setGrounded] = useState(false);
  const lastFallTime = useRef(performance.now());
  const lastGroundTime = useRef(performance.now());
  const lastGroundPositionX = useRef(0);
  const lastGroundPositionY = useRef(0);
  const lastGroundRotation = useRef(0);
  const SDF = handling.SDF;
  const score = useRef(0);
  const gameOver = useRef(false);
  const ghostY = useRef(0);

  const lockdownRule = useRef(15);
  const nextPieces = useRef(generateBag().concat(generateBag())); // Initialize with a generated bag

  const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const shapeIndex = useRef(nextPiece());
  const rotation = useRef(0);
  const shapeX = useRef(4);
  const shapeY = useRef(18);

  const heldPiece = useRef(0);
  const hasHeld = useRef(true);
  const garbageQueue = useRef([]);

  console.log(nextPieces.current);
  const nextPiecesPreview = useRef([]);

  let combo = -1;
  let b2b = -1;

  const lastKickForceTspin = useRef(false);
  const lastMoveIsRotate = useRef(false);

  const gravity = 0.02; // 1G : 1 cell per frame
  let level = 1;
  let fallSpeed = (1000 / 60) / (gravity * (2 ** (level - 1))); // Fall speed in milliseconds



  // If the piece is grounded, ungrounds it and update the ground values 
  function ungroundPiece() {
    if (!grounded) return;
    let time = performance.now();
    setGrounded(false);
    lastFallTime.current = time
    lastGroundTime.current = time;
    lastGroundPositionX.current = shapeX.current;
    lastGroundPositionY.current = shapeY.current;
    lastGroundRotation.current = rotation.current;
  }

  function clearFullLines(newGrid) {
    let linesCleared = 0;
    // let tspinStatus = isTSpin();
    for (let row = ROWS - 1; row >= 0; row--) {
      if (newGrid[row].every(cell => cell !== 0)) {
        newGrid.splice(row, 1); // Remove the full row
        newGrid.unshift(Array(COLUMNS).fill(0)); // Add an empty row at the bottom
        linesCleared++;
        row++; // Stay at the same row index to check again
      }
    }
    setGrid(newGrid);
  }

  function resetPosition() {
    rotation.current = 0;
    shapeX.current = 4 - Math.floor(shapes[shapeIndex.current][0].length / 2);
    shapeY.current = 18 - (shapes[shapeIndex.current][0].length - 3);
    lockdownRule.current = 15;
    lastKickForceTspin.current = false;
    lastMoveIsRotate.current = false;
    lastFallTime.current = performance.now();
    ungroundPiece();
    // gameOverCheck();
  }

  // Resets the current piece after placing one
  function resetPiece() {   
    shapeIndex.current = nextPiece();
    hasHeld.current = false;
    resetPosition();
    nextPiecesPreview.current = nextPieces.current.slice(0, 5); // Slice returns a copy
    updateGhost();
  }

  // Takes a piece (from hold) and resets the piece
  function takePiece(piece) {
    shapeIndex.current = piece;
    hasHeld.current = true;
    resetPosition();
  }

  // Fisher-Yates (Knuth) shuffle algorithm from https://rosettacode.org/wiki/Knuth_shuffle#ES5
  function fyShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Fisher-Yates (Knuth) shuffle algorithm from https://rosettacode.org/wiki/Knuth_shuffle#ES5
  function generateBag() {
    let bag = [];
    for (let i = 1; i < shapes.length; i++) {
      bag.push(i);
    }
    return fyShuffle(bag);
  }

  // Returns the next piece to be played, refills the bag if necessary
  function nextPiece() {
    if (nextPieces.current.length < 7) nextPieces.current = nextPieces.current.concat(generateBag());
    return nextPieces.current.shift();
  }

  function updateGhost() {
    let y = shapeY.current;
    while (canMove(0, y - shapeY.current, rotation.current)) y++;
    ghostY.current = y - 1;
  }

  // Tries to move a piece
  function tryMove(offsetX, offsetY) {
    if (canMove(offsetX, offsetY, rotation.current)) {
      shapeX.current += offsetX;
      shapeY.current += offsetY;
      lastMoveIsRotate.current = false;
      // If the piece is taken off the ground or moved down, reset the last fall time
      if (grounded || offsetY === 1) lastFallTime.current = performance.now();
      if (grounded) {
        lockdownRule.current--;
        ungroundPiece();
      }
    }
  }

  function groundPiece() {
    if (grounded) return;
    setGrounded(true);
    let time = performance.now();
    lastGroundTime.current = time;
    lastGroundPositionX.current = shapeX.current;
    lastGroundPositionY.current = shapeY.current;
    lastGroundRotation.current = rotation.current;
  }

  function canMove(offsetX, offsetY, newRotation) {
    for (let y = 0; y < shapes[shapeIndex.current][newRotation].length; y++) {
      for (let x = 0; x < shapes[shapeIndex.current][newRotation][y].length; x++) {
        if (shapes[shapeIndex.current][newRotation][y][x] === 1) {
          let newX = shapeX.current + x + offsetX;
          let newY = shapeY.current + y + offsetY;
          // Check if out of bounds or occupied
          if (newX < 0 || newX >= COLUMNS || newY >= ROWS) return false;
          if (grid[newY][newX] !== 0) return false;
        }
      }
    }
    return true;
  }

  function groundCheck() {
    if (!canMove(0, 1, rotation.current)) groundPiece();
    else ungroundPiece();
  }

  function saveToGrid() {
    let newGrid = grid.slice();
    for (let y = 0; y < shapes[shapeIndex.current][rotation.current].length; y++) {
      for (let x = 0; x < shapes[shapeIndex.current][rotation.current][y].length; x++) {
        if (shapes[shapeIndex.current][rotation.current][y][x] === 1) {
          let newX = shapeX.current + x;
          let newY = shapeY.current + y;
          if (newY < ROWS && newX < COLUMNS) {
            newGrid[newY][newX] = shapeIndex.current;
          }
        }
      }
    }
    clearFullLines(newGrid);
  }

  function hardDrop() {
    while (canMove(0, 1, rotation.current)) {
      shapeY.current++;
      score.current += 2;
      lastFallTime.current = performance.now();
    }
    saveToGrid();
    resetPiece();
  }

  // Check if the piece can rotate
  function canRotate(newRotation) {
    // Find kick table to use
    let is180 = (rotation.current + newRotation) % 2 === 0;
    let kicks = (is180
      ? (shapeIndex.current === 1
        ? wallKicks["180-O"]
        : wallKicks["180"])
      : (shapeIndex.current === 1
        ? wallKicks["O"]
        : (shapeIndex.current === 2
          ? wallKicks["I"]
          : wallKicks["JLSTZ"]))
    );

    // Check if the piece can rotate with one of the kicks
    if (is180) {
      for (let i = 0; i < kicks[rotation.current].length; i++) {
        let offsetX = kicks[rotation.current][i][0];
        let offsetY = kicks[rotation.current][i][1];
        if (canMove(offsetX, offsetY, newRotation)) {
          let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
          return { allowed: true, newX: shapeX.current + offsetX, newY: shapeY.current + offsetY, kick: kickForceTspin };
        }
      }
      return { allowed: false, newX: shapeX.current, newY: shapeY.current, kickForceTspin: false };
    }
    else {
      for (let i = 0; i < kicks[newRotation].length; i++) {
        let offsetX = kicks[rotation.current][i][0] - kicks[newRotation][i][0];
        let offsetY = kicks[rotation.current][i][1] - kicks[newRotation][i][1];
        if (canMove(offsetX, offsetY, newRotation)) {
          let kickForceTspin = (Math.abs(offsetX) === 1 && Math.abs(offsetY) === 2) || (Math.abs(offsetX) === 2 && Math.abs(offsetY) === 1);
          return { allowed: true, newX: shapeX.current + offsetX, newY: shapeY.current + offsetY, kick: kickForceTspin };
        }
      }
      return { allowed: false, newX: shapeX.current, newY: shapeY.current, kickForceTspin: false };
    }
  }

  // Tries to rotate a piece
  function tryRotate(newRotation, time) {
    let res = canRotate(newRotation);
    if (res.allowed) {
      rotation.current = newRotation;
      shapeX.current = res.newX;
      shapeY.current = res.newY;
      if (grounded) {
        lockdownRule.current--;
        ungroundPiece(time);
      }
      lastKickForceTspin.current = res.kick;
      lastMoveIsRotate.current = true;
    }
  }

  function tryRotateCW() {
    let newRotation = (rotation.current + 1) % shapes[shapeIndex.current].length;
    tryRotate(newRotation, performance.now());
  }

  function tryRotateCCW() {
    let newRotation = (rotation.current + shapes[shapeIndex.current].length - 1) % shapes[shapeIndex.current].length;
    tryRotate(newRotation, performance.now());
  }

  function tryRotate180() {
    let newRotation = (rotation.current + 2) % shapes[shapeIndex.current].length;
    tryRotate(newRotation, performance.now());
  }

  const [ms, setMs] = useState(0);

  useEffect(() => {
    const update = setInterval(() => {
      setMs(prev => prev + 1);
      let time = performance.now();
      if (gameOver.current) return;
      updateGhost();
      groundCheck();
      // Calculate fall speed depending on soft drop activation
      let currentFallSpeed = (isSoftDropping && SDF !== Infinity) ? fallSpeed / SDF : fallSpeed;
      if (grounded) {
        // Piece placed if has been on the ground for 500ms or too many lockdown resets
        if ((lastGroundPositionX.current === shapeX.current
          && lastGroundPositionY.current === shapeY.current
          && lastGroundRotation.current === rotation.current
          && time - lastGroundTime.current > 500)
          || lockdownRule.current === 0) {
          lastLockdownTime.current = time;
          saveToGrid();
          resetPiece();
        }
        // If piece hasn't been placed because of movement (ie time), do not update time
        else {
          if (lockdownRule.current > 0
            &&
            !(lastGroundPositionX.current === shapeX.current
              && lastGroundPositionY.current === shapeY.current
              && lastGroundRotation.current === rotation.current)) {
          }
        }
      }
      else {
        if (isSoftDropping && SDF === Infinity && !grounded) {
          while (canMove(0, 1, rotation.current)) {
            tryMove(0, 1);
            score.current++;
          }
          groundPiece(time);
        }
        else if (time - lastFallTime.current > currentFallSpeed) {
          tryMove(0, 1);
          if (isSoftDropping) score.current++;
          lastFallTime.current = time;
        }
      }
    }, 10);
    return () => clearInterval(update);
  });

  return {
    grid,
    shapeIndex,
    rotation,
    shapeX,
    shapeY,
    heldPiece,
    hasHeld,
    nextPiecesPreview,
    garbageQueue,
    setIsSoftDropping,
    lastLockdownTime,
    grounded,
    ghostY,
    tryMove,
    hardDrop,
    tryRotateCW,
    tryRotateCCW,
    tryRotate180
  };
};

export default useGameLogic;