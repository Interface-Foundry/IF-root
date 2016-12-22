var mongoose = require('mongoose')

var emailUserSchema = mongoose.Schema({
  team_id: String,
  id: String,
  name: String,
  platform: {
    type: String,
    default: 'email'
  },
  email: {
    type: String,
    unique: true
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  history: {
    orders: [],
    modes: [], // { ts: date, mode: 'shopping'/'food' }
    interactions: []
  }
});

module.exports = mongoose.model('EmailUser', emailUserSchema);
