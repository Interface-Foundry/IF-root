'use strict';

var mongoose = require('mongoose');
var amazonResult = mongoose.Schema;
var modifyVal = mongoose.Schema;
var messageSchema = mongoose.Schema({
    id: { type: String, index: true },
    source: {
        origin: String,
        channel: String,
        org: String
    },
    ts: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chatuser', chatuserSchema);

