import { useEffect, useState } from "react";
import Multiplayer from "./Multiplayer.js";
import socket from "./../socket.js";

function LobbyComponent({ isHost, roomId }) {
    const [players, setPlayers] = useState([]);
    const [inGame, setInGame] = useState(false);

    useEffect(() => {
        socket.on("update-lobby", (players) => {
            setPlayers(players);
        });

        socket.on("game-started", () => {
            setInGame(true);
            console.log("Game started");
        });

        return () => {
            socket.off("update-lobby");
            socket.off("game-started");
        };
    }, [isHost, roomId]);

    const handleStartGame = () => {
        if (isHost) {
            socket.emit("start-game", roomId);
        }
    };

    if (inGame) {
        return <Multiplayer socket={socket} roomId={roomId} />;
    }

    return (
        <div>
            <h1>Lobby</h1>
            <h2>Players in lobby :</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player}</li>
                ))}
            </ul>
            {isHost && <button onClick={handleStartGame}>Start Game</button>}
        </div>
    );
}

export default LobbyComponent;