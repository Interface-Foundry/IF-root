var mongoose = require('mongoose')

var emailUserSchema = mongoose.Schema({
  team_id: String,
  id: String,
  name: String,
  tz: String,
  tz_offset: Number,
  tz_label: String,
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
  is_restricted: {
    type: Boolean,
    default: false
  },
  is_ultra_restricted: {
    type: Boolean,
    default: false
  },
  is_owner: {
    type: Boolean,
    default: false
  },
  is_primary_owner: {
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  },
  is_bot: {
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
