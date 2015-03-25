// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

// stores any sort of analytics that we might want to use for training algorithms
var analyticsSchema = mongoose.Schema({

    analyticsUserId: String, // required
    userId: String, // optional, can remove if the user opts out of tracking?
    hashedSessionId: String, // for stringing session data together.
                             // we can't store the actual session id,
                             // because it's tied to user_id
    platform: String, // mobile.ios.7, mobile.android.5.1, web.chrome, web.safari?
    userTimestamp: Date,
    serverTimestamp: Date,
    sequenceNumber: Number, // starts at zero when a person opens the app, makes sure we know we missed something
    loc: {
        type: {
            type: String //GeoJSON-'point'
        },
        coordinates: []
    },
    action: String, // allows you to prefix stuff if you want. like location.found or location.lostSignal
    data: {} // free-form data logged by the application
});


analyticsSchema.index({loc:'2dsphere'});

// create the model for users and expose it to our app
module.exports = mongoose.model('analytics', analyticsSchema);
