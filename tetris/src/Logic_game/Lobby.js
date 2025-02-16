import {useState} from "react";
import socketHooks from "../socketHooks";

const Lobby = () => {
    const [roomId, setRoomId] = useState("");
    const { createRoom, joinRoom } = socketHooks();

    return (
        <div>
            <button onClick={createRoom}>Create a game</button>
            <button onClick={() => joinRoom(roomId)}>Join a game</button>
        </div>
    );
};

export default Lobby;