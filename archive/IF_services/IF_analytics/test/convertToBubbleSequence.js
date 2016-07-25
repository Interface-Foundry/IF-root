var mongoose = require('mongoose');
var lonLatToBubble = require('../lonLatToBubble');
var Sequence = require('./sequence_schema');
var async = require('async');


// test database
mongoose.connect('mongodb://localhost:27017/if', function(err) {
  if (err) {
    console.error(err);
  }
});



var unset_value = 'bubble_id'; // this is what will be there if the bubble id hasn't been set yet

// We will reduce the full lon-lat sequence to just the bubbles.
// so like [24, 42], [24, 53], [58, 35] might go from 3 points to just 2 bubbles.

Sequence.find({})
  .exec(function(err, sequences) {
    if (err) {
      console.error(err);
      return;
    }

    // do all the sequences
    sequences.map(function(seq) {

      // convert lonLatSequence to bubbleSequence
      async.reduce(seq.lonLatSequence, [], function(memo, lonlat, cb) {
        lonLatToBubble(lonlat, function(err, bubble) {
          if (err) {
            cb(err);
          }

          if (bubble && bubble._id) {
            memo.push(bubble._id);
            cb(null, memo);
          }
        })
      }, function(err, bubbleSequence) {
        seq.bubbleSequence = bubbleSequence;
        if (bubbleSequence.length > 0) {
          console.log(bubbleSequence);
        }
        seq.save(function(err) {
          if (err) {
            console.error(err);
          }
        })
      });
    });
  });