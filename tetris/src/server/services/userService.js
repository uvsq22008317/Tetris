const User = require("../models/userModel");

const createUser = async (username, password) => {
    const user = new User ({
        username,
        password,
    });
    return await user.save();
}

const findUserById = async (userId) => {
    return await User.findById(userId);
};

const deleteUser = async (userId) => {
    try {
        ; 
    } catch (error) {

    }
}

module.exports = { createUser, findUserById };