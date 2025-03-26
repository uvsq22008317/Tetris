import { useEffect, useState } from "react";
import Multiplayer from "./Multiplayer.js";
import socket from "../socket.js";
import "./Multiplayer.css";

function LobbyComponent({ isHost, roomId, changepage }) {
    const [players, setPlayers] = useState([]);
    const [inGame, setInGame] = useState(false);
    const [multiplayerSeed, setMultiplayerSeed] = useState(0);
    const [multiplayerSeedOffset, setMultiplayerSeedOffset] = useState(0);

    useEffect(() => {
        let disconnectTimeout;
        if (players.length === 1 && inGame) {
            setWinner(true);
            disconnectTimeout = setTimeout(() => {
                socket.emit("disconnect-players", roomId);
                setInGame(false);
                changepage("menu");
            },  5000); 
        }

        socket.on("update-lobby", (players) => {
            setPlayers(players);
        });

        socket.on("game-started", (multiplayerInfo) => {
            setPlayers(multiplayerInfo.players);
            setMultiplayerSeed(multiplayerInfo.seed);
            setMultiplayerSeedOffset(multiplayerInfo.seedOffset);
            setInGame(true);
        });

        socket.on("room-closed", () => {
            changepage('menu');
        });

        const handleUnload = () => {
            socket.on("disconnect");
        };

        window.addEventListener("beforeunload", handleUnload);

        return () => {
            clearTimeout(disconnectTimeout);
            socket.off("update-lobby");
            socket.off("game-started");
            socket.off("room-closed");
            socket.off("player-won");
            window.removeEventListener("beforeunload", handleUnload);
        };
    }, [isHost, roomId, players, inGame]);

    const handleStartGame = () => {
        if (isHost && players.length > 1) {
            socket.emit("start-game", roomId);
        }
    };

    if (inGame) {
        return <Multiplayer 
            socket={socket} 
            roomId={roomId} 
            playerId={socket.id} 
            players={players}
            multiplayerSeed={multiplayerSeed}
            multiplayerSeedOffset={multiplayerSeedOffset}
        />;
    }

    return (
        <div>
            <h1>Lobby : {roomId}</h1>
            <h2>Joueurs :</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player.username}</li>
                ))}
            </ul>
            {isHost && <button onClick={handleStartGame}>Lancer la partie</button>}
            {isHost && players.length < 2 && <p style={{ color: "red" }}>Au moins 2 joueurs sont nécessaires pour démarrer la partie.</p>}
        </div>
    );
}

export default LobbyComponent;