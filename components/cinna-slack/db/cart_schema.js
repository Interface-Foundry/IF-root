var mongoose = require('mongoose');
var accounting = require('accounting');

/**
 * cart and cart status stuff
 */
var cart = mongoose.Schema({
  // amazon stuff
  amazon: {},

  // For team carts it is a team id, for personal carts it is their user id
  slack_id: String,

  // list of object ids in the cart
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],

  purchased: {
    type: Boolean,
    default: false
  },

  deleted: {
    type: Boolean,
    default: false
  },

  created_date: {
    type: Date,
    default: Date.now
  },

  purchased_date: {
    type: Date
  },

  link: String

});

//
// aggregate_items is an array grouped by item ASIN with quantities etc
// note that you must call .populate('items') to use this
//
cart.virtual('aggregate_items').get(function() {
  var hash = this.items.reduce(function(hash, i) {
    if (!hash[i.ASIN]) {
      hash[i.ASIN] = i.toObject();
      hash[i.ASIN].added_by = [];
      hash[i.ASIN].quantity = 0;
    }
    hash[i.ASIN].quantity ++;
    if (hash[i.ASIN].added_by.indexOf(i.added_by) < 0) {
      hash[i.ASIN].added_by.push(i.added_by);
    }
    return hash;
  }, {})

  return Object.keys(hash).filter(function(k) {
    return hash.hasOwnProperty(k)
  }).map(function(k) {
    return hash[k];
  })
})

//
// Total is the cart total price (since amazon's subtotal is buggy)
//
cart.virtual('total').get(function() {
  return accounting.formatMoney(this.items.reduce(function(total, i) {
    return total + accounting.parse(i.price);
  }, 0))
})

cart.set('toObject', { getters: true, virtuals: true });
cart.set('toJSON', { getters: true, virtuals: true });

var Cart = mongoose.model('Cart', cart);

module.exports = Cart;
