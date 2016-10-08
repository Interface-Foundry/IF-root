var mongoose = require('mongoose')

/**
 * Save delivery sessions
 */
var deliverySchema = mongoose.Schema({
  session_id: mongoose.Schema.ObjectId,
  team_id: String,
  team_members: [],
  chosen_location: {},
  chosen_restaurant: {},
  merchants: [],
  cuisines: [],

  // admin or whomever to use for picking restaurant and various other
  convo_initiater: String,
  fulfillment_method: String,
  time_started: {
    type: Date,
    default: Date.now
  },
  mode: String,
  action: String,
  data: {},
  votes: [],
  conversations: {}
})

var delivery = mongoose.model('delivery', deliverySchema, 'delivery')

module.exports = delivery
