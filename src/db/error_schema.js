var mongoose = require('mongoose');

// stores any sort of error
var errorSchema = mongoose.Schema({
    // required
    message: {
      type: String
    },
    stack: String,
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
module.exports = mongoose.model('Errors', errorSchema);
