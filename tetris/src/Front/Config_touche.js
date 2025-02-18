import React, { useState, useEffect } from 'react';

function ConfigControls({ changepage }) {
  // Object to keep the keys(touches) in memory
  const [controls, setControls] = useState({
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    softDrop: 'ArrowDown',
    hardDrop: ' ',
    rotateCW: 'ArrowUp',
    rotateCCW: 'z',
    rotate180: 'a',
    swapHold: 'c',
    retryGame: 'r',
    forfeitGame: 'o',
  });

  const [handling, setHandling] = useState({
    DAS: 200,
    ARR: 33,
    SDF: 20,
  });

  useEffect(() => {
    // Recover the saves
    const savedControls = localStorage.getItem('tetrisControls');
    if (savedControls) {
      setControls(JSON.parse(savedControls));
    }
    const savedHandling = localStorage.getItem('tetrisHandling');
    if (savedHandling) {
      const parsedHandling = JSON.parse(savedHandling);
      if (parsedHandling.SDF === "Infinity") {
        parsedHandling.SDF = Infinity;
      }
      setHandling(parsedHandling);
    }
  }, []);


  // Updates when user modifies option
  // e = new value
  // key = name control (ex moveLeft)
  const handleChange = (e, key) => {
    setControls({
      ...controls,
      [key]: e.key
    });
  };

  const handleHandlingChange = (e, key) => {
    const value = key === 'SDF' && e.target.value === '51' ? Infinity : e.target.value;
    setHandling({
      ...handling,
      [key]: value
    });
  };

  // When click "Save" it saves controls + function prevents reloading for the page + saves settings in browser for later
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('tetrisControls', JSON.stringify(controls));
    const handlingToSave = { ...handling, SDF: handling.SDF === Infinity ? "Infinity" : handling.SDF };
    localStorage.setItem('tetrisHandling', JSON.stringify(handlingToSave));
  };
  

  return (
    <div className = "config">
      <h1>Configuration des touches</h1>
      <form onSubmit = {handleSave}>
        <div>
          <label style = {{ marginRight: '100px' }}>Déplacer la pièce à gauche :</label>
          <input
            type = "text"
            value = {controls.moveLeft === ' ' ? 'SPACE' : controls.moveLeft.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'moveLeft')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '111px' }}>Déplacer la pièce à droite :</label>
          <input
            type = "text"
            value = {controls.moveRight === ' ' ? 'SPACE' : controls.moveRight.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'moveRight')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '223px' }}>Soft Drop :</label>
          <input
            type = "text"
            value = {controls.softDrop === ' ' ? 'SPACE' : controls.softDrop.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'softDrop')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '219px' }}>Hard Drop :</label>
          <input
            type = "text"
            value = {controls.hardDrop === ' ' ? 'SPACE' : controls.hardDrop.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'hardDrop')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '85px' }}>Rotation dans le sens horaire :</label>
          <input
            type = "text"
            value = {controls.rotateCW === ' ' ? 'SPACE' : controls.rotateCW.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'rotateCW')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '53px' }}>Rotation dans le sens anti-horaire :</label>
          <input
            type = "text"
            value = {controls.rotateCCW === ' ' ? 'SPACE' : controls.rotateCCW.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'rotateCCW')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '197px' }}>Rotation 180° :</label>
          <input
            type = "text"
            value = {controls.rotate180 === ' ' ? 'SPACE' : controls.rotate180.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'rotate180')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '110px' }}>Échanger la pièce en hold :</label>
          <input
            type = "text"
            value = {controls.swapHold === ' ' ? 'SPACE' : controls.swapHold.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'swapHold')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '242px' }}>Rejouer :</label>
          <input
            type = "text"
            value = {controls.retryGame === ' ' ? 'SPACE' : controls.retryGame.toUpperCase()}
            onKeyDown={(e) => handleChange(e, 'retryGame')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '148px' }}>Abandonner la partie :</label>
          <input
            type = "text"
            value = {controls.forfeitGame === ' ' ? 'SPACE' : controls.forfeitGame.toUpperCase()}
            onKeyDown={(e) => {
              handleChange(e, 'forfeitGame')
              changepage('menu');
              }
            }
          />
        </div>
        <div>
          <label style={{ marginRight: '100px' }}>DAS :</label>
          <input
            type="range"
            min="0"
            max="500"
            value={handling.DAS}
            onChange={(e) => handleHandlingChange(e, 'DAS')}
          />
          <span>{handling.DAS}</span>
        </div>
        <div>
          <label style={{ marginRight: '100px' }}>ARR :</label>
          <input
            type="range"
            min="0"
            max="200"
            value={handling.ARR}
            onChange={(e) => handleHandlingChange(e, 'ARR')}
          />
          <span>{handling.ARR}</span>
        </div>
        <div>
          <label style={{ marginRight: '100px' }}>SDF :</label>
          <input
            type="range"
            min="5"
            max="51"
            value={handling.SDF === Infinity ? '51' : handling.SDF}
            onChange={(e) => handleHandlingChange(e, 'SDF')}
          />
          <span>{handling.SDF === Infinity ? '∞' : handling.SDF}</span>
        </div>
        <button type = "submit">Sauvegarder les réglages</button>
      </form>
      <button onClick = {() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default ConfigControls;