// load the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectID = Schema.ObjectID;

var contestEntrySchema = mongoose.Schema({
    userTime: {
        type: Date,
        default: Date.now
    },
    userID: {
        type: String,
        index: true
    },
    userName: String,
    worldID: String,
    worldName: String,
    region: {
        type: String,
        default: 'global'
    },
    valid: {type:Boolean,default:true}, //valid or not
    contestTag: [{
        tag: {
            type: String,
            index: true
        }
    }],
    userLat: Number,
    userLng: Number,
    imgURL: String,
    contestId: {type: Schema.Types.ObjectId, ref: 'contest'},
    distanceFromWorld: Number
});

// create the model for users and expose it to our app
module.exports = mongoose.model('contestEntry', contestEntrySchema);