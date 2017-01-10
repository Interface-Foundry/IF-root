var mongoose = require('mongoose')

// stores any sort of error
var couponSchema = mongoose.Schema({

  // team its for
  team_id: {
    type: String,
    required: true
  },

  coupon_code: {
    type: String,
    required: true
  },

  quantity_coupon: {
    used: {
      type: Number,
      default: 0
    },
    can_be_used: {
      type: Number,
      default: 1
    }
  },

  coupon_type: {
    type: String, // either percentage or fixed amount (i.e. 5$ off or 50% off)
    enum: ['amount_off', 'percentage'],
    required: true
  },

  coupon_discount: Number, // number that is either hard coded i.e. $5 or amount of order
  coupon_limit: Number, // if we need to limit on % off or something
  promotion: String, // promotion if its related to like press or idk

  coupon_order: [{
    order_amount: Number, // value of their order
    user_id: String,
    foodsession_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "delivery"
    }
  }],


  // if coupon is available to be used i.e. if its been used or not.
  // generally is used >= can_be_used
  available: {
    type: Boolean,
    default: true
  },

  time: {
    created: {
      type: Date,
      default: Date.now
    },
    expiration: Date,
    used: Date
  }
})

couponSchema.post('init', function (coupon) {
  if (coupon.quantity_coupon.can_be_used <= coupon.quantity_coupon.used) {
    coupon.available = false
    coupon.save()
  }
})


// create the model for users and expose it to our app
module.exports = mongoose.model('Coupon', couponSchema)
