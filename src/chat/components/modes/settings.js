var message_tools = require('../message_tools')
var handlers = module.exports = {};
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var momenttz = require('moment-timezone');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var request = require('request');
var requestP = require('request-promise');
var date_lib = require('date-fns');
var cron = require('cron');
var agenda = require('../agendas');
//maybe can make this persistent later?
var cronJobs = {};

function* handle(message) {
  var last_action = _.get(message, 'history[0].action');
  let action;
  // if (_.get(message,'action') && _.get(message,'action').indexOf('email') > -1) {
  //      var data = _.split(message.action, '.');
  //     action = data[0].trim();
  //     var choice = data[1]; 
  //     var datum = _.get(message,'data.value');
  //     kip.debug('\n\n\n🤖🤖🤖 action : ', action, ' choice: ', choice, 'datum: ', datum,' 🤖\n\n\n');
  //     return yield handlers[action](message, choice, datum);
  // } else
  if (!last_action || last_action != 'home') {
    action = 'start';
  } else if (message.text) {
    action = getAction(message.text);
  } else {
      var data = _.split(message.action, '.');
      action = data[0].trim();
      var choice = data[1]; 
      var datum = _.get(message,'data.value');
      kip.debug('\n\n\n🤖🤖🤖 action : ', action, ' choice: ', choice, 'datum: ', datum,' 🤖\n\n\n');
      return yield handlers[action](message, choice, datum);
  }

  return yield handlers[action](message)
}

module.exports.handle = handle;

/*
 * Show the user all the settings they have access to
 */
handlers['start'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var find = yield db.Slackbots.find({'team_id': team_id}).exec();
  if (!find || find && find.length == 0) {
    return kip.debug('could not find team : ', team_id, find);
  } else {
    var team = find[0];
  }
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user}).exec();

  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  //adding settings mode sticker
  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: ''
  });

  //
  // Admins
  //
  var adminNames = team.meta.office_assistants.map(function(user_id) {
    return '<@' + user_id + '>';
  });
  if (adminNames.length > 1) {
    var last = adminNames.pop();
    adminNames[adminNames.length-1] += ' and ' + last;
  }

  if(adminNames.length < 1){
    var adminText = 'I\'m not managed by anyone right now.';
  } else {
    var adminText = 'I\'m managed by ' + adminNames.join(', ') + '.';
  }

  if (isAdmin && admins && admins.length >= 1) {
    adminText += '  You can *add and remove admins* with `add @user` and `remove @user`.'
  } else if (isAdmin) {
    adminText += '  You can *add admins* with `add @user`.'
  }

  attachments.push({text: adminText});

  var color = '#45a5f4';

  var status = team.meta.weekly_status_enabled ? 'Off' : 'On';
  attachments.push({
      text: 'Do you want to receive weekly email updates on your team cart status?',
      color: color,
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: [{
        name: 'settings.email.' + status.toLowerCase(),
        text: 'Turn '+ status + ' Email',
        style: 'default',
        type: 'button',
        value: !team.meta.weekly_status_enabled,
      }],
      callback_id: 'none'
  })

  var buttons = cardTemplate.settings_menu;

  attachments.push({
      text: '',
      color: color,
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: buttons,
      callback_id: 'none'
    })
    // console.log('SETTINGS ATTACHMENTS ',attachments);
    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify({
        text: '',
        attachments: attachments
      })
    })
  }
  else {
    // for case when settings is typed
    var msg = message;
    msg.mode = 'settings'
    msg.text = ''
    msg.source.team = team_id;
    msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
    msg.reply = attachments;
    return [msg];
  }
}

handlers['back'] = function * (message) {
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(cardTemplate.home_screen(true))
  })
}

handlers['email'] = function * (message, status) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var reverse = status == 'off' ? 'On' : 'Off';
  team.meta.weekly_status_enabled = reverse == 'On' ? false : true;
  yield team.save();
  if (_.get(message,'source.response_url') && _.get(message,'source.original_message.attachments')) {
    var attachments = _.get(message,'source.original_message.attachments');
    var button = {
                  "id": "1",
                  "name": "settings.email." + reverse.toLowerCase(),
                  "text": "Turn " + reverse + " Email",
                  "type": "button",
                  "value": reverse.toLowerCase(),
                  "style": "default"
                 }
    _.setWith(attachments,'[2].actions[0]', button ,{})
    let stringOrig = JSON.stringify({
      text: '',
      attachments: attachments
    });
    var map = {
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
    })
  }

  if (status == 'on') {
    var admins = yield utils.findAdmins(team);
    var cart_id = message.cart_reference_id || message.source.team;
    yield admins.map( function * (admin) {
      agenda.every('0 15 * * 5','send email', { userId: _.get(admin,'id'), to: _.get(admin,'profile.email'), subject: 'This is your weekly team cart status email from Kip!' });
    })
  }
  var msg = message;
  msg.mode = 'settings';
  msg.action = 'home';
  msg.text = 'Ok I turned ' + status + ' weekly email cart updates!';
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}


handlers['add_or_remove'] = function * (message) {
  var replies = [];
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var tokens = message.original_text.toLowerCase().trim().split(' ');
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  if (isAdmin && ['add', 'remove'].indexOf(tokens[0]) >= 0) {
    // look for users mentioned with the @ symbol
    var userIds = tokens.filter((t) => {
      return t.indexOf('<@') === 0;
    }).map((u) => {
      return u.replace(/(\<\@|\>)/g, '').toUpperCase();
    });
    // also look for users mentioned by name without the @ symbol
    var users = yield db.Chatusers.find({
      team_id: team.team_id,
      is_bot: {
        $ne: true
      },
      deleted: {
        $ne: true
      }
    }).select('id name').exec();
    users.map((u) => {
      var re = new RegExp('\\b' + u.name + '\\b', 'i')
      if (message.text.match(re)) {
        userIds.push(u.id);
      }
    });
    if (userIds.length === 0) {
      // return yield handlers['home.sorry'][message]
      var attachments = [];
       attachments.push({
          text: 'Don’t have any changes? Type `exit` to quit settings',
          color: '#49d63a',
          mrkdwn_in: ['text'],
          fallback:'Settings',
          actions: [
              {
                "name": "settings.back",
                "text": "Home",
                "style": "default",
                "type": "button"
              },
              {
                "name": "team",
                "text": "Team Members",
                "style": "default",
                "type": "button",
                "value": "team"
              },
              {
                "name": "viewcart",
                "text": "View Cart",
                "style": "default",
                "type": "button",
                "value": "viewcart"
              }
          ],
          callback_id: 'none'
        });
      attachments.map(function(a) {
        a.mrkdwn_in =  ['text'];
        a.color = '#45a5f4';
      })
      var msg = message;
      msg.mode = 'settings'
      msg.action = 'home'
      msg.text = "We couldn't find that user!";
      msg.reply = attachments;
      msg.source.team = team.team_id;
      msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      return [msg]
    }
    if (tokens[0] === 'add') {
      if(team.meta.p2p) {
         team.meta.p2p = false;
         kip.debug('P2P mode OFF');
         team.meta.office_assistants = [];
      }
      yield userIds.map(function * (id) {
        if (team.meta.office_assistants.indexOf(id) < 0) {
          team.meta.office_assistants.push(id);
          var userToBeNotified = yield db.Chatusers.findOne({id: id});
          var msg = new db.Message();
          msg.source = {};
          msg.mode = 'onboard';
          msg.action = 'home';
          msg.source.team = team.team_id;
          msg.source.channel = userToBeNotified.dm;
          msg.source.user = id;
          msg.user_id = id;
          msg.thread_id = userToBeNotified.dm;
          msg.reply = cardTemplate.onboard_home_attachments('tomorrow');
          msg.text = `<@${message.source.user}> just made you an admin of Kip!\nWe'll help you get started :) Choose a Kip mode below to start a tour`;
          yield msg.save();
          yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.notification');
        }
      })
    } else if (tokens[0] === 'remove') {
      userIds.map((id) => {
        if (team.meta.office_assistants.indexOf(id) >= 0) {
          var index = team.meta.office_assistants.indexOf(id);
          //check to see if there is only one admin left, if so you cant remove the last remaining admin
          if (team.meta.office_assistants.length != 1) {
            team.meta.office_assistants.splice(index, 1);
          }
        }
      })
    }

    team.markModified('meta.office_assistants');
    yield team.save();
    var msg = message;
    msg.mode = 'settings';
    msg.action = 'home';
    msg.text = 'Ok, I have updated your settings!';
    msg.execute = [ { 
      "mode": "settings",
      "action": "home",
      "_id": message._id
    } ];
    msg.source.team = team.team_id;
    msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
    replies.push(msg)
  }
 return yield handlers['start'](msg) //actually showing results instead of just saying you updated settings...should be both eventually
}

handlers['sorry'] = function * (message) {
   message.text = "Sorry, my brain froze!"
   message.mode = 'settings';
   message.action = 'home';
   var attachments = [];
   attachments.push({
      text: 'Don’t have any changes? Type `exit` to quit settings',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: [
          {
            "style": "primary",
            "name": "settings.back",
            "text": "Home",
            "type": "button"
          },
          {
            "name": "team",
            "text": "Team Members",
            "style": "default",
            "type": "button",
            "value": "team"
          },
          {
            "name": "",
            "text": "View Cart",
            "style": "default",
            "type": "button",
            "value": "team"
          }
      ],
      callback_id: 'none'
    });
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
   message.reply = attachments;
     return [message];
}



function getAction(text) {
  var action;
  if (isAddOrRemove(text)) {
    action = 'add_or_remove';
  } else if (text.includes('settings')) {
    action = 'start'
  } else {
    action = 'sorry'
  }
  return action;
}

function isAddOrRemove(input) {
    var regex = /^(add|remove|add @|remove @)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}
