const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { createUserss, deleteUserById } = require("../controllers/userControllers");

router.post("/register", [
    body("username").isAlphanumeric().withMessage("Le nom d'utilisateur doit contenir uniquement des lettres et des chiffres. \n"),
    body("password").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères. \n"),
], createUserss); // If receive a POST request with /register as address use createUserss function

router.delete("/dusername", deleteUserById); // If receive a DELETE request with /dusername as address use deleteUserById function

module.exports = router;
