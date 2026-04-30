const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    icon: String
}, { _id: false });

const inviteSchema = new mongoose.Schema({
    table: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'GameInstance', required: true },
        title: String
    },
    sender: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String
    }
}, { _id: false });

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
    icon: {
       type: String
    },
    friends: {
        type: [friendSchema]
    },
    friendRequests: {
        type: [friendSchema]
    },
    activeGames: {
        type: Array
    },
    invites: {
        type: [inviteSchema]
    }
}, {strict: false})

module.exports = mongoose.model('User', userSchema);