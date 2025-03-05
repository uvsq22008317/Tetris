import { useEffect, useState } from "react";
import socketHooks from "../socketHooks.js";
import LobbyComponent from "./LobbyComponent.js";
import socket from "./../socket.js";

const Lobby = () => {
    const [roomId, setRoomId] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [inGame, setInGame] = useState(false);

    useEffect(() => {

    }, []);

    const handleCreateRoom = () => {
        socket.emit("create-room", roomId);
        setIsHost(true);
        setInLobby(true);
    };

    const handleJoinRoom = () => {
        socket.emit("join-room", roomId);
        setInLobby(true);
    };

    return (
        <div>
            {!inLobby ? (
                <>
                    <input type="text" placeholder="Enter room ID" value={roomId} onChange={(event) => setRoomId(event.target.value)} />
                    <button onClick={handleCreateRoom}>Create a game</button>
                    <button onClick={handleJoinRoom}>Join a game</button>
                </>
            ) : (
                <LobbyComponent isHost={isHost} roomId={roomId} />
            )}
        </div>
    );
};

export default Lobby;