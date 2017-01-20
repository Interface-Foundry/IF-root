// Introduces non-admins to the process of adding items to the cart
var handlers = module.exports = {};
var amazon = require('../amazon_search.js');
var _ = require('lodash');
var cardTemplate = require('../slack/card_templates');
var kipcart = require('../cart');
var winston = require('winston');
var Fuse = require('fuse.js');
var request = require('request');
var agenda = require('../agendas');
var queue = require('../queue-mongo');
var utils = require('../slack/utils.js');

winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function * handle(message) {
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
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var msg = message;
  msg.mode = 'member_onboard';
  msg.action = 'home';
  msg.text = '';
  msg.image_url = 'http://tidepools.co/kip/oregano/onboard_3.png';
  msg.fallback = 'Step 1/3: Find items to add to team cart';
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.reply = [{
    text: '*Step 1/3:* Find items to add to team cart',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 1/3: Find items to add to team cart'
  }, {
    text: 'Looking for something?',
    fallback: 'Looking for something?',
    callback_id: 'wopr_game',
    color: '#3AA3E3',
    attachment_type: 'default',
    actions: cardTemplate.slack_member_onboard_start
  }, {
    'text': '✎ Hint: You can also search what you want below (Example: _MacBook Pro Power Cord_)',
    mrkdwn_in: ['text']
  }];
  cancelReminder('initial reminder', message.source.user);
  return [msg];
};

/*
 * Step 2:
 * Results and adding to cart
 */
handlers['step_2'] = function * (message, data) {
  let team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null),
    searchTerm = data[0],
    query = '';
  switch (searchTerm) {
    case 'coding_books':
      query = 'coding books';
      break;
    case 'healthy_snacks':
      query = 'healthy snacks';
      break;
    default:
      query = searchTerm;
      break;
  }
  let searchMsg = utils.randomSearching();
  let json = message.source.original_message ? message.source.original_message : {
    attachments: []
  };
  json.attachments = [...json.attachments, {
    'text': searchMsg,
    mrkdwn_in: ['text']
  }];
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
  } else {
    var newMessage = new db.Message({
      text: searchMsg,
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'member_onboard',
      fallback: searchMsg,
      action: 'home',
      source: message.source
    });
    yield newMessage.save();
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  }
  var results = yield amazon.search({
    query: query
  }, message.origin);

  if (results == null || !results) {
    kip.debug('-1');
    return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!'
    });
  }

  message._timer.tic('done with amazon_search');

  var msg = message;
  msg.resolved = true;
  msg.incoming = false;
  msg.mode = 'member_onboard';
  msg.action = 'results';
  msg.exec = {
    mode: 'member_onboard',
    action: 'step_2',
    params: {
      query: searchTerm
    }
  };
  msg.text = '';
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.amazon = JSON.stringify(results);
  msg.original_query = results.original_query;
  msg.reply = [{
    text: '*Step 2/3:* Try adding an item to your basket',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 2/3: Try adding an item to your basket'
  }];
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(message.source.original_message)
    });
  }
  return [msg];
};

/*
 * Step 3:
 * You can copy/paste etc. text
 */
handlers['addcart'] = function * (message, data) {
  // taken from modes/shopping.js
  var raw_results = (message.flags && message.flags.old_search) ? JSON.parse(message.amazon) : yield getLatestAmazonResults(message);
  winston.debug('raw_results: ', typeof raw_results, raw_results);
  var results = (typeof raw_results == 'array' || typeof raw_results == 'object') ? raw_results : JSON.parse(raw_results);

  var cart_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO make this available for other platforms
  // Diverting team vs. personal cart based on source origin for now
  var cart_type = message.source.origin === 'slack' ? 'team' : 'personal';
  winston.debug('INSIDE REPLY_LOGIC SAVEE   :   ', data[0] - 1);
  try {
    yield kipcart.addToCart(cart_id, message.user_id, results[data[0] - 1], cart_type);
  } catch (e) {
    kip.err(e);
    return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊');
  }

  // view the cart
  return yield handlers['cart'](message);
};

// modified version of modes/shopping.js
handlers['cart'] = function * (message) {
  let attachments = [{
    text: '*Step 3/3:* Well done!\n I\'ve added your item to the team cart',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    image_url: 'http://tidepools.co/kip/oregano/success.png',
    fallback: 'Step 3/3: Well done!\n I\'ve added your item to the team cart',
    callback_id: 'take me home pls',
    actions: [{
      'name': 'passthrough',
      'text': ':tada:\u00A0 Finish',
      'style': 'primary',
      'type': 'button',
      'value': 'home'
    }]
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
  });
  var cart_reference_id = (message.source.origin === 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO
  res.data = yield kipcart.getCart(cart_reference_id);
  res.data = res.data.toObject();
  return [res];
};

/*
 * Reminders:
 * Schedules reminders in a cylce of 24 hrs, 1 week, and 2 weeks
 */
handlers['remind_later'] = function * (message, data) {
  const ONE_DAY = 24 * 60 * 60 * 1000; // hours in a day * mins in hour * seconds in min * milliseconds in second
  let nextDate,
    msInFuture = -1,
    alertTime = data[0],
    admin = data[1],
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
      msInFuture = ONE_DAY * 14;
      nextDate = 'tomorrow';
      break;
    default:
      break;
  }
  if (process.env.NODE_ENV.includes('development')) msInFuture = 20 * 1000; // 20 seconds for dev
  if (msInFuture > 0) {
    let cronMsg = {
      mode: 'member_onboard',
      action: 'home',
      reply: cardTemplate.member_onboard_attachments(admin, nextDate),
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
        'name': 'member_onboard.start.start_now',
        'text': '▶︎ Start Now',
        'style': 'primary',
        'type': 'button',
        'value': `start_now.${admin}`
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

handlers['start_now'] = function (message, data) {
	// when someone clicks the start now button after choosing to
	// be reminded later
  cancelReminder(message.source.user);
  let admin = data[0];
  let msg = {
    text: 'Ok, let\'s get started!',
    fallback: 'Ok, let\'s get started!',
    attachments: cardTemplate.member_onboard_attachments(admin, 'tomorrow'),
    origin: message.origin,
    source: message.source,
    mode: 'member_onboard',
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
 * catcher
 */
handlers['sorry'] = function(message) {
  if (message.text.includes('amazon.com')) {
    return; // ignore times people paste stuff in
  }
  message.text = 'Sorry, my brain froze!';
  message.mode = 'member_onboard';
  message.action = 'home';
  return [message];
};

/**
 * Handle user input text
 */
handlers['text'] = function * (message) {
  var history = yield db.Messages.find({
    thread_id: message.source.channel
  }).sort('-ts').limit(10);
  var lastMessage = history[1];
  var choices = _.flatten(lastMessage.reply.map(m => {
    return m.actions;
  }).filter(function(n) {
    return n != undefined;
  }));
  if (!choices) {
    return kip.debug('error: lastMessage: ', choices);
  }
  var fuse = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    keys: ["text"]
  });
  var matches = yield fuse.search(message.text);
  var choice;
  if (matches.length > 0) {
    choice = matches[0].text === 'Help' ? 'help' : matches[0].value;
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
};

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

// stolen from modes/shopping.js
//
// Returns the amazon results as it is stored in the db (json string)
// Recalls more history from the db if it needs to, and the history is just appended
// to the existing history so you don't need to worry about stuff getting too messed up.
//
function * getLatestAmazonResults(message) {
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
        throw new Error('Could not find amazon results in message history for message ' + message._id);
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
    action: 'reply'
  });
  return msg;
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
    text: 'I\'m sorry I couldn\'t quite understand that',
    source: message.source
  });
}
