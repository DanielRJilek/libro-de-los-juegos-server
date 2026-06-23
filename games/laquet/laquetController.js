const asyncHandler = require('express-async-handler');
const GameInstance = require('../../models/GameInstance');
const User = require('../../models/User');
const Laquet = require('./Laquet');
const endGame = require('../../controllers/gameInstanceController').endGame;
const { getIo } = require('../../socket');
const { emitTableUpdate } = require('../../socket/emitters');
const { TABLE_UPDATE_KIND } = require('../../socket/events');


const createInstance = asyncHandler(async (req,res) => {
});

const startGame = asyncHandler(async (req,res) => {
});

const rollDice = asyncHandler(async (req,res) => {
});

const play = asyncHandler(async (req,res) => {
});