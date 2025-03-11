import React from 'react';
import TetrisGameSolo from '../Logic_game/TetrisGameSolo';
import "./Solo.css";
import './Config_touche.css';

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGameoSlo gameMode={mode} />
      <button class="retourMenu" onClick={() => changepage('menu')}>← </button>
    </div>
  );
}

export default Solo;