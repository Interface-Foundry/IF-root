// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

//(headline, html body, URL, priority #,. maybe img url) 
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
        required: true
    }, 
    priority: {type: Number},
    imgURL: {
        type: String,
        required: true
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('announcements', announcementsSchema);