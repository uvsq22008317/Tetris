import React from 'react';

function Multi({ changepage }) {
  return (
    <div className = "Multi">
      <h1>Mode Multi</h1>
      <p>Mettre jeu mode multi</p>
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default Multi;
