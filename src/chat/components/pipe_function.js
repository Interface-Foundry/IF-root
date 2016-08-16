
var co = require('co');
var kip = require('kip');
var queue = require('./queue-mongo');
var db = require('../../db');
var Chatuser = db.Chatuser;
var _ = require('lodash');
var request = require('request');
var async = require('async');
var fs = require('fs');
//set env vars
var config = require('../../config'); 

var send_to_pipe = function(json, menus, nlp) {
	 var key =  [json.source.origin, json.source.channel.toString(), json.ts].join('.');	
	 var message = new db.Message(json);
	 message.menus = menus;
	 message.nlp = nlp;
	 message.save().then(() => {
        queue.publish('incoming', message, key);
     });
} 


// [{ type: 'button', data: [ 'View Cart', 'Add to Cart', 'Amazon Link']}, { type: 'quick_reply', data: [ 'View Cart', 'Add to Cart', 'Amazon Link']}]