const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameController');
const isPlayer = require('../middleware/isPlayer');
const gameInstanceController = require('../controllers/gameInstanceController');
const verifyJWT = require('../middleware/verifyJWT');

router.route('/')
    .get(controller.getAllGames)

router.route('/:title')
    .get(controller.getGameInfo)

router.use(verifyJWT);
router.route('/:title/table')
    .post(gameInstanceController.createGameInstance)

router.route('/:title/table/:instance/players')
    .post(gameInstanceController.addPlayer)

router.use('/:title/table/:instance', isPlayer)
router.route('/:title/table/:instance')
    .get(gameInstanceController.getAllData)
    .delete(gameInstanceController.deleteGameInstance)

router.route('/:title/table/:instance/quit')
    .post(gameInstanceController.quitGame)

router.route('/:title/table/:instance/start')
    .post(gameInstanceController.startGame)

router.route('/:title/table/:instance/play')
    .post(gameInstanceController.play)

router.route('/:title/table/:instance/roll')
    .post(gameInstanceController.rollDice)

module.exports = router;