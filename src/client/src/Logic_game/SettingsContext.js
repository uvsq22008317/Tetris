import React, { createContext, useContext, useEffect, useState } from 'react';

// Context
const SettingsContext = createContext();

// Default settings
const defaultControls = {
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
};

const defaultHandling = {
  DAS: 200,
  ARR: 33,
  SDF: 20,
};

export const SettingsProvider = ({ children }) => {
  const [controls, setControls] = useState(defaultControls);
  const [handling, setHandling] = useState(defaultHandling);

  useEffect(() => {
      const savedControls = JSON.parse(localStorage.getItem('tetrisControls'));
      const savedHandling = JSON.parse(localStorage.getItem('tetrisHandling'));

      //  Load settings if they exist
      if (savedControls) setControls(savedControls);
      if (savedHandling) setHandling(savedHandling);
  }, []);

  // Passer les paramètres de configuration à travers les props
  return (
    <SettingsContext.Provider value={{ controls, handling }}>
      {children}
    </SettingsContext.Provider>
  )
};

export const useSettings = () => useContext(SettingsContext);