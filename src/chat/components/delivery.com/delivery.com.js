require('kip')

var queue = require('../queue-mongo')
var co = require('co')
var fs = require('fs')
var uuid = require('uuid')
var _ = require('lodash')
var api = require('./api-wrapper')
var search = require('./search')
var utils = require('./utils')
var picstitch = require('./image_processing_delivery.js')
var path = require('path')
var request = require('request-promise')

// until cuisines is returned from s1-s3
var cuisinesFile = require('./cuisines.js')

var fs = require('fs')
var yaml = require('js-yaml')
var dsxsvc = require('./dsx_services')
var dsxutils = require('./dsx_utils')
var ui = require('../ui_controls')
var argv = require('minimist')(process.argv.slice(2))

var initFilename = argv['config']
if (initFilename === null || initFilename === undefined) {
  console.log('--config parameter not found. Please invoke this script using --config=<config_filename>.')
  // process.exit(-1)
  initFilename = path.resolve(__dirname, 'dsx_init_peter.local.yml')
}

var yamlDoc
try {
  yamlDoc = yaml.safeLoad(fs.readFileSync(initFilename, 'utf8'))
} catch(err) {
  console.log(err)
  process.exit(-1)
}

var loadedParams = dsxutils.ServiceObjectLoader(yamlDoc).loadServiceObjectParams('DSXClient')

logging.info(loadedParams)
logging.info(typeof (loadedParams))
logging.info('### looking at loadedParams again')
logging.info(loadedParams)

var dsxClient = new dsxsvc.DSXClient(loadedParams)

console.log(dsxClient.getURI())

class UserChannel {

  constructor (queue) {
    this.queue = queue
    this.send = function (session, nextHandlerID, data, replace) {
      // make sure all attachments have a callback_id
      if (_.get(data, 'attachments', []).length > 0) {
        data.attachments.map(a => {
          a.callback_id = a.callback_id || 'default'
        })
      }

      // because javascript is not statically typed
      if (_.get(data, 'data.attachments', []).length > 0) {
        data.data.attachments.map(a => {
          a.callback_id = a.callback_id || 'default'
        })
      }

      var newSession = new db.Message({
        incoming: false,
        thread_id: session.thread_id,
        resolved: true,
        user_id: 'kip',
        origin: session.origin,
        source: session.source,
        mode: session.mode,
        action: session.action,
        state: session.state,
        user: session.source.user
      })
      newSession['reply'] = data
      newSession.mode = nextHandlerID.split('.')[0]
      newSession.action = nextHandlerID.split('.').slice(1).join('.')
      kip.debug('inside channel.send(). Session mode is ' + newSession.mode)
      kip.debug('inside channel.send(). Session action is ' + newSession.action)
      var self = this
      newSession.save(function (err, saved) {
        if (err) {
          kip.debug('mongo save err: ', err)
          throw Error(err)
        }
        if (replace && _.get(session, 'source.response_url')) {
          request({
            method: 'POST',
            uri: session.source.response_url,
            body: JSON.stringify(data.data),
          })
        } else {
          self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
        }
      })
    }

    this.sendReplace = function (session, nextHandlerID, data) { this.send(session, nextHandlerID, data, true) }
    return this
  }
}

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

//mock function for now until dexter implements
function validateAddress(addr) {
  //validate addr via google places api and Parse out the fields from the addr string
  return {
    label: "NYC Office",
    coordinates: [-123.34, 34.32432423],
    address_1: addr,
    address_2: 'Apt. 6',
    phone_number: "212-867-5309",
    region: "US",
    timezone: "ET",
    special_instructions: "Please send a raven to herald your arrival"
  };
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
    if (!_.get(session, 'state') && _.get(history[1], 'state')) {
      session.state = history[1].state
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
    var route = yield getRoute(session);
    kip.debug('mode', session.mode, 'action', session.action)
    kip.debug('route'.cyan, route.cyan);
    // session.mode = 'food';
    // session.action = route.replace(/^food./, '');
    if (handlers[route]) {
      yield handlers[route](session);
    } else {
      kip.error('No route handler for ' + route)
      incoming.ack();
    }
    session.save();
    incoming.ack();
  }).catch(e => {
    kip.err(e)
    incoming.ack();
  });
});
 
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
var handlers = {}



handlers['food.sys_error'] = function* (session){
  kip.debug('chat session halted.');
}

handlers['food.exit'] = function * (message) {
  var msg_json = {
    "text": 'Are you sure you don\'t want to order food?',
    "attachments": [
      {
        "mrkdwn_in": [
                 "text"
        ],
        "fallback": "Are you sure you don't want to order food?",
        "callback_id": "leave_confirm",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
           {
              name: "passthrough",
              text: "I don't want food",
              type: 'button',
              value: 'yes'
            },
           {
              name: "passthrough",
              text: "Keep ordering food",
              type: 'button',
              value: 'no'
           }
        ]
      },
    ]
  };
  replyChannel.send(message, 'food.exit.confirm', {type: message.origin, data: msg_json})
}

handlers['food.exit.confirm'] = function * (message) {
  replyChannel.sendReplace(message, 'shopping.initial', {type: message.origin, data: {text: 'ok byeee'}})
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function* (session) {
  kip.debug('🍕 food order 🌮');
  session.state = {};
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  var address_buttons = _.get(team, 'meta.locations', []).map(a => {
    return {
      name: 'passthrough',
      text: a.address_1,
      type: 'button',
      value: JSON.stringify(a),

    }
  })
  address_buttons.push({
    name: "passthrough",
    text: "New +",
    type: 'button',
    value: "address.new"
  })
  var msg_json = {
    "attachments": [
      {
        "title": "",
        "image_url":"http://kipthis.com/kip_modes/mode_cafe.png"
      },
      {
          "text": "Great! Which address is this for?",
          "fallback": "You are unable to choose an address",
          "callback_id": "address",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": address_buttons
      }
    ]
  }
  replyChannel.send(session, 'food.choose_address', {type: session.origin, data: msg_json});
}

//
// User decides what address they are ordering for. could be that they need to make a new address
//
handlers['food.choose_address'] = function* (session) {
  if (_.get(session, 'source.response_url')) {
    // slack action button tap
    try {
      var location = JSON.parse(session.text)
    } catch (e) {
      var location = {address_1: session.text}
      kip.debug('Could not understand the address the user wanted to use, session.text: ', session.text)
      // TODO handle the case where they type a new address without clicking the "new" button
    }
    var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
    team.meta.chosen_location = location
    kip.debug('saving location', location.address_1)
    yield team.save()
    //yield dsxClient.createDeliveryContext(location.address_1, 'none', session.source.team, session.source.user)

    var teamMembers = yield db.Chatusers.find({team_id: session.source.team}).exec()
    var foodSession = new db.Delivery({
      // probably will want team_members to come from weekly_updates getTeam later
      // will need to update later
      team_id: session.source.team,
      team_members: teamMembers,
      chosen_location: {addr: location},
      convo_initiater: session.source.user
    })

    yield foodSession.save()
    //
    // START OF S2
    //
    var text = 'Cool! You selected \`${location.address_1}\`. Delivery or Pickup?'
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
handlers['address.new'] = function* (session) {
  kip.debug(' 🌆🏙 enter a new address');
  // session.state = {};
  var msg_json = {
    "text": "What's the delivery address?",
    "attachments": [
      {
        "text": "Type your address below"      }
    ]
  }
  replyChannel.send(session, 'address.confirm', {type: session.origin, data: msg_json});
}

//
// the user seeks to confirm their possibly updated/validated address
//
handlers['address.confirm'] = function* (session) {
  kip.debug('🌆🏙 validate an address', session.text);
  var location = yield validateAddress(session.text)
  var prompt = "Is `" + location.address_1 + '` your address?'
  var msg_json = {
    "text": prompt,
    "attachments": [
      {
        "mrkdwn_in": [
                 "text"
        ],
        "fallback": "You are unable to confirm.",
        "callback_id": "address_confirm",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "actions": [
           {
              name: "address_confirm_btn",
              text: "Confirm",
              type: 'button',
              value: JSON.stringify(location)
            },
           {
              name: "passthrough",
              text: "Edit",
              type: 'button',
              value: "address.new"
           }
        ]
      },
    ]
  };
      //storing location in source since there is no other way to persist it thru handler exchanges,
    //feel free to implement a better way. would not make sense to save it in slackbots before it is even validate nah meen
  session.source.location = location;
  yield session.save();
  replyChannel.send(session, 'address.validate', {type: session.origin, data: msg_json});
}

handlers['address.validate'] = function* (session) {
    var location = session.source.location;
    kip.debug('\n\n🌃🌉getting to address.validate', location, '\n\n');
    var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
    //validateAddress with either return false or return a json with the proper filled fields, we can change this later however u want to implement it
    if (validateAddress(location)) {
      team.meta.locations.push(validateAddress(location.address_1))
      team.meta.chosen_location = location;
    }
    else {
      team.meta.chosen_location = location;
      team.meta.locations.push(validateAddress({
        label: "NYC Office",
        coordinates: [-123.34, 34.32432423],
        address_1: location.address_1,
        address_2: 'Apt. 6',
        phone_number: "212-867-5309",
        region: "US",
        timezone: "ET",
        special_instructions: "Please send a raven to herald your arrival"
      }))
    }
    yield team.save();
    kip.debug('###  saved new address in mongo...');
    var text = `Cool! You selected \`${location.address_1}\`. Delivery or Pickup?`
    var msg_json = {
        "attachments": [
            {
                "mrkdwn_in": [
                   "text"
                ],
                "text": text,
                "fallback": "You did not choose a fulfillment method :/",
                "callback_id": "wopr_game",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "passthrough",
                        "text": "Delivery",
                        "type": "button",
                        "value": "food.delivery_or_pickup"
                    },
                    {
                        "name": "passthrough",
                        "text": "Pickup",
                        "type": "button",
                        "value": "food.delivery_or_pickup"
                    },
                    {
                        "name": "passthrough",
                        "text": "< Change Address",
                        "type": "button",
                        "value": "address.change"
                    }
                ]
            }
        ]
    };
    replyChannel.send(session, 'food.ready_to_poll', {type: session.origin, data: msg_json});

}

handlers['address.save'] = function* (session) {
  if (session.text === 'no') {
    return handlers['food.begin'](session)
  }
  var location = JSON.parse(session.text)
    //
    //
    //*Also store the address into mongo*
    //
    //
    var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()

    if (location) {
      team.meta.locations.push(location)
      team.meta.chosen_location = location;
    }
    else {

      // todo error
      throw new Error('womp bad address')
    }
    yield team.save()
    session.text = JSON.stringify(location)
    return yield handlers['food.choose_address'](session)
}

handlers['address.change'] = function* (session) {
    return yield handlers['food.begin'](session)
}



handlers['food.delivery_or_pickup'] = function* (session) {
  kip.debug('\n\n🍏 🍎 🍐 getting to food.delivery_or_pickup\n\n');
  var fulfillmentMethod = session.text;
  kip.debug('set fulfillmentMethod', fulfillmentMethod)
  //var updatedDeliveryContext = yield dsxClient.setFulfillmentMethodForContext(fulfillmentMethod, session.source.team, session.source.user)

  //
  // START OF S2B
  //
  var mock_s2b = {
    "attachments": [
            {
            "title": "",
            "image_url":"http://i.imgur.com/BVHZTaS.png",
            "text": "You ordered `Delivery` from `Lantern Thai Kitchen` last time, order again?",
            "color": "#3AA3E3",
             "mrkdwn_in": [
               "text"
            ],
             "actions": [
                {
                    "name": "chess",
                    "text": "Choose Restaurant",
                    "type": "button",
                    "value": "chess"
                }

                 ]
            },
            {
            "mrkdwn_in": [
               "text"
            ],
            "text": "*Tip:* `✓ Start New Poll` polls your team on what type of food they want.",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "passthrough",
                    "text": "✓ Start New Poll",
                    "style":"primary",
                    "type": "button",
                    "value": "food.poll.confirm_send"
                },
                {
                    "name": "passthrough",
                    "text": "See More",
                    "type": "button",
                    "value": "food.restaurants.list"
                },

                {
                    "name": "passthrough",
                    "text": "× Cancel",

                    "type": "button",
                    "value": "food.exit.confirm",
                    confirm: {
                      title: 'Leave Order',
                      text: 'Are you sure you want to stop ordering food?',
                      ok_text: "Don't order food",
                      dismiss_text: "Keep ordering food"
                    }
                }
            ]
        }
    ]
}
  replyChannel.send(session, 'food.ready_to_poll', {type: session.origin, data: mock_s2b});
}

handlers['food.restaurants.list'] = function * (message) {
  // here's some mock stuff for now
  var msg_json = {
    "text": "Here are 3 restaurant suggestions based on your recent history. \n Which do you want today?",
    "attachments": [
        {
            "mrkdwn_in": [
               "text"
            ],
            "text": "",
            "image_url":"http://i.imgur.com/iqjT5iJ.png",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "passthrough",
                    "text": "✓ Choose",
                    "style": "primary",
                    "type": "button",
                    "value": "food.poll.confirm_send"
                },
                {
                    "name": "chess",
                    "text": "More Info",
                    "type": "button",
                    "value": "chess"
                }
                ]
        },
        {
            "title": "",
            "image_url":"http://i.imgur.com/8Huwjao.png",
            "mrkdwn_in": [
               "text"
            ],
            "text": "",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "passthrough",
                    "text": "✓ Choose",
                    "style": "primary",
                    "type": "button",
                    "value": "food.poll.confirm_send"
                },
                {
                    "name": "chess",
                    "text": "More Info",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "title": "",
            "image_url":"http://i.imgur.com/fP6EcEm.png",
            "mrkdwn_in": [
               "text"
            ],
            "text": "",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "passthrough",
                    "text": "✓  Choose",
                    "style": "primary",
                    "type": "button",
                    "value": "food.poll.confirm_send"
                },
                {
                    "name": "chess",
                    "text": "More Info",
                    "type": "button",
                    "value": "chess"
                }
            ]
        },
        {
            "mrkdwn_in": [
               "text"
            ],
            "text": "",
            "fallback": "You are unable to choose a game",
            "callback_id": "wopr_game",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "chess",
                    "text": "<",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "chess",
                    "text": "More Choices >",
                    "type": "button",
                    "value": "chess"
                },
                {
                    "name": "maze",
                    "text": "Sort Price",
                    "type": "button",
                    "value": "maze"
                },
                {
                    "name": "maze",
                    "text": "Sort Rating",
                    "type": "button",
                    "value": "maze"
                },
                {
                    "name": "maze",
                    "text": "Sort Distance",
                    "type": "button",
                    "value": "maze"
                }
            ]
        }
    ]
  }
  replyChannel.send(message, 'food.ready_to_poll', {type: message.origin, data: msg_json});
}

handlers['food.poll.confirm_send'] = function * (message) {
  var team = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var addr = _.get(team, 'meta.chosen_location.address_1', '');
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
            'text': 'Cancel',
            'type': 'button',
            'value': 'food.exit'
          }
        ]
      }
    ]
  }

  replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}

// check for user preferences/diet/etc, skipping for now
handlers['food.user.preferences'] = function * (session) {
  var teamMembers = yield db.chatusers.find({team_id: session.source.team, is_bot: false})
  if (process.env.NODE_ENV === 'test') {
    teamMembers = [teamMembers[0]]
  }
  teamMembers.map(function (member) {
    var userPreferences = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: session.origin,
      source: session.source,
      res: utils.userFoodPreferencesPlaceHolder
    }
    userPreferences.source.user = member.id
    userPreferences.source.channel = member.dm
    replyChannel.send(userPreferences, 'food.user.poll', {type: 'slack', data: userPreferences.res})
  })
}

// poll for cuisines
handlers['food.user.poll'] = function * (message) {
  // going to want to move this to s3 probably
  // ---------------------------------------------
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team}).exec()
  var address = foodSession.chosen_location.addr.address_1
  var results = yield api.searchNearby({addr: address})
  foodSession.merchants = _.get(results, 'merchants')
  foodSession.cuisines = _.get(results, 'cuisines')
  foodSession.save()
  // ---------------------------------------------
  var teamMembers = foodSession.team_members
  if (process.env.NODE_ENV === 'test') {
    teamMembers = [teamMembers[0]]
  }

  // error with mock slack not being able to get all messages
  var admin = yield db.chatusers.findOne({team_id: message.source.team, is_bot: false, is_admin: true})
  teamMembers.map(function (member) {
    var source = {
      type: 'message',
      channel: member.dm,
      user: member.id,
      team: member.team_id
    }

    var resp = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: message.origin,
      source: source,
      res: utils.askUserForCuisineTypes(_.map(foodSession.cuisines, 'name'), member.dm, admin.real_name)
    }
    replyChannel.send(resp, 'food.admin.restaurant.pick', {type: 'slack', data: resp.res})
  })
}

handlers['food.admin.restaurant.pick'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team}).exec()
  foodSession.votes.push(message.data.value)
  foodSession.save()
  var numOfResponsesWaitingFor = foodSession.team_members
  var votes = foodSession.votes
  if (votes.length < numOfResponsesWaitingFor) {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
    return
  }

  logging.data('# of restaurants: ', foodSession.merchants.length)
  var viableRestaurants = yield utils.createSearchRanking(foodSession.merchants, votes)
  logging.data('# of viable restaurants: ', viableRestaurants.length)
  var responseForAdmin = utils.chooseRestaurant(viableRestaurants)
  var resp = {
    mode: 'food',
    action: 'admin.restaurant.pick',
    thread_id: message.dm,
    origin: message.origin,
    source: message.source,
    res: responseForAdmin
  }
  replyChannel.send(resp, 'food.admin.restaurant.confirm', {type: 'slack', data: resp.res})
}

handlers['food.admin.restaurant.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team}).exec()
  var merchant = yield db.Merchants.findOne({id: String(message.data.value)})
  foodSession.chosen_restaurant = {
    id: message.data.value,
    name: merchant.data.summary.name
  }
  foodSession.save()

  var resp = {
    mode: 'food',
    action: 'admin.restaurant.confirm',
    thread_id: message.dm,
    origin: message.origin,
    source: message.source,
    res: utils.confirmRestaurant(foodSession.chosen_restaurant.name)
  }
  replyChannel.send(resp, 'food.admin.restaurant.confirm', {type: 'slack', data: resp.res})
}

handlers['food.user.confirm_interest'] = function * (message) {
  //
  console.log('S8 at this point')
}
