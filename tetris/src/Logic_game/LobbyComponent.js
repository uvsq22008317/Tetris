import { useEffect, useState } from "react";

function createRoom({ isHost, roomId, socket }) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.on("Update-lobby", (players) => {
            setPlayers(players);
        });

        return () => {
            socket.off("update-lobby");
        };
    }, []);

    const handleStartGame = () => {
        if (isHost) {
            socket.emit("startGame", roomId);   
        }
    };

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

export default createRoom;