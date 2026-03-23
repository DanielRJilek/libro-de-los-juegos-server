const asyncHandler = require('express-async-handler');
const GameInstance = require('../../models/GameInstance');
const User = require('../../models/User');
const Doblet = require('./Doblet');
const Game = require('../../models/Game');

function startingPlayer(player1, player2) {
    player1Roll = Math.random() * (6-1) + 1;
    player2Roll = Math.random() * (6-1) + 1;
    if (player1Roll == player2Roll) {
        return startingPlayer(player1,player2)
    }
    return player1 ? player1Roll > player2Roll : player2;
}

// for now automatically makes the host player1, later implement the players rolling for first
const createDobletInstance = asyncHandler(async (req,res) => {
    const id1 = req.user.id;
    const user1 = await User.findById(id1).select('username');
    const dobletObject = {  "owner": id1,
                            "board": [[2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2], [2,0,0,2]],
                            "currentPlayer":{"id": id1, "username": user1.username},
                            "title": "doblet"
                        };
    const gameInstance = await GameInstance.create(dobletObject);
    if (!gameInstance) {
        res.status(400).json({message: "Error 400"});
    }
    const player1 = {   "id": id1,
                        "phase": 1,
                        "username": user1.username
    }
    gameInstance.players.addToSet(player1);
    gameInstance.save();
    user1.activeGames.push({id: gameInstance.id, title: gameInstance.title});
    user1.save();
    res.status(201).json({message: `New game instance created`, id: gameInstance.id});
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
    if (game.currentPlayer.id != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    let gameModel = new Doblet(game.id, game.players[0], game.players[1], game.currentPlayer, game.board)
    gameModel.takeTurn();
    const updatedGame = await GameInstance.findByIdAndUpdate(id, 
        {"currentPlayer": gameModel.currentPlayer, "board": gameModel.board, "players": [gameModel.player1, gameModel.player2]}, {new: true});
    const room = game.id;
    io.to(room).emit('game-update', {board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, winner: gameModel.winner})
    if (gameModel.winner) {
        res.status(201).json({message: `New board state: ${updatedGame.board}`, board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, winner: gameModel.winner});
    }
    res.status(201).json({message: `New board state: ${updatedGame.board}`, board: updatedGame.board, currentPlayer: updatedGame.currentPlayer});
});

module.exports = { createDobletInstance, play}