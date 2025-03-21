const express = require("express");
const router = express.Router();
const {loginUser} = require("../controllers/LoginControllers");
const {verifyToken} = require("../authentification/authentificationToken");

router.post("/login", loginUser); // If receive a POST request with /login as address use loginUser function
router.get("/token", verifyToken);

module.exports = router;
