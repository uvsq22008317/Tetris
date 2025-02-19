import { useEffect, useState } from "react";
import TetrisGame from "./Tetris_game";
import TetrisGamePreview from "./TetrisGamePreview";
import "./Multiplayer.css"
import SocketHooks from "../socketHooks";

const Multiplayer = ({ socketId, roomId }) => {
    //const { roomId, playerGrid, otherPlayersGrids, sendMove } = socketHooks();

    //const handleMove = (move) => {
    //    sendMove(move);
    //};

    const [ players, setPlayers ] = useState([]);
    const { sendMove } = SocketHooks();
    const move = 1;

    // useEffect(() => {
    //     // socket.on("update-players", (updatedPlayers) => {
    //     //     setPlayers(updatedPlayers);
    //     // });

    //     return () => {
    //         socket.off("update-players");
    //     };
    // }, []);
    useEffect(() => {
        
    })

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi">
            <TetrisGame />
            <TetrisGamePreview />
            </div>
        </div>
    );
};

export default Multiplayer;