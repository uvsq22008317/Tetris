import React, { useEffect, useRef } from 'react';
import { CELL_SIZE, colors, GRID_ROWS, shapes, SHOWN_ROWS } from './constants';

function Hold({ heldPiece, hasHeld }) {
    const positions = holdPositions();
    const canvasRef = useRef();
    const drawOffset = (SHOWN_ROWS - GRID_ROWS) * CELL_SIZE + 5;

    function pieceOffset() {
        switch (heldPiece) {
            // O piece
            case 0: return { x: 1, y: 0.5 };
            // I piece
            case 1: return { x: 0, y: -1 };
            default: return { x: 1.5, y: 0.5 };
        }
    }

    function holdPositions() {
        const offset = pieceOffset(heldPiece);
        const shape = shapes[heldPiece][0];
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

    function drawHold(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(5, drawOffset, 6 * CELL_SIZE, 3 * CELL_SIZE);

        // Draw held piece
        positions.forEach(([px, py]) => {
            ctx.fillStyle = hasHeld ? '#999' : colors[heldPiece + 1];
            ctx.fillRect(5 + px * CELL_SIZE, py * CELL_SIZE + drawOffset, CELL_SIZE, CELL_SIZE);
        });

        // Draw borders
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 5;
        // Draw right border outside of canvas
        ctx.strokeRect(2.5, drawOffset - 2.5, 6 * CELL_SIZE + 5, 3 * CELL_SIZE + 5);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawHold(ctx);
    });

    return (
        <canvas
            ref={canvasRef}
            width={6 * CELL_SIZE + 5}
            height={(SHOWN_ROWS - GRID_ROWS + 3) * CELL_SIZE + 10}
        />
    );

}

export default Hold;