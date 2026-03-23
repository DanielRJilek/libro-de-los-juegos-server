const asyncHandler = require('express-async-handler');
const GameInstance = require('../models/GameInstance');
const User = require('../models/User');
const Game = require('../models/Game');

const deleteGameInstance = asyncHandler(async (req,res) => {
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

const addPlayer = asyncHandler(async (req,res) => {
    const userID = req.user.id;
    const gameID = req.params.instance;
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

module.exports = { deleteGameInstance, getAllData, loadGame, addPlayer}