import React, { useState, useEffect } from 'react';


function ConfigControls({ changepage }) {
  // Object to keep the keys(touches) in memory
  const [controls, setControls] = useState({
    moveLeft: 'LEFT, NUMPAD4',
    moveRight: 'RIGHT, NUMPAD6',
    softDrop: 'DOWN, NUMPAD2',
    hardDrop: 'SPACE, NUMPAD8',
    rotateCCW: 'CTRL, Z, NUMPAD3, NUMPAD7',
    rotateCW: 'UP, X, NUMPAD1, NUMPAD5, NUMPAD9',
    rotate180: 'SHIFT, C, NUMPADO',
    swapHold: 'ESCAPE',
    forfeitGame: 'R',
    retryGame: 'T',
    openChat: '1.2.3.4',
    moveInMenus: 'UP (OR W), DOWN (OR S) LEFT (OR A), RIGHT (OR D)',
    confirmInMenus: 'ENTER, SPACE',
    backInMenus: 'ESCAPE, BACKSPACE'
  });

  useEffect(() => {
    // Recover the saves
    const savedControls = localStorage.getItem('tetrisControls');
    if (savedControls) {
      setControls(JSON.parse(savedControls));
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


  // When click "Save" it saves controls + function prevents reloading for the page + saves settings in browser for later
  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('tetrisControls', JSON.stringify(controls));
  };
  

  return (
    <div className = "config">
      <h1>Configuration des touches</h1>
      <form onSubmit = {handleSave}>
        <div>
          <label style = {{ marginRight: '100px' }}>Déplacer la pièce à gauche :</label>
          <input
            type = "text"
            value = {controls.moveLeft}
            onKeyDown={(e) => handleChange(e, 'moveLeft')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '111px' }}>Déplacer la pièce à droite :</label>
          <input
            type = "text"
            value = {controls.moveRight}
            onKeyDown={(e) => handleChange(e, 'moveRight')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '223px' }}>Soft Drop :</label>
          <input
            type = "text"
            value = {controls.softDrop}
            onKeyDown={(e) => handleChange(e, 'softDrop')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '219px' }}>Hard Drop :</label>
          <input
            type = "text"
            value = {controls.hardDrop}
            onKeyDown={(e) => handleChange(e, 'hardDrop')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '53px' }}>Rotation dans le sens anti-horaire :</label>
          <input
            type = "text"
            value = {controls.rotateCCW}
            onKeyDown={(e) => handleChange(e, 'rotateCCW')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '85px' }}>Rotation dans le sens horaire :</label>
          <input
            type = "text"
            value = {controls.rotateCW}
            onKeyDown={(e) => handleChange(e, 'rotateCW')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '197px' }}>Rotation 180° :</label>
          <input
            type = "text"
            value = {controls.rotate180}
            onKeyDown={(e) => handleChange(e, 'rotate180')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '110px' }}>Échanger la pièce en hold :</label>
          <input
            type = "text"
            value = {controls.swapHold}
            onKeyDown={(e) => handleChange(e, 'swapHold')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '148px' }}>Abandonner la partie :</label>
          <input
            type = "text"
            value = {controls.forfeitGame}
            onKeyDown={(e) => handleChange(e, 'forfeitGame')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '242px' }}>Rejouer :</label>
          <input
            type = "text"
            value = {controls.retryGame}
            onKeyDown={(e) => handleChange(e, 'retryGame')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '204px' }}>Ouvrir le chat :</label>
          <input
            type = "text"
            value = {controls.openChat}
            onKeyDown={(e) => handleChange(e, 'openchat')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '118px' }}>Déplacer dans les menus :</label>
          <input
            type = "text"
            value = {controls.moveInMenus}
            onKeyDown={(e) => handleChange(e, 'moveInMenus')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '114px' }}>Confirmer dans les menus :</label>
          <input
            type = "text"
            value = {controls.confirmInMenus}
            onKeyDown={(e) => handleChange(e, 'confirmInMenus')}
          />
        </div>
        <div>
          <label style = {{ marginRight: '55px' }}>Revenir en arrière dans les menus :</label>
          <input
            type = "text"
            value = {controls.backInMenus}
            onKeyDown={(e) => handleChange(e, 'backInMenus')}
          />
        </div>
        <button type = "submit">Sauvegarder les réglages</button>
      </form>
      <button onClick = {() => changepage('menu')}>Retour au Menu</button>
    </div>
  );
}

export default ConfigControls;