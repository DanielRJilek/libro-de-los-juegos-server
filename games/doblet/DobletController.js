const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
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

function setCurrentPlayer(player) {
    currentPlayer = player;
    otherPlayer = player1 ? currentPlayer == player2 : player2;
}

// move to generic gameController
const addPlayer = asyncHandler(async (req,res) => {
    const userID = req.user.id;
    const gameID = req.params.instance;
    console.log(`userid: ${userID}`);
    console.log(`instance: ${gameID}`);
    const gameInstance = await GameInstance.findById(gameID).exec();
    
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    const newPlayer = await User.findOne({_id: userID}).exec();
    if (!newPlayer) {
        return res.status(400).json({message: "User not found"});
    }
    const inGame = await GameInstance.find({_id: gameID,
                                            players: {"$in": newPlayer.id}})
    if (inGame.length != 0) {
        return res.status(409).json({message: "Player already in game"});
    }
    const requested = await User.find({ _id: userID,
                                        "invites.game_id": gameID})
    if (requested.length == 0) {
        return res.status(409).json({message: "User has not received a game invite from the other user"});
    }
    const owner = await User.findById(gameInstance.owner).select('username');
    gameInstance.players.addToSet({ "id": newPlayer.id,
                                    "phase": 1,
                                    "username": newPlayer.username
    });
    gameInstance.save();
    const activeGame = {_id: gameInstance.id, owner: owner, title: gameInstance.title};
    const result = await User.updateOne(
        { _id: userID }, 
        { $pull: { invites: {game_id: gameID }}},
        {new: true}
    )
    newPlayer.activeGames.addToSet(activeGame);
    newPlayer.save();
    if (!result) {
        return res.status(400).json({message: "Could not accept invite."});
    }
    // console.log(newPlayer.username)
    // console.log(newPlayer.invites)
    // newPlayer.invites.pull({game_id: gameID.toString()})
    // newPlayer.markModified('invites.game_id');
    // newPlayer.save();
    // newPlayer.invites.pull(requested);
    // newPlayer.activeGames.push(inGame);
    
    res.status(201).json({message: `Player ${newPlayer.username} added to game instance ${gameID}`});
});

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
    res.status(201).json({message: `New game instance created`, id: gameInstance.id});
});

const deleteDobletInstance = asyncHandler(async (req,res) => {
    const {id} = req.body;
    if (!id) {
        return res.status(400).json({message: "Game instance ID required"});
    }

    const gameInstance = await GameInstance.findById(id).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    const result = await gameInstance.deleteOne();
    const reply = `Game instance with ID ${result.id} deleted`;
    res.json(reply);
});

const getAllData = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const game = await GameInstance.findById(id).exec();
    if (!game) {
        return res.status(400).json({message: "Game instance not found"});
    }
    res.json(game);
});

const loadGame = asyncHandler(async (req,res) => {
    const {id} = req.body;
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const game = await GameInstance.findById(id).exec();
    if (!game) {
        return res.status(400).json({message: "Game instance not found"});
    }
    return game;
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

module.exports = { createDobletInstance, deleteDobletInstance, play, getAllData, addPlayer}