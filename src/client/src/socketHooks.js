import { useState, useEffect } from "react";
import socket from "./socket.js";

const SocketHooks = () => {
    const [roomId, setRoomId] = useState("");
    const initialGrid = Array.from({ length: 40 }, () => Array(10).fill(0));
    const [playerGrid, setPlayerGrid] = useState(initialGrid);
    const [otherPlayersGrids, setOtherPlayersGrids] = useState({});
    const [playersInRoom, setPlayersInRoom] = useState([]);

    useEffect(() => {
        socket.on("room-created", (roomId) => {
            setRoomId(roomId);
        });

        socket.on("room-joined", (roomId) => {
            setRoomId(roomId);
        });

        socket.on("players-in-room", (players) => {
            setPlayersInRoom(players);
        });

        return () => {
            socket.off("room-created");
            socket.off("room-joined");
            socket.off("move");
            socket.off("players-in-room");
        };
    }, []);

    const getPlayersInRoom = (roomId) => {
        socket.emit("get-players-in-room", roomId);
    };

    return { roomId, playerGrid, otherPlayersGrids, getPlayersInRoom, playersInRoom };
};

export default SocketHooks;