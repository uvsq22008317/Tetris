import "./Tetris.css";
import Grid from '../Logic_game/Grid';
import Hold from '../Logic_game/Hold';
import Next from '../Logic_game/Next';
import Garbage from '../Logic_game/Garbage';
import useControls from '../Logic_game/useControls';
import useGameLogic from '../Logic_game/useGameLogic';
import { SettingsProvider, useSettings } from './SettingsContext';

function TetrisSolo() {
    const time = performance.now();

    const { controls, handling } = useSettings();

    const { eGrid,
        shapeIndex,
        rotation,
        shapeX,
        shapeY,
        heldPiece,
        hasHeld,
        garbageQueue,
        nextPiecesPreview,
        setIsSoftDropping,
        lastLockDownTime,
        ghostY,
        userHardDrop,
        userTryMove,
        userTryRotateCW,
        userTryRotateCCW,
        userTryRotate180 } 
    = useGameLogic(controls, handling);
    useControls(controls, handling, setIsSoftDropping, lastLockDownTime, userHardDrop.current, userTryMove.current, userTryRotateCW.current, userTryRotateCCW.current, userTryRotate180.current);

    return (
        <div className='game-wrapper'>
            <div className="left-container">
                <Hold
                    heldPiece={heldPiece.current}
                    hasHeld={hasHeld.current}
                />
            </div>
            <Garbage
                garbageQueue={garbageQueue.current}
                time={time}
            />
            <Grid
                grid={eGrid.current}
                shapeIndex={shapeIndex.current}
                rotation={rotation.current}
                x={shapeX.current}
                y={shapeY.current}
                ghostY={ghostY.current}
            />
            <div className="right-container">
                <Next
                    nextPieces={nextPiecesPreview.current}
                />
            </div>
        </div>
    )
}

export default function TetrisSoloWrapper() {
    return (
        <SettingsProvider>
            <TetrisSolo />
        </SettingsProvider>
    );
}