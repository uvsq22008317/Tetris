import { useEffect, useState } from "react";
import Multiplayer from "./Multiplayer.js";
import socket from "../socket.js";

function LobbyComponent({ isHost, roomId, playersInLobby, changepage }) {
    const [players, setPlayers] = useState(playersInLobby);
    const [inGame, setInGame] = useState(false);
    const [multiplayerSeed, setMultiplayerSeed] = useState(0);
    const [multiplayerSeedOffset, setMultiplayerSeedOffset] = useState(0);

    useEffect(() => {
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

        return () => {
            socket.off("update-lobby");
            socket.off("game-started");
            socket.off("room-closed");
        };
    }, [isHost, roomId]);

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
            <h1>Lobby</h1>
            <h2>Players in lobby :</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index}>{player.username}</li>
                ))}
            </ul>
            {isHost && <button onClick={handleStartGame}>Start Game</button>}
            {isHost && players.length < 2 && <p style={{ color: "red" }}>At least 2 players are required to start the game.</p>}
        </div>
    );
}

export default LobbyComponent;