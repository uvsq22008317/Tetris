import Grid from '../Logic_game/Grid';
import Hold from '../Logic_game/Hold';
import Next from '../Logic_game/Next';
import Garbage from '../Logic_game/Garbage';
import "./Tetris.css";
import { ROWS, COLUMNS } from '../Logic_game/constants';

function TetrisSolo() {
    // Example grid and piece state
    const grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    grid[39][0] = 1; // Example piece
    grid[39][1] = 1;
    grid[38][0] = 1;
    grid[38][1] = 1;
    grid[39][7] = 4; // Another piece
    grid[39][8] = 4;
    grid[39][9] = 4;
    grid[38][9] = 4;
    const shapeIndex = 1;
    const rotation = 0;
    const x = 4;
    const y = 15;
    const ghostX = 4;
    const ghostY = 36;

    const heldPiece = 0;
    const hasHeld = true;

    const time = 199;
    const nextPieces = [0, 1, 2, 3, 4];

    const garbageQueue = [[3,0], [10,100], [15,200]]

    return (
        <div className='game-wrapper'>
            <div className="left-container">
                <Hold
                    heldPiece={heldPiece}
                    hasHeld={hasHeld}
                />
            </div>
            <Garbage
                garbageQueue={garbageQueue}
                time={time}
            />
            <Grid
                grid={grid}
                shapeIndex={shapeIndex}
                rotation={rotation}
                x={x}
                y={y}
                ghostX={ghostX}
                ghostY={ghostY}
            />
            <div className="right-container">
                <Next
                    nextPieces={nextPieces}
                />
            </div>
        </div>
    )
}

export default TetrisSolo;