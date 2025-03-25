import { useEffect, useState } from "react";
import LobbyComponent from "./LobbyComponent.js";
import socket from "../socket.js";

const Lobby = ({ changepage }) => {
    const [roomId, setRoomId] = useState("");
    const [isHost, setIsHost] = useState(false);
    const [inLobby, setInLobby] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const username = localStorage.getItem("username");

    useEffect(() => {
        // Listen server response
        socket.on("room-created", (success) => {
            if (success) {
                setIsHost(true);
                setInLobby(true);
            } else {
                setErrorMessage("This room already exist !");
            }
        });

        socket.on("room-joined",(success) => {
            if (success) {
                setInLobby(true);
            } else {
                setErrorMessage("This room doesn't exist !");
            }
        });
        socket.on("new-host", (newHost) => {
            if (socket.id === newHost.id) {
                setIsHost(true);
            } else {
                setIsHost(false);
            }
        })
        return () => {
            socket.off("room-created");
            socket.off("room-joined");
            socket.off("new-host");
        }
    }, []);

    const handleCreateRoom = () => {
        if(!roomId.trim()) {
            setErrorMessage("Enter a room ID !");
            return;
        }
        setErrorMessage("");
        socket.emit("create-room", { roomId, username });

    };

    const handleJoinRoom = () => {
        if(!roomId.trim()) {
            setErrorMessage("Enter a room ID !");
            return;
        }
        socket.emit("join-room", { roomId, username });
    };

    return (
        <div>
            {!inLobby ? (
                <>
                    <input type="text" placeholder="Entrer un id" value={roomId} onChange={(event) => setRoomId(event.target.value)} />
                    <button onClick={handleCreateRoom}>Crée un lobby</button>
                    <button onClick={handleJoinRoom}>Rejoindre un lobby</button>
                    {errorMessage && <p style={{color: "red"}}>{errorMessage}</p>}
                </>
            ) : (
                <LobbyComponent isHost={isHost} roomId={roomId} changepage={changepage} />
            )}
        </div>
    );
};

export default Lobby;