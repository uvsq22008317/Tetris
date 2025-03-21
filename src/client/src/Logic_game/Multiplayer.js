import { useEffect, useState } from "react";
import TetrisGameSolo from "./TetrisGameSolo.js";
import TetrisGamePreview from "./TetrisGamePreview.js";
import socket from "../socket.js";
import "./Multiplayer.css";
import { ROWS, COLUMNS } from './constants.js';

const Multiplayer = ({ roomId, playerId, players }) => {
    const [grids, setGrids] = useState({});
    const [activePlayers, setActivePlayers] = useState(players);
    const [isAlive, setIsAlive] = useState(true);
    const updatePlayersGrid = (playerId, newGrid) => {
        setGrids((prevGrids) => ({
            ...prevGrids,
            [playerId]: newGrid
        }));
        
    };

    const handlePlayerLose = (looserPlayerId) => {
        if (looserPlayerId === playerId) {
            setIsAlive(false);
        }
        setActivePlayers((prevPlayers) => prevPlayers.filter(player => player.id !== looserPlayerId));
        setGrids((prevGrids) => {
            const newGrids = {...prevGrids };
            delete newGrids[looserPlayerId];
            return newGrids;
        }); 
    }

    useEffect(() => {

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
                {isAlive ? (<TetrisGameSolo gameMode={'Multiplayer'} roomId={roomId} playerId={playerId} players={activePlayers} />) : (<></>)} 
                {activePlayers
                    .filter((players) => players.id !== socket.id)
                    .map((players) => (
                        <TetrisGamePreview username={players.id} players={activePlayers} updateGrid={(grid) => updatePlayersGrid(players.id, grid)} grid={grids[players.id] || Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))} />
                    ))}
            </div>
        </div>
    );
};

export default Multiplayer;