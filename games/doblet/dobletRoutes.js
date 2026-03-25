// a lot of this should move to gameController to be more general. everything except /play 

const express = require('express');
const router = express.Router();
const dobletController = require('./DobletController');
const gameInstanceController = require('../../controllers/gameInstanceController');
const verifyJWT = require('../../middleware/verifyJWT');
const isPlayer = require('../../middleware/isPlayer');
    
router.use(verifyJWT)

// '.com/games/doblet/table
router.route('/')
    .post(dobletController.createDobletInstance)
    .delete(gameInstanceController.deleteGameInstance)

router.use(isPlayer);

router.route('/:instance')
    .get(gameInstanceController.getAllData)

router.route('/:instance/play')
    .post(dobletController.play)

router.route('/:instance/players')
    .post(gameInstanceController.addPlayer)

router.route('/:instance/start')
    .post(gameInstanceController.startGame)

module.exports = router;