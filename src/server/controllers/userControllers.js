const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { createUser, findUserById } = require("../services/userService");


// Create an user
const createUserss = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
          }
          
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, hashedPassword);

        res.status(201).json({ message: "Utilisateur créé avec succès !", user: { newUser }});
    } catch (error) {
        res.status(500).json({ message: "Échec de la création de l'utilisateur !", error: error.message});
    }
}

//Delete an user
const deleteUserById = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await findUserById(username);

        if(!user) {
            return res.status(404).json({ message: "Utilisateur introuvable !" });
        }

        await user.deleteUser(user);
        res.status(201).json({ message: "Utilisateur supprimé avec succès !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur !", error })
    }
}

module.exports = { createUserss, deleteUserById };