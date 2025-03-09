import React, { useEffect, useRef, useState } from 'react';
import Grid from '../Logic_game/Grid';
import Hold from '../Logic_game/Hold';
import Next from '../Logic_game/Next';
import Garbage from '../Logic_game/Garbage';
import socket from "./../socket";
import "./Tetris.css";
import { ROWS, COLUMNS } from './constants';

function TetrisGamePreview({ username, roomId }) {
  const eGrid = useRef(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const eShapeIndex = useRef(0);
  const eRotation = useRef(0);
  const eShapeX = useRef(0);
  const eShapeY = useRef(0);
  const eGhostY = useRef(0);
  const eHeldPiece = useRef(-1);
  const eHasHeld = useRef(false);
  const eGarbageQueue = useRef([]);
  const eNextPieces = useRef([]);
  const [time, setTime] = useState(performance.now());

  useEffect(() => {
    console.log("AAAAAAAAAA")
    socket.on("updated-grid", (gridData) => {
      if (gridData.playerId === username) {
        eGrid.current = gridData.grid;
      }
    });

    const interval = setInterval(() => {
      setTime(performance.now());
    }, 1000);

    return () => {
      clearInterval(interval)
      socket.off("updated-grid");
    }
  }, [username, roomId, time]);

  return (
    <div className='game-wrapper'>
      <div className="left-container">
        <Hold
          heldPiece={eHeldPiece.current}
          hasHeld={eHasHeld.current}
        />
      </div>
      <Garbage
        garbageQueue={eGarbageQueue.current}
        time={time}
      />
      <Grid
        grid={eGrid.current}
        shapeIndex={eShapeIndex.current}
        rotation={eRotation.current}
        x={eShapeX.current}
        y={eShapeY.current}
        ghostY={eGhostY.current}
      />
      <div className="right-container">
        <Next
          nextPieces={eNextPieces.current}
        />
      </div>
    </div>
  )
}

export default TetrisGamePreview;