var request = require('request-promise');
var co = require('co');
var _ = require('lodash');
var async = require('async');
var eachSeries = require('async-co/eachSeries');
var slack = process.env.NODE_ENV === 'test' ? require('./mock_slack') : require('@slack/client')
var jstz = require('jstz');
var amazon = require('../amazon_search.js');
var kipcart = require('../cart');
var queue = require('../queue-mongo');
var cron = require('cron');
var sleep = require('co-sleep');
var cardTemplate = require('./card_templates');
var kipCart = require('../cart');
var processData = require('../process');
var util = require('util')

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
 debugger;
 if (!(team.meta.cart_channels && team.meta.cart_channels.length > 0)) {
  var generalChannel = res_chan.channels.find( (c) => { return c.name == 'general' });
  team.meta.cart_channels.push(generalChannel.id);
 }
 team.meta.office_assistants = _.uniq(team.meta.office_assistants);
 debugger;
 team.meta.all_channels = res_chan.channels.map(c => _.pick(c, 'id', 'name', 'is_channel'));
 team.markModified('meta.cart_channels');
 team.markModified('meta.all_channels');
 team.markModified('meta.office_assistants');
 yield team.save();
 yield getTeamMembers(team);
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
        if (!user.is_admin) {
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
            if (user != null && user != undefined) {
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
  slackbot.slackbot.meta.all_channels = botsChannels.filter(c => !c.is_archived).map((channel) => {
    return _.pick(channel, 'id', 'name', 'is_channel')
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
    text: '⁂ View Cart',
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
* CRON Jobs
*
*/




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
  var relevantMessage = yield db.Messages.findOne({'thread_id': message.source.channel})
  var json = message.source.original_message;
    if (!json) {
     var msg = new db.Message(message);
     msg.mode = 'loading';
     msg.action = 'show'
     msg.text = '';
     msg.reply = [{
        text: 'Searching...',
        color: '#45a5f4'
      }];
     yield msg.save()
     return yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.results');
    }
    json.attachments.push({
        fallback: message.action,
        callback_id: message.action + (+(Math.random() * 100).toString().slice(3)).toString(36),
        text: 'Searching...',
        color: '#45a5f4'
    })
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
    return
}

function * hideLoading(message) {
    var history = yield db.Messages.find({'thread_id': message.source.channel}).sort({'_id':-1}).limit(2).exec();
    var relevantMessage = history[0];
    var json =  message.reply;
    if (!message.source.original_message) {
     var msg = new db.Message(message);
     msg.mode = 'loading';
     msg.action = 'hide';
     msg.text = '';
     msg.data =  {hide_ts: relevantMessage.ts};
     yield msg.save()
     return yield queue.publish('outgoing.' + msg.origin, msg, msg._id + '.reply.results')
    }
    message.source.original_message.attachments.splice(-1,1);
     request({
      method: 'POST',
      uri: relevantMessage.source.response_url,
      body: JSON.stringify(message.source.original_message)
    });
    return
}


function* sendLastCalls(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();
  var currentUser = yield db.Chatusers.findOne({
    id: message.source.user
  });
  var channelMembers = [];
  yield team.meta.cart_channels.map(function*(channel) {
    var members = yield getChannelMembers(team, channel);
    channelMembers = channelMembers.concat(members);
  });
  channelMembers = _.uniqBy(channelMembers, a => a.id);
  var admins = yield findAdmins(team)
  channelMembers = _.differenceBy(channelMembers, admins, 'id') //should take out all admins
  kip.debug(JSON.stringify(channelMembers, null, 2))
  yield channelMembers.map(function*(m) {
    kip.debug(JSON.stringify(currentUser, null, 2))
    var attachment = [{
      "fallback": "Last Call",
      "text": '',
      "image_url": "http://kipthis.com/kip_modes/mode_teamcart_collect.png",
      "color": "#45a5f4",
      "mrkdwn_in": ["text"]
    }, {
      "fallback": "Last Call",
      "text": 'Hi! ' + currentUser.name + ' wanted to let you know that they will be placing their order soon.',
      "color": "#45a5f4",
      "mrkdwn_in": ["text"]
    }];
    var msg = new db.Message(message);
    msg.mode = 'shopping';
    msg.action = 'switch';
    msg.text = '';
    msg.source.team = team.team_id;
    msg.source.channel = m.dm;
    msg.user_id = m.id;
    msg.thread_id = m.dm;
    msg.reply = attachment;
    yield msg.save();
    yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.lastcall');

  })
}

function * constructCart(message, text) {
 var cart_id = message.cart_reference_id || message.source.team;
 var cart = yield kipcart.getCart(cart_id);
 // all the messages which compose the cart
 var attachments = [];

  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png',
    text: text,
    color: '#45a5f4'
  });

  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    // the slack message for just this item in the cart list
    var item_message = {
      mrkdwn_in: ['text', 'pretext'],
      color: '#45a5f4',
      thumb_url: item.image
    }
    // multiple people could have added an item to the cart, so construct a string appropriately
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');
    var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
    // make the text for this item's message
    item_message.text = [
      `*${i + 1}.* ` + `<${link}|${item.title}>`,
      `*Price:* ${item.price} each`,
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`,

    ].filter(Boolean).join('\n');
    // add the item actions if needed
    item_message.callback_id = item._id.toString();
    var buttons = [{
      "name": "additem",
      "text": "+",
      "style": "default",
      "type": "button",
      "value": "add"
    }, {
        "name": item.quantity > 1 ? "removeitem" : 'removewarn',
        "text": "—",
        "style": "default",
        "type": "button",
        "value": "remove"
      }];

    if (item.quantity > 1) {
      buttons.push({
        name: "removewarn",
        text: 'Remove All',
        style: 'default',
        type: 'button',
        value: 'removewarn'
      })
    }
    item_message.actions = buttons;
    attachments.push(item_message);
   }

    var summaryText = `*Team Cart Summary*
    *Total:* ${cart.total}`;
    summaryText += `
    <${cart.link}|*➤ Click Here to Checkout*>`;

	if (cart.aggregate_items.length === 0) {
		summaryText = 'It looks like your cart is empty!'
	}

    attachments.push({
      text: summaryText,
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })

  return attachments
}


function * sendCartToAdmins(message,team) {
   var cutoff = new Date("2016-12-14T23:07:00.417Z");
   var added = new Date(team.meta.dateAdded)
   var copy;
   // kip.debug('EUREKA ',added, cutoff, (added < cutoff))
   if (added < cutoff) {
    copy =  'Hi, we added a new feature to get cart status updates from what your team is adding to the cart';
   } else {
    copy = 'Hi! Here\'s what your team has added into the cart so far. If it looks good click the checkout link below :)';
   }
   var admins = yield findAdmins(team);
   yield admins.map(function*(a) {
      var msg = new db.Message();
      msg.source = {};
      msg.mode = 'settings';
      msg.action = 'home';
      msg.source.team = team.team_id;
      msg.source.channel = a.dm;
      msg.source.user = a.id;
      msg.user_id = a.id;
      msg.thread_id = a.dm;
      msg.reply = yield constructCart(msg, copy);
      yield msg.save();
      yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.viewcart');
   })
};



function * updateCron(message, jobs, when, type) {
  return;
   var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
   var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
   var interval = _.get(team, 'meta.status_interval');
   var date;
   var date2;
    if (jobs[team.team_id]) {
      jobs[team.team_id].stop();
    }
    if (type == 'never') {
      delete jobs[team.team_id];
      return
    } else if (type == 'time' && interval != 'daily') {
      var dayOfMonth = (interval == 'weekly' || interval == 'daily') ? '*' : _.get(team, 'meta.weekly_status_date');
      var weekday = (interval == 'monthly' || interval == 'daily') ? '*' : getDayNum(_.get(team, 'meta.weekly_status_day')).toString();
      date = '00 ' + when.minutes + ' ' + when.hour + ' ' + dayOfMonth +  ' * ' + weekday;
      date2 = '00 ' + when.minutes + ' ' + (parseInt(when.hour) < 23 ? (parseInt(when.hour) + 1).toString() : '00') + ' ' + dayOfMonth +  ' * ' + weekday;
    } else if (type == 'time' && interval == 'daily') {
      date = '00 ' + when.minutes + ' ' + when.hour  + ' * * *';
      date2 = '00 ' + when.minutes + ' ' + (parseInt(when.hour) < 23 ? (parseInt(when.hour) + 1).toString() : '00')   + ' * * *';
    } else if (type == 'day') {
      date = '00 ' + when.minutes + ' ' + when.hour  + ' * * ' + when.day;
      date2 = '00 ' + when.minutes + ' ' + (parseInt(when.hour) < 23 ? (parseInt(when.hour) + 1).toString() : '00')  + ' * * ' + when.day;
    } else if (type == 'date') {
      date = '00 ' + when.minutes + ' ' + when.hour  + ' ' + when.date + ' * *';
      date2 = '00 ' + when.minutes + ' ' + (parseInt(when.hour) < 23 ? (parseInt(when.hour) + 1).toString() : '00')   + ' ' + when.date + ' * *';
    } else {
      date = when;
    }
    kip.debug('\n\n\n\n\n\n setting cron job to send last calls : ', date,'\n\n\n\n\n\n')


    //Set cron job for cart member last calls
    jobs[team.team_id] = new cron.CronJob( date, function  () {
       co(sendLastCalls(message));
    }, function() {
      kip.debug('\n\n\n\n ran cron job for team: ' + team.team_id + ' ' + team.team_name + date + '\n\n\n\n');
    },
    true,
    team.meta.weekly_status_timezone);

    //Set cron job for admin cart status updates -- currently one hour after
    jobs[message.source.user] = new cron.CronJob( date2, function  () {
       co(sendCartToAdmins(message,team));
    }, function() {
      kip.debug('\n\n\n\n ran cron job for admin: ' + team.team_id + ' ' + team.team_name + date + '\n\n\n\n');
    },
    true,
    team.meta.weekly_status_timezone);
};

/**
 * Sets all parameters for a given chron
 * Only used during onboarding
 * @param {Message} message - the message received
 * @param {Array} jobs - a list of all cron jobs
 * @param {Object} when - a date object in the form of {day:String, hour:String, minutes:String, date:String}
 * @return {Null} no return
 */
function* setCron(message, jobs, when) {
  let team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  let team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();

  let teamDate = `00 ${when.minutes} ${when.hour} ${when.date} * ${when.day}`;
  let adminDate = `00 ${when.minutes} ${(parseInt(when.hour) < 23 ? (parseInt(when.hour) + 1).toString() : '00')} ${when.date} * ${when.day}`;

  kip.debug('\n\n\n\n\n\n setting cron job to send last calls : ', teamDate, adminDate, '\n\n\n\n\n\n')

  //Set cron job for cart member last calls
  jobs[team.team_id] = new cron.CronJob(teamDate, function() {
      co(sendLastCalls(message));
    }, function() {
      kip.debug('\n\n\n\n ran cron job for team: ' + team.team_id + ' ' + team.team_name + teamDate + '\n\n\n\n');
    },
    true,
    team.meta.weekly_status_timezone);

  //Set cron job for admin cart status updates -- currently one hour after
  jobs[message.source.user] = new cron.CronJob(adminDate, function() {
      co(sendCartToAdmins(message, team));
    }, function() {
      kip.debug('\n\n\n\n ran cron job for admin: ' + team.team_id + ' ' + team.team_name + adminDate + '\n\n\n\n');
    },
    true,
    team.meta.weekly_status_timezone);
}



function getDayNum(string) {
  switch(string.toLowerCase()) {
    case 'sunday':
     return 0
     break;
    case 'monday':
     return 1
     break;
    case 'tuesday':
     return 2
     break;
    case 'wednesday':
     return 3
     break;
    case 'thursday':
     return 4
     break;
    case 'friday':
     return 5
     break;
    case 'saturday':
     return 6
     break;
  }
}

//
// Cleans up the attachments and stuff. mutaties the message in place
//
function formatMessage(m) {
  if (m.attachments) {
    m.attachments.map((a) => {
      // every attachmnet needs a callback id
      a.callback_id = _.get(a, 'callback_id') || 'default'

      // also should json stringify action.value
      _.get(a, 'actions', []).map(action => {
        if (typeof action.value !== 'string') {
          action.value = JSON.stringify(action.value)
        } else {
          console.log('hey, listen'.cyan, util.inspect(m, {depth: null, colors: true}))
          throw new Error('you need to refactor the buttons')
        }
      })
    })
  }

  return m
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
  hideLoading: hideLoading,
  updateCron: updateCron,
  sendLastCalls: sendLastCalls,
  getDayNum: getDayNum,
  constructCart: constructCart,
  setCron: setCron,
  formatMessage: formatMessage
}
