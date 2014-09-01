var mongoose = require('mongoose');

var BubbleObject = new mongoose.Schema({
  loc: {
    type: {
      type: String
    },
    coordinates: []
  },
  startTime: Date,
  endTime: Date
});

BubbleObject.index({loc:'2dsphere'});

module.exports = mongoose.model('Bubble', BubbleObject);
