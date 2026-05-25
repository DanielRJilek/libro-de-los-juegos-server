const asyncHandler = require('express-async-handler');
const GameInstance = require('../models/GameInstance');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getIo } = require('../socket');
const { emitTableUpdate } = require('../socket/emitters');
const { TABLE_UPDATE_KIND } = require('../socket/events');

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

module.exports = { deleteGameInstance, getAllData, loadGame, addPlayer, endGame, quitGame}