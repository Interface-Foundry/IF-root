var mongoose = require('mongoose');
var analytics = require('../../../components/IF_schemas/analytics_schema');


var sequenceSchema = mongoose.Schema({
  analyticsUserId: String,
  lonLatSequence: [],
  geohashSequence: [String],
  bubbleSequence: [String]
});

var Sequence = module.exports = mongoose.model('sequence', sequenceSchema);
