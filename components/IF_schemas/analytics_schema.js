// load the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectID = Schema.ObjectID;

// stores any sort of analytics that we might want to use for training algorithms
var analyticsSchema = mongoose.Schema({

    analyticsUserId: { type: Schema.Types.ObjectId, ref: 'anonusers', required: true}, // required
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

// Validate analyticsUserId
// (automatically checks that it's a mongoid already, just check that it's valid now)
analyticsSchema.path('analyticsUserId').validate(function(value, cb) {
    mongoose.model('anonusers').findById(value, function(err, doc) {
        if (err || !doc) {
            cb(false);
        } else {
            // maybe check the anonuser doc that was returned?
            cb(true);
        }
    });
});

analyticsSchema.index({loc:'2dsphere'});

// create the model for users and expose it to our app

var db = require('./bubbllidb');
module.exports = db.model('analytics', analyticsSchema);
