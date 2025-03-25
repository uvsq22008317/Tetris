const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/userControllers");

router.get("/profil", getProfile);

module.exports = router;