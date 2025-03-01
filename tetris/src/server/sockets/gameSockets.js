const { updatePlayerMove } = require("../services/gameService");

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create-room", (roomId) => {
            socket.join(roomId);
            console.log(`player ${socket.id} created room ${roomId}`);
            socket.emit("room-created", roomId);
        });
    
        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`player ${socket.id} joined room ${roomId}`);
            socket.emit("room-joined", roomId);
        });
    
        socket.on("start-game", (roomId) => {
            console.log(`Received start-game event for room ${roomId}`);
            io.to(roomId).emit("game-started");
        });

        socket.on("update-grid", (gridInfo) => {
            const { roomId, playerId, grid } = gridInfo;
            io.to(roomId).emit("updated-grid", { playerId, grid });
        });

        socket.on("get-players-in-room", (roomId) => {
            const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            socket.emit("players-in-room", players);
        });
    
        socket.on("disconnect", () => {
            console.log(`player ${socket.id} left the room`);
            for (let roomId in socket.rooms) {
                socket.leave(roomId);
            }
        });
    });
};

module.exports = gameSockets;