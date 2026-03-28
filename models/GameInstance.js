const mongoose = require('mongoose');

const gameInstanceSchema = new mongoose.Schema({
    owner: {
        type: Object
    },
    players : {
        type: Array
    },
    invites: {
        type: Array
    },
    started : {
        type: Boolean,
        default: false
    }
}, {strict: false})

module.exports = mongoose.model('GameInstance', gameInstanceSchema);