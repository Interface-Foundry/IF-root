require('../../../kip')

var co = require('co')
var _ = require('lodash')

var api = require('./api-wrapper')
var queue = require('../queue-direct')

var UserChannel = require('./UserChannel')
var replyChannel = new UserChannel(queue)

// turn feedback buttons on/off
var feedbackOn = false
var feedbackTracker = {}

var card_templates = require('../slack/card_templates');
var utils = require('../slack/utils');

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

  if (!message.mode) {
    message.mode = 'food';
    message.action = 'exit.confirm';
  }

  if (message.text && message.mode.toLowerCase().trim() === 'food' || message.mode === 'cafe') {
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
    if (route === 'food.results') {
      // ppl are getting stuck here for some reasonf
      var newMessage = new db.Message({
        source: message.source,
        text: 'exit',
        mode: 'food',
        action: 'exit.confirm'
      })
      yield newMessage.save()
      queue.publish('incoming', message, ['slack', 'delivery.com.exit', Math.random().toString(32).slice(2)].join('.'))
    }
  }
  message.save()
}

//
// this is the worst part of building bots: intent recognition
//
function getRoute (message) {
  kip.debug(`prevRoute ${message.prevRoute}`)
  return co(function * () {
    var text = (message.text || '').toLowerCase().trim()
    // allow people to type food in cuisine selection and it not ruin the order
    if ((text === 'food' || text === 'cafe') && (message.action !== 'admin.restaurant.pick')) {
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
require('./email_handlers')(replyChannel, handlers)
require('./handlers_budget')(replyChannel, handlers)

handlers['food.sys_error'] = function * (message) {
  kip.debug('chat message halted.')
}

handlers['food.null'] = function * (message) {
  // nothing to see here
}

handlers['food.null.continue'] = function * (message) {
  var msg_json = {
    'text': 'Okay we are just going to continue for the time being',
    'fallback': 'Okay we are just going to continue for the time being'
  }
  replyChannel.sendReplace(message, `${message.mode}.${message.action}`, {type: message.origin, data: msg_json})
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

handlers['food.exit.confirm_end_order'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  foodSession.active = false
  yield foodSession.save()
  yield handlers['food.exit.confirm'](message)
}

handlers['food.exit.confirm'] = function * (message) {
  let couponText = yield utils.couponText(message.source.team);
  var slackreply = card_templates.home_screen(true, message.source.user, couponText);
  replyChannel.sendReplace(message, 'shopping.initial', {type: message.origin, data: slackreply})
  // make sure to remove this user from the food message if they are in it
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()

  if(foodSession){
    foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.user_id)
    foodSession.markModified('team_members')
    if (foodSession.team_members.length <= 0){
      foodSession.active = false
    }
    yield foodSession.save()
  }
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function * (message) {
  kip.debug('🍕 food order 🌮')
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()

  if(foodSession){ // If foodSession exists, let initiator know that one is already in progress.
    return yield handlers['food.admin.confirm_new_session'](message)
  } else {//Else carry on like normal
    return yield handlers['food.admin.select_address'](message, true)
  }

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
