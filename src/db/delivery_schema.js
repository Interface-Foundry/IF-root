var mongoose = require('mongoose')

/**
 * Save delivery sessions
 */
var deliverySchema = mongoose.Schema({
  teamMembers: [],
  chosen_location: {},
  possible_locations: [],

  // admin or whomever to use for picking restaurant and various other
  convoInitiater: String,
  fulfillment_method: String,
  time_started: {
    type: Date,
    default: Date.now
  },
  mode: String,
  action: String,
  data: {},
  conversations: {}
})

var delivery = mongoose.model('delivery', deliverySchema, 'delivery')

module.exports = delivery
