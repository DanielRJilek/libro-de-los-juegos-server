const asyncHandler = require('express-async-handler');
const GameInstance = require('../models/GameInstance');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getIo } = require('../socket');
const { emitTableUpdate } = require('../socket/emitters');
const { TABLE_UPDATE_KIND } = require('../socket/events');
const { getGameModel } = require('../games/gameRegistry');
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
    if (!game.players.some(player => player?._id && player._id.toString() == req.user.id)) {
        return res.status(403).json({message: "Forbidden"});
    }
    // is this redundant now?
    for (let player of game.players) {
        const user = await User.findById(player._id);
        player.username = user.username;
        player.profilePic = user.profilePic;
        player._id = user._id;
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
    if (!game.players.some(player => player?._id && player._id.toString() == req.user.id)) {
        return res.status(403).json({message: "Forbidden"});
    }
    for (let player of game.players) {
        const user = await User.findById(player._id);
        player.username = user.username;
        player.icon = user.icon;
        player.playerNumber = game.playerCount;
    }
    return game;
});

const addPlayer = asyncHandler(async (req,res) => {
    const userID = req.user.id;
    const tableID = req.params.instance;
    const gameInstance = await GameInstance.findById(tableID).exec();
    const tableObjectId = new mongoose.Types.ObjectId(tableID);
    
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    const newPlayer = await User.findOne({_id: userID}).exec();
    if (!newPlayer) {
        return res.status(400).json({message: "User not found"});
    }
    const inGame = await GameInstance.find({ _id: tableID, 'players._id': newPlayer._id }).exec();
    if (inGame.length != 0) {
        return res.status(409).json({message: "Player already in game"});
    }
    const requested = await User.find({ _id: userID,
                                        "invites.table._id": tableID}).exec();
    if (requested.length == 0) {
        return res.status(409).json({message: "User has not received a game invite from the other user"});
    }
    const owner = await User.findById(gameInstance.owner).select('username');
    await GameInstance.updateOne(
        { _id: tableID },
        { 
            $pull: { invites: { _id: userID } },
            $addToSet: { players: { _id: newPlayer._id, username: newPlayer.username, icon: newPlayer.icon, phase: 1, playerNumber: gameInstance.playerCount +1 } },
            $inc: { playerCount: 1 }
        }
    );
    await User.updateOne(
        { _id: newPlayer._id },
        { $pull: { invites: { "table._id": tableID } },
          $addToSet: { activeGames: gameInstance._id } }
    );
    emitTableUpdate(getIo(), tableID, TABLE_UPDATE_KIND.PLAYER_JOINED, {
        message: `Player ${newPlayer.username} joined game instance ${tableID}`,
        username: newPlayer.username,
    });
    res.status(201).json({message: `Player ${newPlayer.username} added to game instance ${tableID}`});
});

const quitGame = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    const userID = req.user.id;
    const user = await User.findById(userID).exec();
    if (!user) {
        return res.status(400).json({message: "User not found"});
    }
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const game = await GameInstance.findById(id).exec();
    if (!game) {
        return res.status(400).json({message: "Game instance not found"});
    }
    if (game.winner) {
        return res.status(400).json({message: "Game already ended"});
    }
    for (let player of game.players) {
        if (player._id != userID) {
            await endGame(id, player._id);
        }
    }
    res.status(201).json({message: "Game ended"});
});

const endGame = asyncHandler(async (gameInstanceID, winnerID) => {
    const game = await GameInstance.findByIdAndUpdate(gameInstanceID, { winner: winnerID }, { new: true });
    await User.updateMany({ activeGames: gameInstanceID }, { $pull: { activeGames: gameInstanceID }, $inc: { gamesPlayed: 1 } });
    if (winnerID) {
        for (let i=0; i<game.players.length; i++) {
            if (game.players[i]._id == winnerID) {
                await User.findByIdAndUpdate(game.players[i]._id, { $inc: { gamesWon: 1, gamesPlayed: 1 } });
            }
            else {
                await User.findByIdAndUpdate(game.players[i]._id, { $inc: { gamesPlayed: 1 } });
            }
        }
    }
    else {
        for (let i=0; i<game.players.length; i++) {
            await User.findByIdAndUpdate(game.players[i]._id, { $inc: { gamesPlayed: 1 } });
        }
    }
    const winner = await User.findById(winnerID).select('username icon playerNumber');
    await game.deleteOne();
    
    emitTableUpdate(getIo(), gameInstanceID, TABLE_UPDATE_KIND.GAME_ENDED, {
        message: 'Game ended',
        winner,
    });
});

const createGameInstance = asyncHandler(async (req,res) => {
    const {title} = req.params;
    const ownerID = req.user.id;
    const owner = await User.findById(ownerID).exec();
    if (!owner) {
        return res.status(400).json({message: "User not found"});
    }
    const gameInfo = await Game.findOne({title: title}).select('diceCount').exec();
    const gameInstance = await GameInstance.create({
        owner: ownerID, 
        title: title, 
        players: [{_id: owner._id, username: owner.username, icon: owner.icon, phase: 1, playerNumber: 1}], 
        invites: [], 
        started: false,
        playerCount: 1,
        dice: [],
        diceCount: gameInfo.diceCount,
    });
    if (!gameInstance) {
        return res.status(400).json({message: "Error 400"});
    }
    owner.activeGames.addToSet(gameInstance._id);
    owner.save();
    res.status(201).json({message: `New game instance created`, _id: gameInstance._id});
});

const startGame = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    const gameInstance = await GameInstance.findById(id).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    if (gameInstance.owner != req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }
    if (gameInstance.players.length < 2) {
        return res.status(400).json({message: "Not enough players"});
    }
    if (gameInstance.started) {
        return res.status(400).json({message: "Game already started"});
    }
    const gameModel = getGameModel(gameInstance);
    gameModel.setup();
    await GameInstance.updateOne({ _id: id }, { $set: {
        board: gameModel.board,
        players: gameModel.players,
        dice: gameModel.dice,
        currentPlayerNumber: gameModel.currentPlayerNumber,
        turnStage: gameModel.turnStage,
        started: true} });
    emitTableUpdate(getIo(), id, TABLE_UPDATE_KIND.GAME_START, {
        message: `Game instance ${id} started`,
    });
    res.status(201).json({message: `Game instance ${id} started`});
});

const play = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const gameInstance = await GameInstance.findById(id).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    const player = gameInstance.players.find(p => p._id.toString() == req.user.id);
    if (!player) {
        return res.status(403).json({message: "Forbidden"});
    }
    if (gameInstance.currentPlayerNumber != player.playerNumber) {
        return res.status(403).json({message: "Forbidden"});
    }
    const gameModel = getGameModel(gameInstance);
    const move = req.body;
    if (!gameModel.isValidMove(move)) {
        return res.status(400).json({message: "Invalid move"});
    }
    gameModel.makeMove(move);
    await GameInstance.updateOne({ _id: id }, { $set: {
        board: gameModel.board,
        players: gameModel.players,
        dice: gameModel.dice,
        currentPlayerNumber: gameModel.currentPlayerNumber,
        turnStage: gameModel.turnStage,
    } });
    const updatedGameInstance = await GameInstance.findById(id).exec();
    emitTableUpdate(getIo(), id, TABLE_UPDATE_KIND.STATE, {
        board: gameModel.board,
        gameState: updatedGameInstance,
        dice: gameModel.dice,
        winner: gameModel.winner,
        move: move,
        currentPlayerNumber: gameModel.currentPlayerNumber,
        turnStage: gameModel.turnStage,
    });
    if (gameModel.winner) {
        await endGame(id, gameModel.winner._id);
    }
    res.status(201).json({message: `New board state: ${gameModel.board}`, gameState: updatedGameInstance, dice: gameModel.dice});
});

const rollDice = asyncHandler(async (req,res) => {
    const id = req.params.instance;
    const gameInstance = await GameInstance.findById(id).exec();
    if (!gameInstance) {
        return res.status(400).json({message: "Game instance not found"});
    }
    if (gameInstance.started == false) {
        return res.status(400).json({message: "Game not started"});
    }
    const player = gameInstance.players.find(p => p._id.toString() == req.user.id);
    if (!player) {
        return res.status(403).json({message: "Forbidden"});
    }
    if (gameInstance.currentPlayerNumber != player.playerNumber) {
        return res.status(403).json({message: "Forbidden"});
    }
    if (gameInstance.turnStage != "roll") {
        return res.status(403).json({message: "Forbidden"});
    }
    const gameModel = getGameModel(gameInstance);
    gameModel.roll(gameInstance.diceCount);
    await GameInstance.updateOne({ _id: id }, { $set: {
        dice: gameModel.dice,
        turnStage: gameModel.turnStage
    } });
    emitTableUpdate(getIo(), id, TABLE_UPDATE_KIND.STATE, {
        dice: gameModel.dice,
        turnStage: gameModel.turnStage,
    });
    res.status(201).json({message: `Dice rolled`, dice: gameModel.dice});
});

module.exports = { deleteGameInstance, getAllData, loadGame, addPlayer, endGame, quitGame, createGameInstance, startGame, play, rollDice}