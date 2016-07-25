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
        id: { type: String, index: true }
    },
    client_res: [mongoose.Schema.Types.Mixed], //outgoing messages, if applicable
    ts: {
        type: Date,
        default: Date.now
    },
    //Delete dis
    // resolved: {
    //     type: Boolean,
    //     default: false
    // },
    //Delete dis 
    // parent:{
    //     id: String
    // },
    thread: {
        id: String,
        sequence: Number,
        isOpen: Boolean,
        ticket: {
            id: String, 
            isOpen: Boolean
        },
        parent: {
            isParent:Boolean,
            id:String
        }
    },
    urlShorten:[String],
    flags: {
            toSupervisor: Boolean, //messages coming from cinna to supervisor
            toClient: Boolean, //messages going from supervisor to cinna to client
            toCinna: Boolean, // messages going from supervisor to cinna only (previewing search results)
            searchResults: Boolean, //messages coming from cinna to supervisor that are search preview result sets
            recalled: Boolean, //flag to bypass history function in cinna
            toTrain: Boolean //flag to mark for later training if supervisor is AFK mode
        }
});

module.exports = mongoose.model('Message', messageSchema);


