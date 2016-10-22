require('kip')
require('nodejs-dashboard')

var co = require('co')
var fs = require('fs')
var _ = require('lodash')
var path = require('path')

var api = require('./api-wrapper')
var queue = require('../queue-mongo')
var search = require('./search')
var utils = require('./utils')
var address_utils = require('./address_utils')
var request = require('request-promise')
var team_utils = require('./team_utils.js')
var UserChannel = require('./UserChannel')

var ui = require('../ui_controls')
var all_cuisines = require('./cuisines2').cuisines


var replyChannel = new UserChannel(queue)

function default_reply (message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source,
    mode: message.mode,
    action: message.action,
    state: message.state
  })
}

function text_reply (message, text) {
  var msg = default_reply(message)
  msg.text = text
  return msg
}

function send_text_reply (message, text) {
  var msg = text_reply(message, text)
  msg.save()
  console.log('<<<'.yellow, text.yellow)
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
}

//
// Listen for incoming messages from all platforms because I'm 🌽 ALL 🌽 EARS
//
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

    var session = history[0]
    if (_.get(session, 'state') && _.get(history[1], 'state')) {
      session.state = history[1].state
    }
    if (!session) {
      logging.error('No Session!!!')
      session.state = {}
    }
    session.state = session.state || {}
    session.history = history.slice(1)
    if (session._id.toString() !== incoming.data._id.toString()) {
      throw new Error('correct message not retrieved from db')
    }
    if (history[1]) {
      session.mode = history[0].mode
      session.action = history[0].action
      session.route = session.mode + '.' + session.action
      session.prevMode = history[1].mode
      session.prevAction = history[1].action
      session.prevRoute = session.prevMode + '.' + session.prevAction
    }
    if (!session.mode) {
      kip.debug('setting mode to prevmode', session.prevMode)
      session.mode = session.prevMode
    }
    if (!session.action) {
      kip.debug('setting mode to prevaction', session.prevAction)
      session.action = session.prevAction
    }
    var route = yield getRoute(session)
    kip.debug('mode', session.mode, 'action', session.action)
    kip.debug('route'.cyan, route.cyan)
    // session.mode = 'food'
    // session.action = route.replace(/^food./, '')
    if (handlers[route]) {
      yield handlers[route](session)
    } else {
      kip.error('No route handler for ' + route)
      incoming.ack()
    }
    session.save()
    incoming.ack()
  }).catch(e => {
    kip.err(e)
    incoming.ack()
  })
})

//
// this is the worst part of building bots: intent recognition
//
function getRoute (session) {
  kip.debug(`prevRoute ${session.prevRoute}`)
  return co(function * () {
    if (session.text === 'food') {
      kip.debug('### User typed in :' + session.text)
      return 'food.begin'
    } else if (handlers[session.text]) {
      return session.text
    } else {
      return (session.mode + '.' + session.action)
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
require('./handlers_votes')(replyChannel, handlers)

handlers['food.sys_error'] = function * (session) {
  kip.debug('chat session halted.')
}

handlers['food.null'] = function * (session) {
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
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function * (session) {
  kip.debug('🍕 food order 🌮')
  // loading chat users here for now lel, can remove once init_team is fully implemented tocreate chat user objects:
  team_utils.getChatUsers(session)
  session.state = {}
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  var teamMembers = yield db.Chatusers.find({team_id: session.source.team, is_bot: false, id: {$ne: 'USLACKBOT'}}).exec()
  var foodSession = yield utils.initiateDeliverySession(session, teamMembers)
  yield foodSession.save()
  var address_buttons = _.get(team, 'meta.locations', []).map(a => {
    return {
      name: 'passthrough',
      text: a.address_1,
      type: 'button',
      value: JSON.stringify(a)

    }
  })
  address_buttons.push({
    name: 'passthrough',
    text: 'New +',
    type: 'button',
    value: 'address.new'
  })
  var msg_json = {
    'attachments': [
      {
        'title': '',
        'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
      },
      {
        'text': 'Great! Which address is this for?',
        'fallback': 'You are unable to choose an address',
        'callback_id': 'address',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': address_buttons
      }
    ]
  }
  replyChannel.send(session, 'food.choose_address', {type: session.origin, data: msg_json})
}

//
// User decides what address they are ordering for. could be that they need to make a new address
//
handlers['food.choose_address'] = function * (session) {
  if (_.get(session, 'source.response_url')) {
    // slack action button tap
    try {
      var location = JSON.parse(session.text)
    } catch (e) {
      var location = {address_1: session.text}
      kip.debug('Could not understand the address the user wanted to use, session.text: ', session.text)
    // TODO handle the case where they type a new address without clicking the "new" button
    }
    //
    // START OF S2
    //
    var text = `Cool! You selected \`${location.address_1}\`. Delivery or Pickup?`
    var msg_json = {
      'attachments': [
        {
          'title': '',
          'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
        },
        {
          'mrkdwn_in': [
            'text'
          ],
          'text': text,
          'fallback': 'You did not choose a fulfillment method :/',
          'callback_id': 'wopr_game',
          'color': '#3AA3E3',
          'attachment_type': 'default',
          'actions': [
            {
              'name': 'passthrough',
              'text': 'Delivery',
              'type': 'button',
              'value': 'food.delivery_or_pickup'
            },
            {
              'name': 'passthrough',
              'text': 'Pickup',
              'type': 'button',
              'value': 'food.delivery_or_pickup'
            },
            {
              'name': 'passthrough',
              'text': '< Change Address',
              'type': 'button',
              'value': 'address.change'
            }
          ]
        }
      ]
    }
    replyChannel.sendReplace(session, 'food.delivery_or_pickup', {type: session.origin, data: msg_json})
  } else {
    throw new Error('this route does not handle text input')
  }
}

//
// the user's intent is to create a new address
//
handlers['address.new'] = function * (session) {
  kip.debug(' 🌆🏙 enter a new address')
  // session.state = {}
  var msg_json = {
    'text': "What's the delivery address?",
    'attachments': [{'text': 'Type your address below'}]
  }
  replyChannel.send(session, 'address.confirm', {type: session.origin, data: msg_json})
}

//
// the user seeks to confirm their possibly updated/validated address
//
handlers['address.confirm'] = function * (session) {
  var input = session.text;
  var foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec()
  var res = yield api.searchNearby({addr: input})
  if (!res) return send_text_reply(session, 'Sorry! We couldn\'t find that address!');
  var res_loc = res.search_address;
  res_loc.input = input;
  var location = yield address_utils.parseAddress(res_loc);
  foodSession.chosen_location = location;
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  team.meta.chosen_location = location
  team.meta.locations.push(location)
  yield team.save();
  kip.debug('\n\n\n\n\n final address is : ', location,'\n\n\n\n\n')
  var prompt = 'Is `' + location.address_1 + '` your address?'
  var msg_json = {
    'text': prompt,
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to confirm.',
        'callback_id': 'address_confirm',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            name: 'address_confirm_btn',
            text: 'Confirm',
            type: 'button',
            value: session.text
          },
          {
            name: 'passthrough',
            text: 'Edit',
            type: 'button',
            value: 'address.new'
          }
        ]
      }
    ]
  }
  // storing location in source since there is no other way to persist it thru handler exchanges,
  // feel free to implement a better way. would not make sense to save it in slackbots before it is even validate nah meen
  foodSession.data = { input: session.text}
  yield foodSession.save()
  yield session.save()
  replyChannel.send(session, 'address.validate', {type: session.origin, data: msg_json})
}

handlers['address.validate'] = function * (session) {
  var foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec();
  var text = `Cool! You selected \`${foodSession.data.input}\`. Delivery or pickup?`
  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': text,
        'fallback': 'You did not choose a fulfillment method :/',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': 'Delivery',
            'type': 'button',
            'value': 'food.delivery_or_pickup'
          },
          {
            'name': 'passthrough',
            'text': 'Pickup',
            'type': 'button',
            'value': 'food.delivery_or_pickup'
          },
          {
            'name': 'passthrough',
            'text': '< Change Address',
            'type': 'button',
            'value': 'address.change'
          }
        ]
      }
    ]
  }
  replyChannel.send(session, 'food.user.poll', {type: session.origin, data: msg_json})
}

handlers['address.save'] = function * (session) {
  kip.debug('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n🌃🌉getting to address.save\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
  if (session.text === 'no') {
    return handlers['food.begin'](session)
  }
  var location = JSON.parse(session.text)
  //
  //
  // *Also store the address into mongo*
  //
  //
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()

  if (location) {
    team.meta.locations.push(location)
    team.meta.chosen_location = location
  } else {
    // todo error
    throw new Error('womp bad address')
  }
  yield team.save()
  session.text = JSON.stringify(location)
  return yield handlers['food.choose_address'](session)
}

handlers['address.change'] = function * (session) {
  return yield handlers['food.begin'](session)
}

handlers['food.delivery_or_pickup'] = function * (session) {
  var fulfillmentMethod = session.text
  kip.debug('set fulfillmentMethod', fulfillmentMethod)

  //
  // START OF S2B
  //
  var lastOrdered = yield db.Deliveries.find({team_id: session.source.team, chosen_restaurant: {$exists: true}})
    .sort({_id: -1})
    .select('chosen_restaurant')
    .exec()
  var done = false
  var i = 0
  var merchant
  while (!done) {
    if (i >= lastOrdered.length) {
      done = true
    } else {
      var merchant = yield api.getMerchant(lastOrdered[i].chosen_restaurant.id)
      if (_.get(merchant, 'ordering.availability.delivery')) {
        done = true
      } else {
        merchant = null
      }
    }
  }

  var attachments = []

  if (merchant) {
    var picstitchUrl = yield request({
      uri: kip.config.picstitchDelivery,
      json: true,
      body: {
        origin: 'slack',
        cuisines: merchant.summary.cuisines,
        location: merchant.location,
        ordering: {
          minimum: _.get(merchant, 'ordering.minimum.delivery.lowest', 0),
          delivery_charge: _.get(merchant, 'ordering.fees.delivery_charge', 0),
          availability: merchant.ordering.availability
        },
        summary: merchant.summary,
        url: merchant.summary.merchant_logo }})

    attachments.push({
      title: '',
      image_url: picstitchUrl,
      text: `You ordered \`Deivery\` from \`${merchant.summary.name}\` recently, order again?`,
      color: '#3AA3E3',
      mrkdwn_in: ['text'],
      actions: [{name: 'food.admin.restaurant.confirm', text: 'Choose Restaurant', type: 'button', value: merchant.id}]
    })
  }

  attachments.push({
    'mrkdwn_in': [
      'text'
    ],
    'text': '*Tip:* `✓ Start New Poll` polls your team on what type of food they want.',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'wopr_game',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'passthrough',
        'text': '✓ Start New Poll',
        'style': 'primary',
        'type': 'button',
        'value': 'food.poll.confirm_send'
      },
      {
        'name': 'passthrough',
        'text': 'See More',
        'type': 'button',
        'value': 'food.restaurants.list'
      },

      {
        'name': 'passthrough',
        'text': '× Cancel',

        'type': 'button',
        'value': 'food.exit.confirm',
        confirm: {
          title: 'Leave Order',
          text: 'Are you sure you want to stop ordering food?',
          ok_text: "Don't order food",
          dismiss_text: 'Keep ordering food'
        }
      }
    ]
  })

  var res = {
    attachments: attachments
  }

  replyChannel.send(session, 'food.ready_to_poll', {type: session.origin, data: res})
}

handlers['food.restaurants.list'] = function * (message) {
  // here's some mock stuff for now
  var msg_json = {
    'text': 'Here are 3 restaurant suggestions based on your recent history. \n Which do you want today?',
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': '',
        'image_url': 'http://i.imgur.com/iqjT5iJ.png',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Choose',
            'style': 'primary',
            'type': 'button',
            'value': 'food.poll.confirm_send'
          },
          {
            'name': 'chess',
            'text': 'More Info',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'image_url': 'http://i.imgur.com/8Huwjao.png',
        'mrkdwn_in': [
          'text'
        ],
        'text': '',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Choose',
            'style': 'primary',
            'type': 'button',
            'value': 'food.poll.confirm_send'
          },
          {
            'name': 'chess',
            'text': 'More Info',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'image_url': 'http://i.imgur.com/fP6EcEm.png',
        'mrkdwn_in': [
          'text'
        ],
        'text': '',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓  Choose',
            'style': 'primary',
            'type': 'button',
            'value': 'food.poll.confirm_send'
          },
          {
            'name': 'chess',
            'text': 'More Info',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': '',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '<',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': 'More Choices >',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'maze',
            'text': 'Sort Price',
            'type': 'button',
            'value': 'maze'
          },
          {
            'name': 'maze',
            'text': 'Sort Rating',
            'type': 'button',
            'value': 'maze'
          },
          {
            'name': 'maze',
            'text': 'Sort Distance',
            'type': 'button',
            'value': 'maze'
          }
        ]
      }
    ]
  }
  replyChannel.send(message, 'food.ready_to_poll', {type: message.origin, data: msg_json})
}

handlers['food.poll.confirm_send'] = function * (message) {
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var addr = _.get(foodSession, 'chosen_location.address_1', _.get(foodSession,'data.input',''))
  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': `Send poll for lunch cuisine to the team members at \`${addr}\`?`,
        'fallback': 'Send poll for lunch cuisine to the team members at ',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': 'Confirm',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          },
          {
            'name': 'passthrough',
            'text': 'View Team Members',
            'type': 'button',
            'value': 'team.members'
          },
          {
            'name': 'passthrough',
            'text': '× Cancel',
            'type': 'button',
            'value': 'food.exit'
          }
        ]
      }
    ]
  }

  replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}

handlers['test.s8'] = function * (message) {
  var msg_json = {
    'text': '`Alyx` chose `Choza Taqueria` - Mexican, Southwestern - est. wait time 45-55 min',
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': 'Want to be in this order?',
        'fallback': 'n/a',
        'callback_id': 'food.participate.confirmation',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'food.menu.quick_picks',
            'text': 'Yes',
            'type': 'button',
            'style': 'primary',
            'value': 'food.menu.quick_picks'
          },
          {
            'name': 'food.exit.confirm',
            'text': 'No',
            'type': 'button',
            'value': 'food.exit.confirm',
            'confirm': {
              'title': 'Are you sure?',
              'text': "Are you sure you don't want to order food?",
              'ok_text': 'Yes',
              'dismiss_text': 'No'
            }
          }
        ]
      }
    ]
  }

  replyChannel.send(message, 'food.menu.quick_picks', {type: 'slack', data: msg_json})
}

/**
 * helper to determine an affirmative or negative response
 *
 * 10-4 good buddy is not supported
 *
 * @param {any} text
 * @returns {Boolean} yes
 */
function * yesOrNo (text) {
  text = (text || '').toLowerCase().trim()
  if (text === 'yes') {
    return true
  } else {
    return false
  }
}
