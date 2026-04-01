const asyncHandler = require('express-async-handler');
const GameInstance = require('../../models/GameInstance');
const User = require('../../models/User');
const Doblet = require('./Doblet');
const Game = require('../../models/Game');

// for now automatically makes the host player1, later implement the players rolling for first
const createDobletInstance = asyncHandler(async (req,res) => {
    const id1 = req.user.id;
    const user1 = await User.findById(id1);
    const dobletObject = {  "owner": id1,
                            "board": [[2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2]],
                            "currentPlayer":{"_id": id1, "username": user1.username},
                            "title": "doblet",
                            "started": false,
                            "invites": [],
                            "players": [],
                        };
    const gameInstance = await GameInstance.create(dobletObject);
    if (!gameInstance) {
        res.status(400).json({message: "Error 400"});
    }
    const player1 = {   "_id": id1,
                        "phase": 1,
                        "username": user1.username
    }
    gameInstance.players.addToSet(player1);
    gameInstance.save();
    user1.activeGames.addToSet(gameInstance._id);
    user1.save();
    res.status(201).json({message: `New game instance created`, _id: gameInstance._id});
});

const play = asyncHandler(async (req,res) => {
    const io = require('../../server')
    const id = req.params.instance;
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const game = await GameInstance.findById(id).exec();
    if (!game) {
        return res.status(400).json({message: "Game instance not found"});
    } 
    if (game.currentPlayer._id != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    let gameModel = new Doblet(game._id, game.players[0], game.players[1], game.currentPlayer, game.board)
    gameModel.takeTurn();
    const updatedGame = await GameInstance.findByIdAndUpdate(id, 
        {"currentPlayer": gameModel.currentPlayer, "board": gameModel.board, "players": [gameModel.player1, gameModel.player2]}, {new: true});
    const room = game._id;
    console.log(gameModel.dice);
    io.to(room).emit('game-update', {board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, dice: gameModel.dice, winner: gameModel.winner})
    if (gameModel.winner) {
        // res.status(201).json({message: `New board state: ${updatedGame.board}`, board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, winner: gameModel.winner});
        io.to(room).emit('game-update', {board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, 
            dice: gameModel.dice, winner: gameModel.winner})
    }
    res.status(201).json({message: `New board state: ${updatedGame.board}`, board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, 
        dice: gameModel.dice});
});

module.exports = { createDobletInstance, play}