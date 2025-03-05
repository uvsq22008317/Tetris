import { useEffect, useRef, useState } from 'react';
import { ROWS, COLUMNS, shapes, wallKicks, tCorners } from '../Logic_game/constants';

const useGameLogic = (controls, handling) => {
  const eGrid = useRef(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const shapeIndex = useRef(0);
  const rotation = useRef(0);
  const shapeX = useRef(0);
  const shapeY = useRef(0);
  const [isSoftDropping, setIsSoftDropping] = useState(false);
  const heldPiece = useRef(0);
  const hasHeld = useRef(true);
  const nextPiecesPreview = useRef([]);
  const garbageQueue = useRef([]);
  const ghostY = useRef(0);
  const userHardDrop = useRef(null);
  const userTryMove = useRef(null);
  const userTryRotateCW = useRef(null);
  const userTryRotateCCW = useRef(null);
  const userTryRotate180 = useRef(null);

  const score = useRef(0);
  const gameOver = useRef(false);

  const [ms, setMs] = useState(0);

  useEffect(() => {
    let grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)); // Empty grid
    shapeX.current = 4;
    shapeY.current = 18;
    let combo = -1;
    let b2b = -1;
    const gravity = 0.02; // 1G : 1 cell per frame
    let level = 1;
    let fallSpeed = (1000 / 60) / (gravity * (2 ** (level - 1))); // Fall speed in milliseconds
    let lastKickForceTspin = false;
    let lastMoveIsRotate = false;
    let nextPieces = generateBag().concat(generateBag()); // Initialize with a generated bag
    shapeIndex.current = nextPiece();
    let lastFallTime = 0;
    let lastGroundTime = 0;
    let lastLockdownTime = 0;
    let lastGroundPositionX = -1;
    let lastGroundPositionY = -1;
    let lastGroundRotation = -1;
    let grounded = false;
    let lockdownRule = 15; // lockdown resets left
    const SDF = handling.SDF

    // Resets the current piece after placing one
    function resetPiece() {
      shapeIndex.current = nextPiece();
      hasHeld.current = false;
      resetPosition();
      nextPiecesPreview.current = nextPieces.slice(0, 5); // Slice returns a copy
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
      if (nextPieces.length < 7) nextPieces = nextPieces.concat(generateBag());
      return nextPieces.shift();
    }

    function updateGhost() {
      let y = shapeY.current;
      while (canMove(0, y - shapeY.current, rotation.current)) y++;
      ghostY.current = y - 1;
    }

    function updateEGrid() {
      eGrid.current = grid;
    }


    // Tries to move a piece
    function tryMove(offsetX, offsetY) {
      if (canMove(offsetX, offsetY, rotation.current)) {
        shapeX.current += offsetX;
        shapeY.current += offsetY;
        lastMoveIsRotate = false;
        // If the piece is taken off the ground or moved down, reset the last fall time
        if (grounded || offsetY === 1) lastFallTime = performance.now();
        if (grounded) {
          lockdownRule--;
          ungroundPiece();
        }
      }
    }
    userTryMove.current = tryMove;

    function groundPiece() {
      if (grounded) return;
      grounded = true;
      let time = performance.now();
      lastGroundTime = time;
      lastGroundPositionX = shapeX.current;
      lastGroundPositionY = shapeY.current;
      lastGroundRotation = rotation.current;
    }

    function canMove(offsetX, offsetY, newRotation) {
      for (let y = 0; y < shapes[shapeIndex.current][newRotation].length; y++) {
        for (let x = 0; x < shapes[shapeIndex.current][newRotation][y].length; x++) {
          if (shapes[shapeIndex.current][newRotation][y][x] === 1) {
            let newX = shapeX.current + x + offsetX;
            let newY = shapeY.current + y + offsetY;
            console.log(`newX: ${newX}, newY: ${newY}`)
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

    // If the piece is grounded, ungrounds it and update the ground values 
    function ungroundPiece() {
      if (!grounded) return;
      let time = performance.now();
      grounded = false;
      lastFallTime = time
      lastGroundTime = time;
      lastGroundPositionX.current = shapeX.current;
      lastGroundPositionY.current = shapeY.current;
      lastGroundRotation.current = rotation.current;
    }

    function clearFullLines(newGrid) {
      let linesCleared = 0;
      // let tspinStatus = isTSpin();
      for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== 0)) {
          grid.splice(row, 1); // Remove the full row
          grid.unshift(Array(COLUMNS).fill(0)); // Add an empty row at the top
          linesCleared++;
          row++; // Stay at the same row index to check again
        }
      }
    }

    function resetPosition() {
      rotation.current = 0;
      shapeX.current = 4 - Math.floor(shapes[shapeIndex.current][0].length / 2);
      shapeY.current = 18 - (shapes[shapeIndex.current][0].length - 3);
      lockdownRule = 15;
      lastKickForceTspin = false;
      lastMoveIsRotate = false;
      lastFallTime = performance.now();
      ungroundPiece();
      // gameOverCheck();
    }

    function hardDrop() {
      let time = performance.now();
      if (time - lastLockdownTime < 160) return;
      while (canMove(0, 1, rotation.current)) {
        shapeY.current++;
        score.current += 2;
        lastFallTime = time;
      }
      saveToGrid();
      resetPiece();
    }
    userHardDrop.current = hardDrop;

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
          lockdownRule--;
          ungroundPiece(time);
        }
        lastKickForceTspin = res.kick;
        lastMoveIsRotate = true;
      }
    }


    function tryRotateCW() {
      let newRotation = (rotation.current + 1) % shapes[shapeIndex.current].length;
      tryRotate(newRotation, performance.now());
    }
    userTryRotateCW.current = tryRotateCW;

    function tryRotateCCW() {
      let newRotation = (rotation.current + shapes[shapeIndex.current].length - 1) % shapes[shapeIndex.current].length;
      tryRotate(newRotation, performance.now());
    }
    userTryRotateCCW.current = tryRotateCCW;

    function tryRotate180() {
      let newRotation = (rotation.current + 2) % shapes[shapeIndex.current].length;
      tryRotate(newRotation, performance.now());
    }
    userTryRotate180.current = tryRotate180;

    const update = setInterval(() => {
      setMs(prev => prev + 1);
      let time = performance.now();
      if (gameOver.current) return;
      // console.log(`${shapeIndex.current}`)
      updateGhost();
      updateEGrid();
      groundCheck();
      // Calculate fall speed depending on soft drop activation
      let currentFallSpeed = (isSoftDropping && SDF !== Infinity) ? fallSpeed / SDF : fallSpeed;
      if (grounded) {
        // Piece placed if has been on the ground for 500ms or too many lockdown resets
        if ((lastGroundPositionX === shapeX.current
          && lastGroundPositionY === shapeY.current
          && lastGroundRotation === rotation.current
          && time - lastGroundTime > 500)
          || lockdownRule === 0) {
          lastLockdownTime = time;
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
  }, [isSoftDropping, handling.SDF]);

  return { eGrid,
    shapeIndex,
    rotation,
    shapeX,
    shapeY,
    heldPiece,
    hasHeld,
    garbageQueue,
    nextPiecesPreview,
    setIsSoftDropping,
    ghostY,
    userHardDrop,
    userTryMove,
    userTryRotateCW,
    userTryRotateCCW,
    userTryRotate180
  };
};

export default useGameLogic;