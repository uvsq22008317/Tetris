const Room = require("../models/roomModel");
const { updateHighscore } = require("../services/userService");

const gameSockets = (io) => {
    io.on("connection", (socket) => {
        console.log("user is connected : ", socket.id);
        socket.on("submit-score", async ({ username, gameMode, score }) => {
            try {
                console.log("data : ", username, gameMode, score);
                await updateHighscore(username, gameMode, score);
                socket.emit("score-updated", { message: "Score mis à jour avec succès !" });
            } catch (error) {
                socket.emit("error", { message: "Erreur lors de la mise à jour du score" });
            }
        });
        
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
                    io.to(roomId).emit("game-started");
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

        socket.on("update-duel", (duelInfo) => {
            const { roomId, playerId, duelData } = duelInfo;
            io.to(roomId).emit("updated-duel", { playerId, duelData });
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
    
        socket.on("leave-room", async () => {
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
                        io.to(room.roomId).emit("new-host", room.players[0]);
                    }
                    socket.leave(room.roomId);
                }
            } catch (error) {
                console.error("Error leave-room : ", error);
            }
        });

        socket.on("game-over", async ({roomId, playerId}) => {
            // socket.leave(roomId);    
            io.to(roomId).emit("player-lost", playerId);
            try {
                let room = await Room.findOne({ "players.id": socket.id });
                if (room) {
                    room.players = room.players.filter(player => player.id !== socket.id);
                    await room.save();
                    io.to(room.roomId).emit("update-lobby", room.players);
                }
            } catch (error) {
                console.error("Error game over : ", error);
            }
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