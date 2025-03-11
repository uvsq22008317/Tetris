import React from 'react';
import TetrisGameSolo from '../Logic_game/TetrisGameSolo';
import "./Solo.css";

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisGameSolo gameMode={mode} />
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Solo;