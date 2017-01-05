var _ = require('lodash')
var message_tools = require('../message_tools')
module.exports = {}
var handlers = module.exports.handlers = {}
var onboard = require('./onboard');
var queue = require('../queue-mongo');
var slackUtils = require('../slack/utils');
var cardTemplate = require('../slack/card_templates');

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
  } else if(_.get(message,'action') === 'get-admins.confirm') {
    return yield handlers['get-admins.confirm'](message)
  } else if(_.get(message,'action') === 'get-admins.addme') {
    return yield handlers['get-admins.addme'](message)
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
  attachments.push({text: welcome, mrkdwn_in: ['text'],color: '#3AA3E3'})
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
  var admins = [];
  var user_is_admin = false
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();

  var find = yield db.Slackbots.find({'team_id': message.source.team}).exec();
  if (!find || find && find.length == 0) {
    return kip.debug('could not find team : ', message, find);
  } else {
    var team = find[0];
  }

  var office_admins = message.original_text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
  var isAdmin;
  office_admins = office_admins.map(g => {
    if (g === 'me' || g === 'ME') {
       isAdmin = true;
      team.meta.office_assistants.push(message.user_id);
      return message.user_id
    } else {
      team.meta.office_assistants.push(g.replace(/(\<\@|\>)/g, ''));
      return g.replace(/(\<\@|\>)/g, '')
    }
  });
  team.meta.office_assistants = _.uniq(team.meta.office_assistants);
  yield team.save();
  var users = yield db.Chatusers.find({
    team_id: team.team_id,
    is_bot: {$ne: true},
    deleted: {$ne: true}
  });
  var currentUser = yield db.Chatusers.findOne({
    id: message.source.user
  });
  yield users.map(function*(u) {
    var re = new RegExp('\\b' + u.id + '\\b', 'i');
    if (message.original_text.match(re)) {
      office_admins.push(u.id);
      if (u.id != currentUser.id) {
        var msg = new db.Message();
        msg.reply = cardTemplate.onboard_home_attachments('tomorrow');
        msg.text = `<@${message.source.user}> just made you an admin of Kip!\nWe'll help you get started :) Choose a Kip mode below to start a tour`;
        msg.source = {};
        msg.mode = 'onboard';
        msg.action = 'home';
        msg.source.team = team.team_id;
        msg.source.channel = u.dm;
        msg.source.user = u.id;
        msg.user_id = u.id;
        msg.thread_id = u.dm;
        yield msg.save();
        yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.notification');
      }
    }
  });
  office_admins = _.uniq(office_admins);
  // add the admin strings into the reply message
  reply_success = reply_success.replace('$ADMINS', office_admins.map(g => {
    return '<@' + g + '>'
  }).join(', ').replace(/,([^,]*)$/, ' and $1'));
  message.mode = 'onboarding';
  message.action = 'get-admins.response';

  if (isAdmin) {
    var next_message = message
    next_message.mode = 'onboard';
    next_message.action = 'home';
    return yield onboard.handle(next_message);
  } else {
    message.mode = 'onboarding';
    message.text = '';
    var attachments = [];
    attachments.push({
      text: 'Are you sure you don\'t want to be an admin for team *' + team.team_name + '*?',
      fallback: 'You are unable to choose a game',
      callback_id: 'wopr_game',
      color: '#3AA3E3',
      mrkdwn_in: ['text', 'pretext'],
      attachment_type: 'default',
      actions: [{
        name: "onboarding.get-admins.confirm",
        text: "Confirm",
        style: "primary",
        type: "button",
        value: "onboarding.get-admins.confirm"
      }, {
        name: "onboarding.get-admins.addme",
        text: "Add me as an Admin!",
        style: "default",
        type: "button",
        value: "onboarding.get-admins.addme"
      }]
    });
    message.reply = attachments;
    yield message.save()
    return [message]
  }
}

/**
 * Ask one more time is user is sure he/she does not want to be admin.
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.confirm'] = function * (message) {
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();
  var admins = yield slackUtils.findAdmins(team);
  var reply = '';
  if (team.meta.office_assistants.length == 0) {
    reply = 'You didn\'t choose an admin for your team, I will allow anybody in the team to manage for now :-)'
    team.meta.p2p = true;
    kip.debug('P2P mode ON');
    var members = yield slackUtils.getTeamMembers(team);
    team.meta.office_assistants = members.map( (m) => {
      return m.id
    })
    yield team.save();
    var next_message = message;
    next_message.text = reply;
    delete next_message.reply;
    next_message.mode = 'onboard';
    next_message.action = 'home';
    return yield onboard.handle(next_message);
  } else {
    reply = `Great! I\'ll keep $ADMINS up-to-date on what your team members are adding to the office shopping cart 😊`;
    reply = reply.replace('$ADMINS', admins.map(g => {
    return '<@' + g.id + '>'
    }).join(', ').replace(/,([^,]*)$/, ' and $1'));
    var slackreply = cardTemplate.home_screen(false);
    var msg = {
      action: 'simplehome',
      mode: 'food',
      source: message.source,
      origin: message.origin,
      reply: {
        data: slackreply
      }
    }
    yield queue.publish('outgoing.' + message.origin, msg, 'home.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
  }
}


/**
 * User changed mind and wants be an admin
 * 
 * @param message the latest message from the user
 */
handlers['get-admins.addme'] = function * (message) {
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();
    team.meta.office_assistants.push(message.source.user);
    yield team.save()
    var next_message = message;
    next_message.text = '';
    delete next_message.reply;
    next_message.mode = 'onboard';
    next_message.action = 'home';
   return yield onboard.handle(next_message);
}

