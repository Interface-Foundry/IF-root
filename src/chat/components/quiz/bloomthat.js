require('../../../kip')

var co = require('co')
var _ = require('lodash')

//var api = require('./api-wrapper')
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

  console.log('MESSAGE RECEIVED!!!!!!!!!!!!! ',message)
  console.log('ROUTE RECEIVED!!!!!!!!!!!!! ',route)


  //RECORD QUIZ ANSWERS

  if(message.source && message.data){
    console.log('CALL BACK ID | | | | | | | | | : ',message.source.callback_id)

    if(message.source.callback_id == 'Q1' || message.source.callback_id == 'Q2' || message.source.callback_id == 'Q3' || message.source.callback_id == 'Q4'){
      console.log('ANSWER VALUE | | | | | | | | | : ',message.data.value)

      var a = new db.Quiz({
        user_id:message.source.user,
        team_id:message.source.team,
        channel_id:message.source.channel,
        quiz_version:'bloomthat',
        answer: message.data.value,
        question: message.source.callback_id
      })
      yield a.save()

      //record answers in new DB 
      //sort into buckets, push to arrays. count total in end

    }    
  }

  kip.debug('mode', message.mode, 'action', message.action)
  kip.debug('route'.cyan, route.cyan)
  // message.mode = 'food'
  // message.action = route.replace(/^food./, '')
  if (handlers[route]) {
    yield handlers[route](message)
  } else {
    kip.error('No route handler for ' + route)
  }
  message.save()
}

//
// this is the worst part of building bots: intent recognition
//
function getRoute (message) {

  kip.debug(`prevRoute ${message.prevRoute}`)
  return co(function * () {
    if (handlers[message.text]) {
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
require('./bloomthat_quiz_questions')(replyChannel, handlers)


handlers['quiz_bloomthat.exit'] = function * (message) {
  let couponText = yield utils.couponText(message.source.team);
  var slackreply = card_templates.home_screen(true, message.source.user, couponText);
  replyChannel.sendReplace(message, 'shopping.initial', {type: message.origin, data: slackreply})
}


// //bloomthat quiz start
handlers['quiz_bloomthat.begin'] = function * (message) {
  kip.debug('🍕 quiz start 🌮')
  console.log('🍕 quiz start 🌮')
  return yield handlers['quiz_bloomthat.q1'](message, true)
}

// //bloomthat quiz start
handlers['quiz_bloomthat.help'] = function * (message) {
  console.log('🍕 quiz HELP???? 🌮')

  return yield handlers['quiz_bloomthat.help_print'](message, true)
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
