import React, { useEffect, useRef } from 'react';
import { ROWS, COLUMNS, CELL_SIZE, colors, shapes, wallKicks, tCorners } from './constants';
// import { useGame } from './useGame';

function Grid({ grid, shapeIndex, rotation, x, y, ghostX, ghostY }) {
    const positions = piecePositions(x, y);
    const ghostPositions = piecePositions(ghostX, ghostY);
    const canvasRef = useRef();

    function piecePositions(x, y) {
        const shape = shapes[shapeIndex] ? shapes[shapeIndex][rotation] : null;
        const positions = [];
        if (shape) {
            for (let i = 0; i < shape.length; i++) {
                for (let j = 0; j < shape[i].length; j++) {
                    if (shape[i][j]) {
                        positions.push([x + j, y + i]);
                    }
                }
            }
        }
        return positions;
    }

    function drawGrid(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(5, 5 * CELL_SIZE, ctx.canvas.width - 10, ctx.canvas.height - 5);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.5;
        for (let i = 6; i < ROWS - 15; i++) {
            ctx.beginPath();
            ctx.moveTo(5, Math.round(i * CELL_SIZE) + 0.5);
            ctx.lineTo(COLUMNS * CELL_SIZE + 5, Math.round(i * CELL_SIZE) + 0.5);
            ctx.stroke();
        }
        for (let i = 1; i < COLUMNS; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.round(i * CELL_SIZE) + 5.5, 5 * CELL_SIZE);
            ctx.lineTo(Math.round(i * CELL_SIZE) + 5.5, ROWS * CELL_SIZE);
            ctx.stroke();
        }

        // Draw placed pieces
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                if (grid[row][col]) {
                    ctx.fillStyle = colors[grid[row][col]];
                    ctx.fillRect(Math.round(col * CELL_SIZE) + 5, Math.round((row - 15) * CELL_SIZE), CELL_SIZE, CELL_SIZE);
                }
            }
        }
        // Draw current piece
        positions.forEach(([px, py]) => {
            ctx.fillStyle = colors[shapeIndex+1];
            ctx.fillRect(Math.round(px * CELL_SIZE) + 5, Math.round((py - 15) * CELL_SIZE), CELL_SIZE, CELL_SIZE);
        });
        // Draw ghost piece
        ghostPositions.forEach(([px, py]) => {
            ctx.fillStyle = colors[shapeIndex+1];
            ctx.globalAlpha = 0.5;
            ctx.fillRect(Math.round(px * CELL_SIZE) + 5, Math.round((py - 15) * CELL_SIZE), CELL_SIZE, CELL_SIZE);
            ctx.globalAlpha = 1.0;
        });
        // Draw borders
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 5;  
        ctx.beginPath();
        ctx.moveTo(2.5, 5 * CELL_SIZE);
        ctx.lineTo(2.5, ctx.canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(COLUMNS * CELL_SIZE + 7.5, 5 * CELL_SIZE);
        ctx.lineTo(COLUMNS * CELL_SIZE + 7.5, ctx.canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, ctx.canvas.height-2.5);
        ctx.lineTo(COLUMNS * CELL_SIZE + 5, ctx.canvas.height-2.5);
        ctx.stroke();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawGrid(ctx);
    });

    return (
        <canvas ref={canvasRef} className="grid" width={(COLUMNS * CELL_SIZE) + 10} height={((ROWS - 15) * CELL_SIZE) + 5} tabIndex="0"></canvas>
    );
}

export default Grid;