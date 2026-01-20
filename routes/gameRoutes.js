const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('../controllers/gameController');
const verifyJWT = require('../middleware/verifyJWT');
const dobletRouter = require('../games/doblet/dobletRoutes')

router.route('/')
    .get(controller.getAllGames)

router.route('/:title')
    .get(controller.getGameInfo)

router.use('/doblet/table', dobletRouter);





module.exports = router;