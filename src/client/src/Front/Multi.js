import React from 'react';
import Lobby from '../Logic_game/Lobby.js';
import './Multi.css';

function Multi({ changepage }) {
  return (
    <div className = "Multi">
      <h1>Mode Multi</h1>
      <Lobby />
      <button class ="retourMenu" onClick={() => changepage('menu')}>← </button>
    </div>
  );
}

export default Multi;
