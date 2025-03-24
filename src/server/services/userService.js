const fs = require("fs");
const FILE_PATH = "./leaderboard.json";
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

const updateHighscoreProfil = async (username, gameMode, score) => {
    try {
        let user = await User.findOne({ username });
        console.log("user :", user);
        if (!user) return null; // User doesn't exist

        // Check if it's a new highscore
        switch (gameMode) {
            case "Sprint":
                if (user.highscore40L === null || user.highscore40L === 0 || score < user.highscore40L) {
                    user.highscore40L = score;
                }
                break;
            case "Cheese":
                if (user.cheeseHighscore === null || user.cheeseHighscore === 0 || score < user.cheeseHighscore) {
                    user.cheeseHighscore = score;
                }
                break;
            case "Ultra":
                if (user.ultraHighscore === null || user.cheeseHighscore === 0 || score > user.ultraHighscore) {
                    user.ultraHighscore = score;
                }
                break;
            case "Rush":
                if (user.rushHighscore === null || user.cheeseHighscore === 0 || score < user.rushHighscore) {
                    user.rushHighscore = score;
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

const updateHighscoreLeaderboard = async (username, gameMode, score) => {
    try {
        let leaderboard = loadLeaderboard();

        if (!leaderboard[gameMode]) return null; 

        // Vérifier si l'utilisateur existe déjà dans le leaderboard
        let userIndex = leaderboard[gameMode].findIndex((entry) => entry.username === username);

        if (userIndex !== -1) {
            if (gameMode === "Ultra" ? score > leaderboard[gameMode][userIndex].score : score < leaderboard[gameMode][userIndex].score) {
                leaderboard[gameMode][userIndex].score = score;
            }
        } else {
            leaderboard[gameMode].push({ username, score });
        }

        // Trier les scores (descendant pour Ultra, ascendant pour les autres)
        leaderboard[gameMode].sort((a, b) => (gameMode === "Ultra" ? b.score - a.score : a.score - b.score));

        // Limit to 10 the leaderboard
        leaderboard[gameMode] = leaderboard[gameMode].slice(0, 10);

        // Save the leaderboard
        saveLeaderboard(leaderboard);

        return leaderboard[gameMode];
    } catch (error) {
        console.error("Error updateHighscoreLeaderboard :", error);
        throw error;
    }
};

const getLeaderboard = async (mode, limit = 10) => {
    let leaderboard = loadLeaderboard();
    return leaderboard[mode]?.slice(0, limit) || [];
};

const getLeaderboardWithDB = async(mode, limit) => {
    const modes = {
        Sprint: "highscore40L",
        Cheese : "cheeseHighscore",
        Ultra : "ultraHighscore",
        Rush : "rushHighscore"
    };

    const validMode = modes[mode];
    if (!validMode) {
        throw new Error("Invalid mode");
    }

    return await User.find({ [validMode]: { $gt: 0 } }) 
        .sort({ [validMode]: mode === "Ultra" ? -1 : 1 })
        .limit(limit)
        .select(`username ${validMode}`);
}

const loadLeaderboard = () => {
  if (fs.existsSync(FILE_PATH)) {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  }
  return { Sprint: [], Cheese: [], Ultra: [], Rush: [] };
};

const saveLeaderboard = (data) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
};

module.exports = { createUser, findUserByUsername, deleteUser, updateHighscoreProfil, updateHighscoreLeaderboard, getLeaderboard, getLeaderboardWithDB};