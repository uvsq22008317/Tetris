import React from 'react';
import TetrisGame from '../Logic_game/Tetris_game.js';
import './Config_touche.css';

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGame gameMode={mode} />
      <button class="retourMenu" onClick={() => changepage('menu')}>← </button>
    </div>
  );
}

export default Solo;