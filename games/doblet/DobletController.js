const asyncHandler = require('express-async-handler');
const GameInstance = require('../../models/GameInstance');
const User = require('../../models/User');
const Doblet = require('./Doblet');
const endGame = require('../../controllers/gameInstanceController').endGame;
const io = require('../../server');

// for now automatically makes the host player1, later implement the players rolling for first
const createDobletInstance = asyncHandler(async (req,res) => {
    const id1 = req.user.id;
    const user1 = await User.findById(id1);
    const dobletObject = {  "owner": id1,
                            "board": Array.from({ length: 6 }, () => Array.from({ length: 4 }, () => [])),
                            // "currentPlayer":{"_id": id1, "username": user1.username},
                            "title": "doblet",
                            "started": false,
                            "invites": [],
                            "players": [],
                            "playerCount": 1
                        };
    const gameInstance = await GameInstance.create(dobletObject);
    if (!gameInstance) {
        res.status(400).json({message: "Error 400"});
    }
    const player1 = {   "_id": id1,
                        "phase": 1,
                        "username": user1.username,
                        "icon": user1.icon,
                        "playerNumber": 1
    }
    gameInstance.players.addToSet(player1);
    gameInstance.save();
    user1.activeGames.addToSet(gameInstance._id);
    user1.save();
    res.status(201).json({message: `New game instance created`, _id: gameInstance._id});
});

const startGame = asyncHandler(async (req,res) => {
    const io = require('../../server')
    const tableID = req.params.instance;
    const gameInstance = await GameInstance.findById(tableID).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    if (gameInstance.owner != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    gameInstance.started = true;
    gameInstance.save();
    if (gameInstance.players.length < 2) {
        return res.status(400).json({message: "Not enough players"});
    }
    let gameModel = new Doblet(gameInstance._id, gameInstance.players, gameInstance.board, null)
    gameModel.setup();
    const updatedGame = await GameInstance.findByIdAndUpdate(tableID, 
        {"currentPlayer": gameModel.currentPlayer, "board": gameModel.board, "players": gameModel.players}, {new: true});
    io.to(tableID).emit('game-start', {message: `Game instance ${tableID} started`});
    res.status(201).json({message: `Game instance ${tableID} started`});
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
    let gameModel = new Doblet(game._id, game.players, game.board, game.currentPlayer)
    gameModel.takeTurn();
    const updatedGame = await GameInstance.findByIdAndUpdate(id, 
        {"currentPlayer": gameModel.currentPlayer, "board": gameModel.board, "players": gameModel.players}, {new: true});
    const room = id;
    io.to(room).emit('game-update', {board: updatedGame.board, gameState: updatedGame, dice: gameModel.dice, winner: gameModel.winner})
    if (gameModel.winner) {
        // res.status(201).json({message: `New board state: ${updatedGame.board}`, board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, winner: gameModel.winner});
        // console.log(updatedGame)
        await endGame(id, gameModel.winner._id);
        // io.to(room).emit('game-update', {board: updatedGame.board, currentPlayer: updatedGame.currentPlayer, 
        //     dice: gameModel.dice, winner: gameModel.winner})
        // io.to(room).emit('game-ended', { message: 'Game ended', reason: 'win', winner: gameModel.winner});
    }
    res.status(201).json({message: `New board state: ${updatedGame.board}`, gameState: updatedGame, dice: gameModel.dice});
});

module.exports = { createDobletInstance, play, startGame}