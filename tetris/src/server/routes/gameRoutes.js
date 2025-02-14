const express = require("express");
const { createRoom, joinRoom } = require("../controllers/gameControllers");

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);

module.exports = router;