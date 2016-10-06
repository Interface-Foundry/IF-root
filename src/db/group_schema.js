var mongoose = require('mongoose')

/**
 * Save slackbot integrations
 */
var groupSchema = mongoose.Schema({
  team_name: String,
  team_id: {
    type: String,
    unique: true
  },
  cart_id: {
    type: String,
    unique: true
  },
  incoming_webhook: {
    url: String,
    channel: String,
    configuration_url: String
  },
  members: [
    {
      member_id: String,
      admin: Boolean,
      active: Boolean,
      bot: Boolean,
      bots: [{
        type: {type: String},
        activated: Boolean,
        notify: Boolean,
        bot_user_id: String,
        bot_access_token: String,
        platform_access_token: String,
        conversations: {},
        flags: {}
      }]
    }
  ],
  meta: {
    dateAdded: {
      type: Date,
      default: Date.now
    },
    addedBy: String,
    initialized: {
      type: Boolean,
      default: false
    },
    weekly_status_enabled: {
      type: Boolean,
      default: true
    },
    weekly_status_day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: 'Friday'
    },
    weekly_status_time: {
      type: String,
      default: '4:00 PM'
    },
    weekly_status_timezone: {
      type: String,
      default: 'America/New_York'
    },
    city: {
      type: String
    },
    cart_channels: [String]
  },
  // hash of channel:type conversations, for instance { D340852K: 'onboarding' }
  conversations: {}
})

var Group = mongoose.model('Group', groupSchema)

module.exports = Group
