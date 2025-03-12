import { useEffect, useState } from "react";
import TetrisGameSolo from "./TetrisGameSolo.js";
import TetrisGamePreview from "./TetrisGamePreview.js";
import SocketHooks from "../socketHooks.js";
import socket from "../socket.js";
import "./Multiplayer.css";
import { ROWS, COLUMNS } from './constants.js';

const Multiplayer = ({ roomId, playerId, players }) => {
    const [grids, setGrids] = useState({});
    const [activePlayers, setActivePlayers] = useState(players);
    const updatePlayersGrid = (playerId, newGrid) => {
        setGrids((prevGrids) => ({
            ...prevGrids,
            [playerId]: newGrid
        }));
        
    };

    const handlePlayerLose = (looserPlayerId) => {
        setActivePlayers((prevPlayers) => prevPlayers.filter(id => id !== looserPlayerId));
        setGrids((prevGrids) => {
            const newGrids = {...prevGrids };
            delete newGrids[looserPlayerId];
            return newGrids;
        }); 
    }

    const { getPlayersInRoom } = SocketHooks();

    useEffect(() => {
        getPlayersInRoom(roomId);

        socket.on("player-lost", (looserPlayerId) => {
            handlePlayerLose(looserPlayerId);
        });

        return () => {
            socket.off("player-lost");
        }
    }, [roomId, activePlayers]);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi">
                <TetrisGameSolo gameMode={'Multiplayer'} roomId={roomId} playerId={playerId} players={players} />
                {activePlayers
                    .filter((playerId) => playerId !== socket.id)
                    .map((playerId) => (
                        <TetrisGamePreview key={playerId} username={playerId} players={players} updateGrid={(grid) => updatePlayersGrid(playerId, grid)} grid={grids[playerId] || Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))} />
                    ))}
            </div>
        </div>
    );
};

export default Multiplayer;