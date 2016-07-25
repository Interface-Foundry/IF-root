/**
 * This file creates mock data for user geolocation logs
 *
 * it models users walking around NYC randomly
 *
 */
var mongoose = require('mongoose');
var analytics = require('../../../components/IF_schemas/analytics_schema');

// test database
mongoose.connect('mongodb://localhost:37017', function(err) {
    if (err) {
        console.error(err);
    }
});

/**
 * Random walk
 * @param oldPoint [lon lat]
 */
var getNextGeoPoint = function(oldPoint) {
    var maxDistance = 100; //m, not exact

    var distance = Math.random()*maxDistance;
    var direction = Math.random()*2*Math.PI;

    var newPoint = [
        oldPoint[0] + distance * 2/(111131.75 + 78846.81) * Math.cos(direction),
        oldPoint[1] + distance * 2/(111131.75 + 78846.81) * Math.sin(direction)
    ];

    // todo don't run into buildings

    return newPoint;
};

/**
 * Logs user {is, loc, time} stuff to the db
 */
var logDataPoint = function(user) {
    var a = new analytics({
        analyticsUserId: user.id,
        userTimestamp: user.time,
        serverTimestamp: user.time,
        sequenceNumber: user.sequenceNumber,
        loc: {type: 'Point', coordinates: user.loc},
        action: 'geoloc.update',
        data: {}
    });
    a.save(function(err, a) {
        if (err) {
            console.error(err);
            return;
        }

        // progress
        if (a.sequenceNumber%100 == 0) {
            console.log(a.analyticsUserId, a.sequenceNumber);
        }
    });
};



var numberUsers = 100;
var startingPoint = [-73.9878516, 40.7384012];
var startingTime = 1426803177615;

for (var i = 0; i < numberUsers; i++) {
    var determinationOfUser = Math.random()*1000|0; // how many datapoints they take

    var user = {
        id: i,
        loc: startingPoint,
        time: new Date(startingTime + Math.random()*1000*60*60),
        sequenceNumber: 0
    };

    for (var j = 0; j < determinationOfUser; j++) {
        user.loc = getNextGeoPoint(user.loc);
        user.time = new Date(user.time.getTime() + Math.random()*1000*60*20); // add some time between 0-20 minutes
        user.sequenceNumber++;

        // randomly drop datapoints
        if (Math.random() < .95) {
            logDataPoint(user);
        }
    }
}

