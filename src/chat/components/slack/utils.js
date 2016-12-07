var request = require('request-promise');
var co = require('co');
var _ = require('lodash');
var async = require('async');
var eachSeries = require('async-co/eachSeries');
var slack = process.env.NODE_ENV === 'test' ? require('./mock_slack') : require('@slack/client')
var jstz = require('jstz');
var amazon = require('../amazon_search.js');
var kipcart = require('../cart');


/*
*
* Team Member Management
*
*/


/*
* returns creates chat users for a team
* @param {Object} slackbot object
* @returns {Object} slackbot object
*
*/
function * initializeTeam(team, auth) {
 if (!auth.user_id) {
    return kip.error('Could not find the user who added slackbot ' + team._id)
 }
 team.meta.addedBy = typeof team.meta.addedBy == 'string' ? team.meta.addedBy : auth.user_id;
 var res_chan = yield request('https://slack.com/api/channels.list?token=' + team.bot.bot_access_token); // lists all members in a channel
 res_chan = JSON.parse(res_chan);
 if (!(team.meta.cart_channels && team.meta.cart_channels.length > 0)) {
  var generalChannel = res_chan.channels.find( (c) => { return c.name == 'general' });
  team.meta.cart_channels.push(generalChannel.id);
 }
 team.meta.office_assistants = _.uniq(team.meta.office_assistants);
 team.meta.all_channels = res_chan.channels.map(c => {return c.id});
 team.markModified('meta.cart_channels');
 team.markModified('meta.all_channels');
 team.markModified('meta.office_assistants');
 yield getTeamMembers(team);
 yield team.save();
 return team;
}



/*
* returns admins of a team. will appropriately update chatusers based on latest slackbot.meta.office_assistants field
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
  }).then( function() { return admins });
}

function * isAdmin(userId, team) {
  let adminList = yield findAdmins(team);
  for (var i = 0; i < adminList.length; i++) {
    if(adminList[i].id === userId){
      return true;
    }
  }
  return false;
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
   // channels.sort(function(a, b) { parseFloat(b['num_members']) - parseFloat(a['num_members']) })
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
  if (process.env.NODE_ENV === 'test') return;
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
* Channel Management
*
*/


function * refreshAllChannels (slackbot) {
  var botChannelArray = yield slackbot.web.channels.list()
  var botGroupArray = yield slackbot.web.groups.list()
  var botsChannels = botChannelArray.channels.concat(botGroupArray.groups)
  logging.info(`adding ${botsChannels.length} to slackbots.meta`)
  slackbot.slackbot.meta.all_channels = botsChannels.map((channel) => {
    return channel.id
  })
  yield slackbot.slackbot.save()
}

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

/*
*
* Menu Management
*
*/

function * cacheMenu(message, original, expandable, data) {
   yield db.Messages.update({_id: message._id}, {$set: {menus:{ id: message._id, original: {data: original }, expandable: { data: expandable } }, data: data}}).exec()
}

function * showMenu(message) {
   var relevantMessage = yield db.Messages.findOne({'thread_id': message.source.channel, 'menus.id': message.data.value})
   var actions = _.get(relevantMessage, 'menus.expandable[0].data') ? _.get(relevantMessage, 'menus.expandable[0].data') : yield generateMenuButtons(message);
   // var team = yield db.Slackbots.findOne({'team_id': message.source.team}).exec();
   // var isAdmin = team.meta.office_assistants.find( u => { return u == message.source.user });
   // if (!isAdmin) actions.splice(_.findIndex(actions, function(e) {return e.name == 'team'}),1);
    var json = message.source.original_message;
    if (!json.attachments) return;
    var text =  _.get(relevantMessage,'data.text') ?  _.get(relevantMessage,'data.text') : ''
    var color =  _.get(relevantMessage,'data.color') ?  _.get(relevantMessage,'data.color') : ''
    json.attachments[json.attachments.length-1] = {
        fallback: message.action,
        callback_id: message.action + (+(Math.random() * 100).toString().slice(3)).toString(36),
        text: text,
        color: color,
        actions: actions
    }
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
    return 
}

function * hideMenu(message, original, expandable, data) {
  if (!_.get(message,'data.value')) return
    var relevantMessage = yield db.Messages.findOne({'thread_id': message.source.channel, 'menus.id': message.data.value})
    var actions = _.get(relevantMessage, 'menus.original[0].data') ? _.get(relevantMessage, 'menus.original[0].data') : yield generateMenuButtons(message);
    var json =  message.source.original_message;
    var text =  _.get(relevantMessage,'data.text') ?  _.get(relevantMessage,'data.text') : ''
    var color =  _.get(relevantMessage,'data.color') ?  _.get(relevantMessage,'data.color') : ''

    json.attachments[json.attachments.length-1] = {
        fallback: message.action,
        callback_id: message.action + (+(Math.random() * 100).toString().slice(3)).toString(36),
        text: text,
        color: color,
        actions: actions
    };
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
  return
}

function* generateMenuButtons(message) {
  kip.debug(`🔲 🔲 🔲 🔲 🔲 🔲 🔲 🔲 🔲 🔲 \n ${JSON.stringify(message, null, 2)}`)
  let team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();

  let isAdmin = yield this.isAdmin(message.source.user, team),
    buttons = [];
  let showEverything = isAdmin || team.meta.office_assistants == 0
  switch (message.mode) {
    case 'settings':
      buttons.push({
        name: 'shopping',
        text: 'Shopping',
        type: 'button',
        value: 'shopping_btn'
      });
      if (showEverything) {
        buttons = [...buttons, {
          name: 'cafe_btn',
          text: 'Kip Café',
          style: 'default',
          type: 'button',
          value: 'cafe_btn'
        }, {
          name: 'team',
          text: 'Team Members',
          style: 'default',
          type: 'button',
          value: 'home',
        }];
      }
      break;

    case 'food':
      buttons = [{
        name: 'shopping',
        text: 'Shopping',
        type: 'button',
        value: 'shopping_btn'
      }, {
        name: 'settings',
        text: 'Settings',
        style: 'default',
        type: 'button',
        value: 'home'
      }];
      if (showEverything) {
        buttons.push({
          name: 'team',
          text: 'Team Members',
          style: 'default',
          type: 'button',
          value: 'home',
        });
      }
      break;

    case 'shopping':
      buttons.push({
        name: 'settings',
        text: 'Settings',
        style: 'default',
        type: 'button',
        value: 'home'
      });
      if (showEverything) {
        buttons = [...buttons, {
          name: 'cafe_btn',
          text: 'Kip Café',
          style: 'default',
          type: 'button',
          value: 'cafe_btn'
        }, {
          name: 'team',
          text: 'Team Members',
          style: 'default',
          type: 'button',
          value: 'home',
        }];
      }
      break;

    case 'team':
      buttons = [{
        name: 'shopping',
        text: 'Shopping',
        type: 'button',
        value: 'shopping_btn'
      }, {
        name: 'settings',
        text: 'Settings',
        style: 'default',
        type: 'button',
        value: 'home'
      }];
      if (showEverything) {
        buttons.push({
          name: 'cafe_btn',
          text: 'Kip Café',
          style: 'default',
          type: 'button',
          value: 'cafe_btn'
        });
      }
  }

  var newBtns = [...buttons, {
    name: 'view_cart_btn',
    text: 'View Cart',
    style: 'default',
    type: 'button',
    value: 'view_cart_btn'
  }, {
    name: 'shopping.home.detract',
    text: '< Back',
    style: 'default',
    type: 'button',
    value: message._id
  }]
  kip.debug(`🎒  🎒  🎒  🎒  🎒  🎒  🎒  🎒  🎒  🎒  🎒  🎒  \n ${JSON.stringify(newBtns, null, 2)}`)
  return newBtns;
}



/*
* get the groups (private channels) and channels and add them to slackbots meta
* used as init in slack.js but probably should be run periodically (like
* multiple times a day)
* @param {Object} slackbot object with web, rtm and mongo objects
*/
function * getAllChannels (slackbot) {
  var botChannelArray = yield slackbot.web.channels.list()
  botChannelArray = botChannelArray.channels.map(channel => {
    return {
      id: channel.id,
      name: channel.name,
      is_channel: true
    }
  })
  var botGroupArray = yield slackbot.web.groups.list()
  botGroupArray = botGroupArray.groups.map(channel => {
    return {
      id: channel.id,
      name: channel.name,
      is_channel: false
    }
  })
  var allChannels = (botGroupArray.length === 0) ? botChannelArray : botChannelArray.concat(botGroupArray)
  logging.debug(`adding allChannels with ${allChannels.length} to slackbots.meta \n\n allChannels:\n`, allChannels)
  slackbot.slackbot.meta.all_channels = allChannels
  yield slackbot.slackbot.save()
}


/*
*
* Misc.
*
*/

function * addViaAsin(asin, message) {
   var cart_id = message.cart_reference_id || message.source.team; 
   var skip = false;
    try {
       var res = yield amazon.lookup({ ASIN: asin, IdType: 'ASIN'}); 
     } catch (e) {
       skip = true;
     }
    if (res && !skip) {
      var item = res[0];
      if (item.reviews && item.reviews.reviewCount) {
        item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
      }
      yield kipcart.addToCart(cart_id, message.user_id, item, 'team');
    }
}

function * showLoading(message) {
  var message = new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    text: 'Searching...',

    data: { loading: true}
  });
  yield message.save();
  yield queue.publish('outgoing.' + message.origin, message, message._id + '.loading.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
  // return message;
}

function * hideLoading(message, response) {
  var relevantMessage = yield db.Messages.findOne({'thread_id': message.source.channel, 'data.loading': true}).sort('_id').exec();
  kip.debug(' \n\n\n\n\n\n\n\n\n\n  👳/slack/utils.js:372:replaceLoading', relevantMessage, response,'  \n\n\n\n\n\n\n\n\n\n');
  request({
      method: 'POST',
      uri: relevantMessage.source.response_url,
      body: JSON.stringify(response)
    });
}


function * updateResponseUrl(message) {
  yield db.Messages.update({_id: message._id}, {$set: {source:{ response_url: message.source.response_url}}}).exec();
}


module.exports = {
  initializeTeam: initializeTeam,
  findAdmins: findAdmins,
  getTeamMembers: getTeamMembers,
  getChannels: getChannels,
  getChannelMembers: getChannelMembers,
  refreshAllChannels: refreshAllChannels,
  addCartChannel: addCartChannel,
  removeCartChannel: removeCartChannel,
  cacheMenu: cacheMenu,
  showMenu: showMenu,
  hideMenu: hideMenu,
  addViaAsin: addViaAsin,
  getAllChannels: getAllChannels,
  isAdmin: isAdmin,
  generateMenuButtons: generateMenuButtons,
  showLoading: showLoading,
  hideLoading: hideLoading
}
