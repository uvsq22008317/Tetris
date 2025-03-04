const express = require("express");
const router = express.Router();
const { createUserss, deleteUserById } = require("../controllers/userControllers");

router.post("/register", createUserss); // If receive a POST request with /register as address use createUserss function

router.delete("/dusername", deleteUserById); // If receive a DELETE request with /dusername as address use deleteUserById function

module.exports = router;
