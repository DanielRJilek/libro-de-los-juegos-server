const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
       type: String,
        required: true 
    },
    desc: {
        type: String,
        required: false
    },
}, {strict: false});

module.exports = mongoose.model('Game', gameSchema);