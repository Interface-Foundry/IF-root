// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;


// define the schema for our user model
var anonUserSchema = mongoose.Schema({

    instances: [{
        // sessionID: String,
        userTime: { type: Date, default: Date.now },
        // loc: { //user inputted loc
        //     type: {
        //         type: String //GeoJSON-'point'
        //     },
        //     coordinates: []
        // },
        // loc_info: {
        //     country: String,
        //     city: String
        // },
        // interaction:{
        selectedUploadType: String,
        closedNoLogin: Boolean,
        signedUp: Boolean
        // }

    }]
});


//landmarkSchema.index({loc:'2dsphere'});

// create the model for users and expose it to our app
module.exports = mongoose.model('anonusers', anonUserSchema);
