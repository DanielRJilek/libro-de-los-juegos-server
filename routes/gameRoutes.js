const express = require('express');
const router = express.Router();
const controller = require('../controllers/gameController');
const dobletRouter = require('../games/doblet/dobletRoutes')

router.route('/')
    .get(controller.getAllGames)

router.route('/:title')
    .get(controller.getGameInfo)

router.use('/doblet/table', dobletRouter);





module.exports = router;