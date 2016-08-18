//This is the schema for the story responses
//Look at message_schema.js 

'use strict';

var mongoose = require('mongoose');
var storyAnswers = mongoose.Schema({
    id: {
      type: String,
      unique: true,
      index: true
    },
    answers: [{
    	selected: String, //user response
    	handler: String, //how we're processing incoming button tap from user (i.e. story answer)
    	story_pointer: Number, //position in story
    	template_type: String, //button template i.e. survey1
    	text: String, //prompt question
    	type: String, //button probably
    	name: String //button label
    }],
    ts: {
      type: Date,
      default: Date.now
    },
    origin: String,
    user: {
    	team_id: String,
    	user_id: String,
    	name: String,
    	channel_id: String
    }
});

module.exports = mongoose.model('storyAnswers', storyAnswers);