import React from 'react';
import Lobby from '../Logic_game/Lobby';
import Multiplayer from '../Logic_game/Multiplayer';

function Multi({ changepage }) {
  return (
    <div className = "Multi">
      <h1>Mode Multi</h1>
      <Lobby />
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Multi;
