import React, { useEffect, useRef } from 'react';
import { CELL_SIZE, colors, GRID_ROWS, shapes, SHOWN_ROWS } from './constants.js';

function Next({ nextPieces }) {
    const positions = nextPieces.map(nextPositions);
    const canvasRef = useRef();
    const drawOffset = (SHOWN_ROWS - GRID_ROWS) * CELL_SIZE + 5;

    function pieceOffset(piece) {
        switch (piece) {
            // O piece
            case 1: return { x: 1, y: 0.5 };
            // I piece
            case 2: return { x: 0, y: -1 };
            default: return { x: 1.5, y: 0.5 };
        }
    }

    function nextPositions(piece) {
        const offset = pieceOffset(piece);
        const shape = shapes[piece][0];
        const positions = [];
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    positions.push([offset.x + j, offset.y + i]);
                }
            }
        }
        return positions;
    }

    function drawNext(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, drawOffset, 6 * CELL_SIZE, 15 * CELL_SIZE);

        let offset = 0;
        for (let i = 0; i < nextPieces.length; i++) {
            // Draw next piece
            (function(offset) {
                positions[i].forEach(([px, py]) => {
                    ctx.fillStyle = colors[nextPieces[i]];
                    ctx.fillRect(px * CELL_SIZE, py * CELL_SIZE + drawOffset + offset, CELL_SIZE, CELL_SIZE);
                });
            })(offset);
            offset += 3 * CELL_SIZE;
        }

        // Draw borders
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 5;
        // Draw left border outside of canvas
        ctx.strokeRect(-2.5, drawOffset - 2.5, 6 * CELL_SIZE + 5, 15 * CELL_SIZE + 5);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawNext(ctx);
    });

    return (
        <canvas
            ref={canvasRef}
            width={6 * CELL_SIZE + 5}
            height={20 * CELL_SIZE + 10 }
        />
    );
}

export default Next;