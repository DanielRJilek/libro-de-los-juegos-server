const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/gameController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
    .get(controller.getAllGames)

module.exports = router;