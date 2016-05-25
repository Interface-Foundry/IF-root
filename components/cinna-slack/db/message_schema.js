'use strict';

var mongoose = require('mongoose');
var amazonResult = mongoose.Schema;
var modifyVal = mongoose.Schema;
var messageSchema = mongoose.Schema({

    thread_id: {
      type: String,
      index: true
    },
    ts: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    user_id: String,
    origin: String,
    source: {},
    incoming: Boolean, //if true, incoming message, if false, outgoing message
    original_text: String, //raw incoming message (if applicable)

    //
    // Kip processing stuff
    //
    text: String, //incoming message (if applicable), pre-processed
    tokens: [String], //broken up incoming message (if applicable)
    execute: [{
      mode: String,
      action: String,
      params: {}
    }],
    amazon: [mongoose.Schema.Types.Mixed], //amazon search results

    //
    // Response
    //
    client_res: [mongoose.Schema.Types.Mixed], //outgoing messages, if applicable
    mode: String, // the mode we left off in
    action: String, // the last action we did

    //
    // Miscellaneous probably will get removed eventually
    //
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
