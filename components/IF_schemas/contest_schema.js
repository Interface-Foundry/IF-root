// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var contestSchema = mongoose.Schema({
    userTime: { type: Date, default: Date.now },
    userID: { type: String, index: true},
    userName: String,
    worldID: String,
    worldName: String,
    v: Boolean, //valid or not
    contestTag: { type: String, index: true}, //hashtag 
    userLat: Number,
    userLng: Number,
    imgURL: String,
    // distancefrombubble field property harversin property???
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contests', contestSchema);
