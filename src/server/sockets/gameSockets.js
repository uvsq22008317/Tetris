const Room = require("../models/roomModel");

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
    
        socket.on("create-room", async ({ roomId, username }) => {
            try {
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
            } catch {
                console.error("Error create room : ", error);
            }
        });
    
        socket.on("join-room", async ({ roomId, username }) => {
            try {
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
            } catch (error) {
                console.error("Error join room : ", error);
            }
        });
    
        socket.on("start-game", async (roomId) => {
            try {
                const room = await Room.findOne({ roomId });
                if (room) {
                    const seed = Math.floor(Math.random() * 100000);
                    const seedOffset = Math.floor(Math.random() * 15) + 1;
                    const multiplayerInfo = { players, seed, seedOffset };
                    io.to(roomId).emit("game-started", multiplayerInfo);
                    io.to(roomId).emit("players-in-room", room.players);
                }
            } catch (error) {
                console.error("Error start-game : ", error);
            }
        });

        socket.on("update-grid", (gridInfo) => {
            const { roomId, playerId, grid } = gridInfo;
            io.to(roomId).emit("updated-grid", { playerId, grid });
        });

        socket.on("send-garbage", (attackInfo) => {
            const { roomId, playerId, lines } = attackInfo;
            io.to(roomId).emit("garbage-received", { playerId, lines });
        });

        socket.on("get-players-in-room", async (roomId) => {
            try {
                let room = await Room.findOne({ roomId });
                if (room) {
                    io.to(roomId).emit("players-in-room", room.players);
                }
            } catch (error) {
                console.error("Error get-players-in-room : ", error);
            }
        });
    
        socket.on("leave-room", async ({ roomId }) => {
            try {
                let room = await Room.findOne({ "players.id": socket.id });

                if (room) {
                    room.players = room.players.filter(player => player.id !== socket.id);
                    if (room.players.length === 0) {
                        await Room.deleteOne({ roomId: room.roomId });
                    } else {
                        await room.save();
                        io.to(room.roomId).emit("update-lobby", room.players);
                        io.to(room.roomId).emit("player-lost", socket.id);
                    }
                    socket.leave(room.roomId);
                }
            } catch (error) {
                console.error("Error leave-room : ", error);
            }
        });

        socket.on("game-over", ({roomId, playerId}) => {
            // socket.leave(roomId);
            io.to(roomId).emit("player-lost", playerId);
        });

        socket.on("disconnect", async () => {
            try {
                let room = await Room.findOne({ "players.id": socket.id });

                if (room) {
                    room.players = room.players.filter(player => player.id !== socket.id);
                    if (room.players.length === 0) {
                        await Room.deleteOne({ roomId: room.roomId });
                    } else {
                        await room.save();
                        io.to(room.roomId).emit("update-lobby", room.players);
                        io.to(room.roomId).emit("player-lost", socket.id);
                    }
                    socket.leave(room.roomId);
                }
            } catch (error) {
                console.error("Error disconnect : ", error);
            }
        });
    });
};

module.exports = gameSockets;