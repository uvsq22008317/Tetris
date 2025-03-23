import { useEffect, useState } from "react";
import TetrisGameSolo from "./TetrisGameSolo.js";
import TetrisGamePreview from "./TetrisGamePreview.js";
import socket from "../socket.js";
import "./Multiplayer.css";
import { ROWS, COLUMNS } from './constants.js';

const Multiplayer = ({ roomId, playerId, players }) => {
    const [grids, setGrids] = useState({});
    const [duelData, setDuelData] = useState({});
    const [activePlayers, setActivePlayers] = useState(players);
    const [isAlive, setIsAlive] = useState(true);
    const updatePlayersGrid = (playerId, newGrid) => {
        setGrids((prevGrids) => ({
            ...prevGrids,
            [playerId]: newGrid
        }));
    };
    const updatePlayersDuelData = (playerId, newDuelData) => {
        setDuelData((prevDuelData) => ({
            ...prevDuelData,
            [playerId]: newDuelData
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

        socket.on("updated-grid", (gridData) => {
            updatePlayersGrid(gridData.playerId, gridData.grid);
          });

        socket.on("updated-duel", (duelData) => {
            updatePlayersDuelData(duelData.playerId, duelData.duelData);
        });

        return () => {
            socket.off("player-lost");
            socket.off("updated-grid");
            socket.off("updated-duel");
        }
    }, [roomId, activePlayers, grids, duelData]);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi-container">
                {isAlive && (
                    <div className="tetris-solo" style={{"--players-count": players.length }} >
                        <TetrisGameSolo 
                            gameMode={'Multiplayer'} 
                            roomId={roomId} 
                            playerId={playerId} 
                            players={activePlayers} />
                    </div>
                )} 
                <div className="tetris-previews">
                    {activePlayers
                        .filter((players) => players.id !== socket.id)
                        .map((players) => (
                            <div key={players.id}>
                                <TetrisGamePreview 
                                    className="preview" 
                                    username={players.id} 
                                    players={activePlayers} 
                                    grid={grids[players.id] || Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0))}
                                    duelData={duelData[players.id] || 0}    
                                />
                                <span>{players.username}</span>
                            </div>
                        
                    ))}
                    
                </div>
            </div>
        </div>
    );
};

export default Multiplayer;