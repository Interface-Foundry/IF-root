// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;


// define the schema for our user model
var worldchatSchema = mongoose.Schema({
    roomID: String, //pointed @ item ID
    userID: String,
    msg: String,
    time: { type: Date, default: Date.now },
    avatar: String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('worldchat', worldchatSchema);
