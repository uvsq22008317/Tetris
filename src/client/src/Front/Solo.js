import React from 'react';
import TetrisGameSolo from '../Logic_game/TetrisGameSolo.js';
import "./Solo.css";
import './Config_touche.css';

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGameSolo gameMode={mode} />
      <button className="retourMenu" onClick={() => changepage('menu')}>← </button>
    </div>
  );
}

export default Solo;