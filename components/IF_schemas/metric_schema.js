var mongoose = require('mongoose');

// stores any sort of metrics
var metricsSchema = mongoose.Schema({
    // required
    metric: {
      type: String,
      index: true
    },
    data: {},

    // optional
    userId: String, // optional

    // automagic
    timestamp: {
      type: Date,
      default: Date.now
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Metrics', metricsSchema);

module.exports.log = function(obj) {
  (new module.exports(obj)).save();
}
