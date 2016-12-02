var mongoose = require('mongoose')

var menuSessionSchema = mongoose.Schema({
  foodSessionId: String,
  userId: String,
  session_token: {
    // gen key inside object
    type: String,
    index: true
  },
  menu: {
    data: {}
  },
  merchant: {
    id: String,
    name: String
  },
  cart: {},
  ts: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('MenuSession', menuSessionSchema)
