var mongoose = require('mongoose')
var accounting = require('accounting')

/**
 *  The data format we get back from Delivery.com when we inspect the cart
 *
 */

var deliveryCart = mongoose.Schema({

  // For team carts it is a team id, for personal carts it is their user id
  slack_id: String,

  laundry_delivery_times: [],

  tax: Number,

  delivery_fee: Number,

  fees: [Number],

  message: [String],

  total: Number,

  delivery_points_multiplier: Number,

  // Xo_after tax charges: [Number],

  item_count: Number,

  // order_time: "2016-10-04T19:00:00+0000", // TODO: find out about Mongoose's date/time formatting

  asap: Boolean,

  convenience_fee: Number,

  delivery_points: Number,

  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryItem'
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

  type: String,

  link: String

})

deliveryCart.set('toObject', { getters: true, virtuals: true })
deliveryCart.set('toJSON', { getters: true, virtuals: true })

var DeliveryCart = mongoose.model('DeliveryCart', deliveryCart)

module.exports = DeliveryCart
