const asyncHandler = require('express-async-handler');
const Game = require('../models/Game');

const getAllGames = asyncHandler(async (req,res) => {
    const games = await Game.find().lean();
    console.log(games);
    if (!games) {
        return res.status(400).json({message: 'No games found'});
    }
    res.json(games);
});

module.exports = {getAllGames}