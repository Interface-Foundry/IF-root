var mongoose = require('mongoose');

// our prefix tree is a mongo database

// the number of documents in the tree is equal to the number of distinct geohashes that start a sequence.

// this is useful because someone walking down 5th ave from a hotel is probably not going to the same
// place as the person walking down 5th ave starting from best buy
var geoTrieSchema = mongoose.Schema({
    geohash: String,
    item: {}, // don't know what goes here yet
    support: Number,
    children: {} // hash table
});

// geohash precision
var PRECISION = 9;

/**
 * Add a sequence of geohashes to the trie
 * @param sequence
 * @param cb callback(err)
 */
geoTrieSchema.statics.add = function(sequence, cb) {
    var GeoTrie = this;
    if (typeof cb == 'undefined') {
        cb = function() {};
    }
    if (!sequence || !sequence.length) {
        return cb(); // trivial case is ok
    }

    if (typeof sequence[0] !== 'string') {
        return cb(new Error("Can only add sequences of string geohashes"));
    }

    var rootGeohash = sequence[0].substr(0, PRECISION).toLowerCase();

    GeoTrie.findOne({geohash: rootGeohash}).exec(function(err, trie) {
        if (err) {
            debugger;
            cb(err);
        }

        // make a new one for new root geohashes
        if (!trie) {
            trie = new GeoTrie();
            trie.geohash = rootGeohash;
            trie.support = 0;
            trie.children = {};
        }

        // if we're on the tree for A, and we had the original string Animorphs,
        // then we would be calling addSubSequence(A_trie, 'nimorphs')
        // then we would recurse and call addSubSequence(An_trie, 'imorphs')
        function addSubSequence(trie, sequence) {
            trie.support++;

            if (!trie.children) {
                trie.children = {};
            }

            if (!sequence || sequence.length == 0) {
                // no more nodes to visit
                return;
            }

            var next_geohash = sequence[0].substr(0, PRECISION).toLowerCase();

            if (!trie.children[next_geohash]) {
                trie.children[next_geohash] = {
                    support: 0
                }
            }

            addSubSequence(trie.children[next_geohash], sequence.slice(1));
        }

        addSubSequence(trie, sequence.slice(1));
        trie.save(function(err) {
            if (err) {
                cb(err);
            } else {
                cb();
            }
        });
    });

};


// register
var GeoTrie = module.exports = mongoose.model('geotrie', geoTrieSchema);

