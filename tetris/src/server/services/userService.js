const User = require("../models/userModel");

const createUser = async (username, password) => {
    const user = new User ({
        username,
        password,
    });
    return await user.save();
}

const findUserByUsername = async (username) => {
    return await User.findById(username);
};

const deleteUser = async (user) => {
    await User.deleteMany(user);
}

module.exports = { createUser, findUserByUsername, deleteUser };