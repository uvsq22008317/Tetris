import React, { useEffect, useState } from 'react';

function Leaderboard({ changepage }) {
  const [topPlayersSprint, setTopPlayersSprint] = useState([]);
  const [topPlayersCheese, setTopPlayersCheese] = useState([]);
  const [topPlayersUltra, setTopPlayersUltra] = useState([]);
  const [topPlayersRush, setTopPlayersRush] = useState([]);
  const [selectedMode, setSelectedMode] = useState("Sprint");

  useEffect(() => {
    fetch("http://localhost:5000/leaderboard")
      .then((response) => response.json())
      .then((data) => {
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
                <td>{player.score}</td>
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