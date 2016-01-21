'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;
var messageSchema = mongoose.Schema({
    id: Number, //to keep track of state index in redux
    incoming: { type: Boolean, default: true } , //if true, incoming message, if false, outgoing message
    msg: String, //raw incoming message (if applicable)
    tokens: [String], //broken up incoming message (if applicable)
    bucket: String,
    action: String,
    amazon: [Schema.Types.Mixed], //amazon search results
    dataModify: {
        type: {
            type: String
        },
        val: [Schema.Types.Mixed],
        param: String
    },
    source: {
        origin: String,
        channel: String,
        org: String,
        id: String
    },
    client_res: [Schema.Types.Mixed],
    ts: {
        type: Date,
        default: Date.now
    },
    resolved: {
        type: Boolean,
        default: false
    },
    parent: String
});

module.exports = mongoose.model('Message', messageSchema);