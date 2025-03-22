const express = require("express");
const router = express.Router();
const { getAllLeaderboards } = require("../controllers/userControllers");

router.get("/leaderboards", getAllLeaderboards); // If receive a GET request with /leaderboards as address use getAllLeaderboards function

module.exports = router;
