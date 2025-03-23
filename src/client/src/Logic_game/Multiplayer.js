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

    useEffect(() => {
        socket.on("updated-grid", (gridData) => {
            updatePlayersGrid(gridData.playerId, gridData.grid);
          });

        socket.on("updated-duel", (duelData) => {
            updatePlayersDuelData(duelData.playerId, duelData.duelData);
        });

        return () => {
            socket.off("updated-grid");
            socket.off("updated-duel");
        }
    }, [roomId, activePlayers, grids, duelData, playerId]);

    return (
        <div>
            <h1>Tetris</h1>
            <h2>Room {roomId}</h2>
            <div className="multi-container">
                {(
                    <div className="tetris-solo" style={{"--players-count": players.length }} >
                        <TetrisGameSolo 
                            gameMode={'Multiplayer'} 
                            roomId={roomId} 
                            playerId={playerId} 
                            players={activePlayers}
                            setActivePlayers={setActivePlayers}
                        />
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