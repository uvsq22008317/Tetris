const rooms = {}; //store players id in each room
const roomPlayers = {}; //store players username in each room

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create-room", ({ roomId, username }) => {
            let success;
            if(rooms[roomId]) {
                success = false;
                socket.emit("room-created", success, null);
            } else {
                success = true;
                rooms[roomId] = [socket.id];
                roomPlayers[roomId] = {[socket.id] : username};
                socket.join(roomId);
                
                const players = Object.entries(roomPlayers[roomId]).map(([id, username]) => ({ id, username }));
                socket.emit("room-created", success, players);
                io.to(roomId).emit("update-lobby", players);
            }
        });
    
        socket.on("join-room", ({ roomId, username }) => {
            let success;
            if(rooms[roomId]) {
                success = true;
                rooms[roomId].push(socket.id);
                roomPlayers[roomId][socket.id] = username;
                socket.join(roomId);
                
                const players = Object.entries(roomPlayers[roomId]).map(([id, username]) => ({ id, username }));
                socket.emit("room-joined", success, players);
                io.to(roomId).emit("update-lobby", players);
                // socket.emit("update-lobby", players);
            } else {
                success = false;
                socket.emit("room-joined", success, null);
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
            for (let roomId in rooms) {
                if (rooms[roomId].includes(socket.id)) {
                    rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
                    delete roomPlayers[roomId][socket.id];

                    const players = Object.entries(roomPlayers[roomId]).map(([id, username]) => ({ id, username }));
                    io.to(roomId).emit("update-lobby", players);

                    if (rooms[roomId].length === 0) {
                        delete rooms[roomId];
                        delete roomPlayers[roomId];
                    } else {
                        const newHost = rooms[roomId][0];
                        io.to(roomId).emit("new-host", newHost);
                    }
                    socket.leave(roomId);
                    break;
                }
            }
            
        });

        socket.on("game-over", ({roomId, playerId}) => {
            // socket.leave(roomId);
            io.to(roomId).emit("player-lost", playerId);
        });
    });
};

module.exports = gameSockets;