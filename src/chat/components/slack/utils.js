var db = require('db');
var request = require('request-promise');
var co = require('co');
var _ = require('lodash');
var kip = require('kip');
var async = require('async');
var eachSeries = require('async-co/eachSeries');
var slack = process.env.NODE_ENV === 'test' ? require('./mock_slack') : require('@slack/client')
var jstz = require('jstz');


/*
*
* Team Member Management
*
*/


/*
* returns sets admin user for a slackbot team, creates chat users
* @param {Object} slackbot object
* @returns {Object} slackbot object
*
*/
function * initializeTeam(team, auth) {
 if (!auth.user_id) {
    return kip.error('Could not find the user who added slackbot ' + team._id)
 }
 team.meta.addedBy = typeof team.meta.addedBy == 'string' ? team.meta.addedBy : auth.user_id;
 team.meta.office_assistants = (team.meta.office_assistants && team.meta.office_assistants.length > 0) ? team.meta.office_assistants : [auth.user_id];
 var res_chan = yield request('https://slack.com/api/channels.list?token=' + team.bot.bot_access_token); // lists all members in a channel
 res_chan = JSON.parse(res_chan);
 if (!(team.meta.cart_channels && team.meta.cart_channels.length > 0)) {
  var generalChannel = res_chan.channels.find( (c) => { return c.name == 'general' });
  team.meta.cart_channels.push(generalChannel.id);
 }
 team.meta.all_channels = res_chan.channels.map(c => {return c.id});
 team.markModified('meta.cart_channels');
 team.markModified('meta.all_channels');
 team.markModified('meta.office_assistants');
 yield team.save();
 yield getTeamMembers(team);
 return team;
}





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
* returns members of a channel given a slackbot(team) and channelId
* @param {Object} slackbot object
* @param {string} channel ID
* @returns {array} returns chatuser objects
*
*/
function * getChannelMembers(team, channelId) {
    var channelMembers = [];
    var teamMembers = yield db.Chatusers.find({team_id: team.team_id, is_bot: false}).exec();
    teamMemberIds = teamMembers.map( (t) => { return t.id })
    var res_chan = yield request('https://slack.com/api/channels.list?token=' + team.bot.bot_access_token); // lists all members in a channel
    res_chan = JSON.parse(res_chan);
    var channel = res_chan.channels.find( (c) => { return c.id == channelId });
    var res_dm = yield request('https://slack.com/api/im.list?token=' + team.bot.bot_access_token); // has direct message id
    var res_prof = yield request('https://slack.com/api/users.list?token=' + team.bot.bot_access_token); // has all the profile info such as name, email, etc
    res_dm = JSON.parse(res_dm);
    res_prof = JSON.parse(res_prof);
    return co(function * (){
      yield eachSeries(channel.members, function * (uId) {
        var bots = res_prof.members.filter( (e) => { return e.is_bot }).map((e) => { return e.id });
        if (teamMemberIds.indexOf(uId) > -1 && uId != 'USLACKBOT' && bots.indexOf(uId) == -1) {
          var user = teamMembers.find((e) => { return (e.id == uId) });
          if (user != null) {
            channelMembers.push(user)
          }
        }
      });
    }).then( function() { return channelMembers });
}


/*
* returns all channel objects for a given a slackbot(team)
* @param {Object} slackbot object
* @returns {array} returns channel objects
*
*/
function * getChannels(team) {
    var res_chan = yield request('https://slack.com/api/channels.list?token=' + team.bot.bot_access_token); // lists all members in a channel
    var channels =JSON.parse(res_chan).channels;
    channels = _.orderBy(channels, ['num_members'], ['desc']);
    channels = channels.filter( c => { return !c.is_archived });
     // channels.sort(function(a, b) { parseFloat(b["num_members"]) - parseFloat(a["num_members"]) })
    var generalChannel = channels.find( (c) => { return c.name == 'general' });
    if (generalChannel) {
      var generalChannelIndex =  _.findIndex(channels, function(c) { return c.name == 'general'});
      channels.splice(generalChannelIndex, 1);
      channels.unshift(generalChannel);
    }
    return channels
}


/*
* returns members of a team given a slackbot object, creates chatuser objects if they do not exist in db
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
    var teamIds = teamMembers.map(function(u){ return u.id });
    var bots = res_prof.members.filter( (e) => { return e.is_bot }).map((e) => { return e.id });
    return co(function * (){
      yield eachSeries(res_prof.members, function * (u) {
        if (!u.deleted) {
            if ( teamIds.indexOf(u.id) == -1 && u.id != 'USLACKBOT' && bots.indexOf(u.id) == -1) {
              var user = new db.Chatuser();
              user.platform = 'slack';
              var dm = res_dm.ims.find( (d) => { return d.user == u.id })
              if (dm) {
                dm = dm.id
              } else {
               var res_dm2 = yield request('https://slack.com/api/im.open?token=' + team.bot.bot_access_token + '&&user='+u.id); // has direct message id
               res_dm2 = JSON.parse(res_dm2);
                if (_.get(res_dm2,'channel.id')) {
                  var dm = _.get(res_dm2,'channel.id')
                }
              }
              user.dm = dm;
              user.is_bot =  bots.indexOf(u.id) == -1 ? false : true;
              user = _.merge(user, u);
              yield user.save();
              members.push(user);
            } else if (teamIds.indexOf(u.id) > -1) {
              var user = yield db.Chatusers.findOne({ id: u.id}).exec();
              if (user != null) {
                members.push(user)
              }
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
  team.markModified('meta.cart_channels');
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
  team.markModified('meta.cart_channels');
  yield team.save();
  return
}

function * getAllChannels (slackbot) {
  var botChannelArray = yield slackbot.web.channels.list()
  var botGroupArray = yield slackbot.web.groups.list()
  var botsChannels = botChannelArray.channels.concat(botGroupArray.groups)
  logging.info(`adding ${botsChannels.length} to slackbots.meta`)
  slackbot.slackbot.meta.all_channels = botsChannels.map((channel) => {
    return {
      id: channel.id,
      name: channel.name
    }
  })
  yield slackbot.slackbot.save()
}

module.exports = {
  initializeTeam: initializeTeam,
  findAdmins: findAdmins,
  getTeamMembers: getTeamMembers,
  getChannels: getChannels,
  getChannelMembers: getChannelMembers,
  addCartChannel: addCartChannel,
  removeCartChannel: removeCartChannel,
  getAllChannels: getAllChannels
};
