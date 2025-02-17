import React from 'react';
import Lobby from '../Logic_game/Lobby';

function Multi({ changepage }) {
  return (
    <div className = "Multi">
      <h1>Mode Multi</h1>
      <p>Mettre jeu mode multi</p>
      <Lobby />
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Multi;
