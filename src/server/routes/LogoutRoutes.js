const express = require("express");
const router = express.Router();
const {Logout} = require("../authentification/LogoutToken");

router.post("/logout", Logout);

module.exports = router;