import React from 'react';

function Menu({ changepage }) {
  return (
    <div className = "menu">
      <img src="../../../public/fonts/logo.png" alt="TetrAWS" style={{ height: '80px' }} />
      <button onClick={() => changepage('menuSolo')}>Mode Solo</button>
      <button onClick={() => changepage('Multi')}>Mode Multi</button>
      <button onClick={() => changepage('leaderboard')}>Leaderboard</button> 
      <button onClick={() => changepage('config')}>Configuration</button>
    </div>
  );
}

export default Menu;
