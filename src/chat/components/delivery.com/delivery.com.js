require('kip')

var co = require('co')
var _ = require('lodash')

var api = require('./api-wrapper')
var queue = require('../queue-mongo')

var UserChannel = require('./UserChannel')
var replyChannel = new UserChannel(queue)

// turn feedback buttons on/off
var feedbackOn = true
var feedbackTracker = {}

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
if (!module.parent) {
  queue.topic('incoming').subscribe(incoming => {
    co(function * () {
      if (incoming.data.text) {
        console.log('>>>'.yellow, incoming.data.text.yellow)
      } else {
        console.log('>>>'.yellow, '[button clicked]'.blue, incoming.data.data.value.yellow)
      }

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
      if (!message.action) {
        kip.debug('setting mode to prevaction', message.prevAction)
        message.action = message.prevAction
      }

      yield handleMessage(message)
      incoming.ack()
    }).catch(e => {
      kip.err(e)
      incoming.ack()
    })
  })
}

function * handleMessage (message) {
  // parse the action value objects if they exist
  try {
    message.data.value = JSON.parse(message.data.value)
  } catch (e) {}

  var route = yield getRoute(message)

  if (message.text && message.mode === 'food' || message.mode === 'cafe') {
    // if user types something allow the text_matching flag which we can use
    // in some handlers: cuisine picking, restaurant picking, item picking
    message.allow_text_matching = true
  }

  kip.debug('mode', message.mode, 'action', message.action)
  kip.debug('route'.cyan, route.cyan)
  // message.mode = 'food'
  // message.action = route.replace(/^food./, '')
  if (handlers[route]) {
    yield handlers[route](message)
  } else {
    kip.error('No route handler for ' + route)
    incoming.ack()
  }
  message.save()
}

//
// this is the worst part of building bots: intent recognition
//
function getRoute (message) {
  kip.debug(`prevRoute ${message.prevRoute}`)
  return co(function * () {
    if (message.text === 'food' || message.text === 'cafe') {
      kip.debug('### User typed in :' + message.text)
      return 'food.begin'
    } else if (handlers[message.text]) {
      // allows jumping to a section, will want to remove this when not testing to not create issues
      return message.text
    } else {
      return (message.mode + '.' + message.action)
    }
    // unreachable
    throw new Error("couldn't figure out the right mode/action to route to")
  }).catch(kip.err)
}

//
// Set up route handlers
//
var handlers = {}
require('./menu_handlers')(replyChannel, handlers)
require('./cart_handlers')(replyChannel, handlers)
require('./handlers_admin_initial')(replyChannel, handlers)
require('./handlers_user_selection')(replyChannel, handlers)
require('./handlers_votes')(replyChannel, handlers)
require('./handlers_checkout')(replyChannel, handlers)
require('./team_handlers')(replyChannel, handlers)

handlers['food.sys_error'] = function * (message) {
  kip.debug('chat message halted.')
}

handlers['food.null'] = function * (message) {
  // nothing to see here
}

handlers['food.exit'] = function * (message) {
  var msg_json = {
    'text': "Are you sure you don't want to order food?",
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'fallback': "Are you sure you don't want to order food?",
        'callback_id': 'leave_confirm',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            name: 'passthrough',
            text: "I don't want food",
            type: 'button',
            value: 'yes'
          },
          {
            name: 'passthrough',
            text: 'Keep ordering food',
            type: 'button',
            value: 'no'
          }
        ]
      }
    ]
  }
  replyChannel.send(message, 'food.exit.confirm', {type: message.origin, data: msg_json})
}

handlers['food.exit.confirm'] = function * (message) {
  replyChannel.sendReplace(message, 'shopping.initial', {type: message.origin, data: {text: 'ok byeee'}})
  // make sure to remove this user from the food message if they are in it
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.user_id)
  foodSession.markModified('team_members')
  foodSession.save()
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function * (message) {
  kip.debug('🍕 food order 🌮')
  return yield handlers['food.admin.select_address'](message, true)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}

module.exports = {
  handleMessage: handleMessage
}
