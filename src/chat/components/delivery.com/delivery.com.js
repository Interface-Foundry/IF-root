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

function * handleMessage(message) {
  // parse the action value objects if they exist
  try {
    message.data.value = JSON.parse(message.data.value)
  } catch (e) {}

  var route = yield getRoute(message)

  if (message.text && message.mode === 'food') {
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
    if (message.text === 'food') {
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
  replyChannel.send(message, 'food.banner', {type: message.origin, data: msg_json})
  yield sleep(1000)

  // loading chat users here for now, can remove once init_team is fully implemented tocreate chat user objects
  team_utils.getChatUsers(message)
  message.state = {}
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var foodSession = yield utils.initiateDeliverySession(message)
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
    value: 'food.settings.address.new'
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


  replyChannel.send(message, 'food.choose_address', {type: message.origin, data: msg_json})
}

//
// User decides what address they are ordering for. could be that they need to make a new address
//
handlers['food.choose_address'] = function * (message) {
  if (_.get(message, 'source.response_url')) {
    // slack action button tap
    try {
      var location = JSON.parse(message.text)
    } catch (e) {
      var location = {address_1: message.text}
      kip.debug('Could not understand the address the user wanted to use, message.text: ', message.text)
    // TODO handle the case where they type a new address without clicking the "new" button
    }

    var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
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
              'name': 'food.settings.address.change',
              'text': '< Change Address',
              'type': 'button',
              'value': 'food.settings.address.change'
            }
          ]
        }
      ]
    }
    replyChannel.sendReplace(message, 'food.delivery_or_pickup', {type: message.origin, data: msg_json})

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
handlers['food.settings.address.new'] = function * (message) {
  kip.debug(' 🌆🏙 enter a new address')
  // message.state = {}
  var msg_json = {
    'text': "What's the address for the order?",
    'attachments': [{
      'text': '✎ Type your address below (Example: _902 Broadway 10010_)',
      'mrkdwn_in': ['text']
    }]
  }
  replyChannel.send(message, 'food.settings.address.confirm', {type: message.origin, data: msg_json})
}

//
// the user seeks to confirm their possibly updated/validated address
//
handlers['food.settings.address.confirm'] = function * (message) {
  // ✐✐✐
  // send response since this is slow
  replyChannel.sendReplace(message, 'food.settings.address.save', {type: message.origin, data: {text: 'Thanks! We need to process that address real quick.'}})
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
    replyChannel.sendReplace(message, 'food.settings.address.new', {
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
            name: 'food.settings.address.save',
            text: '✓ Confirm Address',
            type: 'button',
            style: 'primary',
            value: JSON.stringify(location)
          },
          {
            name: 'passthrough',
            text: 'Edit Address',
            type: 'button',
            value: 'food.settings.address.new'
          }
        ]
      }
    ]
  };

  // collect feedback on this feature
  if (feedbackOn && msg_json) {
    msg_json.attachments[0].actions.push({
      name: 'food.feedback.new',
      text: '⇲ Send feedback',
      type: 'button',
      value: 'food.feedback.new'
    })
  }

  replyChannel.send(message, 'food.settings.address.save', {type: message.origin, data: msg_json})
}

// Save the address to the db after the user confirms it
handlers['food.settings.address.save'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var location = message.data.value

  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  if (location) {
    foodSession.chosen_location = location
    slackbot.meta.locations.push(location)
  } else {
    // todo error
    throw new Error('womp bad address')
  }
  yield foodSession.save()
  yield slackbot.save()

  message.text = JSON.stringify(location)
  return yield handlers['food.choose_address'](message)
}

handlers['food.settings.address.change'] = function * (message) {
  return yield handlers['food.begin'](message)
}


//send feedback to Kip 😀😐🙁
handlers['food.feedback.new'] = function * (message) {

   feedbackTracker[message.source.team + message.source.user + message.source.channel] = {
    source: message.source
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
        'callback_id': JSON.stringify(message),
        'attachment_type': 'default'
      }
    ]
  }
  replyChannel.send(message, 'food.feedback.save', {type: message.origin, data: msg_json})
}

handlers['food.feedback.save'] = function * (message) {

  //check for entry in feedback tracker
  if (feedbackTracker[message.source.team + message.source.user + message.source.channel]){
    var source = feedbackTracker[message.source.team + message.source.user + message.source.channel].source
  } else {
    var source = 'undefined'
  }

  var mailOptions = {
    to: 'Kip Server <hello@kipthis.com>',
    from: 'Kip Café <server@kipthis.com>',
    subject: '['+source.callback_id+'] Kip Café Feedback',
    text: '- Feedback: '+message.text + ' \r\n - Context:'+JSON.stringify(source)
  }
  mailer_transport.sendMail(mailOptions, function (err) {
    if (err) console.log(err)
  })

  var msg_json = {
    'text': 'Thanks for explaining the issue'
  }

  // switch back to original context
  if (_.get(source, 'callback_id')) {
    replyChannel.send(message, source.callback_id.replace(/_/g, '.'), {type: message.origin, data: msg_json})
  }
}

//
// The user jsut clicked pickup or delivery and is now ready to start ordering
//
handlers['food.delivery_or_pickup'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // Sometimes we have to wait a ilttle bit for the merchants to finish populating from an earlier step
  // i ended up just sending the reply back in that earlier step w/o waiting for delivery.com, because
  // delivery.com is so slow
  var time = +new Date()
  while (_.get(foodSession, 'merchants.length', 0) <= 0 && (+new Date() - time < 3000)) {
    if (!alreadyWaiting) {
      var alreadyWaiting = true
      replyChannel.sendReplace(message, 'food.delivery_or_pickup', {type: message.origin, data: {text: 'Searching your area for good food...'}})
    }
    yield sleep(500)
    foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  }
  var fulfillmentMethod = message.data.value
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
  var lastOrdered = yield db.Deliveries.find({team_id: message.source.team, chosen_restaurant: {$exists: true}})
    .sort({_id: -1})
    .select('chosen_restaurant')
    .exec()

  lastOrdered = lastOrdered.filter(message => merchantIds.includes(message.chosen_restaurant.id))
  var mostRecentSession = lastOrdered[0]
  lastOrdered = _.uniq(lastOrdered.map(message => message.chosen_restaurant.id)) // list of unique restaurants

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

  replyChannel.sendReplace(message, 'food.ready_to_poll', {type: message.origin, data: res})
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
        'text': `Send poll for cuisine to the team members at \`${addr}\`?`,
        'fallback': 'Send poll for cuisine to the team members at ',
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

module.exports = {
  handleMessage: handleMessage
}
