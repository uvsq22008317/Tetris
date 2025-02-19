import React from 'react';
import TetrisGame from '../Logic_game/Tetris_game';
import "./Solo.css";

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGame gameMode={mode} />
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Solo;