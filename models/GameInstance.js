const mongoose = require('mongoose');

const gameInstanceSchema = new mongoose.Schema({
    owner: {
        type: String
    },
    players : {
        type: Array
    }
}, {strict: false})

module.exports = mongoose.model('GameInstance', gameInstanceSchema);