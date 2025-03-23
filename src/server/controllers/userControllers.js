const {  createUser, findUserByUsername, getLeaderboard, updateHighscoreProfil, updateHighscoreLeaderboard, getLeaderboardWithDB } = require("../services/userService");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');


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

        // Sign JWT with secret key
        const token=jwt.sign({id: newUser._id, username: newUser.username}, process.env.SECRET_KEY, {expiresIn: "1h"});
        // Define cookie options
        const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60*60*1000,
        path: "/"
        };

        // Stock token in a cookie
        res.cookie("token", token, cookieOptions);
        res.status(201).json({ message: "Utilisateur créé avec succès !", user: {newUser}});
    } 
    catch (error) {
        res.status(500).json({ message: "Échec de la création de l'utilisateur !", error: error.message});
    }
}


//Delete an user
const deleteUserByUsername = async (req, res) => {
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
        // update userProfil
        const user = await updateHighscoreProfil(username, gameMode, score);
        if (!user) return res.status(404).json({ message: "User not found !" });

        // update leaderboard
        const leaderboard = await updateHighscoreLeaderboard(username, gameMode, score);
        if (!leaderboard) return res.status(400).json({ message: "Invalid game mode !" });

        return res.status(200).json({ message: "Highcore updated !", user });
    } catch (error) {
        return res.status(500).json({ message: "Error highscore updated !", error });
    }
};

const getAllLeaderboards = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; 

        // get all the leaderboards
        const sprintLeaderboard = await getLeaderboardWithDB("Sprint", limit);
        const cheeseLeaderboard = await getLeaderboardWithDB("Cheese", limit);
        const ultraLeaderboard = await getLeaderboardWithDB("Ultra", limit);
        const rushLeaderboard = await getLeaderboardWithDB("Rush", limit);

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

module.exports = { createUserss, deleteUserByUsername, submitScore, getAllLeaderboards };