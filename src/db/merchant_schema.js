var mongoose = require('mongoose');

// stores any sort of merchants
var merchantsSchema = mongoose.Schema({
    // required
    id: {
      type: String,
      index: true
    },
    data: {},

    // automagic
    first_searched: {
      type: Date,
      default: Date.now
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Merchants', merchantsSchema);
