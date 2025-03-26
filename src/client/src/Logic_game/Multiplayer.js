import { useEffect, useState } from "react";
import TetrisGameSolo from "./TetrisGameSolo.js";
import TetrisGamePreview from "./TetrisGamePreview.js";
import socket from "../socket.js";
import "./Multiplayer.css";
import { ROWS, COLUMNS } from './constants.js';

const Multiplayer = ({ roomId, playerId, players, multiplayerSeed, multiplayerSeedOffset }) => {
    const [grids, setGrids] = useState({});
    const [duelData, setDuelData] = useState({});
    const [activePlayers, setActivePlayers] = useState(players);
    const [winner, setWinner] = useState(false);
    const username = localStorage.getItem("username");
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
        let disconnectTimeout;
        if (activePlayers.length === 1) {
            setWinner(true);
            disconnectTimeout = setTimeout(() => {
                setWinner(false);
            },  5000); 
        }
        socket.on("updated-grid", (gridData) => {
            updatePlayersGrid(gridData.playerId, gridData.grid);
          });

        socket.on("updated-duel", (duelData) => {
            updatePlayersDuelData(duelData.playerId, duelData.duelData);
        });

        return () => {
            clearTimeout(disconnectTimeout);
            socket.off("updated-grid");
            socket.off("updated-duel");
        }
    }, [roomId, activePlayers, grids, duelData, playerId]);

    return (
        <div>
            {winner && (
                <div className="winner-message">
                    {players[0].username} a gagné !
                </div>
            )}
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
                            multiplayerSeed={multiplayerSeed}
                            multiplayerSeedOffset={multiplayerSeedOffset}
                        />
                        <span className="player-username">{username}</span>
                    </div>
                )} 
                <div className="tetris-previews" players-number={activePlayers.length} style={{ "--players-count": players.length }}>
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
                                <span className="players-username" players-number={activePlayers.length}>{players.username}</span>
                            </div>
                    ))}
                    
                </div>
            </div>
        </div>
    );
};

export default Multiplayer;