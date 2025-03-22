const { updateHighscore } = require("../services/userService");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { createUser, findUserByUsername, getLeaderboard } = require("../services/userService");


// Create an user
const createUserss = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: "Erreur lors de l'inscription",
                errors: errors.array().map(err => err.msg) 
            });
        }

        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, hashedPassword);

        res.status(201).json({ message: "Utilisateur créé avec succès !", user: { newUser }});
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris." });
        }
        res.status(500).json({ message: "Échec de la création de l'utilisateur.", error: error.message});
    }
}


//Delete an user
const deleteUserById = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await findUserByUsername(username);

        if(!user) {
            return res.status(404).json({ message: "Utilisateur introuvable !" });
        }

        await user.deleteUser(user);
        res.status(201).json({ message: "Utilisateur supprimé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur !", error })
    }
}

const submitScore = async (req, res) => {
    const { username, gameMode, score } = req.body;

    try {
        const user = await updateHighscore(username, gameMode, score);
        if (!user) return res.status(404).json({ message: "User not found !" });

        return res.status(200).json({ message: "Highcore updated !", user });
    } catch (error) {
        return res.status(500).json({ message: "Error highscore updated !", error });
    }
};

const getAllLeaderboards = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; 

        // get all the leaderboards
        const sprintLeaderboard = await getLeaderboard("Sprint", limit);
        const cheeseLeaderboard = await getLeaderboard("Cheese", limit);
        const ultraLeaderboard = await getLeaderboard("Ultra", limit);
        const rushLeaderboard = await getLeaderboard("Rush", limit);

        const leaderboards = {
            Sprint: sprintLeaderboard,
            Cheese: cheeseLeaderboard,
            Ultra: ultraLeaderboard,
            Rush: rushLeaderboard
        };

        res.json(leaderboards);
    } catch (error) {
        console.error("Erreur get all leaderboards : ", error);
        res.status(500).json({ error: "Error server ! " });
    }
};

module.exports = { createUserss, deleteUserById, submitScore, getAllLeaderboards };