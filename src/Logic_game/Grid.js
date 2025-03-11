import React, { useEffect, useRef } from 'react';
import { ROWS, COLUMNS, CELL_SIZE, colors, shapes, SHOWN_ROWS, HIDDEN_ROWS } from './constants';

function Grid({ grid, shapeIndex, rotation, x, y, ghostY }) {
    const positions = piecePositions(x, y);
    const ghostPositions = piecePositions(x, ghostY);
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
        for (let i = 6; i < SHOWN_ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(5, i * CELL_SIZE + 0.5);
            ctx.lineTo(COLUMNS * CELL_SIZE + 5, i * CELL_SIZE + 0.5);
            ctx.stroke();
        }
        for (let i = 1; i < COLUMNS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE + 5.5, 5 * CELL_SIZE);
            ctx.lineTo(i * CELL_SIZE + 5.5, ROWS * CELL_SIZE);
            ctx.stroke();
        }

        // Draw placed pieces
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                let piece = grid[row][col]
                if (piece) {
                    let color = (piece === -1) ? colors[0] : colors[piece];
                    ctx.fillStyle = color;
                    ctx.fillRect(col * CELL_SIZE + 5, (row - HIDDEN_ROWS) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        // Draw current piece
        positions.forEach(([px, py]) => {
            ctx.fillStyle = colors[shapeIndex];
            ctx.fillRect(px * CELL_SIZE + 5, (py - HIDDEN_ROWS) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
        // Draw ghost piece
        ghostPositions.forEach(([px, py]) => {
            ctx.fillStyle = colors[shapeIndex];
            ctx.globalAlpha = 0.2;
            ctx.fillRect(px * CELL_SIZE + 5, (py - HIDDEN_ROWS) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.globalAlpha = 1.0;
        });
        // Draw borders
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
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
        <canvas 
            ref={canvasRef} 
            className="grid"
            width={(COLUMNS * CELL_SIZE) + 10}
            height={((SHOWN_ROWS) * CELL_SIZE) + 5} 
            tabIndex="0">
        </canvas>
    );
}

export default Grid;