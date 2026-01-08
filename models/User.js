const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
       type: String,
        required: true 
    },
    active: {
        type: Boolean,
        default: true
    },
    friends: {
        type: Array
    },
    friendRequests: {
        type: Array
    },
    activeGames: {
        type: Array
    },
    invites: {
        type: Array
    }
}, {strict: false})

module.exports = mongoose.model('User', userSchema);