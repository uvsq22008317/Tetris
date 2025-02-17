import { useEffect, useState } from "react";
import socketHooks from "../socketHooks";
import { io } from "socket.io-client";
import LobbyComponent from "./LobbyComponent";
import Multiplayer from "./Multiplayer";
const socket = io("http://localhost:3000");

const Lobby = () => {
    const [roomId, setRoomId] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [inGame, setInGame] = useState(false);

    const { createRoom, joinRoom } = socketHooks();

    useEffect(() => {
        socket.on("game-started", () => {
            setInGame(true);
        });

        return () => {
            socket.off("game-started");
        };
    }, []);

    const handleCreateRoom = () => {
        createRoom();
        setIsHost(true);
        setInLobby(true);
    };

    const handleJoinRoom = () => {
        joinRoom(roomId);
        setInLobby(true);
    };

    if (inGame) {
        return <Multiplayer socket={socket} roomId={roomId} isHost={isHost} />;
    }
    return (
        <div>
            {!inLobby ? ( 
                <> 
                <button onClick={handleCreateRoom}>Create a game</button>
                <button onClick={() => handleJoinRoom(roomId)}>Join a game</button>
                </>
            ) : (
                <LobbyComponent isHost={isHost} roomId={roomId} socket={socket} />
            )}
        </div>
    );
};

export default Lobby;