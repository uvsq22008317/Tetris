import React, { useState } from 'react';
import './MenuSolo.css';

function MenuSolo({ changepage }) {
  const [description, setDescription] = useState(' ');

  return (
    <div className="menuSolo">
      <h1>Mode Solo</h1>
      <button 
        onMouseEnter={() => setDescription('Complète 40 lignes le plus rapidement possible')} 
        onMouseLeave={() => setDescription(' ')} 
        onClick={() => changepage({ page: 'solo', mode: 'Sprint' })}
      >
        40L
      </button>
      <button 
        onMouseEnter={() => setDescription('Marque le plus de points possible en 2 minutes')} 
        onMouseLeave={() => setDescription(' ')} 
        onClick={() => changepage({ page: 'solo', mode: 'Ultra' })}
      >
        Ultra
      </button>
      <button 
        onMouseEnter={() => setDescription('Atteins 10 000 points le plus rapidement possible')} 
        onMouseLeave={() => setDescription(' ')} 
        onClick={() => changepage({ page: 'solo', mode: 'Rush' })}
      >
        Rush
      </button>
      <button 
        onMouseEnter={() => setDescription('Vide les 15 lignes de fromage')} 
        onMouseLeave={() => setDescription(' ')} 
        onClick={() => changepage({ page: 'solo', mode: 'Cheese' })}
      >
        Cheese
      </button>
      <button 
        onMouseEnter={() => setDescription('Joue sans fin')} 
        onMouseLeave={() => setDescription(' ')} 
        onClick={() => changepage({ page: 'solo', mode: 'Training' })}
      >
        Entraînement
      </button>
      <button 
        className="retourMenu" 
        onClick={() => changepage('menu')}
      >
        ←
      </button>
      <p className="description"><b>{description}</b></p>
    </div>
  );
}

export default MenuSolo;
