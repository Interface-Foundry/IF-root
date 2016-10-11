'use strict'

var mongoose = require('mongoose')
var amazonResult = mongoose.Schema
var modifyVal = mongoose.Schema
var chatuserSchema = mongoose.Schema({
  id: {
    type: String,
    unique: true,
    index: true
  },
  persona: {
    sessions: [String],
    items: [String]
  },
  onboarded: Boolean,
  ts: String,
  origin: String,
  type: { type: String }, // slack, telegram, skype, etc.
  dm: String, // direct message channel id
  team_id: String,
  name: String,
  deleted: Boolean,
  color: String,
  real_name: String,
  tz: String,
  tz_label: String,
  tz_offset: Number,
  country: String,
  profile: {
    avatar_hash: String,
    real_name: String,
    real_name_normalized: String,
    email: String,
    image_24: String,
    image_32: String,
    image_48: String,
    image_72: String,
    image_192: String,
    image_512: String
  },
  is_admin: Boolean,
  is_owner: Boolean,
  is_primary_owner: Boolean,
  is_restricted: Boolean,
  is_ultra_restricted: Boolean,
  is_bot: Boolean,
  has_2fa: Boolean,
  settings: {
    last_call_alerts: {
      type: Boolean,
      default: true
    },
    emailNotification: {
      type: Boolean,
      default: false
    },
    awaiting_email_response: {
      type: Boolean,
      default: false
    }
    // ,
    // interactions: [{
    //     platform: String,
    //     session_id: String,
    //     handler: String,
    //     input_type: String,
    //     input: String,
    //     output: String,
    //     ts: Date.now
    // }]
    // , email_stages: {
    //   stage_1: {
    //     type: Boolean,
    //     default: false
    //   }
    // }
  }
// , email_stages: {
//   stage_1: {
//     type: Boolean,
//     default: false
//   }
// }
})

module.exports = mongoose.model('Chatuser', chatuserSchema)
