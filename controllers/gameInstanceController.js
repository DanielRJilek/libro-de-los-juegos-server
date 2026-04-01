const asyncHandler = require('express-async-handler');
const GameInstance = require('../models/GameInstance');
const User = require('../models/User');
const Game = require('../models/Game');

const deleteGameInstance = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    if (!id) {
        return res.status(400).json({message: "Game instance ID required"});
    }
    const gameInstance = await GameInstance.findById(id).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    if (gameInstance.owner != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    await User.updateMany({ activeGames: id }, { $pull: { activeGames: id } });
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
    if (!game.players.some(player => player._id.toString() == req.user.id)) {
        return res.status(403).json({message: "Forbidden"});
    }
    for (let player of game.players) {
        const user = await User.findById(player._id).select('username');
        player.username = user.username;
    }  
    const owner = await User.findById(game.owner).exec();
    game.owner = owner;

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
    if (!game.players.some(player => player._id.toString() == req.user.id)) {
        return res.status(403).json({message: "Forbidden"});
    }
    for (let player of game.players) {
        const user = await User.findById(player._id).select('username');
        player.username = user.username;
    }
    return game;
});

const addPlayer = asyncHandler(async (req,res) => {
    const io = require('../server')
    const userID = req.user.id;
    const tableID = req.params.instance;
    const gameInstance = await GameInstance.findById(tableID).exec();
    
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    const newPlayer = await User.findOne({_id: userID}).exec();
    if (!newPlayer) {
        return res.status(400).json({message: "User not found"});
    }
    const inGame = await GameInstance.find({_id: tableID,
                                            players: {"$in": newPlayer._id}}).exec();
    if (inGame.length != 0) {
        return res.status(409).json({message: "Player already in game"});
    }
    const requested = await User.find({ _id: userID,
                                        "invites.table._id": tableID}).exec();
    if (requested.length == 0) {
        return res.status(409).json({message: "User has not received a game invite from the other user"});
    }
    const owner = await User.findById(gameInstance.owner).select('username');
    gameInstance.players.addToSet({ "_id": newPlayer._id,
                                    "phase": 1,
                                    "username": newPlayer.username
    });
    gameInstance.invites.pull({_id: newPlayer._id.toString(), username: newPlayer.username});
    await gameInstance.save();
    newPlayer.invites.pull({table: {_id: tableID, title: gameInstance.title}, sender: {_id: gameInstance.owner, username: owner.username}});
    newPlayer.activeGames.addToSet(gameInstance._id);
    await newPlayer.save();
    io.to(tableID).emit('player-joined', {message: `Player ${newPlayer.username} joined game instance ${tableID}`});
    res.status(201).json({message: `Player ${newPlayer.username} added to game instance ${tableID}`});
});

const startGame = asyncHandler(async (req,res) => {
    const io = require('../server')
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
    io.to(tableID).emit('game-start', {message: `Game instance ${tableID} started`});
    res.status(201).json({message: `Game instance ${tableID} started`});
});

module.exports = { deleteGameInstance, getAllData, loadGame, addPlayer, startGame }