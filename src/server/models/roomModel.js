const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomId: { type: String, unique: true, required: true},
    players: [{ id: String, username: String }],
});

module.exports = mongoose.model("Room", roomSchema);
