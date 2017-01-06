var mongoose = require('mongoose')

// stores any sort of error
var couponSchema = mongoose.Schema({
  // required
  coupon_code: {
    type: String,
    required: true
  },

  quanitity_coupon_can_be_used: { // number of times a coupon can be used
    type: Number
    default: 1
  },

  quanitity_coupon_used: {
    type: Number
    default: 0
  }

  coupon_type: {
    type: String, // either percentage or fixed amount (i.e. 5$ off or 50% off)
    required: true
  },

  promotion: {
    type: String, // promotion if its related to like press or idk
  }

  coupon_discount: Number, // number that is either hard coded i.e. $5 or amount of order

  coupon_order: [{
    order_amount: Number, // value of their order
    order_used_with: String, // something related to the order we are using with
    user_id: String,
  }],

  expiration: {
    type: Date
  },

  // who used it
  team_id: String,

  //
  used: {
    type: Boolean,
    default: false
  }
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Coupon', couponSchema)
