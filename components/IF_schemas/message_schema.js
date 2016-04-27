'use strict';

var mongoose = require('mongoose');
var amazonResult = mongoose.Schema;
var modifyVal = mongoose.Schema;
var messageSchema = mongoose.Schema({
    incoming: Boolean, //if true, incoming message, if false, outgoing message
    msg: String, //raw incoming message (if applicable)
    tokens: [String], //broken up incoming message (if applicable)
    bucket: { type: String, index: true},
    action: { type: String, index: true},
    amazon: [mongoose.Schema.Types.Mixed], //amazon search results
    dataModify: {
        type: {type: String},
        val: [mongoose.Schema.Types.Mixed],
        param: String
    },
    source: {
        origin: String,
        channel: String,
        org: String,
        id: { type: String, index: true },
        flag: String
    },
    client_res: [mongoose.Schema.Types.Mixed], //outgoing messages, if applicable
    ts: {
        type: Date,
        default: Date.now
    },
    resolved: {
        type: Boolean,
        default: false
    },
    parent:{
        id: String
    },
    thread: {
        id: String,
        sequence: Number,
        isOpen: Boolean,
        ticket: {
            id: String, 
            isOpen: Boolean
        },
        parent: {
            isParent: Boolean,
            id: String
        }
    },
    urlShorten:[String],
    flags: {
            //stuff for supervisor
            toSupervisor: Boolean, //messages coming from cinna to supervisor
            toClient: Boolean, //messages going from supervisor to cinna to client
            toCinna: Boolean, // messages going from supervisor to cinna only (previewing search results)
            searchResults: Boolean, //messages coming from cinna to supervisor that are search preview result sets
            recalled: Boolean, //flag to bypass history function in cinna
            //stuff for email
            email: Boolean
        },
    click: {
        productId: String,
        url: String,
        IP: String,
        headers:String
    },
    slackData: {
        callback_id: String
    }
});

module.exports = mongoose.model('Message', messageSchema);

