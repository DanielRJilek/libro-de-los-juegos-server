const mongoose = require('mongoose');

const iconSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
}, {strict: false});

module.exports = mongoose.model('Icon', iconSchema);