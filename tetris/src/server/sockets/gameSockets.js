const { updatePlayerMove } = require("../services/gameService")

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create room", (roomId) => {
            socket.join(roomId);
            console.log(`player ${socket.id} joined room ${roomId}`);
            socket.emit("room created", roomId); // check if the room is create
        });
    
        socket.on("join room", (roomId) => {
            socket.join(roomId);
            console.log(`player ${socket.id} joined room ${roomId}`);
            socket.emit("room created", roomId); // check if a player joined the room
        });
    
        socket.on("move", (roomId, moveData) => {
            socket.to(roomId).emit("move", moveData);
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