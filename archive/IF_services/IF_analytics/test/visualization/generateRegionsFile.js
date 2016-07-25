var mongoose = require('mongoose');
var geohash = require('ngeohash');


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


var fs = require('fs');

Sequence.find().select('lonLatSequence').exec(function(err, data) {
    if (err) {
        console.log(err);
        return;
    }

    // data is [{lonlatsequence:[[lon,lat]]}]

    fs.writeFileSync('trajectoryData2.js', 'trajectories = ' + JSON.stringify(data.map(function(d) {
        // convert from lonlat to latlon
        // d is {lonlatsequence: [ [lon,lat] ] }
        return d.lonLatSequence.map(function(lonlat) {
            var g = geohash.encode(lonlat[1], lonlat[0]);
            return geohash.decode(g.substr(0,7));
        });
    })));
    process.exit(0);

});