const { User } = require("../models/userModel");

const createUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User ({
        username,
        password: hashedPassword,
    });
    return await user.save();
}

const findUserByUsername = async (username) => {
    return await User.findOne({ username });
  };

const deleteUser = async (user) => {
    await User.deleteMany(user);
}

module.exports = { createUser, findUserByUsername, deleteUser };