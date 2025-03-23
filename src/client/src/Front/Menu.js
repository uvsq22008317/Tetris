import React, { useState, useEffect, useRef } from 'react';
import "./Menu.css";

function Menu({ changepage, setIsLoggedIn }) {
  const [isPageOpen, setisPageOpen] = useState(false);
  const verifclick = useRef(null);

  const basculPage = () => {
    setisPageOpen(!isPageOpen);
  };

  const handleLogout = async() => {
    try {
      const response = await fetch("http://localhost:5000/logo/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      console.log("Déconnexion:", data.message);
      setIsLoggedIn(false);
    } 
    catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (verifclick.current && !verifclick.current.contains(event.target)) {
        setisPageOpen(false);
      }
    };
    if (isPageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };}, [isPageOpen]);

  return (
    <div className = "menu">
      <img src="/images/logo.png" alt="TetrAWS" className="logo" />
      <button className="profil" onClick={basculPage}>Profil</button>
      {isPageOpen && (
        <div className="modal-overlay">
          <div className="modal" ref={verifclick}>
            <button className="close-button" onClick={basculPage}>x</button>
            <h1>PROFIL</h1>
            <p>Blabla</p>
            <h2>bla</h2>
            <p>bla</p>
            <h2>bla</h2>
            <p>Blabla</p>
            <button onClick={handleLogout}>Deconnexion</button>
          </div>
        </div>
      )}
      <h1>TetrAWS</h1>
      <button onClick={() => changepage('menuSolo')}>Mode Solo</button>
      <button onClick={() => changepage('Multi')}>Mode Multi</button>
      <button onClick={() => changepage('leaderboard')}>Leaderboard</button> 
      <button onClick={() => changepage('config')}>Configuration</button>
    </div>
  );
}

export default Menu;