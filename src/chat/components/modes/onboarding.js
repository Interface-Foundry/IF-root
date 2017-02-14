var _ = require('lodash')
var message_tools = require('../message_tools')
var onboard = require('./onboard');
var queue = require('../queue-direct');
var slackUtils = require('../slack/utils');
var cardTemplate = require('../slack/card_templates');
var agenda = require('../agendas');
var request = require('request');
var card_templates = require('../slack/card_templates');

var handlers = {}
/**
 * Main handler which decides what part of the onbaording process the user is at
 *
 * @param {any} message
 */
function * handle (message) {
  var last_action = _.get(message, 'history[0].action')
  cancelReminder('initial reminder', message.source.user);
  cancelReminder('onboarding reminder', message.source.user);
  if (last_action && (last_action.includes('start_now') || last_action.includes('remind_later'))) {
    last_action = 'get-admins.ask'; // this is the only workaround I can think of
  }
  if (!last_action) {
    return yield handlers['start'](message);
  } else if (!message.text) {
    let [action, data] = message.action.split('.');
    kip.debug(`forwarding to onboarding[${action}](message, [${data}])`);
    return yield handlers[action](message, [data]);
  } else {
    return yield handlers['response'](message);
  }
}

/**
 * Starts the onboarding conversation
 *
 * @param message a fake message that has the source information about the origin of the conversation (slack, facebook, etc)
 */
handlers['start'] = function * (message) {
  kip.debug('starting onboarding conversation');
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({team_id: team_id}).exec();

  var welcome_message = message_tools.text_reply(message, '');
  welcome_message.reply = card_templates.onboard_admin_attachments('initial', team.team_name);
  welcome_message.action = 'get-admins.ask';

  let msInFuture = (process.env.NODE_ENV.includes('development') ? 20 : 60 * 60) * 1000; // if in dev, 20 seconds
  let now = new Date();
  let cronMsg = {
    mode: welcome_message.mode,
    action: 'get-admins.ask',
    reply: card_templates.onboard_admin_attachments('tomorrow', team.team_name),
    origin: message.origin,
    source: message.source,
    text: 'Almost there...! :)',
    fallback: 'Almost there...! :)'
  };
  scheduleReminder(
    'initial reminder',
    new Date(msInFuture + now.getTime()), {
      msg: JSON.stringify(cronMsg),
      user: message.source.user,
      token: team.bot.bot_access_token,
      channel: message.source.channel
    });

  return [welcome_message];
}

handlers['remind_later'] = function * (message, data) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({team_id: team_id}).exec();
  const ONE_DAY = 24 * 60 * 60 * 1000; // hours in a day * mins in hour * seconds in min * milliseconds in second
  let nextDate,
    msInFuture = -1,
    alertTime = data[0],
    now = new Date();
  switch (alertTime) {
    case 'tomorrow':
      msInFuture = ONE_DAY;
      nextDate = 'one_week';
      break;
    case 'one_week':
      msInFuture = ONE_DAY * 7;
      nextDate = 'two_week';
      break;
    case 'two_week':
      msInFuture = ONE_DAY * 14; // 3 days for now
      nextDate = 'tomorrow';
      break;
    default:
      break;
  }
  if (process.env.NODE_ENV.includes('development')) msInFuture = 20 * 1000; // 20 seconds for dev
  if (msInFuture > 0) {
    let cronMsg = {
      mode: message.mode,
      action: 'home',
      reply: cardTemplate.onboard_admin_attachments(nextDate, team.team_name),
      origin: message.origin,
      source: message.source,
      text: 'Hey, it\'s me again! Ready to get started?',
      fallback: 'Hey, it\'s me again! Ready to get started?'
    };
    scheduleReminder(
    'onboarding reminder',
    new Date(msInFuture + now.getTime()), {
      msg: JSON.stringify(cronMsg),
      user: message.source.user
    });
  }

  let laterMsg = {
    text: 'Ok, I\'ll talk to you soon!',
    fallback: 'Ok, I\'ll talk to you soon!',
    history: message.history,
    attachments: [{
      text: '',
      callback_id: 'kip!',
      actions: [{
        'name': 'onboarding.start_now.start_now',
        'text': '▶︎ Start Now',
        'style': 'primary',
        'type': 'button',
        'value': 'onboarding.start_now.start_now'
      }]
    }]
  };
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(laterMsg)
  });
  return [];
};

handlers['start_now'] = function(message) {
  cancelReminder('onboarding reminder', message.source.user);
  let msg = {
    text: 'Ok, let\'s get started!',
    fallback: 'Ok, let\'s get started!',
    attachments: card_templates.onboard_admin_attachments('tomorrow'),
    origin: message.origin,
    source: message.source,
    mode: 'onboarding',
    action: 'home',
    history: message.history
  };
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(msg)
  });
  return [];
};

/**
 * Handles asking the user who manages office purchases.
 * This is only for slack right now.
 *
 * @param message the latest message from the user
 */
handlers['ask'] = function * (message) {
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
handlers['response'] = function * (message) {
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();
  cancelReminder('initial reminder', message.source.user);
  var find = yield db.Slackbots.find({'team_id': message.source.team}).exec();
  if (!find || find && find.length == 0) {
    return kip.debug('could not find team : ', message, find);
  } else {
    team = find[0];
  }

  var office_admins = message.original_text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
  var isAdmin;
  office_admins = office_admins.map(g => {
    if (g === 'me' || g === 'ME') {
      isAdmin = true;
      team.meta.office_assistants.push(message.user_id);
      return message.user_id;
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
        let msg = {};
        if (!u.admin_shop_onboarded) {
          msg.text = `<@${message.source.user}> just made you an admin of Kip!\nWe'll help you get started :) Choose a Kip mode below to start a tour`;
          msg.user_id = u.id;
          msg.thread_id = u.dm;
          msg.mode = 'onboard';
          msg.action = 'home';
          msg.reply = cardTemplate.onboard_home_attachments('initial');
          msg.origin = message.origin;
          msg.source = {
            team: team.team_id,
            channel: u.dm,
            user: u.id
          };
          let cronMsg = msg;
          msg = new db.Message(msg);
          yield msg.save();
          yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.notification');

          cronMsg.reply = cardTemplate.onboard_home_attachments('tomorrow');
          let msInFuture = (process.env.NODE_ENV.includes('development') ? 20 : 60 * 60) * 1000; // if in dev, 20 seconds
          let now = new Date();
          scheduleReminder(
            'initial reminder',
            new Date(msInFuture + now.getTime()), {
              msg: JSON.stringify(cronMsg),
              user: u.id,
              token: team.bot.bot_access_token,
              channel: u.dm
            });
        } else {
          let attachments = [{
            text: 'Looks like you\'ve done this before :blush:\nIf you need a refresher, I can start your tour again',
            mrkdwn_in: ['text'],
            color: '#A368F0',
            callback_id: 'take me home pls',
            actions: [{
              'name': 'onboard.restart',
              'text': 'Refresh Me',
              'style': 'primary',
              'type': 'button',
              'value': 'restart'
            }, {
              name: 'passthrough',
              text: 'Home',
              style: 'default',
              type: 'button',
              value: 'home'
            }]
          }];
          msg.text = `<@${message.source.user}> just made you an admin of Kip!`;
          msg.mode = 'onboard';
          msg.action = 'home';
          msg.user_id = u.id;
          msg.thread_id = u.dm;
          msg.origin = message.origin;
          msg.source = {
            team: team.team_id,
            channel: u.dm,
            user: u.id
          };
          msg.reply = attachments;
          msg = new db.Message(msg);
          yield msg.save();
          yield queue.publish('outgoing.' + message.origin, msg, msg._id + '.reply.notification');
        }
      }
    }
  });
  office_admins = _.uniq(office_admins);
  message.mode = 'onboarding';
  message.action = 'get-admins.response';

  if (isAdmin) {
    var next_message = message;
    next_message.text = 'onboard';
    next_message.mode = 'onboard';
    next_message.action = 'start.start';
    delete next_message.data;
    return yield onboard.handle(next_message);
  } else {
    message.mode = 'onboarding';
    message.text = '';
    var attachments = [];
    attachments.push({
      text: 'Are you sure you don\'t want to be an admin for team *' + team.team_name + '*?',
      fallback: 'Are you sure you don\'t want to be an admin for team *' + team.team_name + '*?',
      callback_id: 'wopr_game',
      color: '#3AA3E3',
      mrkdwn_in: ['text', 'pretext'],
      attachment_type: 'default',
      actions: [{
        name: "onboarding.confirm",
        text: "Confirm",
        style: "primary",
        type: "button",
        value: "get-admins.confirm"
      }, {
        name: "onboarding.addme",
        text: "Add me as an Admin!",
        style: "default",
        type: "button",
        value: "get-admins.addme"
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
handlers['confirm'] = function * (message) {
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();
  if (typeof team === 'undefined') {
    logging.error("could not find team asoociate with message", message)
    throw new Error('cannot confirm for unknown team')
  }
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
    next_message.text = 'onboard';
    next_message.mode = 'onboard';
    next_message.action = 'start.start';
    return yield onboard.handle(next_message);
  } else {
    reply = `Great! I\'ll keep $ADMINS up-to-date on what your team members are adding to the office shopping cart 😊`;
    reply = reply.replace('$ADMINS', admins.map(g => {
    return '<@' + g.id + '>'
    }).join(', ').replace(/,([^,]*)$/, ' and $1'));
    let couponText = yield slackUtils.couponText(message.source.team);
    var slackreply = cardTemplate.home_screen(false, message.source.user, couponText);
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
handlers['addme'] = function*(message) {
  var team = yield db.Slackbots.findOne({
    'team_id': message.source.team
  }).exec();
  team.meta.office_assistants.push(message.source.user);
  yield team.save()

  var msg = {
    action: 'start.start',
    mode: 'onboard',
    source: message.source,
    origin: message.origin
  }
  return yield onboard.handle(msg);
}

const scheduleReminder = function(type, time, data) {
  kip.debug('\n\n\nsetting reminder for ', time.toLocaleString(), '\n\n\n');
  agenda.schedule(time, type, data);
};

const cancelReminder = function(type, userId) {
  kip.debug(`canceling ${type} for ${userId}`);
  agenda.cancel({
    'name': type,
    'data.user': userId
  }, function(err, numRemoved) {
    if (!err) {
      kip.debug(`Canceled ${numRemoved} tasks`);
    } else {
      kip.debug(`Could not cancel task bc ${JSON.stringify(err, null, 2)}`);
    }
  });
};

module.exports = {
  handlers: handlers,
  handle: handle
}
