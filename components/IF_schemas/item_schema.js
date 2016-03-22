var mongoose = require('mongoose');

/**
 * Save an item in a cart
 */
var item = mongoose.Schema({
  cart_id: mongoose.Schema.ObjectId,
  
  title: String,

  link: String,

  image: String,

  description: String,

  price: String,

  ASIN: String,

  rating: Number,

  review_count: Number,

  added_by: String,

  slack_id: String,

  source_json: String,  // make sure to do JSON.stringify()

  purchased: {
    type: Boolean,
    default: false
  },

  deleted: {
    type: Boolean,
    default: false
  },

  added_date: {
    type: Date,
    default: Date.now
  }

});


var Item = mongoose.model('Item', item);

module.exports = Item;
