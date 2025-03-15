import React, { useState } from "react";
import './Register.css';

const Register = ({ setIsLogin, setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reg/register`, {
        method: "POST", // Send informations
        headers: { "Content-Type": "application/json" }, // Written in json
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Compte créé avec succès !");
        setIsLoggedIn(true);
      } else {
        setMessage(data.message || "Erreur lors de l'inscription"); // Message what is the error and if data.message empty return other message
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'inscription");
    }
  };

  return (
    <div class="backmain">
      <form onSubmit={handleSubmit}>
        <h2>S'inscrire</h2>
        <div class="nameregist">
          <input 
            type="text" 
            placeholder="Nom d'utilisateur"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required />
            <i class= "bx bxs-user"></i>
        </div>
        <div class="nameregist">
          <input 
            type="password" 
            placeholder="Mot de passe"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required />
            <i class= "bx bxs-lock-alt"></i>
        </div>
        <button type="submit" class="regist">S'inscrire</button>
        {message && <p>{message}</p>}
        <div className="LoginForm">
        <p>
          Vous avez déjà un compte ?
          <span 
            onClick={() => setIsLogin(true)} // Go connexion page
            style={{ cursor: "pointer", color: "white", marginLeft: "5px" }}>
            Se connecter
          </span>
        </p>
      </div>
      </form>
    </div>
  );
};

export default Register;