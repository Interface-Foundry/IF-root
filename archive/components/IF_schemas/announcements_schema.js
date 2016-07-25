// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var announcementsSchema = mongoose.Schema({
    headline: {
        type: String,
        required: true
    }, 
    body: {
        type: String,
        required: true
    }, 
    urlPath: {
        type: String
    }, 
    urlName: {
        type: String
    }, 
    priority: {type: Number, default:1},
    live: {type: Boolean, default:false},
    region: {
        type: String,
        default: 'global'
    },
    timestamp: { type: Date, default: Date.now }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('announcements', announcementsSchema);