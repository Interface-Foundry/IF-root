// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var contestSchema = mongoose.Schema({
    headline: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    imgURL: {
        type: String
    },
    current: {type: Boolean, required: true}, //is this the current active contest or not 
    region: {
        type: String,
        default: 'global'
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date},
    contestTag: [{type: String, index: true}] ,
    subheading:{type: String}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contest', contestSchema);

