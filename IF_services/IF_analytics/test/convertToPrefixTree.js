var mongoose = require('mongoose');
var sequenceSchema = mongoose.Schema({
    analyticsUserId: String,
    lonLatSequence: [],
    geohashSequence: [String],
    bubbleSequence: [String]
});
var Sequence = mongoose.model('sequence', sequenceSchema);

var GeoTrie = require('./geo_trie_schema');

// test database
mongoose.connect('mongodb://localhost:37017', function(err) {
    if (err) {
        console.error(err);
    }
});


// Algoritm from Pensa - k-Anonymization of Sequences
Sequence.find().select('geohashSequence').exec(function(err, data) {
    if (err) {
        return console.error(err);
    }

    var i = 0;

    // add all the sequences to the prefix tree (trie)
    data.map(function(sequence) {
        GeoTrie.add(sequence.geohashSequence, function(err) {
            if (err) {
                return console.error(err);
            }

            console.log(i++);
        });
    });
});
