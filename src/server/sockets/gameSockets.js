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
    
        socket.on("disconnect", () => {
            console.log(`player ${socket.id} left the room`);
            for (let roomId in socket.rooms) {
                socket.leave(roomId);
            }
        });

        socket.on("game-over", ({roomId, playerId}) => {
            socket.leave(roomId);
            io.to(roomId).emit("player-lost", playerId);
        });
    });
};

module.exports = gameSockets;