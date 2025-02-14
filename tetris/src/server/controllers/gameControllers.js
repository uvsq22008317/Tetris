const { createRoom, joinRoom } = require("../services/gameService");

const createRoom = (req, res) => {
    const { roomId } = req.body;
    const room = createGame(roomId);
    res.status(200).json(room);
};

const joinRoom = (req, res) => {
    const { roomId, playerId } = req.body;
    const game = joinGame(roomId, playerId);
    res.status(200).json(game);
};

module.exports = { createRoom, joinRoom };