// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

// ANNOUCEMENTS | Add announcement schema (timestamp, region: 'global') 
// with ability for super user to add announcements in object array 
// (headline, html body, URL, priority #,. maybe img url) @mitsuakiuchimoto 

var announcementsSchema = mongoose.Schema({
    headline: {
        type: String,
        required: true
    }, 
    body: {
        type: String,
        required: true
    }, 
    URL: {
        type: String,
        required: true,
        default:'www.google.com'
    }, 
    priority: {type: Number, default:1},
    live: {type: Boolean},
    region: {
        type: String,
        default: 'global'
    },
    timestamp: { type: Date, default: Date.now }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('announcements', announcementsSchema);