import React, { useEffect, useRef } from 'react';
import { CELL_SIZE, GRID_ROWS, SHOWN_ROWS } from './constants.js';

function Hold({ gameMode, timer, countdown, lines, score }) {
    const canvasRef = useRef();

    function modeShowTimer() {
        switch (gameMode) {
            case 'Sprint':
            case 'Rush':
            case 'Cheese':
                return true;
            default:
                return false;
        }
    }

    function modeShowCountdown() {
        switch (gameMode) {
            case 'Ultra':
                return true;
            default:
                return false;
        }
    }

    function modeShowLines() {
        switch (gameMode) {
            case 'Sprint':
                return true;
            default:
                return false;
        }
    }

    function modeShowScore() {
        switch (gameMode) {
            case 'Rush':
            case 'Ultra':
                return true;
            default:
                return false;
        }
    }

    function timeFormat(time) {
        let minutes = Math.floor(time / 60000);
        let seconds = ((time % 60000) / 1000).toFixed(0);
        let milliseconds = (time % 1000).toFixed(0);
        return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds},${milliseconds}`;
    }

    function drawInfo(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '12px scientifica';
        ctx.fillStyle = 'white';

        let y = ctx.height - 15;

        if (modeShowTimer()) {
            ctx.fillText(`${timeFormat(timer)}`, 5, y);
            y -= 20;
        }

        if (modeShowCountdown()) {
            ctx.fillText(`${timeFormat(countdown)}`, 5, y);
            y -= 20;
        }

        if (modeShowLines()) {
            ctx.fillText(`Lines: ${lines}`, 5, y);
            y -= 20;
        }

        if (modeShowScore()) {
            ctx.fillText(`Score: ${score}`, 5, y);
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawInfo(ctx, gameMode, timer, countdown, lines, score);
    }, [gameMode, timer, countdown, lines, score]);

    return (
        <canvas
            ref={canvasRef}
            width={6 * CELL_SIZE + 5}
            // Height is Grid height minus Hold height
            height={((SHOWN_ROWS) * CELL_SIZE) + 5 - ((SHOWN_ROWS - GRID_ROWS + 3) * CELL_SIZE + 10)}
        />
    );
}

export default Hold;