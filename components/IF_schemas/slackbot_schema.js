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
        office_assistants: [String] // user ids of the office assistants, like U0R6H9BKN
    },

    // hash of channel:type conversations, for instance { D340852K: 'onboarding' }
    conversaitons: {}
});

var Slackbot = mongoose.model('Slackbot', slackbotSchema, 'slackbots');

module.exports = Slackbot;
