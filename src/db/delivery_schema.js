var mongoose = require('mongoose')

/**
 * Save delivery sessions
 */
var deliverySchema = mongoose.Schema({
  active: {
    type: Boolean
  },
  session_id: mongoose.Schema.ObjectId,
  team_id: String,
  team_members: [], // who is in the order
  chosen_location: {}, // from slackbot.meta.locations
  chosen_restaurant: {
    id: String,
    name: String,
    url: String,
    minimum: Number
  },
  menu: {}, // the actual menu for the chosen merchant
  merchants: [], // all possible merchants (based on location)
  cuisines: [], // don't confuse this with votes below

  // contains all the items that are in the cart and all the items that a user is working on
  // each user can add multiple items to the cart
  cart: [{
    user_id: String,
    added_to_cart: {type: Boolean, default: false},
    item: {
      item_id: Number, // the item.unique_id
      item_qty: Number,
      option_qty: {}, // hash of {unique_id, quantity} pairs
      item_label: {type: String, default: ''}, // leave blank? idk what this is
      instructions: {type: String, default: ''}
    }
  }],

  // admin or whomever to use for picking restaurant and various other
  convo_initiater: {
    id: String,
    name: String,
    first_name: String,
    last_name: String,
    phone_number: String,
    email: String
  },

  fulfillment_method: String,
  time_started: {
    type: Date,
    default: Date.now
  },
  votes: [], // members votes, like "Frozen Yogurt" (should also be stored in chatuser_schema)
  conversations: {},

  // remove this later
  mode: String,
  action: String,
  data: {}, // \shrug
  tracking: {}, // possibly combine w/ data, cant remember what data is in explicitly
  order: {}, // info after adding items to cart
  tipPercent: {
    type: String,
    default: `15%`
  },
  tipAmount: Number,
  payment_post: {}, // post body for payment (i.e. select or add new card)
  payment: {}, // object with payment details
  confirmed_orders: [], // possibly add time counter thing later
  guest_token: String, // related to creating a guest token per session
  completed_payment: Boolean
})

deliverySchema.virtual('chosen_restaurant_full').get(function () {
  var doc = this
  return doc.merchants.filter(m => m.id === doc.chosen_restaurant.id)[0]
})

var delivery = mongoose.model('delivery', deliverySchema, 'delivery')

module.exports = delivery
