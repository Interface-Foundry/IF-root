// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var contestEntrySchema = mongoose.Schema({
    userTime: { type: Date, default: Date.now },
    userID: { type: String, index: true},
    userName: String,
    worldID: String,
    worldName: String,
    valid: Boolean, //valid or not
    contestTag: [{type: String, index: true}], 
    userLat: Number,
    userLng: Number,
    imgURL: String,
    //'harversine' calculation?
    distanceFromWorld: Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contestEntry', contestEntrySchema);
