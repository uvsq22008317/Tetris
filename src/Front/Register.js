import React, { useState } from "react";

const Register = ({ setIsLogin, setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/reg/register", {
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
    <div>
      <form onSubmit={handleSubmit}>
        <h2>S'inscrire</h2>
        <div>
          <label>Nom d'utilisateur:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">S'inscrire</button>
        {message && <p>{message}</p>}
      </form>
      <div className="LoginForm">
        <p>
          Vous avez déjà un compte ?
          <span 
            onClick={() => setIsLogin(true)} // Go connexion page
            style={{ cursor: "pointer", color: "blue", marginLeft: "5px" }}
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;