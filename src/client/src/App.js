import React, { useState, useEffect, useRef } from 'react';
import Login from './Front/Login.js';
import Register from './Front/Register.js';
import MainPage from './Front/MainPage.js';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('login'); 
  const audioRef = useRef(new Audio("/sounds/accueil.mp3"));

  useEffect(() => {
    if (!audioRef.current) return;

    if (currentPage !== 'Multi') {
      audioRef.current.volume = 0.5; 
      audioRef.current.loop = true;  
      audioRef.current.play().catch(err => console.log("Erreur musique :", err));
    } else {
      audioRef.current.pause();
    }
  }, [currentPage]);

  if (isLoggedIn) {
    return <MainPage setCurrentPage={setCurrentPage} />;
  }

  return (
    <div className="page">
      <h1>TetrAWS</h1>
      <div className="head"></div>
      <div className="form">
        {isLogin ? (
          <Login setIsLoggedIn={setIsLoggedIn} setIsLogin={setIsLogin} />
        ) : (
          <Register setIsLogin={setIsLogin} setIsLoggedIn={setIsLoggedIn} />
        )}
      </div>
    </div>
  );
}

export default App;
