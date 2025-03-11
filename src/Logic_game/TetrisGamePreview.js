import React, { useEffect, useRef, useState } from 'react';
import Grid from '../Logic_game/Grid.js';
import Hold from '../Logic_game/Hold.js';
import Next from '../Logic_game/Next.js';
import Garbage from '../Logic_game/Garbage.js';
import socket from "./../socket.js";
import "./Tetris.css";

function TetrisGamePreview({ username, roomId, players, updateGrid, grid }) {

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
  const [playersInRoom, setPlayersInRoom] = useState(players);

  useEffect(() => {
    socket.on("updated-grid", (gridData) => {
      if (gridData.playerId === username) {
        updateGrid(gridData.grid);
      }
    });

    const interval = setInterval(() => {
      setTime(performance.now());
    }, 1000);

    return () => {
      clearInterval(interval)
      socket.off("updated-grid");
    }
  }, [username, roomId, time, updateGrid]);

  return (
    <div className='game-preview-wrapper'>
      { playersInRoom.length === 2 ? (
        <div className="left-container">
          <Hold
            heldPiece={eHeldPiece.current}
            hasHeld={eHasHeld.current}
          />
        </div>
    ) : (<></>)}
    { playersInRoom.length === 2 ? (
      <Garbage
        garbageQueue={eGarbageQueue.current}
        time={time}
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
      { playersInRoom.length === 2 ? (
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