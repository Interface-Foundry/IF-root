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
  chosen_restaurant: {},
  menu: {}, // the actual menu for the chosen merchant
  merchants: [], // all possible merchants (based on location)
  cuisines: [], // don't confuse this with votes below

  // admin or whomever to use for picking restaurant and various other
  convo_initiater: {
    id: String,
    name: String
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
})

var delivery = mongoose.model('delivery', deliverySchema, 'delivery')

module.exports = delivery