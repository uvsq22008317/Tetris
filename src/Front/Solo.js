import React from 'react';
import TetrisSolo from '../Logic_game/TetrisSolo';
import "./Solo.css";

function Solo({ changepage, mode }) {
  return (
    <div className="solo">
      <h1>Mode Solo</h1>
      <TetrisSolo />
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Solo;