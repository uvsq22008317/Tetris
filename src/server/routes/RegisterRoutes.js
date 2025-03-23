const express = require("express");
const router = express.Router();
const { createUserss, deleteUserByUsername } = require("../controllers/userControllers");

router.post("/register", createUserss); // If receive a POST request with /register as address use createUserss function

router.delete("/dusername", deleteUserByUsername); // If receive a DELETE request with /dusername as address use deleteUserByUsername function

module.exports = router;
