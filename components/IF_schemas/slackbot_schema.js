var mongoose = require('mongoose');

/**
 * Save slackbot integrations
 */
var slackbotSchema = mongoose.Schema({
    //
    // stuff we get from slack
    //
    access_token: String,
    scope: String,
    team_name: String,
    team_id: {
      type: String,
      unique: true
    },
    incoming_webhook: {
        url: String,
        channel: String,
        configuration_url: String
    },
    bot: {
        bot_user_id: String,
        bot_access_token: String
    },
    //
    // this is all kip-specific stuff
    //
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
        office_assistants: [String], // user ids of the office assistants, like U0R6H9BKN

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
    conversaitons: {}
});

var Slackbot = mongoose.model('Slackbot', slackbotSchema, 'slackbots');

module.exports = Slackbot;
