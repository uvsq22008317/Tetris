import React, { useEffect, useState } from 'react';

function Leaderboard({ changepage }) {
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    fetch("https://localhost:5000/leaderboard") 
      .then((response) => response.json())
      .then((data) => setTopPlayers(data))
      .catch((error) => console.error("erreur récupération leaderboard :", error));
  }, []);

  return (
    <div className="leaderboard">
      <h1>Classement des meilleurs joueurs</h1>
      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Nom</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player, index) => (
            <tr key={player.username}>
              <td>{index + 1}</td>
              <td>{player.username}</td>
              <td>{player.highscore40L}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => changepage('menu')}>Retour</button>
    </div>
  );
}

export default Leaderboard;