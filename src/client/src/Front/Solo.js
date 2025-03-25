import React, { useState } from 'react';
import TetrisGameSolo from '../Logic_game/TetrisGameSolo.js';
import "./Solo.css";
import './Config_touche.css';

function Solo({ changepage, mode }) {
  const [exit, setExit] = useState(false);
  if (exit) {
    setExit(false);
    changepage('menu');
  } 
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGameSolo setExit={setExit} gameMode={mode} />
      <button className="retourMenu" onClick={() => changepage('menu')}>← </button>
    </div>
  );
}

export default Solo;