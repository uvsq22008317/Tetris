const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    highscore40L: {type: Number, default: null},
    ultraHighscore: {type: Number, default: null},
    cheeseHighscore: {type: Number, default: null},
    rushHighscore: {type: Number, default: null}
});

const User = mongoose.model("User", userSchema);
module.exports = { userSchema, User };