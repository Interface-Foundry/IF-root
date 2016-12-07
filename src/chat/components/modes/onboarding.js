var _ = require('lodash')
var message_tools = require('../message_tools')
module.exports = {}
var handlers = module.exports.handlers = {}
var onboard = require('./onboard');
var queue = require('../queue-mongo');
var slackUtils = require('../slack/utils');

/**
 * Main handler which decides what part of the onbaording process the user is at 
 * 
 * @param {any} message
 */
function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action) {
    return yield handlers['start'](message)
  } else if (last_action === 'get-admins.ask') {
    return yield handlers['get-admins.response'](message)
  } else if(last_action === 'get-admins.response') {
    return yield handlers['reroute'](message)
  } 
}

module.exports.handle = handle;

/**
 * Starts the onboarding conversation
 * 
 * @param message a fake message that has the source information about the origin of the conversation (slack, facebook, etc)
 */
handlers['start'] = function * (message) {
  kip.debug('starting onboarding conversation')
  var attachments = [];
  var welcome = 'Kudos! *Kip* is now officially a member of your team :blush: '
  attachments.push({
    image_url: 'https://kipthis.com/kip_modes/mode_success.png',
    color: '#3AA3E3',
    mrkdwn_in: ['text'],
    fallback:'Onboarding',
    callback_id: 'none'
  })
  attachments.push({text: welcome, color: '#3AA3E3'})
  attachments.push({text:  'Who manages the office purchases? Type something like `me` or `me and @jane`', color: '#3AA3E3',
    mrkdwn_in: [
        'text',
        'pretext'
      ]})
  var welcome_message = message_tools.text_reply(message,'');
  welcome_message.reply = attachments;
  welcome_message.action = 'get-admins.ask';

  return [welcome_message];
}

/**
 * Handles asking the user who manages office purchases.
 * This is only for slack right now.
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.ask'] = function * (message) {
  var reply = 'Who manages the office purchases? Type something like `me` or `me and @jane`'
  // if not slack, move on to the next part of the onboarding convo
  if (message.origin !== 'slack') {
    kip.err('not slack showing up in slack-only onboarding')
    return handlers['finished'](message);
  }
  var msg = message_tools.text_reply(message, reply)
  msg.mode = 'onboarding'
  msg.action = 'get-admins.ask'
  return msg;
}

/**
 * Handles the user response after the user says who hanldes purchases
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.response'] = function * (message) {
  var reply_success = `Great! I\'ll keep $ADMINS up-to-date on what your team members are adding to the office shopping cart 😊`;
  var reply_admin = `Do you want me to take you on a short tour of Kip?`;
  var reply_user = `Why don't you try searching for something? Type something like 'headphones' to search`;
  var reply_failure = "I'm sorry, I couldn't quite understand that, can you clarify for me who manages office purchases? If you want to skip this part, just type 'skip' and we can move on."
  var special_admin_message = message_tools.text_reply(message, 'special instructions for admins') // TODO
  var admins = []
  var user_is_admin = false
  var team = yield db.Slackbots.findOne({
    'source.team_id': message.source.team_id
  }).exec();

  // check for mentioned users
  // for a typed message like "that would be @dan"
  // the response.text would be like  "that would be <@U0R6H9BKN>"
  var office_admins = message.original_text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
  // replace "me" with the user's id, and <@U12345> with just U12345
  office_admins = office_admins.map(g => {
    if (g === 'me') {
      team.meta.office_assistants.push(message.user_id);
      return message.user_id
    } else {
      team.meta.office_assistants.push(g.replace(/(\<\@|\>)/g, ''));
      return g.replace(/(\<\@|\>)/g, '')
    }
  });
  team.meta.office_assistants = _.uniq(team.meta.office_assistants);
  yield team.save();

  // also look for users mentioned by name without the @ symbol
  var users = yield db.Chatusers.find({
    team_id: team.team_id,
    is_bot: {$ne: true},
    deleted: {$ne: true}
  }).select('id name');
  users.map((u) => {
    var re = new RegExp('\\b' + u.name + '\\b', 'i')
    if (message.original_text.match(re)) {
      office_admins.push(u.id);
    }
  });
  office_admins = _.uniq(office_admins);
  // add the admin strings into the reply message
  reply_success = reply_success.replace('$ADMINS', office_admins.map(g => {
    return '<@' + g + '>'
  }).join(', ').replace(/,([^,]*)$/, ' and $1'));
  var isAdmin = yield slackUtils.isAdmin(message.source.user, team);
  message.mode = 'onboarding';
  message.action = 'get-admins.response';
  if (team.meta.office_assistants.length == 0) {
    team.meta.p2p = true;
    kip.debug('P2P mode ON');
    var members = yield slackUtils.getTeamMembers(team);
    team.meta.office_assistants = members.map( (m) => {
      return m.id
    })
    yield team.save();
  } 
  if (isAdmin) {
    reply_success = reply_success.concat('\n' + reply_admin);
  } else {
    reply_success = reply_success.concat('\n' + reply_user);
    message.mode = 'shopping';
    message.action = '';
  }
  var reply_message = message_tools.text_reply(message, reply_success);
  return [reply_message]
}


/**
 * Finishes the onboarding convo with the quick tutorial blurb
 * changes the mode to shopping
 *  
 * @param message the latest message from the user
 */
handlers['reroute'] = function * (message) {
  var next_mode = message.original_text.match(/(yes|ok|sure|yeah|yea)/) && message.original_text.match(/(yes|ok|sure|yeah|yea)/).length > 0 ? 'onboard' : 'shopping';
  if (next_mode == 'shopping') {
    var finished = "Thanks for the info! Why don't you try searching for something? Type something like 'headphones' to search"
    var finished_message = message_tools.text_reply(message, finished);
    finished_message.mode = 'shopping';
    finished_message.action = '';
    return [finished_message];
  } else {
    var next_message = message
    next_message.mode = 'onboard';
    next_message.action = 'home';
    return yield onboard.handle(next_message);
  }
}
