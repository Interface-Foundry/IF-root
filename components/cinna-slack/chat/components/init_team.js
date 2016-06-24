var db = require('db')
var kip = require('kip')
var request = require('request-promise')
var debug = require('debug')('chat')
var refresh_team = require('./refresh_team')
var co = require('co');

// Needs scopes 'identify,team:read,users:read,im:read,bot'
// (bot+users%3Aread+im%3Aread+team%3Aread)

module.exports = function(bot, cb) {
  cb = cb || function() {};

  co(function*() {
    var identity = yield request({url: 'https://slack.com/api/auth.test?token=' + bot.access_token, json: true});

    bot.meta.addedBy = identity.user_id;
    bot.meta.office_assistants = [bot.meta.addedBy];
    console.log('GRATUITOUS CONSOLE.LOG HERE !!!!!!!!111 ZZZZZZZZZZZZZ');
    console.log('PIZZA ROLLS ARE DONE');
    console.log('ZZZZZZZZZZZZZZZZ TEST ZZZZZZZZZZZZZZZZZZZZ')

    // try to add #general
    var channels = yield request({url: 'https://slack.com/api/channels.list?token=' + bot.bot.bot_access_token, json: true});
    if (channels.ok) {
      channels = channels.channels;
      channels.map(c => {
        if (c.is_general) {
          bot.meta.cart_channels.push(c.id);
        }
      });
    }
    bot.save();
    var users = yield refresh_team(bot.team_id, null, null, null, null, 12, bot, bot.name, console.log);

    if (users.ok) {
      users = users.users
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
    return addedBy[0];

  }).then(addedBy => {
    kip.debug('addedBy', addedBy);
    cb(null, addedBy);
  }).catch(e => {
    kip.err('error initializing team.  that sounds pretty bad');
    // TODO send email here
    kip.err(e);
  })
}
