const { createGame, joinGame } = require("../services/gameService");

// create a room
const createRoom = async (req, res) => {
    try {
        const { roomId } = req.body;
        const newRoom = await createGame(roomId);
        res.status(201).json({ message: "Room created !", roomId: newRoom.roomId });
    } catch (error) {
        res.status(500).json({ message: "Error creating room !", error: error.message });
    }
};

// join a room
const joinRoom = async (req, res) => {
    try {
        const { roomId, playerId, username } = req.body;
        const room = await joinGame(roomId, playerId, username);
        res.status(201).json({ message: "Joined room !", roomId: room.roomId });
    } catch (error) {
        res.status(500).json({ message: "Error joining room !", error: error.message});
    }
    };

module.exports = { createRoom, joinRoom };