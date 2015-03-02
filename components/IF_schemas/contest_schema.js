// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

var contestSchema = mongoose.Schema({

    timestamp: { type: Date, default: Date.now },
    userID: String,
    userName: String,
    worldID: String,
    v: Boolean,
    userLat: String,
    userLng: String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('contests', contestSchema);
