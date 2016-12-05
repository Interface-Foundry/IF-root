/*eslint-env es6*/
require('kip');
var async = require('async');
var request = require('request');
var co = require('co');
var _ = require('lodash');
var fs = require('fs');
var banter = require("./banter.js");
var amazon_search = require('./amazon_search.js');
var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");
var kipcart = require('./cart');
var nlp = require('../../nlp2/api');
//set env vars
var config = require('../../config');
var mailerTransport = require('../../mail/IF_mail.js');
//load mongoose models
var mongoose = require('mongoose');
var Message = db.Message;
var Chatuser = db.Chatuser;
var Slackbots = db.Slackbots;
var upload = require('./upload.js');
var email = require('./email');
/////////// LOAD INCOMING ////////////////
var queue = require('./queue-mongo');
var onboarding = require('./modes/onboarding');
var onboard = require('./modes/onboard');
var onboardShopping = require('./modes/onboard_shopping');

var settings = require('./modes/settings');
var team = require('./modes/team');
var shopping = require('./modes/shopping').handlers;
var food = require('./delivery.com/delivery.com').handleMessage;
// For container stuff, this file needs to be totally stateless.
// all state should be in the db, not in any cache here.
var winston = require('winston');
var slackUtils = require('./slack/utils');



winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// I'm sorry i couldn't understand that
function default_reply (message) {
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

// get a simple text message
function text_reply (message, text) {
  var msg = default_reply(message);
  msg.text = text;
  msg.execute = msg.execute ? msg.execute : [];
  msg.execute.push({
    mode: 'banter',
    action: 'reply'
  });
  return msg
}

// sends a simple text reply
function send_text_reply (message, text) {
  var msg = text_reply(message, text)
  // logging.debug('\n\n\nsendmsg: ', msg)
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

// Make it look like Kip is typing
function typing (message) {
  var msg = {
    action: 'typing',
    source: message.source,
    origin: message.origin
  }
  queue.publish('outgoing.' + message.origin, msg, message._id + '.typing.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

function simplehome (message) {

  var slackreply = {
    text: '*Hi! Thanks for using Kip* 😊',
    attachments: [{
      image_url: "http://tidepools.co/kip/kip_menu.png",
      text: 'Click a mode to start using Kip',
      color: '#3AA3E3',
      callback_id: 'wow such home',
      actions: [{
        name: 'passthrough',
        value: 'food',
        text: 'Kip Café',
        type: 'button'
      },{
        name: 'passthrough',
        value: 'shopping',
        text: 'Kip Store',
        type: 'button'
      }]
    }]
    // mrkdwn_in: ['text']
  }

  var msg = {
    action: 'simplehome',
    mode: 'food',
    source: message.source,
    origin: message.origin,
    reply: {data: slackreply}
  }

  queue.publish('outgoing.' + message.origin, msg, 'home.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

function isCancelIntent(message) {
  var text = message.text ? message.text.toLowerCase() : '';
  var cancelPhrases = [
    'stop',
    'exit',
    'cancel',
    'start over',
    'quit',
    'home'
  ];
  return cancelPhrases.indexOf(text) >= 0
}

function isMenuChange(message) {
  return _.get(message,'action') && (_.get(message,'action').indexOf('home.expand') > -1 || _.get(message,'action').indexOf('home.detract') > -1)
}

function * processProductLink(message) {
  var text = message.text ? message.text.toLowerCase() : '';
  if (text.indexOf('www.amazon.com') > -1 ) {
    if (text.indexOf('/dp/') > -1) {
      var asin = text.substr(text.indexOf('/dp/')+4, 10);
    } else if (text.indexOf('/gp/') > -1) {
      var asin = text.substr(text.indexOf('/gp/')+12, 10);
    }
  }
  if (asin) {
    var fail = false;
    try {
      yield slackUtils.addViaAsin(asin, message);
    } catch (err) {
      fail = true;
    }
    if (!fail) {
      message.text = 'view cart';
      message.mode = 'shopping';
      message.action = 'initial';
      yield message.save();
    }
  } 
}

function switchMode(message) {
  var input = message.text ? message.text.toLowerCase().trim() : '';
  var modes = {
    'onboarding': function () {
      return 'onboarding';
    },
    'onboard': function () {
      return 'onboard';
    },
    'onboard_shopping': function () {
      return 'onboard_shopping'
    },
    'shopping': function () {
      return 'shopping';
    },
    'settings': function () {
      return 'settings';
    },
    'team': function () {
      return 'team';
    },
    'food': function () {
      return 'food';
    },
    'cafe': function () {
      return 'food';
    },
    'address': function () {
      return 'address';
    },
    'default': function () {
      return false;
    }
  };
  var mode = (modes[input] || modes['default'])();
  return mode
}

function printMode(message) {
  switch (message.mode) {
    case 'shopping_button':
    case 'shopping':
      winston.debug('In', 'SHOPPING'.rainbow, 'mode 👚👖👗👝👛👜🏬🏪💳🛍')
      break
    case 'onboarding':
      winston.debug('In', 'ONBOARDING'.green, 'mode 👋')
      break
    case 'onboard':
      winston.debug('In', 'ONBOARD'.cyan, 'mode 👋')
      break
    case 'onboard_shopping':
      winston.debug('In', 'ONBOARD_SHOPPING'.cyan, 'mode 👋')
      break
    case 'team':
      winston.debug('In', 'TEAM'.yellow, 'mode 👋')
      break
    case 'settings':
      winston.debug('In', 'SETTINGS'.red, 'mode 👋')
      break
    case 'food':
      winston.debug('In', 'FOOD'.blue, 'mode 👋')
      break
    case 'address':
      winston.debug('In', 'ADDRESS'.purple, 'mode 👋')
      break
    default:
      winston.debug('no mode known such mystery 🕵 ')
      break
  }
}

//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS <--lel
//
queue.topic('incoming').subscribe(incoming => {

  incoming.ack();

  co(function * () {
    if (incoming.data.text) {
      console.log('>>>'.yellow, incoming.data.text.yellow)
    } else if (_.get(incoming, 'data.data.value')) {
      console.log('>>>'.yellow, '[button clicked]'.blue, incoming.data.data.value.yellow)
    }
    var timer = new kip.SavedTimer('message.timer', incoming.data)
    // skipping histoy and stuff rn b/c i dont have time to do it
    if (_.get(incoming, 'data.action') == 'item.add') {
      var selected_data = incoming.data.postback.selected_data;
      var results = yield amazon_variety.pickItem(incoming.data.sender, selected_data);
      var results = yield amazon_search.lookup(results, results.origin);

      logging.debug('taking first item from results')
      var results = results[0]
      logging.debug('raw_results: ', results)

      var history = yield db.Messages.find({thread_id: incoming.data.postback.dataId}).sort('-ts').limit(20);
      var message = history[0];
      message.history = history.slice(1);

      var cart_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team
      var cart_type = 'personal'
      try {
        yield kipcart.addToCart(cart_id, cart_id, results, cart_type);
        logging.debug('added to cart')
        send_text_reply(message, 'Okay :) added that item to cart');
        incoming.ack()
        timer.stop()
        return
      } catch (e) {
        yield send_text_reply(message, 'oops error, you might need to add that manually');
        timer.stop()
        incoming.ack()
        return
      }
    }

    timer.tic('getting history');
    // find the last 20 messages in this conversation, including this one
    var history = yield db.Messages.find({
      thread_id: incoming.data.thread_id,
      ts: {
        $lte: incoming.data.ts
      }
    }).sort('-ts').limit(20)

    var message = history[0]
    message.history = history.slice(1)

    if (history[1]) {
      message.mode = history[0].mode
      message.action = history[0].action
      message.route = message.mode + '.' + message.action
      message.prevMode = history[1].mode
      message.prevAction = history[1].action
      message.prevRoute = message.prevMode + '.' + message.prevAction
    }
    if (!message.mode) {
      kip.debug('setting mode to prevmode', message.prevMode)
      message.mode = message.prevMode
    }
    if (!message.action && message.prevAction) {
      message.action = message.prevAction.match(/(expand|detract)/) ?  'initial' : message.prevAction;
      kip.debug('setting mode to prevaction', message.action)
    }

    timer.tic('got history')
    message._timer = timer
    // fail fast if the message was not in the database
    if (message._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct message not retrieved from db')
    }

    if (isCancelIntent(message)) {
      message.mode = 'shopping';
      message.action = 'switch'
      simplehome(message)
      yield message.save();
      timer.stop();
      return
    }

    if (isMenuChange(message)) { 
      timer.stop();
      incoming.ack()
      return yield shopping[_.get(message,'action')](message);
    }

    yield processProductLink(message);

    if (switchMode(message)) {
      message.mode = switchMode(message);
      if (message.mode.match(/(settings|team|onboard)/)) message.action = 'home';
      yield message.save(); 
    }

    if (!message.mode) {
      if (_.get(message, 'history[0].mode')) {
        message.mode = _.get(message, 'history[0].mode')
      } else if (_.get(message, 'history[1].mode')) {
        message.mode = _.get(message, 'history[1].mode')
      } else {
        message.mode = 'shopping'
      }
    }

    printMode(message)
    debugger;

    //MODE SWITCHER
    switch (message.mode) {
      case 'onboarding':
        if (message.origin === 'slack') {
          var replies = yield onboarding.handle(message)
        } else {
          // facebook
          //check for valid country
          //turn this into a function
          if (text == 'Singapore' || text == 'United States') {
            winston.debug('SAVING TO DB')
            replies = ['Saved country!'];
            //access onboard template per source origin!!!!
            modes[user.id] = 'shopping';
          } else {
            replies = ['Didnt understand, please choose a country thx'];
            winston.debug('Didnt understand, please choose a country thx')
          }
        }
        break;
      case 'onboard':
        if (message.origin === 'slack') {
          var replies = yield onboard.handle(message)
        }
        break;
      case 'onboard_shopping':
        if (message.origin === 'slack') {
          var replies = yield onboardShopping.handle(message)
        }
        break;
      case 'shopping_button':
        if (message.origin === 'slack') {
          var data = _.split(message.data.value, '.');
          var action = data[0];
          data.splice(0, 1);
          var replies = yield shopping[message.mode](message, data);
        }
        break;
      case 'shopping_home':
        var replies = yield shopping['shopping.home'](message);
        break;
      case 'settings':
        if (message.origin === 'slack') {
          var replies = yield settings.handle(message);
        }
        break;
      case 'team':
        if (message.origin === 'slack') {
          var replies = yield team.handle(message);
        }
        break;
      case 'food':
      case 'cafe':
        yield food(message)
        return incoming.ack()
      case 'address':
        return
        break;
      default:
        logging.debug('DEFAULT SHOPPING MODE')
        // try for simple reply
        timer.tic('getting simple response')
        var replies = yield simple_response(message)
        timer.tic('got simple response')
      kip.debug('simple replies'.cyan, replies)
        // not a simple reply, do NLP
      if (!replies || replies.length === 0) {
        timer.tic('getting nlp response')
        logging.info('👽 passing to nlp: ', message.text)
        if (message.execute && message.execute.length >= 1 || message.mode === 'food') {
          replies = yield execute(message)
        } else if (message.text === 'shopping' || (message.execute && message.execute.length >= 1) || 
          (message.action === 'switch' && (message.text === 'shopping' || !message.text))) {
          kip.debug(`SKIPPING NLP: \n ${message}`);
          message.mode = 'shopping'
          message.action = 'initial'
          message.execute.push({
            mode: 'shopping',
            action: 'initial'
          });
          replies = yield execute(message);
        } else {
          kip.debug(`PRENLP message: \n ${JSON.stringify(message, null, 2)}`)
          replies = yield nlp_response(message)
          kip.debug('+++ NLPRESPONSE ' + replies)
        }
        timer.tic('got nlp response')
        kip.debug('nlp replies'.cyan,
          replies.map(function*(r) {
            return {
              text: r.text,
              execute: r.execute
            }
          }))
      }
      if (!replies || replies.length === 0) {
        kip.error('Could not understand message ' + message._id)
        replies = [default_reply(message)]
      }
    }
    if (replies) kip.debug('num replies', replies.length)
    timer.tic('saving message', message)
    yield message.save(); // the incoming message has had some stuff added to it :)
    timer.tic('done saving message', message)
    timer.tic('saving replies')
    yield replies.map(r => {
      if (r) {
        try {
          r.save()
        } catch(err) {
          logging.debug('could not save ' + r, err)
        }
      } else {
        logging.debug('reply_logic:316:r does not exist ' + r)
      }
    })
    timer.tic('done saving replies')
    timer.tic('sending replies')
    yield replies.map((r, i) => {
      kip.debug('\n\n\n🤖 🤖 🤖 reply  ', r, '\n\n\n')
      queue.publish('outgoing.' + r.origin, r, message._id + '.reply.' + i)
    })
    incoming.ack()
    timer.stop()
  }).catch(kip.err)
})

// pre process incoming messages for canned responses
function * simple_response (message) {
  kip.debug('simple_response begin'.cyan)
  var replies = []

  // check for canned responses/actions before routing to NLP
  // this adds mode and action to the message
  if (message.text) {
    var reply =  banter.checkForCanned(message)
  } else {
    message.text = '';
    var reply =  banter.checkForCanned(message)
  }

  kip.debug('prefab reply from banter.js', reply)



  switch (reply.flag) {
    case 'basic': // just respond, no actions
      return [text_reply(message, reply.res)]

    case 'search.initial':
      // send a reply right away
      send_text_reply(message, reply.res)

      // if(message.origin !== 'skype'){
      typing(message)
      // }

      // now also search for item
      message.mode = 'shopping'
      message.action = 'initial'
      message.execute.push({
        mode: 'shopping',
        action: 'initial',
        params: {
          query: reply.query
        }
      })
      break

    case 'search.focus':
      message.mode = 'shopping'
      message.action = 'focus'
      message.execute.push({
        mode: 'shopping',
        action: 'focus',
        params: {
          focus: reply.query
        }
      })
      break

    case 'search.more':
      message.mode = 'shopping'
      message.action = 'more'
      message.execute.push({
        mode: 'shopping',
        action: 'more'
      })
      break
     case 'search.home':
      message.mode = 'settings'
      message.action = 'home'
      message.execute.push({
        mode: 'settings',
        action: 'home'
      })
      break
    case 'purchase.remove':
    case 'cart.remove':
      message.mode = 'cart'
      message.action = 'remove'
      message.execute.push({
        mode: 'cart',
        action: 'remove',
        params: {
          focus: reply.query
        }
      })
      break

    // for testing in PAPRIKA
    case 'slack.search':
    // message.searchSelect = []
    // data.mode = 'search'

      var slackTester

      if (res == 'cheaper') {
        slackTester = {
          payload: '{"actions":[{"name":"cheaper","value":"1"}],"callback_id":"57081aeed625bc9f8a359926","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460148983.486353","message_ts":"1460148974.000406","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/ZM0ZP8V7RNXDY81DH4L1HQ7S.png","image_width":400,"image_height":175,"image_bytes":34155,"callback_id":"57081aeed625bc9f8a359926","title":":one: Women\'s Military Up Buckle Combat Boots Mid Knee High E...","id":1,"title_link":"http:\\/\\/goo.gl\\/VgkoLs","color":"45a5f4","actions":[{"id":"1","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"Similar","text":"\\u27b0 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/CPY561LDJDMINVXX6OI1ICNM.png","image_width":400,"image_height":175,"image_bytes":26562,"callback_id":"57081aeed625bc9f8a359926","title":":two: COCO 1 Womens Buckle Riding Knee High Boots,Coco-01v4.0...","id":2,"title_link":"http:\\/\\/goo.gl\\/u8EY7U","color":"45a5f4","actions":[{"id":"6","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"Similar","text":"\\u27b0 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WQSCP0BWTPXYHBTXR7E2PIPS.png","image_width":400,"image_height":175,"image_bytes":22442,"callback_id":"57081aeed625bc9f8a359926","title":":three: Forever Mango-21 Women\'s Winkle Back Shaft Side Zip Kne...","id":3,"title_link":"http:\\/\\/goo.gl\\/teZTD5","color":"45a5f4","actions":[{"id":"11","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"Similar","text":"\\u27b0 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460148974.000406"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33282428390\\/2Sq4RdP8qAJKRp5JrXfNoGP1"}'
        }
      } else if (res == 'addcart') {
        slackTester = {
          payload: '{"actions":[{"name":"addcart","value":"1"}],"callback_id":"570c721cd365f919d8e2d42d","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433491.790565","message_ts":"1460433437.000476","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Q3QUY8L4W7M800SX5VX0ZJPZ.png","image_width":400,"image_height":175,"image_bytes":44065,"callback_id":"570c721cd365f919d8e2d42d","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/JVK7D21JRMI3W166JGZY3E9E.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c721cd365f919d8e2d42d","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/QUKE3JMMCWAOFCVSTTFL8WYE.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c721cd365f919d8e2d42d","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460433437.000476"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33838187251\\/zVu3xcqUIvln4FbwLLC51zIR"}'
        }
      } else if (res == 'similar') {
        slackTester = {
          payload: '{"actions":[{"name":"similar","value":"2"}],"callback_id":"570c6cef64513dd7d7b1fd24","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433572.400826","message_ts":"1460432112.000473","attachment_id":"3","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K8JSSSW1PUVP4IZJLP4M2ZP1.png","image_width":400,"image_height":175,"image_bytes":42014,"callback_id":"570c6cef64513dd7d7b1fd24","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/IS52N2SHFGP2RD9BDRKWWXBG.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c6cef64513dd7d7b1fd24","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/VTCYNQ0V06PZVODX85ORIE1C.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c6cef64513dd7d7b1fd24","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460432112.000473"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33887511719\\/sh4EXEcx5h2HVAjz5dIIG50i"}'
        }
      } else if (res == 'modify') {
        slackTester = {
          payload: '{"actions":[{"name":"modify","value":"1"}],"callback_id":"570c75d7d365f919d8e2d431","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434417.593489","message_ts":"1460434392.000484","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/6BSZE72GXWKRR0Y79V72NBC7.png","image_width":400,"image_height":175,"image_bytes":39117,"callback_id":"570c75d7d365f919d8e2d431","title":":one: Youngin\' Blues: The Story of Reed and RaKeem","id":1,"title_link":"http:\\/\\/goo.gl\\/dG0mQm","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/UWF0QVNWH4I4LOA7V9PJX270.png","image_width":400,"image_height":175,"image_bytes":44919,"callback_id":"570c75d7d365f919d8e2d431","title":":two: 2015-16 Totally Certified Roll Call Mirror Camo RC Auto...","id":2,"title_link":"http:\\/\\/goo.gl\\/0UHjD5","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K89N9L5QU3SVLH3T7QE4YRZN.png","image_width":400,"image_height":175,"image_bytes":48795,"callback_id":"570c75d7d365f919d8e2d431","title":":three: Rakeem Interlude (feat. Merc)","id":3,"title_link":"http:\\/\\/goo.gl\\/XWkxKp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434392.000484"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33879490084\\/KY3oPL33C2V4W9V7B45xWEMA"}'
        }
      } else if (res == 'moreinfo') {
        slackTester = {
          payload: '{"actions":[{"name":"moreinfo","value":"0"}],"callback_id":"570c7611d365f919d8e2d433","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434463.610937","message_ts":"1460434449.000488","attachment_id":"1","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/OBIAI1M7VY2U2BGWWAA3VIZB.png","image_width":400,"image_height":175,"image_bytes":52377,"callback_id":"570c7611d365f919d8e2d433","title":":one: Greatest Hits","id":1,"title_link":"http:\\/\\/goo.gl\\/vpf4iz","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Z9RGCV9RBFGATNUWVSRUKT7X.png","image_width":400,"image_height":175,"image_bytes":35445,"callback_id":"570c7611d365f919d8e2d433","title":":two: ZZ Way - Spring ZigZag Craft Game","id":2,"title_link":"http:\\/\\/goo.gl\\/W9si1L","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WOIKXKZKL7JO3J6IR9L8YFJ5.png","image_width":400,"image_height":175,"image_bytes":52322,"callback_id":"570c7611d365f919d8e2d433","title":":three: Til The Casket Drops [Explicit]","id":3,"title_link":"http:\\/\\/goo.gl\\/tDTjNp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434449.000488"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33890435429\\/zRrVRvLmlnN8PEDyvMcQWNIx"}'
        }
      }

      incomingMsgAction(slackTester)
      break
    case 'cancel': // just respond, no actions
      // send message
      logging.debug('Kip response cancelled')
      break
    default:
      logging.debug('error: canned action flag missing')
  }

  var messages = yield execute(message)
  kip.debug('simple replies', messages.length)

  return messages
}

// use nlp to deterine the intent of the user
function * nlp_response (message) {
  kip.debug('nlp_response begin'.cyan);
  // the nlp api adds the processing data to the message
  try {
    yield nlp.parse(message);
    if (process.env.NODE_ENV.includes('development')) {
      var debug_message = text_reply(message, '_debug nlp_ `' + JSON.stringify(message.execute) + '`')
    }
    var messages = yield execute(message)
  }
  catch(err) {
    kip.err(err)
  }
  if (process.env.NODE_ENV.includes('development')) {
    return [debug_message].concat(messages)
  } else {
    return messages
  }
}

// do the things
function execute (message) {
  kip.debug('exec', message.execute)
  return co(function * () {
    message._timer.tic('getting messages')
    var messages = yield message.execute.reduce((messages, exec) => {
      var route = exec.mode + '.' + exec.action
      kip.debug('route: ', route, 'exec: ', exec)

      //switch between reply_logic and delivery.com.js as necessary
      var message_promises = exec.mode.match(/^(shopping|settings|team|cart|exit)$/) ? shopping[route](message, exec) : food[route](message);
      if (!message_promises) {
        throw new Error(route + ' handler not implemented')
      }
      if (message_promises instanceof Array) {
        messages = messages.concat(message_promises)
      } else {
        messages.push(message_promises)
      }
      return messages
    }, [])
    // only return messages
    var replies = messages.reduce((all, m) => {
      logging.debug(typeof m)
      if (m instanceof Array) {
        all = all.concat(m)
      } else {
        all.push(m)
      }
      return all
    }, [])
    return replies
  })
}

;`
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
LIFE OF  NEKO
    ＿＿＿＿＿
　 ／＼＿＿＿＿＼
　|￣＼∩・ω・)＼
　|　 ｜￣￣∪￣｜ ﾁﾗｯ
`
