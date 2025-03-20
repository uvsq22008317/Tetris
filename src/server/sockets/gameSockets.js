const Room = require("../models/roomModel");

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create-room", async ({ roomId, username }) => {
            let room = await Room.findOne({ roomId });
            if (room) {
                socket.emit("room-created", false); // room already exist
            } else {
                room = new Room({ roomId, players: [{ id: socket.id, username }] });
                await room.save(); // update database
                socket.join(roomId);
                socket.emit("room-created", true);
                io.to(roomId).emit("update-lobby", room.players);
            }
        });
    
        socket.on("join-room", async ({ roomId, username }) => {
            let room = await Room.findOne({ roomId });
            console.log("room trouvé : ", room);

            if (room) {
                room.players.push({ id: socket.id, username });
                await room.save(); // update database
                socket.join(roomId);
                socket.emit("room-joined", true);

                io.to(roomId).emit("update-lobby", room.players); 
                
            } else {
                socket.emit("room-joined", false); // room doesn't exist
            }
        });
    
        socket.on("start-game", (roomId) => {
            const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
            const seed = Math.floor(Math.random() * 100000);
            const seedOffset = Math.floor(Math.random() * 15) + 1;
            const multiplayerInfo = { players, seed, seedOffset };
            io.to(roomId).emit("game-started", multiplayerInfo);
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
                        io.to(roomId).emit("player-lost", socket.id);
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

        socket.on("disconnect", () => {
            console.log("rooms : ", rooms);
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
                        io.to(roomId).emit("player-lost", socket.id);
                    }
                    socket.leave(roomId);
                    break;
                }
            }
            
        });
    });
};

module.exports = gameSockets;