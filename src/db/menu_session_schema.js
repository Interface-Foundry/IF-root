var mongoose = require('mongoose')

var menuSessionSchema = mongoose.Schema({
  foodSessionId: String,
  user: {
    id: String,
    is_admin: Boolean
  },
  admin_name: String,
  team_name: String,
  session_token: {
    // gen key inside object
    type: String,
    index: true
  },
  budget: Number,
  menu: {
    data: {}
  },
  merchant: {
    id: String,
    name: String,
    minimum: String,
    logo: String
  },
  cart: {},
  ts: {
    type: Date,
    default: Date.now
  },
  selected_items: []
})

module.exports = mongoose.model('MenuSession', menuSessionSchema)
