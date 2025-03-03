const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    roomId: { type: String, unique: true, required: true},
    users: [],
    grids: [],
    date: { type: Date, default: Date.now },
});

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;