var db = require('db');
var request = require('request-promise');
var co = require('co');
var _ = require('lodash');
var kip = require('kip');
var async = require('async');
var eachSeries = require('async-co/eachSeries');

/*
*
* Team Member Management 
*
*/

/*
* returns admins of a team or false if there are none. will appropriately update chatusers based on latest slackbot.meta.office_assistants field
* @param {Object} slackbot object
* @returns {array} returns chatuser admin objects
*                   
*/
function * findAdmins(team) {
  var admins = [];
  var adminIds = team.meta.office_assistants;
  var members = yield db.Chatusers.find({team_id: team.team_id}).exec();
  return co(function * (){
    yield eachSeries(members, function * (user) {
      if ( adminIds.indexOf(user.id) > -1) {
        admins.push(user);
        if (!user.is_admin ) {
           user.is_admin = true;
           yield user.save();
        }
      }
      else if ( adminIds.indexOf(user.id) == -1 && user.is_admin ) {
        user.is_admin = false;
        yield user.save();
      } 
    });
  }).then( function() { return members });
  if (admins != null) {
    return admins  
  } else {
    return false
  }
}

/*
* returns only active members of a channel given a slackbot object, and updates chatusers based on active list
* @param {Object} slackbot object
* @returns {array} returns chatuser objects 
*                   
*/
function * getChannelMembers(team) {
    var members = [];
    var teamMembers = yield db.Chatusers.find({team_id: team.team_id, is_bot: false}).exec();
    var res_dm = yield request('https://slack.com/api/im.list?token=' + team.bot.bot_access_token); // has direct message id
    var res_prof = yield request('https://slack.com/api/users.list?token=' + team.bot.bot_access_token); // has all the profile info such as name, email, etc
    var res_chan = yield request('https://slack.com/api/users.list?token=' + team.bot.bot_access_token); // lists all members in a channel
    res_dm = JSON.parse(res_dm);
    res_prof = JSON.parse(res_prof);
    res_chan = JSON.parse(res_chan);
    var teamIds = teamMembers.map(function(u){
        return u.id;
    });
    return co(function * (){
      yield eachSeries(res_dm.ims, function * (u) {
        if ( teamIds.indexOf(u.user) == -1 && u.user != 'USLACKBOT' ) {
          var user = new db.Chatuser();
          user.team_id = team.team_id;
          user.id = u.user;
          user.platform = 'slack';
          user.dm = u.id;
          user.is_bot = false;
          var profile = res_prof.members.find((m) => { return (m.id == user.id) });
          user = _.merge(user, profile);
          yield user.save();
          members.push(user);
        } else if (teamIds.indexOf(u.user) > -1 ) {
          var user = yield db.Chatusers.findOne({ id: u.user}).exec();
          if (user != null) {
            members.push(user)
          }
        }
      });
      members = members.filter((m) => {
        return res_chan.members.indexOf(m.id) > -1
      });
    }).then( function() { return members });
}





/*
* returns only active members of a team given a slackbot object, creates chatuser objects if they do not exist in db
* @param {Object} slackbot object
* @returns {array} returns chatuser objects 
*                   
*/
function * getTeamMembers(team) {
    var members = [];
    var teamMembers = yield db.Chatusers.find({team_id: team.team_id, is_bot: false}).exec();
    var res_dm = yield request('https://slack.com/api/im.list?token=' + team.bot.bot_access_token); // has direct message id
    var res_prof = yield request('https://slack.com/api/users.list?token=' + team.bot.bot_access_token); // has all the profile info such as name, email, etc
    res_dm = JSON.parse(res_dm);
    res_prof = JSON.parse(res_prof);
    var teamIds = teamMembers.map(function(u){
        return u.id;
    });
    return co(function * (){
      yield eachSeries(res_dm.ims, function * (u) {
        if ( teamIds.indexOf(u.user) == -1 && u.user != 'USLACKBOT' ) {
          var user = new db.Chatuser();
          user.team_id = team.team_id;
          user.id = u.user;
          user.platform = 'slack';
          user.dm = u.id;
          user.is_bot = false;
          var profile = res_prof.members.find((m) => { return (m.id == user.id) });
          user = _.merge(user, profile);
          yield user.save();
          members.push(user);
        } else if (teamIds.indexOf(u.user) > -1 ) {
          var user = yield db.Chatusers.findOne({ id: u.user}).exec();
          if (user != null) {
            members.push(user)
          }
        }
      });
    }).then( function() { return members });
}


/*
*
* Cart Channel Management
*
*/
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



module.exports = {
  findAdmins: findAdmins,
  getTeamMembers: getTeamMembers,
  addCartChannel: addCartChannel,
  removeCartChannel: removeCartChannel
};
