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
    },
    completed: {
        type: Boolean,
        default: false
    },
    winner: {
        type: Object,
        required: false
    },
}, {strict: false})

module.exports = mongoose.model('GameInstance', gameInstanceSchema);