var queue = require('../queue-mongo');
var kip = require('kip');
var co = require('co');
var db = require('db');

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

function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  return msg
}

function send_text_reply(message, text) {
  var msg = text_reply(message, text);
  console.log('<<<'.yellow, text.yellow);
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
queue.topic('incoming').subscribe(incoming => {
  co(function*() {
    console.log('>>>'.yellow, incoming.data.text.yellow);

    // find the last 20 messages in this conversation, including this one
    var history = yield db.Messages.find({
      thread_id: incoming.data.thread_id,
      ts: {
        $lte: incoming.data.ts
      }
    }).sort('-ts').limit(20);

    var message = history[0];
    message.history = history.slice(1);
    if (message._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct message not retrieved from db');
    }

    var route = yield getRoute(message);
    kip.debug('route', route);
    yield handlers[route](message);
    incoming.ack();

  }).catch(kip.err);
});

//
// starts a food order for a group
//
function startFoodOrder(message) {
  console.log('🍕 food order 🌮');
  send_text_reply(message, "yay let's eat! what address should i use?");
}

function getRoute(message) {
  return co(function*() {
    switch (message.text) {
      case 'hi':
        return 'food.begin';
      case '902 broadway':
        return 'food.address';

    }
  })
}

var handlers = {};
handlers['food.begin'] = function* (message) {
  startFoodOrder(message);
}
handlers['food.address'] = function* (message) {
  var addr = message.text;
  // check if it's a good address

  // search for food near that address
}
