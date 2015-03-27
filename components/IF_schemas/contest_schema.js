// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var contestSchema = mongoose.Schema({
    headline: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    htmlBody: {
        type: String,
        required: true
    },
    imgURL: {
        type: String
    },
    live: {
        type: Boolean,
        required: true,
        default:true
    },
    region: {
        type: String,
        default: 'global'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    contestTag: [{
        tag: {
            type: String,
            index: true
        },
        title: {
            type: String
        }
    }],
    subheading: {
        type: String
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contest', contestSchema);