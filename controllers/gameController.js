const asyncHandler = require('express-async-handler');
const Game = require('../models/Game');

const getAllGames = asyncHandler(async (req,res) => {
    const games = await Game.find().lean();
    if (!games) {
        return res.status(400).json({message: 'No games found'});
    }
    res.json(games);
});

const getGameInfo = asyncHandler(async (req,res) => {
    const title = req.params.title;
    const game = await Game.findOne({"title": title}).lean();
    if (!game) {
        return res.status(400).json({message: 'No game found with that title'})
    }
    res.json(game);
});

module.exports = {getAllGames, getGameInfo}