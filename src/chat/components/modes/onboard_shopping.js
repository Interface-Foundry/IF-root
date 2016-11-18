// Introduces non-admins to the process of adding items to the cart
var handlers = module.exports = {};
var amazon = require('../amazon_search.js');
var db = require('db');
var _ = require('lodash');
var co = require('co');
var cron = require('cron');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');

function* handle(message) {
  if (!message.data) {
    var action = 'sorry'
  } else {
    var data = _.split(message.data.value, '.');
    var action = data[0];
    data.splice(0, 1);
  }
  kip.debug('\n\n\n🤖 action : ', action, 'data: ', data, ' 🤖\n\n\n');
  return yield handlers[action](message, data);
}

module.exports.handle = handle;

/*
 * Step 1:
 * You can search for things you need
 */
handlers['step_1'] = function (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  kip.debug(`\n\n\n\n\n\n\n\n message is: \n ${message} \n\n\n\n\n\n\n\n`);
  var msg = message;
  msg.mode = 'onboard_shopping';
  msg.action = 'home';
  msg.text = '';
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = [{
    text: '*Step 1:* Find items to add to team cart',
    mrkdwn_in: ['text'],
    color: '#A368F0'
  }, {
    text: 'Tap to search for something',
    fallback: 'You are unable to choose a game',
    callback_id: 'wopr_game',
    color: '#3AA3E3',
    attachment_type: 'default',
    actions: cardTemplate.slack_member_onboard_start
  }, {
    text: '✎ Or type what you want (Example: _macbook pro power cord_)',
    mrkdwn_in: ['text']
  }];
  return [msg];
}

/*
 * Step 2:
 * Results and adding to cart
 */
handlers['step_2'] = function*(message, data) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  var searchTerm = data[0];
  var query = '';
  switch (searchTerm) {
    case 'books':
      query = 'coding books'
      break;
    case 'snacks':
      query = 'healthy snacks'
      break;
    default:
      break;
  }
  var results = yield amazon.search({
    query: searchTerm
  }, message.origin);

  if (results == null || !results) {
    kip.debug('-1')
    return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!',
    })
  }

  message._timer.tic('done with amazon_search');

  var msg = message;
  msg.resolved = true;
  msg.incoming = false;
  msg.mode = 'shopping'
  msg.action = 'results'
  msg.exec = {
    mode: 'onboard_shopping',
    action: 'step_2',
    params: {
      query: searchTerm
    }
  }
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.amazon = JSON.stringify(results);
  msg.original_query = results.original_query;
  msg.reply = [{
    text: '*Step 2:* Add items to your basket',
    mrkdwn_in: ['text'],
    color: '#A368F0'
  }, {
    text: 'You can add items to your team\'s basket. Try adding one of the items below to your cart',
    callback_id: 'wopr_game',
    color: '#3AA3E3',
    attachment_type: 'default'
  }];
  return [msg];
}

/*
 * Step 3:
 * You can copy/paste etc. text
 */
handlers['step_3'] = function *(message) {
  // body...
}


/*
 * Reminders:
 * You can tell Kip to ask again later
 */
handlers['reminder'] = function(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var attachments = [];
  attachments.push({
    text: 'Ok! When would you like to be reminded?',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_member_remind,
    callback_id: 'none'
  });
  attachments.push({
    text: '',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  });
  attachments.map(function(a) {
    a.mrkdwn_in = ['text'];
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

handlers['reminder_confirm'] = function*(message, data) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();

  const ONE_DAY = 24 * 60 * 60 * 1000; //hours in a day * mins in hour * seconds in min * milliseconds in second
  var dateDescrip,
    msInFuture = -1,
    alertTime = data[0],
    now = new Date();
  switch (alertTime) {
    case 'today':
      msInFuture = determineLaterToday(now);
      dateDescrip = 'in a bit';
      break;
    case 'tomorrow':
      msInFuture = ONE_DAY;
      dateDescrip = 'tomorrow';
      break;
    case 'one_week':
      msInFuture = ONE_DAY * 7;
      dateDescrip = 'next week';
      break;
    case 'choose':
      msInFuture = ONE_DAY * 3; // 3 days for now
      dateDescrip = 'in a bit';
      break;
    default:
      break;
  }
  var messageText = (msInFuture > 0) ?
    `Ok, I'll talk to you ${dateDescrip}.` :
    'Ok! I won\'t set any reminders.';
  messageText += ' Thanks and have a great day. Type `help` if you\'re feeling a bit wobbly :)';

  if (msInFuture > 0) {
    var currentUser = yield db.Chatusers.findOne({
      id: message.source.user
    });
    var cronAttachments = [{
      text: 'Hey, it\'s me again. Ready to get started?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback: 'Onboard',
      actions: cardTemplate.slack_onboard_member,
      callback_id: 'none'
    }];
    cronAttachments.map(function(a) {
      a.mrkdwn_in = ['text'];
      a.color = '#45a5f4';
    });
    var cronMsg = {
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'onboard',
      action: 'home',
      reply: cronAttachments
    }
    createCronJob([currentUser], cronMsg, team, new Date(msInFuture + now.getTime()));
  }
  var msg = message;
  var attachments = [{
    text: messageText,
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    callback_id: 'none'
  }, {
    text: '',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  }];
  attachments.map(function(a) {
    a.mrkdwn_in = ['text'];
    a.color = '#45a5f4';
  });
  msg.action = 'home'
  msg.mode = 'onboard'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];
}


/**
 * catcher
 */
handlers['sorry'] = function * (message) {

 // kip.debug('\n\n\n  settings.js : 453 : could not understand message : ', message ,'\n\n\n')
   message.text = "Sorry, my brain froze!"
   message.mode = 'onboard_shopping';
   message.action = 'home';
   var attachments = [];
   attachments.push({
      text: 'Don’t have any changes? Type `exit` to quit settings',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
   message.reply = attachments;
   return [message];

}


const createCronJob = function(people, msg, team, date) {
  kip.debug('\n\n\nsetting cron job: ', date.getSeconds() + ' ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), '\n\n\n');
  new cron.CronJob(date, function() {
      people.map(function(a) {
        msg.user_id = a.id;
        msg.user = a;
        msg.source = {
          team: team.team_id,
          channel: a.dm,
          user: a.id,
          type: "message",
          subtype: "bot_message"
        }
        var newMessage = new db.Message(msg);
        newMessage.save();
        queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
      });
    }, function() {
      console.log('just finished the scheduled update thing for team ' + team.team_id + ' ' + team.team_name);
      this.stop();
    },
    true,
    team.meta.weekly_status_timezone);
};
// based on the current time, determine a later time
function determineLaterToday(now) {
  var ONE_HOUR = 60*60*1000;
  if (now.getHours() < 12) return ONE_HOUR;
  else if (now.getHours() < 14) return ONE_HOUR * 2;
  else if (now.getHours() < 17) return (17 - now.getHours()) * ONE_HOUR;
  else return ONE_HOUR;
}
