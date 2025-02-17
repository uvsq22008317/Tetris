import { useEffect, useState } from "react";
import TetrisGame from "./Tetris_game";

const Multiplayer = ({ socket, roomId }) => {
    //const { roomId, playerGrid, otherPlayersGrids, sendMove } = socketHooks();

    //const handleMove = (move) => {
    //    sendMove(move);
    //};

    const [ players, setPlayers ] = useState([]);

    useEffect(() => {
        socket.on("update-players", (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        return () => {
            socket.off("update-players");
        };
    }, []);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <TetrisGame players={players}/>
        </div>
    );
};

export default Multiplayer;