const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

// Différentes routes vers l'API selon les requetes
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
