const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    highscore40L: {type: Number, default: null},
    blitzHighscore: {type: Number, default: null},
    cheeseHighscore: {type: Number, default: null},
    RushHigscore: {type: Number, default: null}
});

const User = mongoose.model("User", userSchema);
module.exports = { userSchema, User };