var handlers = module.exports = {};
var db = require('db');
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var dutils = require('../delivery.com/utils');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var cron = require('cron');
var cronJobs = {};
var momenttz = require('moment-timezone');

function * handle(message) {
  var last_action = _.get(message, 'history[0].action');
  if (!last_action || last_action.indexOf('home') == -1) {
    return yield handlers['start'](message)
  } else {
    kip.debug('\n\n\n🤖  onboard:handle:17:message: ', message,' 🤖\n\n\n');
    var action = message.data.value;
    kip.debug('\n\n\n🤖 action : ',action,' 🤖\n\n\n');
    return yield handlers[action](message)
  }
}
 
module.exports.handle = handle;

/**
 * S1
 */
handlers['start'] = function * (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  //adding onboard sticker
  attachments.push({
    // image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: 'Welcome to Kip!  We\'ll help you get started :)'
  });
  if (admins && isAdmin) {
  //
  // Admin-only settings
  //
  attachments.push({
      text: ' What are looking for?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_start,
      callback_id: 'none'
    })
  }
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_settings_default,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   // msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];
 }

/**
 * S2
 */
handlers['supplies'] = function * (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  attachments.push({
      text: ' What are looking for?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_bundles,
      callback_id: 'none'
    })
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];

}

handlers['lunch'] = function * (message) {   
  var msg = message;
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  msg.mode = 'food'
  msg.action = 'begin'
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.state = {}
  var foodSession = yield dutils.initiateDeliverySession(msg)
  yield foodSession.save()
  var address_buttons = _.get(team, 'meta.locations', []).map(a => {
    return {
      name: 'passthrough',
      text: a.address_1,
      type: 'button',
      value: JSON.stringify(a)

    }
  })
  address_buttons.push({
    name: 'passthrough',
    text: 'New +',
    type: 'button',
    value: 'address.new'
  })
  var msg_json = {
    'attachments': [
    {
        'fallback': 'Kip Cafe',
        'title': '',
        'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
      },
      {
        'text': 'Great! Which address is this for?',
        'fallback': 'You are unable to choose an address',
        'callback_id': 'address',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': address_buttons
      }
    ]
  }
  msg.reply = msg_json;  
  return [msg];

}

/**
 * S3
 */
handlers['bundle'] = function * (message) { 
 

}

/**
 * S4
 */
handlers['team'] = function * (message) { 
 

}

/**
 * S4A1 
 */
handlers['reminder'] = function * (message) { 
 

}

/**
 * S4A2
 */
handlers['confirm_reminder'] = function * (message) { 
 

}

/**
 * S4A3
 */
handlers['collect'] = function * (message) { 
 

}

/**
 * S5
 */
handlers['member'] = function * (message) {


}

/**
 * S6
 */
handlers['checkout'] = function * (message) {


}

/**
 * catcher
 */
handlers['sorry'] = function * (message) {


}

