const mongoose = require('mongoose');

const gameInstanceSchema = new mongoose.Schema({
    players : [{
        id: {
            type: Number,
            required: false
        }
    }]
})

module.exports = mongoose.model('GameInstance', gameInstanceSchema);