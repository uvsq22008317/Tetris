const rooms = {}; //store players id in each room
const roomPlayers = {}; //store players username in each room

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create-room", ({ roomId, username }) => {
            if(rooms[roomId]) {
                socket.emit("room-created", false);
            } else {
                rooms[roomId] = [socket.id];
                roomPlayers[roomId] = {[socket.id] : username};
                socket.join(roomId);
                socket.emit("room-created", true);
                
                const players = Object.entries(roomPlayers[roomId]).map(([id, username]) => ({ id, username }));
                io.to(roomId).emit("update-lobby", players);
            }
        });
    
        socket.on("join-room", ({ roomId, username }) => {
            if(rooms[roomId]) {
                rooms[roomId].push(socket.id);
                roomPlayers[roomId][socket.id] = username;
                socket.join(roomId);
                socket.emit("room-joined", true);
                
                const players = Object.entries(roomPlayers[roomId]).map(([id, username]) => ({ id, username }));
                io.to(roomId).emit("update-lobby", players);
            } else {
                socket.emit("room-joined", false);
            }
        });
    
        socket.on("start-game", (roomId) => {
            io.to(roomId).emit("game-started");
            const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            io.to(roomId).emit("players-in-room", players);
        });

        socket.on("update-grid", (gridInfo) => {
            const { roomId, playerId, grid } = gridInfo;
            io.to(roomId).emit("updated-grid", { playerId, grid });
        });

        socket.on("send-garbage", (attackInfo) => {
            const { roomId, playerId, lines } = attackInfo;
            io.to(roomId).emit("garbage-received", { playerId, lines });
        });

        socket.on("get-players-in-room", (roomId) => {
            const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            io.to(roomId).emit("players-in-room", players);
        });
    
        socket.on("leave-room", () => {
            let roomIdToLeave;
            for (let roomId in rooms) {
                if (rooms[roomId].includes(socket.id)) {
                    roomIdToLeave = roomId;
                    break;
                }
            }
            
            if (roomIdToLeave) {
                const isHost = rooms[roomIdToLeave][0] === socket.id;

                if (isHost) {
                    io.to(roomIdToLeave).emit("room-closed");
                    delete rooms[roomIdToLeave];
                    delete roomPlayers[roomIdToLeave];
                } else {
                    rooms[roomIdToLeave] = rooms[roomIdToLeave].filter(id => id !== socket.id);
                    delete roomPlayers[roomIdToLeave][socket.id];
            
                    socket.leave(roomIdToLeave);

                    const players = Object.entries(roomPlayers[roomIdToLeave]).map(([id, username]) => ({ id, username }));
                    io.to(roomIdToLeave).emit("update-lobby", players);

                    if (rooms[roomIdToLeave].length === 0) {
                        delete rooms[roomIdToLeave];
                        delete roomPlayers[roomIdToLeave];
                    }
            
                    console.log(`player ${socket.id} removed from room ${roomIdToLeave} on disconnect`);
                    console.log("players :", players);
                }
            }
        });

        socket.on("game-over", ({roomId, playerId}) => {
            socket.leave(roomId);
            io.to(roomId).emit("player-lost", playerId);
        });
    });
};

module.exports = gameSockets;