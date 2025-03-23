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
  const audioRef = useRef(new Audio("/sounds/accueil.mp3"));

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    const checkAuthentification = async () => {
      try {
        const response = await fetch("http://localhost:5000/tok/token", {
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
      audioRef.current.volume = 0.5; 
      audioRef.current.loop = true;  
      audioRef.current.play().catch(err => console.log("Erreur musique :", err));
    } else {
      audioRef.current.pause();
    }
  }, [currentPage]);

  if (isLoggedIn) {
    return <MainPage currentPage={currentPage} setCurrentPage={setCurrentPage} setIsLoggedIn={setIsLoggedIn} />;
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
