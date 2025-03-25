import React, { useState } from "react";
import './Login.css';

const Login = ({ setIsLoggedIn, setIsLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/log/login`, {
        method: "POST", // Send informations
        credentials: "include",
        headers: { "Content-Type": "application/json" }, // Written in json
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Connexion réussie!");
        setIsLoggedIn(true);
        localStorage.setItem("username", username);
      } else {
        setMessage(data.message || "Erreur lors de la connexion");
      }
    } 
    catch (error) {
      console.error(error);
      setMessage("Erreur lors de la connexion");
    }
  };

  const handleGuestLogin = () => {
    let guest_number = Math.floor(Math.random() * 100000);
    setIsLoggedIn(true);
    localStorage.setItem("username", `Invité${guest_number}`) // Default name
  };

  return (
    <div className ="backmain">
      <form onSubmit={handleSubmit}>
        <h2>Se connecter</h2>
        <div className="namepass">
          <input 
            type="text" 
            placeholder="Nom d'utilisateur"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required />
            <i className= "bx bxs-user"></i>
        </div>
        <div className="namepass">
          <input 
            type="password" 
            placeholder="Mot de passe"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required />
            <i className= "bx bxs-lock-alt"></i>
        </div>
        <button type="submit" className="connex">Connexion</button>
        {message && <p>{message}</p>}
      <div className="Registerform">
        <p>Vous n'avez pas de compte ?
          <span 
            onClick={() => setIsLogin(false)} // go register page
            style={{ cursor: "pointer", color: "white", marginLeft: "5px" }}>S'inscrire</span>
        </p>
      </div>
      <button type="button" onClick={handleGuestLogin} className="connex">Guest</button>
      </form>
    </div>
  );
};

export default Login;