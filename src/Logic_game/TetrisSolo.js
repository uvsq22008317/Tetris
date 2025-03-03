import Grid from '../Logic_game/Grid';
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

    return (
        <div>
            <Grid 
                grid={grid}
                shapeIndex={shapeIndex}
                rotation={rotation}
                x={x}
                y={y}
                ghostX={ghostX}
                ghostY={ghostY}
            />
        </div>
    )
}

export default TetrisSolo;