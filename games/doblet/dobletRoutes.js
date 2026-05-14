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
    
router.use(isPlayer);

router.route('/:instance')
    .get(gameInstanceController.getAllData)
    .delete(gameInstanceController.deleteGameInstance)

router.route('/:instance/play')
    .post(dobletController.play)

router.route('/:instance/players')
    .post(gameInstanceController.addPlayer)

router.route('/:instance/start')
    .post(dobletController.startGame)

router.route('/:instance/quit')
    .post(gameInstanceController.quitGame)

module.exports = router;