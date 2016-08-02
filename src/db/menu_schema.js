var mongoose = require('mongoose');

// stores any sort of merchants
var menuSchema = mongoose.Schema({
    // required
    merchant_id: {
      type: String,
      index: true
    },
    raw_menu: {},

    // automagic
    first_searched: {
      type: Date,
      default: Date.now
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Menus', menuSchema);
