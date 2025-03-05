import React, { useEffect, useRef } from 'react';
import { GRID_ROWS, CELL_SIZE, SHOWN_ROWS} from './constants';

function Garbage({ garbageQueue, time }) {
    const canvasRef = useRef();
    const drawOffset = (SHOWN_ROWS - GRID_ROWS) * CELL_SIZE + 5;

    function drawGarbage(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, drawOffset - 5, ctx.canvas.width, ctx.canvas.height);

        // Draw garbage queue
        let bottom = SHOWN_ROWS * CELL_SIZE + 2.5;
        garbageQueue.forEach(([rows, arrivalTime]) => {
            const height = rows * CELL_SIZE;
            let color = time > arrivalTime ? '#808080' : '#FF0000';
            ctx.fillStyle = color;
            ctx.fillRect(5, bottom - height, CELL_SIZE, height + 1);
            bottom -= height;
        });

        // Draw left and bottom border
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(2.5, drawOffset - 5);
        ctx.lineTo(2.5, SHOWN_ROWS * CELL_SIZE + 2.5);
        ctx.lineTo(5 + CELL_SIZE, SHOWN_ROWS * CELL_SIZE + 2.5);
        ctx.stroke();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawGarbage(ctx);
    });



    return (
        <canvas
            ref={canvasRef}
            width={5 + CELL_SIZE/2}
            height={(SHOWN_ROWS) * CELL_SIZE + 5}
        />
    )
}

export default Garbage;