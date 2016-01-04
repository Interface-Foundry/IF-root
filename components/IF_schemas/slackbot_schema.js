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
    team_id: String,
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
        initialized: {
            type: Boolean,
            default: false
        }
    }
});

var Slackbot = mongoose.model('Slackbot', slackbotSchema, 'slackbots');

module.exports = Slackbot;
