var co = require('co');
var kip = require('../../../kip');
var _ = require('lodash');
var queue = require('../queue-mongo');
var db = require('../../../db');
var image_search = require('../image_search');
var emojiText = require("emoji-text");
var search_results = require('./search_results');
var cart = require('./cart');
var focus = require('./focus');
var showdown = new (require('showdown').Converter)();

function emojify(text) {
  if (!text) {
    return '';
  }
  return text.replace(/:one:/g, '①')
    .replace(/:two:/g, '②')
    .replace(/:three:/g, '③');
}


var groups = {};

module.exports.init = function(server) {
  var io = require('socket.io')(server);
  io.on('connection', on_connection);
}

function on_connection(socket) {
  kip.debug('new socket connected');
  socket.emit('please_init', 'please');
  socket.on('init', on_init.bind(socket));
  socket.on('message', on_message.bind(socket));
}

function on_init(data) {
  var socket = this;
  kip.debug('setting group to', data.group);
  kip.debug('setting user to', data.user);
  socket.group = data.group;
  groups[socket.group] = groups[socket.group] || {};
  socket.user = data.user;
  groups[socket.group][socket.user] = socket;

  db.Messages.find({
    thread_id: socket.group,
  }).limit(10).sort('-ts').exec(function(e, m) {
    socket.emit('init', {
      messages: m.map(m => {
        return {
          html: get_html(m),
          user: m.user_id || m.source.user
        }
      })
    })
  })

}

function on_message(data) {
  var socket = this;
  kip.debug(`message from ${socket.group}/${socket.user}`, data);

  // pre-process message
  var text = emojiText.convert(data.msg, {delimiter: ''});
  var message = new db.Message({
    incoming: true,
    thread_id: socket.group,
    original_text: data.msg,
    user_id: socket.user,
    origin: 'web',
    text: text,
    source: {
      group: socket.group,
      user: socket.user
    }
  });

  message.save().then(() => {
    queue.publish('incoming', message, ['web', socket.group, socket.user, +new Date].join('.'));
    Object.keys(groups[socket.group]).map(k => {
      if (k !== socket.user && groups[socket.group].hasOwnProperty(k)) {
        groups[socket.group][k].emit('message', {
          message: data.msg,
          user: socket.user
        })
      }
    })
  })
}

queue.topic('outgoing.web').subscribe(outgoing => {
  var message = outgoing.data;
  kip.debug('outgoing', outgoing);
  kip.debug('outgoing message', message.source);
  if (typeof groups[message.source.group] === 'undefined') {
    return kip.debug('no sockets connected for group', message.source.group);
  }

  var html = get_html(message);

  Object.keys(groups[message.source.group]).map(k => {
    if (!groups[message.source.group].hasOwnProperty(k)) return;
    groups[message.source.group][k].emit('message', {
      message: html,
      user: message.user_id
    });
  })
  outgoing.ack();
})

function get_html(message) {
  var route = `${message.mode || ''}/${message.action}`;
  kip.debug('route', route);

  // transform message to html
  switch (route) {
    case '/typing':
      html = 'Just a second...';
      break;
    case 'shopping/results':
      html = search_results(message);
      break;
    case 'cart/view':
      html = cart(message);
      break;
    case 'shopping/focus':
      html = showdown.makeHtml(focus(message));
      break;
    default:
      html = emojify(showdown.makeHtml(message.text));
  }
  console.log('html', html);
  return html;
}
