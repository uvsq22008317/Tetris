import React, { useState, useEffect, useRef } from 'react';
import "./Menu.css";

function Menu({ changepage, setIsLoggedIn }) {
  const [isPageOpen, setisPageOpen] = useState(false);
  const verifclick = useRef(null);
  const [userData, setUserData] = useState(null);

  const basculPage = () => {
    setisPageOpen(!isPageOpen);
  };

  useEffect(() => {
    if (isPageOpen) {
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("Aucun username trouvé dans localStorage");
        return;
      }
      fetch(`http://localhost:5000/profil?username=${username}`, {
        method: "GET",
        credentials: "include",
      })
      .then(response => response.json())
      .then(data => {
        setUserData(data.user);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération du profil :", error);
      });
    }
  }, [isPageOpen]);

  const handleLogout = async() => {
    try {
      const response = await fetch("http://localhost:5000/logout", {
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
    

  const getScore = (score) => {
    if (score === null || score === undefined) {
      return 'Aucun score';
    }
    return score;
  };

  return (
    <div className= "menu">
      <button className="profil" onClick={basculPage}>Profil</button>
      {isPageOpen && (
        <div className="modal-overlay">
          <div className="modal" ref={verifclick}>
            <span 
            onClick={basculPage} // go register page
            style={{ cursor: "pointer", color: "black", marginLeft: "370px"}}>X</span>
            {!userData ? (
              <p>Chargement des données...</p>
            ) : (
              <>
                <p>Nom d'utilisateur : {userData.username}</p>
                <h2>Mode 40L</h2>
                <p>Highscore : {getScore(userData.highscore40L)}</p>
                <h2>Mode Blitz</h2>
                <p>Highscore : {getScore(userData.blitzHighscore)}</p>
                <h2>Mode Cheese</h2>
                <p>Highscore : {getScore(userData.cheeseHighscore)}</p>
                <h2>Mode Rush</h2>
                <p>Highscore : {getScore(userData.RushHigscore)}</p>
              </>
            )}
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