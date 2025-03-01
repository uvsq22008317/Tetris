import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import socket from '../socket';
import "./Tetris.css";
import { colors, shapes } from './constants';

function TetrisGamePreview({ playerId }) {
  const gameContainerRef = useRef(null);
  const holdContainerRef = useRef(null);
  const nextContainerRef = useRef(null);
  const garbageContainerRef = useRef(null);
  const gameRef = useRef(null);
  const CELL_SIZE = 30; // Cell size in px

  useEffect(() => {
    if (gameRef.current) return; // If game already exists, do nothing

    // Clean up the game container before creating a new instance
    while (gameContainerRef.current.firstChild) {
      gameContainerRef.current.removeChild(gameContainerRef.current.firstChild);
    }

    // Grid and pieces
    const GRID_COLUMNS = 10;
    const GRID_ROWS = 40;
    let grid = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLUMNS).fill(0)); // Empty grid

    // Track held piece info
    let hasHeld = false; // true if hold has been used this piece
    let heldPiece = -1; // piece held in hold slot of pieces

    // Track next piece info
    let nextPieces = []; // Start with 2 bags of pieces    

    let shapeIndex = -1; // random shape selection
    let rotation = 0;
    let shapeX = 4 - Math.floor(shapes[shapeIndex][0].length / 2);
    let shapeY = 20 - (shapes[shapeIndex][0].length - 3); // initial piece appearance height

    let garbageQueue = [];

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

    // Calculates the position of the ghost piece
    function getGhostPosition() {
      let ghostY = shapeY;
      while (canMove(0, ghostY - shapeY, rotation)) ghostY++;
      return ghostY - 1;
    }

    // Returns the next 5 pieces to be played
    function peekNextPieces() {
      return nextPieces.slice(0, 5); // Slice returns a copy
    }

    function renderOffset(piece) {
      let offsetX = 0;
      let offsetY = 1;
      if (piece === 1) offsetX = -1; // Offset for I piece
      if (piece === 1) offsetY = -1; // Offset for I piece
      return [offsetX, offsetY];
    }

    class TetrisScene extends Phaser.Scene {
      constructor() {
        super({ key: 'TetrisScene' });
      }

      create() {
        this.drawGrid();
        this.drawShapes();
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

      drawShapes() {
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
        if (shapeIndex === 1) return;
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

      drawHeldPiece() {
        let holdCanvas = holdContainerRef.current;
        if (holdCanvas != null) {
          let context = holdCanvas.getContext('2d');
          context.clearRect(0, 0, holdCanvas.width, holdCanvas.height); // Clear previous drawing
          if (heldPiece !== -1) {
            let color = hasHeld ? 0x808080 : colors[heldPiece]; // Render in gray if hasHeld is true
            let hexColor = `#${color.toString(16).padStart(6, '0')}`; // Ensure color is a 6-digit hex string
            let offset = renderOffset(heldPiece);
            for (let y = 0; y < shapes[heldPiece][0].length; y++) {
              for (let x = 0; x < shapes[heldPiece][0][y].length; x++) {
                if (shapes[heldPiece][0][y][x] === 1) {
                  let posX = (x + offset[0]) * CELL_SIZE;
                  let posY = (y + offset[1]) * CELL_SIZE;
                  context.fillStyle = hexColor;
                  context.fillRect(posX, posY, CELL_SIZE, CELL_SIZE);
                }
              }
            }
          }
        }
      }

      drawNextPieces() {
        let nextCanvas = nextContainerRef.current;
        if (nextCanvas != null) {
          let context = nextCanvas.getContext('2d');
          context.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // Clear previous drawing
          let nextPieces = peekNextPieces();
          for (let i = 0; i < nextPieces.length; i++) {
            let piece = nextPieces[i];
            let color = colors[piece];
            let hexColor = `#${color.toString(16).padStart(6, '0')}`; // Ensure color is a 6-digit hex string
            let offset = renderOffset(piece);
            for (let y = 0; y < shapes[piece][0].length; y++) {
              for (let x = 0; x < shapes[piece][0][y].length; x++) {
                if (shapes[piece][0][y][x] === 1) {
                  let posX = (x + offset[0]) * CELL_SIZE;
                  let posY = (y + offset[1] + i * 4) * CELL_SIZE; // Draw each piece 4 cells lower
                  context.fillStyle = hexColor;
                  context.fillRect(posX, posY, CELL_SIZE, CELL_SIZE);
                }
              }
            }
          }
        }
      }

      drawGarbageBar(time) {
        let garbageCanvas = garbageContainerRef.current;
        if (garbageCanvas != null) {
          let context = garbageCanvas.getContext('2d');
          context.clearRect(0, 0, garbageCanvas.width, garbageCanvas.height); // Clear previous drawing
          let currentHeight = garbageCanvas.height; // Start from the bottom
          // Draw each attack in the queue up to height 20
          for (let i = 0; i < garbageQueue.length; i++) {
            let attack = garbageQueue[i];
            let attackHeight = attack[0] * CELL_SIZE;
            // Draw in grey if the attack time has passed, otherwise in red
            context.fillStyle = attack[1] < time ? '#808080' : '#FF0000';
            currentHeight -= attackHeight;
            context.fillRect(0, currentHeight, garbageCanvas.width, attackHeight + 2);
            if (currentHeight <= 0) break;
          }
        }
      }

      update(time) {
        this.children.removeAll(); // Clear all displayed elements
        this.drawGrid(); // Redraw the grid
        this.drawShapes(); // Redraw stored blocks and current falling shape
        this.drawHeldPiece(); // Draw the held piece
        this.drawNextPieces(); // Draw the next pieces
        this.drawGarbageBar(time); // Draw the garbage bar
        this.drawInfo(time); // Draw the score
      }

    }

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: GRID_COLUMNS * CELL_SIZE,
      height: 20 * CELL_SIZE, // Display only the last 20 rows
      backgroundColor: 'rgba(0, 0, 0, 0)',
      scene: TetrisScene
    };

    gameRef.current = new Phaser.Game(config);

    socket.on("update-grid", (gridData) => {
      grid = gridData;
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      socket.off("update-grid");
    };

  }, [playerId]);

  return (
    <div className="game-wrapper">
      <div className="left-container">
        <canvas ref={holdContainerRef} width={4 * CELL_SIZE} height={4 * CELL_SIZE} className="hold-container"></canvas>
      </div>
      <canvas ref={garbageContainerRef} width={CELL_SIZE / 2} height={20 * CELL_SIZE} className="garbage-container"></canvas>
      <div ref={gameContainerRef} className="game-container"></div>
      <canvas ref={nextContainerRef} width={4 * CELL_SIZE} height={20 * CELL_SIZE} className="next-container"></canvas>
    </div>
  );
}

export default TetrisGamePreview;