import { useEffect, useState } from "react";
import TetrisGame from "./Tetris_game.js";
import TetrisGamePreview from "./TetrisGamePreview.js";
import SocketHooks from "../socketHooks.js";
import socket from "./../socket.js";
import "./Multiplayer.css";

const Multiplayer = ({ roomId }) => {
    const { getPlayersInRoom, playersInRoom } = SocketHooks();

    useEffect(() => {
        getPlayersInRoom(roomId);
    }, [roomId]);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi">
                <TetrisGame gameMode={'Multiplayer'} roomId={roomId} />
                {playersInRoom
                    .filter((playerId) => playerId !== socket.id)
                    .map((playerId) => (
                        <TetrisGamePreview key={playerId} username={playerId} />
                    ))}
            </div>
        </div>
    );
};

export default Multiplayer;