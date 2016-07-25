'use strict';

var mongoose = require('mongoose');

var channelSchema = mongoose.Schema({
    name: String,
    id: {
        type: String,
        unique: true
    },
    resolved: {
        type: Boolean,
        default: false
    },
    AFK: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Channel', channelSchema);