const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { createUserss, deleteUserByUsername } = require("../controllers/userControllers");

router.post("/register", [
    body("username").isAlphanumeric().withMessage("Le nom d'utilisateur doit contenir uniquement des lettres et des chiffres. \n"),
    body("password").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères. \n"),
], createUserss); // If receive a POST request with /register as address use createUserss function

router.delete("/dusername", deleteUserByUsername); // If receive a DELETE request with /dusername as address use deleteUserByUsername function

module.exports = router;
