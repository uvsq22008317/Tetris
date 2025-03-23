import React, { useEffect, useRef, useState } from 'react';
import Grid from './Grid.js';
import Hold from './Hold.js';
import Next from './Next.js';
import Garbage from './Garbage.js';
import "./Tetris.css";

function TetrisGamePreview({ username, roomId, players, grid, duelData }) {
  const eShapeIndex = useRef(duelData.shapeIndex);
  const eRotation = useRef(duelData.rotation);
  const eShapeX = useRef(0);
  const eShapeY = useRef(0);
  const eGhostY = useRef(0);
  const eHeldPiece = useRef(-1);
  const eHasHeld = useRef(false);
  const eNextPieces = useRef([]);
  const eGarbageQueue = useRef([]);
  const [time, setTime] = useState(performance.now());
  const localTime = useRef(0);

  useEffect(() => {
    if (duelData !== 0) {
      eShapeIndex.current = duelData.shapeIndex;
      eRotation.current = duelData.rotation;
      eShapeX.current = duelData.shapeX;
      eShapeY.current = duelData.shapeY;
      eGhostY.current = duelData.ghostY;
      eHeldPiece.current = duelData.heldPiece;
      eHasHeld.current = duelData.hasHeld;
      eNextPieces.current = duelData.nextPieces;
      eGarbageQueue.current = duelData.garbageQueue;
      localTime.current = duelData.time;
    }

    const interval = setInterval(() => {
      setTime(performance.now());
    }, (players.length === 2) ? 1 / 60 : 1000);

    return () => {
      clearInterval(interval)
    }
  }, [username, roomId, time, players.length, duelData]);

  return (
    <div className='game-preview-wrapper' players-number={players.length} style={{ "--players-count": players.length }}>
      {players.length === 2 ? (
        <div className="left-container">
          <Hold
            heldPiece={eHeldPiece.current}
            hasHeld={eHasHeld.current}
          />
        </div>
      ) : (<></>)}

      {players.length === 2 ? (
        <Garbage
          garbageQueue={eGarbageQueue.current}
          time={localTime.current}
        />
      ) : (<></>)}

      <Grid
        grid={grid}
        shapeIndex={eShapeIndex.current}
        rotation={eRotation.current}
        x={eShapeX.current}
        y={eShapeY.current}
        ghostY={eGhostY.current}
      />
      {players.length === 2 ? (
        <div className="right-container">
          <Next
            nextPieces={eNextPieces.current}
          />
        </div>
      ) : (<div></div>)
      }
    </div>
  )
}

export default TetrisGamePreview;