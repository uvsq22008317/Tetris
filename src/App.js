import React, { useState } from 'react';
import Login from './Front/Login';
import Register from './Front/Register';
import MainPage from './Front/MainPage';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // manage connexion

  /// DEBUG
  return <MainPage />;

  // Depends on if user is logged or not, if logged go mainpage
  if (isLoggedIn) {
    return <MainPage />;
  }

  // Connexion page
  return (
    <div className="page">
      <h1>Tetris</h1>
      <div className="head">
      </div>
      <div className="form">
        {isLogin ? (
          <Login setIsLoggedIn={setIsLoggedIn} setIsLogin={setIsLogin} /> // Go login page + change state
        ) : (
          <Register setIsLogin={setIsLogin} setIsLoggedIn={setIsLoggedIn} /> // Go Register page + change state
        )}
      </div>
    </div>
  );
}

export default App;