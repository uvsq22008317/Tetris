import React from 'react';

function Menu({ changepage }) {
  return (
    <div className = "menu">
      <h1>TetrAWS</h1>
      <button onClick={() => changepage('menuSolo')}>Mode Solo</button>
      <button onClick={() => changepage('Multi')}>Mode Multi</button>
      <button onClick={() => changepage('leaderboard')}>Leaderboard</button> 
      <button onClick={() => changepage('config')}>Configuration</button>
    </div>
  );
}

export default Menu;
