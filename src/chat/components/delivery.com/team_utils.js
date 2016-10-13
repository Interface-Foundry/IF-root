var db = require('db');
var request = require('request-promise');
var co = require('co');
var kip = require('kip');
var async = require('async');

function * removeCartChannel(message, channel_name) {
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec();
  var channels = yield request({url: 'https://slack.com/api/channels.list?token=' + team.bot.bot_access_token, json: true});
  if (channels.ok) {
    channels = channels.channels;
    channels.map(c => {
      if (c.name === channel_name && c.is_channel && team.meta.cart_channels.indexOf(c.id) > -1) {
        var index = team.meta.cart_channels.indexOf(c.id);
        team.meta.cart_channels.splice(index, 1);
      } 
      else {
        kip.debug('no channel to remove.', c, team.meta.cart_channels);
      }
    });
  }
  yield team.save();
  return
}

function * addCartChannel(message, channel_name) {
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec();
  var channels = yield request({url: 'https://slack.com/api/channels.list?token=' + team.bot.bot_access_token, json: true});
  if (channels.ok) {
    channels = channels.channels;
    channels.map(c => {
      if (c.name === channel_name && c.is_channel && !c.is_archived && c.num_members > 0 && team.meta.cart_channels.indexOf(c.id) == -1) {
        team.meta.cart_channels.push(c.id);
      } 
      else {
        kip.debug('channel already exists.', c,   team.meta.cart_channels);
      }
      if (c.is_channel && !c.is_archived && c.num_members > 0 && team.all_channels.indexOf(c.id) == -1) {
        team.all_channels.push({id: c.id, name: c.name});
      }
    });
  }
  yield team.save();
  return
}

var getChatUsers = co.wrap(function *(message) {
        var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec();
        var teamMembers = yield db.Chatusers.find({team_id: message.source.team, is_bot: false}).exec();
        var bots = yield db.Chatusers.find({team_id: message.source.team, is_bot: true}).exec();
        var result = [];
        var res = yield request('https://slack.com/api/im.list?token=' + team.bot.bot_access_token);
        res = JSON.parse(res);
        kip.debug('res: ',res)
        var team_members_id_array = teamMembers.map(function(m){
            return m.dm;
        })
          async.eachSeries(res.ims, function iterator(u, cb){
                    kip.debug('creating new chatusers.. ')
                    var new_user = new db.Chatuser();
                    new_user.team_id = team.team_id;
                    new_user.id = u.user;
                    new_user.dm = u.id;
                    new_user.is_bot = false;
                    if (u.user == message.source.user) {
                      new_user.is_admin = true;
                    }
                    new_user.save(function(err, saved) {
                      result.push(new_user)
                      cb();
                    });
          }, function done(err) {
            return Promise.resolve(result)
          })
    
})


module.exports = {
  addCartChannel: addCartChannel,
  removeCartChannel: removeCartChannel,
  getChatUsers: getChatUsers
}
