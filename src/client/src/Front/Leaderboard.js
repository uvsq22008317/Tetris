import React, { useEffect, useState } from 'react';
import { timeFormat } from '../Logic_game/Info.js';

function Leaderboard({ changepage }) {
  const [topPlayersSprint, setTopPlayersSprint] = useState([]);
  const [topPlayersCheese, setTopPlayersCheese] = useState([]);
  const [topPlayersUltra, setTopPlayersUltra] = useState([]);
  const [topPlayersRush, setTopPlayersRush] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Sprint");

  useEffect(() => {
    fetch("https://tetris-server-t6iw.onrender.com/leaderboards") 
      .then((response) => response.json())
      .then((data) => {
        console.log("data leaderboard :",data);
        setTopPlayersSprint(data.Sprint || []);
        setTopPlayersCheese(data.Cheese || []);
        setTopPlayersUltra(data.Ultra || []);
        setTopPlayersRush(data.Rush || []);
      })
      .catch((error) => console.error("erreur récupération leaderboard :", error));
  }, []);

  let currentPlayers = [];
  switch (selectedMode) {
    case "Sprint":
      currentPlayers = topPlayersSprint;
      break;
    case "Cheese":
      currentPlayers = topPlayersCheese;
      break;
    case "Ultra":
      currentPlayers = topPlayersUltra;
      break;
    case "Rush":
      currentPlayers = topPlayersRush;
      break;
    default:
      currentPlayers = [];
  }

  function timeFormat(time) {
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time % 60000) / 1000);
    let milliseconds = (time % 1000).toFixed(0);
    return `${minutes}:${(seconds < 10 ? "0" : "")}${seconds},${milliseconds}`;
  } 

  const chooseData = (player, selectedMode) => {
    let playerScore = 0;
    switch (selectedMode) {
      case "Sprint":
        playerScore = timeFormat(player.highScore40L);
        break;
      case "Cheese":
        playerScore = timeFormat(player.cheeseHighScore);
        break;
      case "Ultra":
        playerScore = player.ultraHighScore;
        break;
      case "Rush":
        playerScore = timeFormat(player.rushHighScore);
        break;
      default:
        break;
    }
    return playerScore;
  }

  return (
    <div className="leaderboard">
      <h1>Classement des meilleurs joueurs</h1>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setSelectedMode("Sprint")}>Sprint (40L)</button>
        <button onClick={() => setSelectedMode("Cheese")}>Cheese</button>
        <button onClick={() => setSelectedMode("Ultra")}>Ultra</button>
        <button onClick={() => setSelectedMode("Rush")}>Rush</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Nom</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {currentPlayers.length === 0 ? (
            <tr>
              <td colSpan="3">Aucun score pour {selectedMode}</td>
            </tr>
          ) : (
            currentPlayers.map((player, index) => (
              <tr key={player.username || index}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{chooseData(player, selectedMode)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <button className="retourMenu" onClick={() => changepage('menu')}>←</button>
    </div>
  );
}

export default Leaderboard;
