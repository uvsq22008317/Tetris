import React from 'react';
import './MenuSolo.css';

function MenuSolo({ changepage }) {
  return (
    <div className="menuSolo">
      <h1>Mode Solo</h1>
      <button onClick={() => changepage({ page: 'solo', mode: 'Sprint' })}>40L</button>
      <button onClick={() => changepage({ page: 'solo', mode: 'Ultra' })}>Ultra</button>
      <button onClick={() => changepage({ page: 'solo', mode: 'Rush' })}>Rush</button>
      <button onClick={() => changepage({ page: 'solo', mode: 'Cheese' })}>Cheese</button>
      <button onClick={() => changepage({ page: 'solo', mode: 'Training' })}>Entraînement</button>
      <button onClick={() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default MenuSolo;
