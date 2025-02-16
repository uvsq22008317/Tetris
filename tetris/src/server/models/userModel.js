const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: String,
    username: String,
    password: String,
});


const User = mongoose.model("User", userSchema);
module.exports = User;