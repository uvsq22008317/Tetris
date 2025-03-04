const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    highscore40L: String,
    blitzHighscore: String,
});

const User = mongoose.model("User", userSchema);
module.exports = { userSchema, User };