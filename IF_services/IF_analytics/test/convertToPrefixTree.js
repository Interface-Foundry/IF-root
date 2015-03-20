var mongoose = require('mongoose');
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


// Algoritm from Pensa - k-Anonymization of Sequences
Sequence.find().select('geohashSequence').exec(function(err, data) {
    if (err) {
        return console.error(err);
    }
    
    data.map(function(sequence) {
        var LP = LongestPrefixSearch(Root(PT), sequence);
        // Append T to LP TODO
        LP.map(function(v) {
            v.support = v.support + support(sequence);
        });

        sequence.map(v) { // T\LP?? TODO only nodes not in LP??
            v.support = support(sequence);
        }

    });
});
