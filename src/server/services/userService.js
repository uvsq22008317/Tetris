const { User } = require("../models/userModel");

const createUser = async (username, password) => {
    const user = new User ({
        username,
        password,
    });
    return await user.save();
}

const findUserByUsername = async (username) => {
    return await User.findOne({ username });
  };

const deleteUser = async (user) => {
    await User.deleteMany(user);
}

const updateHighscore = async (username, gameMode, score) => {
    try {
        let user = await User.findOne({ username });
        console.log("user :", user);
        if (!user) return null; // User doesn't exist

        // Check if it's a new highscore
        switch (gameMode) {
            case "Sprint":
                if (user.highscore40L === null || score < user.highscore40L) {
                    user.highscore40L = score;
                }
                break;
            case "Cheese":
                if (!user.cheeseHighscore === null || score < user.cheeseHighscore) {
                    user.cheeseHighscore = score;
                }
                break;
            case "Ultra":
                if (!user.blitzHighscore === null || score > user.blitzHighscore) {
                    user.blitzHighscore = score;
                }
                break;
            case "Rush":
                if (!user.RushHighscore === null || score < user.RushHighscore) {
                    user.RushHighscore = score;
                }
                break;
            default:
                return null;
        }

        await user.save();
        return user;
    } catch (error) {
        console.error("Error updating highscore:", error);
        throw error;
    }
};


module.exports = { createUser, findUserByUsername, deleteUser, updateHighscore };