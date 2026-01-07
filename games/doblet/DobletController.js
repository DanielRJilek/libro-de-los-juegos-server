const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const GameInstance = require('../../models/GameInstance');
const Doblet = require('./Doblet')

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

function rollDice(count) {
    const dice = [];
    for (let i=0;i<count;i++) {
        dice.push(Math.random() * (6-1) + 1);
    }
    return dice;
}

const createDobletInstance = asyncHandler(async (req,res) => {
    const {id1} = req.body;
    const dobletObject = { "players": [{"id": id1}]};
    const gameInstance = await GameInstance.create(dobletObject);
    if (gameInstance) {
        res.status(201).json({message: `New game instance created`});
    }
    else {
        res.status(400).json({message: "Error 400"});
    }
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
    const {id} = req.body;
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
    console.log(game);
    return game;
});

const play = asyncHandler(async (req,res) => {
    const {id} = req.body;
    if (!id) {
        return res.status(400).json({message: "Game ID required"});
    }
    const game = await GameInstance.findById(id).exec();
    if (!game) {
        return res.status(400).json({message: "Game instance not found"});
    }
    console.log(game);
    const dice = rollDice(3);
    for (let i=0; i<3; i++) {
        if (canMove(game.currentPlayer, dice[i])) {
            if (allPlayedDown(currentPlayer)) {
                game.currentPlayer.phase = 2;
            }
            else if (gameOver()) {
                endGame(game.currentPlayer);
            }
        }
        else {
            // other player gets to use the move if possible
            if (canMove(game.otherPlayer, dice[i])) {
                if (allPlayedDown(game.otherPlayer)) {
                    game.otherPlayer.phase = 2;
                }
                else if (gameOver()) {
                    endGame(game.otherPlayer);
                }
            }
        }
        
    }

    if (game.winner) {
        return;
    }
    else {
        setCurrentPlayer(game.otherPlayer);
    }
});

module.exports = { createDobletInstance, deleteDobletInstance, play, getAllData}