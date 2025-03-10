import { useEffect, useState } from "react";
import TetrisGameSolo from "./TetrisGameSolo";
import TetrisGamePreview from "./TetrisGamePreview";
import SocketHooks from "../socketHooks";
import socket from "./../socket";
import "./Multiplayer.css";
import { ROWS, COLUMNS } from './constants';

const Multiplayer = ({ roomId, playerId, players }) => {

    const [grids, setGrids] = useState({});

    const updatePlayersGrid = (playerId, newGrid) => {
        setGrids((prevGrids) => ({
            ...prevGrids,
            [playerId]: newGrid
        }));
    };

    const { getPlayersInRoom, playersInRoom } = SocketHooks();

    useEffect(() => {
        getPlayersInRoom(roomId);
    }, [roomId]);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi">
                <TetrisGameSolo gameMode={'Multiplayer'} roomId={roomId} playerId={playerId} players={players} />
                {playersInRoom
                    .filter((playerId) => playerId !== socket.id)
                    .map((playerId) => (
                        <TetrisGamePreview key={playerId} username={playerId} players={players} updateGrid={(grid) => updatePlayersGrid(playerId, grid)} grid={grids[playerId] || Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))} />
                    ))}
            </div>
        </div>
    );
};

export default Multiplayer;