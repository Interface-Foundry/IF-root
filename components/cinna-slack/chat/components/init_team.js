var db = require('db')
var kip = require('kip')
var request = require('request')
var debug = require('debug')('chat')
var refresh_team = require('./refresh_team')

// Needs scopes 'identify,team:read,users:read,im:read,bot'
// (bot+users%3Aread+im%3Aread+team%3Aread)

module.exports = function(bot, cb) {
  cb = cb || function() {};
  scrape_team_info(bot, function(err, users) {
    if (err || !users) {
      console.error('Could not scrape users for slackbot ' + bot._id);
      // maybe send email here?
      return;
    }

    // find the user that added the slackbot
    var addedBy = users.filter(function(u) {
      return u.id === bot.meta.addedBy;
    })

    if (addedBy.length !== 1) {
      // maybe send email here?
      console.error('Could not find the user who added bot ' + bot._id);
      return;
    }

    // convert array to regular object
    addedBy = addedBy[0];

    //
    // Onboarding conversation start
    //
    cb(null, addedBy);
  })
}

// callback is a team, the list of chatusers for this bot
var scrape_team_info = function(bot, callback) {
    //console.log('scraping team for bot ' + bot._id);
    request('https://slack.com/api/auth.test?token=' + bot.access_token, function(e, r, b) {
      if (kip.error(e)) return;

      r.body = JSON.parse(r.body)

      if (!r.body.user_id && typeof bot.meta.addedBy === 'undefined') {
        return kip.error('Could not find the user who added slackbot ' + bot._id)
      } else {
        bot.meta.addedBy = r.body.user_id || bot.meta.addedBy;
      }

      bot.meta.office_assistants = [bot.meta.addedBy];
      console.log('ASSISTANTS HERE!!!!!! ',bot.meta.office_assistants);

      if (typeof bot.save === 'function') {
        bot.save();
      } else {
        console.error('Could not save addedBy as ' + r.body.user_id + ' for bot ' + bot._id);
      }

      refresh_team(bot.team_id).then(u => {
        callback(null, u);
      }, callback);
    })
}
