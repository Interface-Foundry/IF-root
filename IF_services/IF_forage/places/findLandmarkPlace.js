var db = require('db');
var Promise = require('bluebird');
var search = require('./searchForPlace');

db.Landmarks.find({world: true, 'addressString': {$exists: true}, 'source_google.place_id': {$exists: false}})
    .exec()
    .then(function(results) {
        console.log('found', results.length);
        return Promise.all(results.map(function(r) {
            if (!r.loc || !r.loc.coordinates) {
                console.error('could not process:\n', r);
                return;
            }
            return search({lon: r.loc.coordinates[0], lat: r.loc.coordinates[1]}, r.name, r.addressString)
                .then(function(google_stuff) {
                    r.source_google = google_stuff; // TODO make conform with source_google in the schema
                    return r;
                }, function(err) {
                    console.error('error for place', r._id);
                    console.error(err);
                });
        }));
    })
    .then(function(results) {
        return Promise.all(results.map(function(r) {
            if (r && r.save) {
                return r.save().exec();
            }
        }))
    })
    .then(function() {
        console.log('done');
    }, console.error.bind(console));