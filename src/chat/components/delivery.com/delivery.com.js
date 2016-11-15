require('kip')

var co = require('co')
var _ = require('lodash')
var sleep = require('co-sleep')
var api = require('./api-wrapper')
var queue = require('../queue-mongo')
var utils = require('./utils')

var team_utils = require('./team_utils.js')
var parseAddress = require('parse-address')
var mailer_transport = require('../../../mail/IF_mail.js')
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

    // parse the action value objects if they exist
    try {
      session.data.value = JSON.parse(session.data.value)
    } catch (e) {}

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

    if (session.text && session.mode === 'food') {
      // if user types something allow the text_matching flag which we can use
      // in some handlers: cuisine picking, restaurant picking, item picking
      session.allow_text_matching = true
    }

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
      // allows jumping to a section, will want to remove this when not testing to not create issues
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
require('./handlers_checkout')(replyChannel, handlers)
require('./team_handlers')(replyChannel, handlers)

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
  // make sure to remove this user from the food session if they are in it
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.user_id)
  foodSession.markModified('team_members')
  foodSession.save()
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function * (session) {
  kip.debug('🍕 food order 🌮')

  // send the banner first
  var msg_json = {
    attachments: [
      {
        'fallback': 'Kip Cafe',
        'title': '',
        'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
      }
    ]
  }
  replyChannel.send(session, 'food.banner', {type: session.origin, data: msg_json})
  yield sleep(1000)

  // loading chat users here for now, can remove once init_team is fully implemented tocreate chat user objects
  team_utils.getChatUsers(session)
  session.state = {}
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  var foodSession = yield utils.initiateDeliverySession(session)
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

    var foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec()
    foodSession.chosen_location = location

    //
    // START OF S2
    //
    var text = `Cool! You selected \`${location.address_1}\`. Delivery or Pickup?`
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
              'name': 'food.delivery_or_pickup',
              'text': 'Delivery',
              'type': 'button',
              'value': 'delivery'
            },
            {
              'name': 'food.delivery_or_pickup',
              'text': 'Pickup',
              'type': 'button',
              'value': 'pickup'
            },
            {
              'name': 'address.change',
              'text': '< Change Address',
              'type': 'button',
              'value': 'address.change'
            }
          ]
        }
      ]
    }
    replyChannel.sendReplace(session, 'food.delivery_or_pickup', {type: session.origin, data: msg_json})

    // get the merchants now assuming "delivery" for UI responsiveness. that means that if they choose "pickup" we'll have to do more work in the next step
    var addr = (foodSession.chosen_location && foodSession.chosen_location.address_1) ? foodSession.chosen_location.address_1 : _.get(foodSession, 'data.input')
    var res = yield api.searchNearby({addr: addr})
    foodSession.merchants = _.get(res, 'merchants')
    foodSession.cuisines = _.get(res, 'cuisines')
    foodSession.markModified('merchants')
    foodSession.markModified('cuisines')
    yield foodSession.save()
  } else {
    throw new Error('this route does not handle text input')
  }
}

//
// the user's intent is to create a new address
//
handlers['address.new'] = function * (message) {
  kip.debug(' 🌆🏙 enter a new address')
  // session.state = {}
  var msg_json = {
    'text': "What's the address for the order?",
    'attachments': [{
      'text': '✎ Type your address below (Example: _902 Broadway 10010_)',
      'mrkdwn_in': ['text']
    }]
  }
  replyChannel.send(message, 'address.confirm', {type: message.origin, data: msg_json})
}

//
// the user seeks to confirm their possibly updated/validated address
//
handlers['address.confirm'] = function * (message) {
  // ✐✐✐
  // send response since this is slow
  replyChannel.sendReplace(message, 'address.save', {type: message.origin, data: {text: 'Thanks! We need to process that address real quick.'}})
  try {
    var res = yield api.searchNearby({addr: message.text})
    logging.data('address broh', _.keys(res))
    var location = {
      address_1: res.search_address.street,
      address_2: res.search_address.unit,
      zip: res.search_address.zip,
      zip_code: res.search_address.zip_code,
      postal_code: res.search_address.postal_code,
      state: res.search_address.state,
      city: res.search_address.city,
      sublocality: res.search_address.sublocality,
      latitude: res.search_address.latitude,
      longitude: res.search_address.longitude,
      neighborhood: res.search_address.neighborhood
    }
  } catch (err) {
    logging.error('error searching that address', err)
    replyChannel.sendReplace(message, 'address.new', {
      type: message.origin,
      data: {text: `Sorry, I can't find that address! Try typing something like: "902 Broadway New York, NY 10010"`}
    })
    return
  }

  var msg_json = {
    'text': `Is ${location.address_1} ${location.city}, ${location.state}, ${location.zip_code} your address?`,
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
            name: 'address.save',
            text: '✓ Confirm Address',
            type: 'button',
            style: 'primary',
            value: JSON.stringify(location)
          },
          {
            name: 'passthrough',
            text: 'Edit Address',
            type: 'button',
            value: 'address.new'
          }
        ]
      }
    ]
  };

  // collect feedback on this feature
  if (feedbackOn && msg_json) {
    msg_json.attachments[0].actions.push({
      name: 'feedback.new',
      text: '⇲ Send feedback',
      type: 'button',
      value: 'feedback.new'
    })
  }

  replyChannel.send(message, 'address.save', {type: message.origin, data: msg_json})
}

// Save the address to the db after the user confirms it
handlers['address.save'] = function * (session) {
  var foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec()
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  var location = session.data.value

  if (location) {
    team.meta.locations.push(location)
    foodSession.chosen_location = location
  } else {
    // todo error
    throw new Error('womp bad address')
  }
  yield [team.save(), foodSession.save()]

  session.text = JSON.stringify(location)
  return yield handlers['food.choose_address'](session)
}

handlers['address.change'] = function * (session) {
  return yield handlers['food.begin'](session)
}


//send feedback to Kip 😀😐🙁
handlers['feedback.new'] = function * (session) {

   feedbackTracker[session.source.team + session.source.user + session.source.channel] = {
    source: session.source
   }

  var msg_json = {
    'text': 'Can you share a bit of info about this? I\'ll pass it on so that we can do better next time',
    'attachments': [
      {
        'text': '✎ Type your feedback',
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'What can we improve?',
        'callback_id': JSON.stringify(session),
        'attachment_type': 'default'
      }
    ]
  }
  replyChannel.send(session, 'feedback.save', {type: session.origin, data: msg_json})
}

handlers['feedback.save'] = function * (session) {

  //check for entry in feedback tracker
  if (feedbackTracker[session.source.team + session.source.user + session.source.channel]){
    var source = feedbackTracker[session.source.team + session.source.user + session.source.channel].source
  } else {
    var source = 'undefined'
  }

  var mailOptions = {
    to: 'Kip Server <hello@kipthis.com>',
    from: 'Kip Café <server@kipthis.com>',
    subject: '['+source.callback_id+'] Kip Café Feedback',
    text: '- Feedback: '+session.text + ' \r\n - Context:'+JSON.stringify(source)
  }
  mailer_transport.sendMail(mailOptions, function (err) {
    if (err) console.log(err)
  })

  var msg_json = {
    'text': 'Thanks for explaining the issue'
  }

  // switch back to original context
  if (_.get(source, 'callback_id')) {
    replyChannel.send(session, source.callback_id.replace(/_/g, '.'), {type: session.origin, data: msg_json})
  }
}

//
// The user jsut clicked pickup or delivery and is now ready to start ordering
//
handlers['food.delivery_or_pickup'] = function * (session) {
  var foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec()

  // Sometimes we have to wait a ilttle bit for the merchants to finish populating from an earlier step
  // i ended up just sending the reply back in that earlier step w/o waiting for delivery.com, because
  // delivery.com is so slow
  var time = +new Date()
  while (_.get(foodSession, 'merchants.length', 0) <= 0 && (+new Date() - time < 3000)) {
    if (!alreadyWaiting) {
      var alreadyWaiting = true
      replyChannel.sendReplace(session, 'food.delivery_or_pickup', {type: session.origin, data: {text: 'Searching your area for good food...'}})
    }
    yield sleep(500)
    foodSession = yield db.Delivery.findOne({team_id: session.source.team, active: true}).exec()
  }
  var fulfillmentMethod = session.data.value
  foodSession.fulfillment_method = fulfillmentMethod
  kip.debug('set fulfillmentMethod', fulfillmentMethod)

  if (fulfillmentMethod === 'pickup') {
    var addr = (foodSession.chosen_location && foodSession.chosen_location.address_1) ? foodSession.chosen_location.address_1 : _.get(foodSession,'data.input')
    var res = yield api.searchNearby({addr: addr, pickup: true})
    foodSession.merchants = _.get(res, 'merchants')
    foodSession.cuisines = _.get(res, 'cuisines')
    foodSession.markModified('merchants')
    foodSession.markModified('cuisines')
  }

  //
  // START OF S2B
  //

  // find the most recent merchant that is open now (aka is in the foodSession.merchants array)
  var merchantIds = foodSession.merchants.map(m => m.id)
  var lastOrdered = yield db.Deliveries.find({team_id: session.source.team, chosen_restaurant: {$exists: true}})
    .sort({_id: -1})
    .select('chosen_restaurant')
    .exec()

  lastOrdered = lastOrdered.filter(session => merchantIds.includes(session.chosen_restaurant.id))
  var mostRecentSession = lastOrdered[0]
  lastOrdered = _.uniq(lastOrdered.map(session => session.chosen_restaurant.id)) // list of unique restaurants

  // create attachments, only including most recent merchant if one exists
  var attachments = []

  if (mostRecentSession) {
    // build the regular listing as if it were a choice presented to the admin in the later steps,
    // but them modify it with some text to indicate you've ordered here before
    var mostRecentMerchant = foodSession.merchants.filter(m => m.id === mostRecentSession.chosen_restaurant.id)[0] // get the full merchant
    var listing = yield utils.buildRestaurantAttachment(mostRecentMerchant)
    listing.text = `You ordered \`Delivery\` from ${listing.text} recently, order again?`
    listing.mrkdwn_in = ['text']
    if (lastOrdered.length > 1) {
      listing.actions.push({
        'name': 'food.restaurants.list.recent',
        'text': 'See More',
        'type': 'button',
        'value': 0
      })
    }
    attachments.push(listing)
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

  replyChannel.sendReplace(session, 'food.ready_to_poll', {type: session.origin, data: res})
  foodSession.save()
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


//
// Return some restaurants, button value is the index offset
//
handlers['food.restaurants.list.recent'] = function * (message) {
  var index = parseInt(_.get(message, 'data.value')) || 0;
  var msg_json = { text: 'Looking up your order history for this location...' }
  replyChannel.sendReplace(message, 'food.waiting', {type: message.origin, data: msg_json})
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var availableMerchantIds = foodSession.merchants.map(m => m.id);
  var recentDeliveries = yield db.Delivery.aggregate([
    {
      $match: {
        team_id: message.source.team,
        'chosen_restaurant.id': {$exists: true}
      }
    },
    {
      $group: {
        _id: '$chosen_restaurant.id',
        count: {$sum: 1}
      }
    }
  ]);

  // show 3 restaurants that are in the foodSession available list
  var attachments = yield recentDeliveries
    .filter(g => availableMerchantIds.includes(g._id)) // remember that ._id here is from the $group mongo aggregate operator
    .sort(g => g.count)
    .slice(index, index + 3)
    .map(g => {
      var merchant = foodSession.merchants.filter(m => m.id === g._id)[0]
      return utils.buildRestaurantAttachment(merchant)
    })

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
        'name': 'food.restaurants.list.recent',
        'text': 'See More',
        'type': 'button',
        'value': index + 3
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
  var msg = {
    'text': 'Here are 3 restaurant suggestions based on your recent history. \n Which do you want today?',
    attachments: attachments
  }

  replyChannel.sendReplace(message, 'food.ready_to_poll', {type: message.origin, data: msg})

}


handlers['food.poll.confirm_send'] = function * (message) {
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec();
  var locationIndex = _.get(team,'meta.locations[0]') && _.get(team,'meta.locations[0]').length > 0 ? _.get(team,'meta.locations[0]').length - 1 : 0;
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var addr = _.get(foodSession, 'chosen_location.address_1', 'the office')
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
            'name': 'food.admin.team.members',
            'text': 'View Team Members',
            'type': 'button',
            'value': 'team.members'
          },
          {
            'name': 'passthrough',
            'text': '× Cancel',
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


module.exports = function (allHandlers) {
  $allHandlers = allHandlers
  // merge in our own handlers
  _.merge($allHandlers, handlers)
}



