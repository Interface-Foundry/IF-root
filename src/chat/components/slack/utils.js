var request = require('request-promise');
var co = require('co');
var _ = require('lodash');
var async = require('async');
var eachSeries = require('async-co/eachSeries');
var slack = process.env.NODE_ENV === 'test' ? require('./mock_slack') : require('@slack/client')
var jstz = require('jstz');
var amazon = require('../amazon_search.js');
var kipcart = require('../cart');
var queue = require('../queue-direct');
var cron = require('cron');
var sleep = require('co-sleep');
var cardTemplate = require('./card_templates');
var kipCart = require('../cart');
var processData = require('../process');

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
  if (typeof team === 'undefined') {
    throw new Error('Cannot find admins of undefined team')
  }

  // I guess some teams don't have admins assigned?
  if (!_.get(team, 'meta.office_assistants')) {
    logging.warn('team', team.team_name, 'has no admins')
    return []
  }

  // get the full chatuser for each admin id
  return yield team.meta.office_assistants.map(function * (admin_id) {
    var user = yield db.chatusers.findOne({id: admin_id}).exec()

    // make double sure that the user is_admin for some reason (idk why)
    if (!user.is_admin) {
      user.is_admin = true
      yield user.save()
    }

    return user
  })
}

function * isAdmin(userId, team) {
  if (typeof userId === 'undefined') {
    throw new Error('cannot determine if an undefined user is an admin')
  }

  if (typeof team === 'undefined') {
    logging.error('cannot determine if user', userId, 'is admin of an undefined team')
    return false;
  }

  let adminList = yield findAdmins(team);
  for (var i = 0; i < adminList.length; i++) {
    if (adminList[i].id === userId) {
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
  // if (generalChannel) {
  //   var generalChannelIndex =  _.findIndex(channels, function(c) { return c.name == 'general'});
  //   channels.splice(generalChannelIndex, 1);
  //   channels.unshift(generalChannel);
  // }
  return channels
}


/*
* returns members of a team given a slackbot object, creates chatuser objects if they do not exist in db
* @param {Object} slackbot object
* @returns {array} returns chatuser objects
*
*/
function * getTeamMembers (slackbot) {
  try {
    var slackbotWeb = new slack.WebClient(slackbot.bot.bot_access_token)
    var userIMInfo = yield slackbotWeb.im.list()
    var usersArray = yield slackbotWeb.users.list()
  } catch (err) {
    logging.error('error gettign im.list/users.list from slack for slackbot', slackbot)
  }

  try {
    var members = yield usersArray.members.map(function * (user) {
      var savedUser = yield db.Chatusers.findOne({id: user.id})
      // check if user is in our database
      if (!savedUser) {
        // insert new user under slack platform if they dont exist
        savedUser = new db.Chatuser(user)
        savedUser.platform = 'slack'
      } else {
        _.merge(savedUser, {
          // could add other features from slack api user object here to merge
          deleted: user.deleted
        })
      }
      // check if user has open dm
      var userDM = userIMInfo.ims.find(i => i.user)
      if (!userDM) {
        // open new dm if user doesnt have one open w/ bot
        userDM = yield slackbotWeb.im.open(user.id)
        savedUser.dm = userDM.channel.id
      } else if (_.get(savedUser, 'dm') !== userDM.id) {
        // if their DM channel isnt equal to what we have saved, update it
        savedUser.dm = userDM.id
      }
      yield savedUser.save()
      return savedUser
    })
  } catch (err) {
    logging.error('error updating chatuser array', usersArray)
  }
  return members
}

/*
*
* Channel Management
*
*/

function * refreshAllChannels (slackbot) {
  // need the web api client real quick quick
  logging.debug('trying to update all channels')
  var slackbotWeb = new slack.WebClient(slackbot.bot.bot_access_token)
  var botChannelArray = yield slackbotWeb.channels.list()
  var botGroupArray = yield slackbotWeb.groups.list()
  // multi person im
  botGroupArray = botGroupArray.groups.filter(c => !c.is_mpim && !c.is_archived).map((group) => {
    return {
      'id': group.id,
      'name': group.name,
      'is_channel': false
    }
  })

  botChannelArray = botChannelArray.channels.filter(c => !c.is_archived).map((channel) => {
    return {
      'id': channel.id,
      'name': channel.name,
      'is_channel': true
    }
  })
  // slackbot.meta.all_channels = botChannelArray.concat(botGroupArray)
  slackbot.meta.all_channels = botChannelArray
  yield slackbot.save()
}

function * refreshAllUserIMs (slackbot) {
  logging.debug('trying to update all users dms')
  var slackbotWeb = new slack.WebClient(slackbot.bot.bot_access_token)
  var userIMInfo = yield slackbotWeb.im.list()
  // don't care about clippy, i mean slackbot (ugh)
  userIMInfo = userIMInfo.ims.filter(u => u.user !== 'USLACKBOT' || u.is_user_deleted !== true)

  yield userIMInfo.map(function * (u) {
    var chatUser = yield db.Chatusers.findOne({id: u.user, type: {$ne: 'email'}, deleted: {$ne: true}})
    if (!chatUser) {
      logging.warn('tried to refresh IM for nonexistant user', u)
    } else if (_.get(chatUser, 'dm') !== u.id) {
      logging.debug('updating user dm', chatUser.name)
      chatUser.dm = u.id
      yield chatUser.save()
    } else {
      logging.debug('no need to update user dm', chatUser.name)
    }
  })
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

function* showLoading(message) {
  var json = message.source.original_message;
  let searchText = this.randomSearching();
  if (!json) {
    var msg = new db.Message(message);
    msg.mode = 'loading';
    msg.action = 'show'
    msg.text = searchText;
    yield msg.save()
    return yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.results');
  }
  json.attachments.push({
    fallback: message.action,
    callback_id: message.action + (+(Math.random() * 100).toString().slice(3)).toString(36),
    text: searchText,
    color: '#45a5f4'
  })
  var stringOrig = JSON.stringify(json)
  let map = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#039': "'"
  }
  stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: stringOrig
  });
  return;
}

function* hideLoading(message) {
  var history = yield db.Messages.find({
    'thread_id': message.source.channel
  }).sort({
    '_id': -1
  }).limit(2).exec();
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({
    team_id: team_id
  }).exec();
  var relevantMessage = history[0];
  if (!message.source.original_message) {
    let token = team.bot.bot_access_token,
      channel = message.source.channel,
      ts = message.source.ts;
    yield request({
      uri: `https://slack.com/api/chat.delete?token=${token}&ts=${ts}&channel=${channel}&as_user=true`,
      method: 'POST',
      json: true
    });
    return;
  }
  message.source.original_message.attachments.splice(-1, 1);
  var stringOrig = JSON.stringify(message.source.original_message)
  let map = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    '#039': "'"
  }
  stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: stringOrig
  });
  return;
}

function* sendLastCalls(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (!team_id) {
    logging.error('could not find team_id associated with message', message)
    throw new Error('could not find team_id associated with message', message)
  }
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
        "name": item.quantity > 1 ? "removeitem" : 'removewarn',
        "text": "—",
        "style": "default",
        "type": "button",
        "value": "remove"
      }, {
      "name": "additem",
      "text": "+",
      "style": "default",
      "type": "button",
      "value": "add"
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

    attachments.push({
      text: summaryText,
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })

  return attachments
}


function * sendCartToAdmins(message,team) {
  if (typeof team === 'undefined') {
    logging.error('cannot send cart to admin of undefined team. message was', message)
    return
  }

   var cutoff = new Date("2016-12-14T23:07:00.417Z");
   var added = new Date(team.meta.dateAdded)
   var copy;
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

/**
 * Chooses a random hint message for the Kip Store
 * @return {String} a hint, prepended with an unicode symbol
 */
function randomStoreHint() {
  let messages = [
    '✎ You can also search what you want below (Example: _MacBook Pro Power Cord_)',
    '✂︎ Add items directly from Amazon by pasting the URL and sending it to me'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}

/**
 * Chooses a random searching messages
 * @return {String} a searching message, suffixed with an ellipsis
 */
function randomSearching() {
  let messages = [
    'Searching…',
    'Foraging…',
    'Looking…',
    'Exploring…',
    'Seeking…'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}
/**
 * Chooses a random welcome message
 * @return {String} a welcome message, suffixed with a (happy) emoji
 */
function randomWelcome(userId) {
  let messages = [
    'Hey there, how can I help you today?',
    'Looking for something? Let me help',
    'Hey how\'ve you been?',
    'Did you know the first digital assistant was made in 1992? We’ve come a long way!',
    'Fun fact: Mars Curiosity Rover has an AI that is programmed to sing happy birthday to itself',
    `Hey <@${userId}>, what’s up?`,
    `Hey <@${userId}>, how’s it going?`,
    `Hey <@${userId}>, good to see you`,
    `Hey <@${userId}>, what’s happening?`,
    'Hey, what can I do for you?'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}

function randomCafeDescrip() {
  let messages = [
    'I can help you collect food orders for the team',
    'Let me help you order food for the team',
    'Make ordering food as easy as a pie',
    'I’d love to help you collect orders for food'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}

function randomStoreDescrip() {
  let messages = [
    'Short of pencils? Need paper? Let me help!',
    'I can help you get a list of things your team needs',
    'Let me help you get all the stuff your team needs',
    'I’ll put together a list of things your team needs',
    'I’ll help you get all the team supplies you need',
    'Don’t waste time, I’ll get the team supplies for you!'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}

function randomSearchTerm () {
  let messages = [
    'Headphones',
    'Phones',
    'Coding Books',
    'Healthy Snacks',
    'Keyboards',
    'Mouse',
    'Laptops',
    'Water Bottles',
    'Coffee',
    'Notebooks',
    'Penguin Snacks'
  ];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num];
}

function randomEmoji (isCafe) {
  let messages = isCafe
    ? ['🍕', '🍩', '🍔', '🍰', '🍴', '🍣', '🍲', '🍪', '🍛']
    : ['🛍', '🛒', '🎁', '📦', '📓', '✏️', '📚', '🖇', '💻'];
  let num = Math.floor(Math.random() * messages.length);
  return messages[num] + '\u00A0 ';
}

function getSearchButtons() {
  let buttons = [];
  while (buttons.length < 3) {
    buttons.push(randomSearchTerm());
    buttons = _.uniqWith(buttons, (a, b) => a === b);
  }
  return buttons;
}

function * couponText(team) {
  let coupon = yield db.Coupons.find({
    team_id: team
  }).exec();
  return coupon.reduce((text, coupon) => {
    let totalCoupons = coupon.quantity_coupon.can_be_used,
      usedCoupons = coupon.quantity_coupon.used;
    if (coupon.available && coupon.coupon_type === 'percentage' && totalCoupons - usedCoupons > 0) {
      let percentOff = coupon.coupon_discount * 100;
      text += `▸ ${totalCoupons - usedCoupons} × [_${percentOff}% Off Coupon_]  \n`;
    }
    return text;
  }, '');
}

module.exports = {
  refreshAllUserIMs: refreshAllUserIMs,
  initializeTeam: initializeTeam,
  findAdmins: findAdmins,
  getTeamMembers: getTeamMembers,
  getChannels: getChannels,
  getChannelMembers: getChannelMembers,
  refreshAllChannels: refreshAllChannels,
  addCartChannel: addCartChannel,
  removeCartChannel: removeCartChannel,
  addViaAsin: addViaAsin,
  getAllChannels: getAllChannels,
  isAdmin: isAdmin,
  showLoading: showLoading,
  hideLoading: hideLoading,
  updateCron: updateCron,
  sendLastCalls: sendLastCalls,
  getDayNum: getDayNum,
  constructCart: constructCart,
  setCron: setCron,
  randomWelcome: randomWelcome,
  randomStoreHint: randomStoreHint,
  randomSearching: randomSearching,
  randomStoreDescrip: randomStoreDescrip,
  randomCafeDescrip: randomCafeDescrip,
  getSearchButtons: getSearchButtons,
  randomEmoji: randomEmoji,
  couponText: couponText
};
