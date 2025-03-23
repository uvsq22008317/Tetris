import React, { useState, useEffect, useRef } from 'react';
import Login from './Front/Login.js';
import Register from './Front/Register.js';
import MainPage from './Front/MainPage.js';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const savedPage = localStorage.getItem("currentPage") || "login";
  const [currentPage, setCurrentPage] = useState(savedPage); 
  const [volume, setVolume] = useState(0.5);  
  const audioRef = useRef(new Audio("/sounds/accueil.mp3"));

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    const checkAuthentification = async () => {
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/tok/token", {
          method: "GET",
          credentials: "include", // Send cookie HTTP-only
          headers: { "Content-Type": "application/json" },
        });
        console.log(response);
        if (!response.ok) {
          throw new Error("Non authentifié");
        }
        const data = await response.json();
        setIsLoggedIn(true);
      } 
      catch (error) {
        console.log("Utilisateur non authentifié :", error);
        setIsLoggedIn(false);
      }
    };
    checkAuthentification();}, []);
  
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentPage !== 'Multi') {
      audioRef.current.volume = volume; 
      audioRef.current.loop = true;  
      audioRef.current.play().catch(err => console.log("Erreur musique :", err));
    } else {
      audioRef.current.pause();
    }
  }, [currentPage, volume]);

  if (isLoggedIn) {
    return <MainPage currentPage={currentPage} setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} setVolume={setVolume} volume={volume} />;

  }

  return (
    <div className="page">
      <img src="/images/logo.png" alt="TetrAWS" className="logo"/>
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
