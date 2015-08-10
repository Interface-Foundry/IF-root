// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;


// define the schema for our user model
var worldchatSchema = mongoose.Schema({
    roomID: String, //pointed @ bubble object ID
	kind: String, 
    nick: String, //address 
    userID: String,
    msg: String,
    pic: String,
    href: String,
    time: { type: Date, default: Date.now },
    avatar: String,
    sticker: {
	    img: String,
	    _id: String
    }
});


// create the model for users and expose it to our app
var db = require('./bubbllidb');
module.exports = db.model('worldchat', worldchatSchema);
