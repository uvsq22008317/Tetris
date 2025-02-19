import { useState, useEffect } from "react";
import socket from "./socket";
import TetrisGame from "./Logic_game/Tetris_game";

const SocketHooks = () => {
    const [roomId, setRoomId] = useState("");
    const [playerGrid, setPlayerGrid] = useState(new TetrisGame());
    const [otherPlayersGrids, setOtherPlayersGrids] = useState({});

    useEffect(() => {
        socket.on("room-created", (roomId) => {
            setRoomId(roomId);
        });

        socket.on("room-joined", (roomId) => {
            setRoomId(roomId);
        });

        socket.on("move", (moveData) => {
            const { playerId, move } = moveData;
            setOtherPlayersGrids((prev) => ({
                ...prev,
                [playerId]: move,
            }));
        });
        return () => {
            socket.off("room-created");
            socket.off("room-joined");
            socket.off("move");
        };
    }, []);

    const createRoom = () => {
        const newRoomId = "room-" + Math.floor(Math.random()*100000);
        socket.emit("create-room", newRoomId);
    };

    const joinRoom = (roomId) => {
        socket.emit("join-room", roomId);
    };

    const sendMove = (move) => {
        socket.emit("move", { roomId, playerId:socket.id, move });
    };

    return { roomId, playerGrid, otherPlayersGrids, createRoom, joinRoom, sendMove };
};

export default SocketHooks;