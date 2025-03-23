const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const FILE_PATH = path.join(__dirname, "./leaderboard.json");


router.get("/leaderboard", (req, res) => {
    try {
        if (!fs.existsSync(FILE_PATH)) {
            return res.status(404).json({ error: "Leaderboard file not found !" });
        }

        const data = fs.readFileSync(FILE_PATH, "utf8");
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Error loading leaderboard file : ", error);
        res.status(500).json({ error: "Error server !" });
    }
});
module.exports = router;