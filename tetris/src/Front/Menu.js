import React from 'react';

function Menu({ changepage }) {
  return (
    <div className = "menu">
      <h1>Tetris</h1>
      <button onClick={() => changepage('solo')}>Mode Solo</button>
      <button onClick={() => changepage('Multi')}>Mode Multi</button>
      <button onClick={() => changepage('config')}>Configuration</button>
    </div>
  );
}

export default Menu;
