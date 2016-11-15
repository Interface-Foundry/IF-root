var mongoose = require('mongoose')

/**
 * Save payment Info
 */
var paymentSchema = mongoose.Schema({
  foodSessionId: String,
  session_token: {
    // gen key inside object
    type: String,
    index: true
  },
  order: {},
  charge: {},
  ts: {
    type: Date,
    default: Date.now
  },
  stripe_response: {},
  delivery_response: {}
})

module.exports = mongoose.model('Payment', paymentSchema)
