var mongoose = require('mongoose');
var analytics = require('../../../components/IF_schemas/analytics_schema');


var sequenceSchema = mongoose.Schema({
    analyticsUserId: String,
    lonLatSequence: [],
    geohashSequence: [String],
    bubbleSequence: [String]
});

var Sequence = mongoose.model('sequence', sequenceSchema);


// test database
mongoose.connect('mongodb://localhost:37017', function(err) {
    if (err) {
        console.error(err);
    }
});



/**
 * We're going to convert our individually logged datapoints to sequences in the db
 */

////  Find all the users with unsequenced data, group by user id or something
analytics
    .distinct('analyticsUserId', {action: 'geoloc.update', 'data.sequenceProcessed': {$ne: true}})
    .exec(function(err, ids) {
        if (err) {
            console.error(err);
        }

        //// run through allll the users.  so many queries, might break the computer....
        ids.forEach(function(id) {
            // only insert continuous sequences
            // we can tell if a sequence is continuous from the sequenceNumber in the data field
            analytics
                .find({analyticsUserId: id, action: 'geoloc.update', 'data.sequenceProcessed': {$ne: true}})
                .sort('sequenceNumber')
                .exec(function(err, data) {
                    // we'll log three sequences:
                    var lonLatSequence = [];
                    var geohashSequence = [];
                    var bubbleSequence = [];

                    var sequenceNumber = -9928309; // starting over
                    data.forEach(function(point) {
                        if (point.sequenceNumber - sequenceNumber != 1) {
                            debugger;
                            // sequence broken.  log it
                            if (lonLatSequence.length > 0) {
                                new Sequence({
                                    analyticsUserId: point.analyticsUserId,
                                    lonLatSequence: lonLatSequence,
                                    geohashSequence: geohashSequence,
                                    bubbleSequence: bubbleSequence
                                }).save(function(err) {
                                        if (err) {
                                            console.error(err);
                                        }
                                    });
                            }

                            // start a new sequence
                            lonLatSequence = [];
                            geohashSequence = [];
                            bubbleSequence = [];
                        }

                        lonLatSequence.push(point.loc.coordinates);
                        geohashSequence.push(lonLatToGeohash(point.loc.coordinates));
                        bubbleSequence.push(lonLatToBubble(point.loc.coordinates));
                        sequenceNumber = point.sequenceNumber;
                    });
                });
        })

});


var geohash = require('ngeohash');
function lonLatToGeohash(lonlat) {
    return geohash.encode(lonlat[1], lonlat[0]); //default precision is 9 chars... perfect!
}

function lonLatToBubble(lonlat) {
    // TODO
    return 'bubble_id';
}
