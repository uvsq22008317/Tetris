const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
    roomId: { type: String, unique: true, required: true},
    users: [userSchema],
    state: {type: String, default: "waiting" },
    date: { type: Date, default: Date.now },
});

const Game = mongoose.model("Game", gameSchema);
module.exports = Game;