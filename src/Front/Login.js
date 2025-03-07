import React, { useState } from "react";

const Login = ({ setIsLoggedIn, setIsLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("ok")
    try {
      const response = await fetch("http://localhost:10000/log/login", {
        method: "POST", // Send informations
        headers: { "Content-Type": "application/json" }, // Written in json
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Connexion réussie !");
        setIsLoggedIn(true);
      } else {
        setMessage(data.message || "Erreur lors de la connexionddd");
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la connexion");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Se connecter</h2>
        <div>
          <label>Nom d'utilisateur:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required />
        </div>
        <div>
          <label>Mot de passe:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required />
        </div>
        <button type="submit">Connexion</button>
        {
          (() => {
            if (message) {
              return <p>{message}</p>;
            }
            return null;
          })()
        }
      </form>
      <div className="Registerform">
        <p>
          Vous n'avez pas de compte ?
          <span 
            onClick={() => setIsLogin(false)} // go register page
            style={{ cursor: "pointer", color: "blue", marginLeft: "5px" }}>
              S'inscrire
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;