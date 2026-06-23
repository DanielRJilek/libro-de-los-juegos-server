const express = require('express');
const router = express.Router();
const laquetController = require('./LaquetController');
const gameInstanceController = require('../../controllers/gameInstanceController');
const verifyJWT = require('../../middleware/verifyJWT');
const isPlayer = require('../../middleware/isPlayer');
    
router.use(verifyJWT)