const express = require("express");
const { createUser } = require("../services/userService");
const router = express.Router();

router.post("/create-user", async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = await createUser(username, password);
        res.status(201).json({ message: "User create successfully !", user: { newUser }});
    } catch (error) {
        res.status(500).json({ message: "Failed to create user !", error: error.message});
    }
})

module.exports = router;