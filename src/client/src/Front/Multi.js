import React from 'react';
import Lobby from '../Logic_game/Lobby.js';
import './Multi.css';
import socket from "../socket.js";

function Multi({ changepage }) {

  const handleQuitGame = () => {
    socket.emit("leave-room");
    changepage('menu');
  }

  return (
    <div className="Multi">
      <h1>Mode Multi</h1>
      <Lobby changepage={changepage} />
      <button class="retourMenu" onClick={handleQuitGame}>← </button>
    </div>
  );
}

export default Multi;
