import React from 'react';
import './Menu.css';

function Menu({ changepage }) {
  return (
    <div className = "menu">
      <img src="/images/logo.png" alt="TetrAWS" className="logo" />
      <button onClick={() => changepage('menuSolo')}>Mode Solo</button>
      <button onClick={() => changepage('Multi')}>Mode Multi</button>
      <button onClick={() => changepage('leaderboard')}>Leaderboard</button> 
      <button onClick={() => changepage('config')}>Configuration</button>
    </div>
  );
}

export default Menu;
