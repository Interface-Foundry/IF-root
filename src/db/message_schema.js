'use strict'

var mongoose = require('mongoose')
var amazonResult = mongoose.Schema
var modifyVal = mongoose.Schema
var messageSchema = mongoose.Schema({
  thread_id: {
    type: String,
    index: true
  },
  cart_reference_id: String, // not the mongo _id of a cart object, but like the slack team_id
  ts: {
    type: Date,
    default: Date.now
  },
  slack_ts: String,
  replace_ts: String,
  resolved: {
    type: Boolean,
    default: false
  },
  user_id: String,
  origin: String,
  source: {},
  incoming: Boolean, // if true, incoming message, if false, outgoing message

  //
  // content
  //
  original_text: String, // raw incoming message (if applicable)
  slack_action: {}, // slack button tap stuff

  //
  // Kip processing stuff
  //
  text: String, // incoming message (if applicable), pre-processed
  allow_text_matching: Boolean, // allow text to match for fuzzy matching
  text_matching: {}, // if we use allow_text_matching, store matched in here
  tokens: [String], // broken up incoming message (if applicable)
  execute: [{
    mode: String,
    action: String,
    params: {}
  }],
  amazon: String, // amazon search results, stringified

  //
  // Response
  //
  client_res: [mongoose.Schema.Types.Mixed], // outgoing messages, if applicable
  mode: String, // the mode we left off in
  action: String, // the last action we did
  focus: Number,
  data: {},
  state: {}, // state information about the context of the conversation

  //
  // Miscellaneous probably will get removed eventually
  //
  parent: {
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
  urlShorten: [String],
  flags: {
    // stuff for supervisor
    toSupervisor: Boolean, // messages coming from cinna to supervisor
    toClient: Boolean, // messages going from supervisor to cinna to client
    toCinna: Boolean, // messages going from supervisor to cinna only (previewing search results)
    searchResults: Boolean, // messages coming from cinna to supervisor that are search preview result sets
    recalled: Boolean, // flag to bypass history function in cinna
    // stuff for email
    email: Boolean
  },
  click: {
    productId: String,
    url: String,
    IP: String,
    headers: String
  },
  slackData: {
    callback_id: String
  },
  original_query: String,
  reply: mongoose.Schema.Types.Mixed,
  menus: {
    id: String,
    original: [{data: [], weight: Number}],
    expandable: [{data: [], weight: Number}]
  }
})

module.exports = mongoose.model('Message', messageSchema)
