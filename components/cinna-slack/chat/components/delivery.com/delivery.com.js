var queue = require('../queue-mongo');
var kip = require('kip');
var co = require('co');
var db = require('db');

var search = require('./search');

function default_reply(message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source,
    mode: message.mode,
    action: message.action
  })
}

function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  return msg
}

function send_text_reply(message, text) {
  var msg = text_reply(message, text);
  msg.save();
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
    if (history[1]) {
      message.prevMode = history[1].mode;
      message.prevAction = history[1].action;
      message.prevRoute = message.prevMode + '.' + message.prevAction;
    }

    var route = yield getRoute(message);
    kip.debug('route', route);
    message.mode = 'food';
    message.action = route.replace(/^food./, '');
    yield handlers[route](message);
    incoming.ack();

  }).catch(kip.err);
});

//
// this is the worst part of building bots: intent recognition
//
function getRoute(message) {
  return co(function*() {
    if (message.text === 'food') return 'food.begin';
    if (message.prevRoute === 'food.begin') return 'food.address';
    if (message.prevRoute === 'food.results') return 'food.results';

    throw new Error("couldn't figure out the right mode/action to route to")
  })
}

var handlers = {};

handlers['food.begin'] = function* (message) {
  console.log('🍕 food order 🌮');
  send_text_reply(message, "yeah let's eat! what address should i use?");
  // todo save addresses and show saved addresses
}

handlers['food.address'] = function* (message) {
  var addr = message.text;
  // check if it's a good address
  // TODO

  // search for food near that address
  send_text_reply(message, 'thanks, searching your area for good stuff!');

  var results = yield search.search({
    addr: addr
  });
  var results_message = default_reply(message);
  results_message.action = 'results';
  results_message.text = 'Here are some restaurants you might like nearby';
  results_message.data = {
    results: results.results,
    params: {addr: results.address}
  };
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results');
}
