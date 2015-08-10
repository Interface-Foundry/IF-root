// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;


// define the schema for our user model
var visitSchema = mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    userID: String,
    userName: String,
    worldID: String
});


// create the model for users and expose it to our app
var db = require('./bubbllidb');
module.exports = db.model('visit', visitSchema);
