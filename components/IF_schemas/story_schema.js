//This is the schema for the story responses
//Look at message_schema.js 

'use strict';

var mongoose = require('mongoose');
var storySchema = mongoose.Schema({
    answer: {
    	selected: String, //user response
    	handler: String, //how we're processing incoming button tap from user (i.e. story answer)
    	story_pointer: Number, //position in story
    	template_type: String, //button template i.e. survey1
    	text: String, //prompt question
    	action_type: String, //button probably
    	name: String //button label
    },
    ts: {
      type: Date,
      default: Date.now
    },
    origin: String,
    user: {
    	id: String,
        name: String
    },
    channel: {
        id: String,
        name: String
    },
    team: {
        id: String,
        domain: String
    }
});

module.exports = mongoose.model('Story', storySchema);