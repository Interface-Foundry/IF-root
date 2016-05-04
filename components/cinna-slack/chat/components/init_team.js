var db = require('db')
var kip = require('kip')
var request = require('request')
var debug = require('debug')('chat')

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

      if (!r.body.user_id) {
        return kip.error('Could not find the user who added slackbot ' + bot._id)
      }

      bot.meta.addedBy = r.body.user_id;
      bot.meta.office_assistants = [r.body.user_id];
      console.log('ASSISTANTS HERE!!!!!! ',bot.meta.office_assistants);
      
      if (typeof bot.save === 'function') {
        bot.save();
      } else {
        console.error('Could not save addedBy as ' + r.body.user_id + ' for bot ' + bot._id);
      }

      request('https://slack.com/api/users.list?token=' + bot.bot.bot_access_token, function(e, r, b) {
        if (kip.error(e)) return;

        r.body = JSON.parse(r.body)
        console.log(r.body);
        // save each user

        var userhash = {};
        var users = r.body.members.map(function(u) {
          userhash[u.id] = new db.Chatuser(u);
          userhash[u.id].save();
          return userhash[u.id];
        })

        request('https://slack.com/api/im.list?token=' + bot.bot.bot_access_token, function(e, r, b) {
          if (kip.error(e)) return;

          r.body = JSON.parse(r.body)
          console.log(r.body);

          // save each user again
          r.body.ims.map(function(u) {
            userhash[u.user].dm = u.id;
            userhash[u.user].save()
          })

          callback(null, users);

        })
      })


    })
}
