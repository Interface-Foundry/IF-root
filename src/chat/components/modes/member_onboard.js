// Introduces non-admins to the process of adding items to the cart
var handlers = module.exports = {};
var amazon = require('../amazon_search.js');
var _ = require('lodash');
var co = require('co');
var cron = require('cron');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var kipcart = require('../cart');
var winston = require('winston');
var Fuse = require('fuse.js');
var request = require('request')

winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';


function* handle(message) {
  let action;
  if (!message.data) {
    action = 'text'
  } else {
    var data = _.split(message.data.value, '.');
    action = data[0];
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
handlers['step_1'] = function(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var msg = message;
  msg.mode = 'member_onboard';
  msg.action = 'home';
  msg.text = '';
  msg.fallback = 'Step 1: Find items to add to team cart'
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = [{
    text: '*Step 1:* Find items to add to team cart',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 1: Find items to add to team cart'
  }, {
    text: 'Tap to search for something',
    fallback: 'You are unable to choose a game',
    callback_id: 'wopr_game',
    color: '#3AA3E3',
    attachment_type: 'default',
    actions: cardTemplate.slack_member_onboard_start
  }, {
    'text': '✎ Hint: You can also what you want below (Example: _MacBook Pro Power Cord_)',
    mrkdwn_in: ['text']
  }];
  return [msg];
}

/*
 * Step 2:
 * Results and adding to cart
 */
handlers['step_2'] = function*(message, data) {
  let team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null),
    searchTerm = data[0],
    query = '';
  switch (searchTerm) {
    case 'coding_books':
      query = 'coding books'
      break;
    case 'healthy_snacks':
      query = 'healthy snacks'
      break;
    default:
      query = searchTerm;
      break;
  }
  let json = message.source.original_message;
  json.attachments = [...json.attachments, {
    'text': 'Searching...',
    mrkdwn_in: ['text']
  }]
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(json)
  });
  var results = yield amazon.search({
    query: query
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
  msg.mode = 'member_onboard'
  msg.action = 'results'
  msg.exec = {
    mode: 'member_onboard',
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
    text: '*Step 2:* Try adding an item to your basket',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 2: Try adding an item to your basket'
  }];
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(message.source.original_message)
  });
  return [msg];
}

/*
 * Step 3:
 * You can copy/paste etc. text
 */
handlers['addcart'] = function*(message, data) {
  // taken from modes/shopping.js
  var raw_results = (message.flags && message.flags.old_search) ? JSON.parse(message.amazon) : yield getLatestAmazonResults(message);
  winston.debug('raw_results: ', typeof raw_results, raw_results);
  var results = (typeof raw_results == 'array' || typeof raw_results == 'object') ? raw_results : JSON.parse(raw_results);

  var cart_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO make this available for other platforms
  //Diverting team vs. personal cart based on source origin for now
  var cart_type = message.source.origin == 'slack' ? 'team' : 'personal';
  winston.debug('INSIDE REPLY_LOGIC SAVEE   :   ', data[0] - 1);
  try {
    yield kipcart.addToCart(cart_id, message.user_id, results[data[0] - 1], cart_type)
  } catch (e) {
    kip.err(e);
    return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊')
  }

  // view the cart
  return yield handlers['cart'](message);
}

//modified version of modes/shopping.js
handlers['cart'] = function*(message) {
  let attachments = [{
    text: '*Step 3:* Well done!\n I\'ve added your item to the team cart',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 3: Well done!\n I\'ve added your item to the team cart'
  }];
  let res = new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    source: message.source,
    mode: 'shopping',
    action: 'onboard_cart',
    reply: attachments
  })
  var cart_reference_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO
  res.data = yield kipcart.getCart(cart_reference_id);
  res.data = res.data.toObject();
  if (res.data.items.length < 1) {
    return text_reply(message, 'It looks like your cart is empty');
  }
  return [res];
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
    actions: cardTemplate.member_reminder,
    callback_id: 'none',
    fallback: 'Ok! When would you like to be reminded?'
  });
  var msg = message;
  msg.mode = 'member_onboard'
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
      msInFuture = determineLaterToday();
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
      mrkdwn_in: ['text'],
      fallback: 'member_onboard',
      actions: cardTemplate.slack_onboard_member,
      callback_id: 'none',
      color: '#45a5f4'
    }];

    var cronMsg = {
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'member_onboard',
      action: 'home',
      reply: cronAttachments
    }
    createCronJob([currentUser], cronMsg, team, new Date(msInFuture + now.getTime()));
  }
  var msg = message;
  var attachments = [{
    text: messageText,
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    fallback: messageText.replace('*', ''),
    callback_id: 'none'
  }];

  msg.action = 'home'
  msg.mode = 'member_onboard'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];
}


/**
 * catcher
 */
handlers['sorry'] = function(message) {
  if(message.text.includes('amazon.com')){
  	return; //ignore times people paste stuff in
  }
  message.text = "Sorry, my brain froze!"
  message.mode = 'member_onboard';
  message.action = 'home';
  var attachments = [];
  attachments.push({
    text: 'Don’t have any changes? Type `exit` to quit settings',
    mrkdwn_in: ['text'],
    fallback: 'Sorry!',
    callback_id: 'none',
    color: '#45a5f4'
  });
  message.reply = attachments;
  return [message];
}


/**
 * Handle user input text
 */
handlers['text'] = function*(message) {
  var history = yield db.Messages.find({
    thread_id: message.source.channel
  }).sort('-ts').limit(10);
  var lastMessage = history[1];
  var choices = _.flatten(lastMessage.reply.map(m => {
    return m.actions
  }).filter(function(n) {
    return n != undefined
  }))
  if (!choices) {
    return kip.debug('error: lastMessage: ', choices);
  }
  var fuse = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    keys: ["text"]
  })
  var matches = yield fuse.search(message.text)
  var choice;
  if (matches.length > 0) {
    choice = matches[0].text == 'Help' ? 'help' : matches[0].value;
    if (choice.indexOf('.') > -1) {
      var handle = choice.split('.')[0];
      var data = [choice.split('.')[1]];
      return yield handlers[handle](message, data);
    } else {
      try {
        return yield handlers[choice](message);
      } catch (err) {
        return yield handlers['step_2'](message, [message.text]);
      }
    }
  } else {
    return yield handlers['step_2'](message, [message.text]);
  }
}

const createCronJob = function(people, msg, team, date) {
  kip.debug('\n\n\nsetting cron job: ', date.getSeconds() + ' ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), '\n\n\n');
  new cron.CronJob(date, function() {
      people.map(function(a) {
        var newMessage = new db.Message({
          incoming: false,
          thread_id: a.dm,
          resolved: true,
          user_id: a.id,
          origin: 'slack',
          text: '',
          source: {
            team: team.team_id,
            channel: a.dm,
            thread_id: a.dm,
            user: a.id,
            type: 'message',
          },
          reply: msg.reply,
          mode: msg.mode,
          action: msg.action,
          user: a.id
        })
        co(publish(newMessage));
      });
    },
    function() {
      kip.debug('just finished the scheduled update thing for team ' + team.team_id + ' ' + team.team_name);
      this.stop();
    }, true, team.meta.weekly_status_timezone);
};

function* publish(message) {
  yield message.save();
  queue.publish('outgoing.' + message.origin, message, message._id + '.reply.update');
}


// based on the current time, determine a later time
const determineLaterToday = function(now) {
  const ONE_HOUR = 60 * 60 * 1000;
  if (process.env.NODE_ENV.includes('development')) return 20 * 1000; //20 seconds for dev
  else return ONE_HOUR;
}

// stolen from modes/shopping.js
//
// Returns the amazon results as it is stored in the db (json string)
// Recalls more history from the db if it needs to, and the history is just appended
// to the existing history so you don't need to worry about stuff getting too messed up.
//
function* getLatestAmazonResults(message) {
  var results, i = 0;
  while (!results) {
    if (!message.history[i]) {
      var more_history = yield db.Messages.find({
        thread_id: message.thread_id,
        ts: {
          $lte: message.ts
        }
      }).sort('-ts').skip(i).limit(20);

      if (more_history.length === 0) {
        winston.debug(message);
        throw new Error('Could not find amazon results in message history for message ' + message._id)
      }

      message.history = message.history.concat(more_history);
    }

    try {
      results = JSON.parse(message.history[i].amazon);
      results[0].ASIN[0]; // check to make sure there is an actual result
    } catch (e) {
      results = false;
      // welp no results here.
    }

    i++;
  }
  return results;
}

// from modes/shopping.js
// get a simple text message
function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  msg.execute = msg.execute ? msg.execute : [];
  msg.execute.push({
    mode: 'banter',
    action: 'reply',
  })
  return msg
}

// from modes/shopping.js
// I'm sorry i couldn't understand that
function default_reply(message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source
  })
}
