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
    loc: { 
        type: {
            type: String //GeoJSON-'point'
        },
        coordinates: []
    },
    imgURL: {
        type: String,
        required: true
    },
    current: {type: Boolean, required: true}, //is this the current active contest or not 
    region: {
        type: String,
        default: 'global'
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date},
    contestTag: {type: String, enum: ['wantit','getit'], index: true} 
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contest', contestSchema);

