const express = require('express');
const router = express.Router();
const controller = require('./DobletController');
const verifyJWT = require('../../middleware/verifyJWT');
const isPlayer = require('../../middleware/isPlayer');

router.use(verifyJWT)

// '.com/games/doblet
router.route('/')
    .post(controller.createDobletInstance)
    .delete(controller.deleteDobletInstance)

router.use(isPlayer);

router.route('/:instance')
    .get(controller.getAllData)

router.route('/:instance/play')
    .post(controller.play)

router.route('/:instance/players')
    .post(controller.addPlayer)

module.exports = router;