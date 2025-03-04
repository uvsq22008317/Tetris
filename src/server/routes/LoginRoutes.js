const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/LoginControllers");

router.post("/login", loginUser); // If receive a POST request with /login as address use loginUser function

module.exports = router;
