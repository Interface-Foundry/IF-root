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
    this.send = function (session, nextHandlerID, data) {
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
      newSession.action = nextHandlerID.split('.')[1]
      kip.debug('inside channel.send(). Session mode is ' + newSession.mode)
      kip.debug('inside channel.send(). Session action is ' + newSession.action)
      var self = this
      newSession.save(function (err, saved) {
        if (err) {
          kip.debug('mongo save err: ', err)
          throw Error(err)
        }
        self.queue.publish('outgoing.' + newSession.origin, newSession, newSession._id + '.reply.results')
      })
    }
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
    if (!session.state && history[1]) {
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
    var route = yield getRoute(session);
    kip.debug('route', route);
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
  }).catch(kip.err);
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

handlers['food.sys_error'] = function * (session) {
  kip.debug('chat session halted.')
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
  if (session.text === 'address.new' || session.text === 'new' ) {
    kip.debug('\n\nwhat is love, what is life, what is session.mode: ', session.mode, 'what is session.action: ', session.action, 'what is session.text: ', session.text)
    // session.mode = 'address'
    // session.action = 'new'
    return handlers['address.new'](session)
  }
    if (session.text === 'address.confirm' || session.text === 'confirm' ) {
    // new message yay
    return handlers['address.confirm'](session)
  }

  try {
    var location = JSON.parse(session.text)
  } catch (e) {
    kip.error('Could not understand the address the user wanted to use')
    // TODO handle the case where they type a new address without clicking the "new" button
  }

  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  team.meta.chosen_location = location
  kip.debug('saving location', location.address_1)
  yield team.save()
  //yield dsxClient.createDeliveryContext(location.address_1, 'none', session.source.team, session.source.user)

  //
  // START OF S2
  //
  var text = `Cool! You selected \`${location.address_1}\`. Delivery or Pickup?`
  var component = new ui.UIComponentFactory(session.origin).buildButtonGroup(text, ['Delivery', 'Pickup'], null);
  replyChannel.send(session, 'food.delivery_or_pickup', component.render());
}

handlers['food.context_update'] = function * (session) {
  kip.debug('\n\n\n GETTING TO FOOD.CONTEXT_UPDATE: ', session, '\n\n\n\n')

  var fulfillmentMethod = session.text

  kip.debug('set fulfillmentMethod', fulfillmentMethod)
  var updatedDeliveryContext = yield dsxClient.setFulfillmentMethodForContext(fulfillmentMethod, session.source.team, session.source.user)

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
                    "name": "exit_btn",
                    "text": "× Cancel",
                    "type": "button",
                    "value": "exit"
                }
            ]
        }
    ]
}
  replyChannel.send(session, 'food.ready_to_poll', {type: session.origin, data: mock_s2b});
}

handlers['food.poll.confirm_send'] = function * (message) {
  var team = yield db.Slackbots.findOne({team_id: session.source.team}).exec()
  var addr = _.get(team, 'meta.chosen_location.address_1', '');
  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': `Send poll for lunch cuisine to the team members at ?`,
        'fallback': 'Send poll for lunch cuisine to the team members at ',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'yes_btn',
            'text': 'Confirm',
            'style': 'primary',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'passthrough',
            'text': 'View Team Members',
            'type': 'button',
            'value': 'team.members'
          },
          {
            'name': 'no_btn',
            'text': 'Cancel',
            'type': 'button',
            'value': 'chess'
          }
        ]
      }
    ]
  }
}

//
// the user's intent is to specify an address for delivery/pickup
//
handlers['food.address'] = function* (message) {
  var addr = message.text;
  // check if it's a good address
  // TODO

  message.state.addr = addr;
  message.save();

  // search for food near that address
  send_text_reply(message, 'thanks, searching your area for good stuff!');

  var results = yield search.search({
    addr: addr
  });
  var results_message = default_reply(message);
  results_message.action = 'restaurant.list';
  results_message.text = 'Here are some restaurants you might like nearby';
  results_message.data = {
    results: results.results,
    params: {addr: results.address}
  };
  results_message.save();
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results');
}

//
// the user's intent is to search for a specific type of food or a specific restaurant
//
handlers['food.restaurant.search'] = function * (message) {
  var results = yield search.search({
    addr: message.state.addr,
    q: message.text
  })
  var results_message = default_reply(message)
  results_message.action = 'restaurant.list'
  results_message.text = `Here are some restaurants matching ${message.text} that you might like nearby`
  results_message.data = {
    results: results.results,
    params: {addr: results.address}
  }
  results_message.save()
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results')
}

//
// the user's intent is to choose a restaurant to order from
//
handlers['food.restaurant.select'] = function * (message) {
  return yield handlers['food.restaurant.info'](message)
}

//
// the user's intent is to obtian more information about a restaurant
//
handlers['food.restaurant.info'] = function * (message) {
  var results_message = message.history.filter(m => {
    return _.get(m, 'data.results.0')
  })[0]

  var selection = parseInt(message.text) - 1
  var merchant = results_message.data.results[selection]
  message.state.merchant_id = merchant.id
  var info_message = default_reply(message)
  info_message.action = 'restaurant.info'
  info_message.text = `Okay, here's the menu for ${merchant.summary.name}`
  var menu = yield api.getMenu(merchant.id)
  info_message.data = {
    merchant: merchant,
    menu: menu
  }
  info_message.save()
  queue.publish('outgoing.' + message.origin, info_message, message._id + '.reply.menu')
}

//
// the user wants to see the full menu
//
handlers['food.menu.list'] = function * (message) {
  var info_message = default_reply(message)
  info_message.action = 'menu.list'
  info_message.data = message.history.filter(m => {
    return m.action === 'restaurant.info' && _.get(m, 'data.merchant') && _.get(m, 'data.menu')
  })[0].data
  info_message.text = `Okay, here's the full menu for ${info_message.data.merchant.summary.name}`
  info_message.save();
  queue.publish('outgoing.' + message.origin, info_message, message._id + '.reply.menu');

}

//
// the user is looking at a menu and is searching for an item to add
//
handlers['food.menu.search'] = function * (message) {
  var results_message = default_reply(message)
  results_message.action = 'menu.search.results'
  var results = yield search.menuSearch({
    q: message.text,
    menu: message.history.filter(m => {
      return m.action === 'restaurant.info' && _.get(m, 'data.merchant') && _.get(m, 'data.menu')
    })[0].data.menu
  })
  results_message.data = {
    results: results
  }
  results_message.text = `Okay, here are the items matching "${message.text}"`
  results_message.save()
  queue.publish('outgoing.' + message.origin, results_message, message._id + '.reply.results')
}

//
// the user's intent is to obtain more information about a menu item
//
handlers['food.item.info'] = function * (message) {}

// the user's intent is to add a menu item to cart
handlers['food.item.add'] = function * (message) {}

// the user's intent is to select an option for a menu item, like size or type of sauce
// the item could already be in their cart or not. message.item should be what you modify
handlers['food.item.option'] = function * (message) {}

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
  // until cuisines is returned from s1-s3
  var cuisines = cuisinesFile.cuisines

  var teamId = message.source.team
  var teamMembers = yield db.chatusers.find({team_id: teamId, is_bot: false})
  if (process.env.NODE_ENV === 'test') {
    teamMembers = [teamMembers[0]]
  }

  // error with mock slack not being able to get all messages
  var admin = yield db.chatusers.findOne({team_id: teamId, is_bot: false, is_admin: true})
  teamMembers.map(function (member) {
    var resp = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: message.origin,
      source: message.source,
      res: utils.askUserForCuisineTypes(cuisines, member.dm, admin.real_name)
    }
    resp.source.user = member.id
    resp.source.channel = member.dm
    replyChannel.send(resp, 'food.admin.restaurant.pick', {type: 'slack', data: resp.res})
  })
}

handlers['food.admin.restaurant.pick'] = function * (message) {
  var teamId = message.source.team
  var teamMembers = yield db.chatusers.find({team_id: teamId, is_bot: false})
  var numOfResponsesWaitingFor = teamMembers.length
  var v = yield db.messages.find({mode: 'food', action: 'admin.restaurant.pick', 'data.voteID': 'XYZXYZ'})
  var votes = utils.getVotesFromMembers(v)
  if (votes.length < numOfResponsesWaitingFor) {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
    return
  }
  var results = dsxClient._get('context', {team_id: message.source.team, user_id: message.source.user_id})
  // var merchants = dsxClient.getNearbyRestaurants(results.address)
  var viableRestaurants = utils.createSearchRanking(results, votes)
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
  var choosenRestaurant = message.text // or whatever the button action.value is
  var resp = {
    mode: 'food',
    action: 'admin.restaurant.confirm',
    thread_id: message.dm,
    origin: message.origin,
    source: message.source,
    res: utils.confirmRestaurant(choosenRestaurant)
  }
  sendIt(resp)
}

function sendIt (resp) {
  var resultsMessage = default_reply(resp)
  resultsMessage.data = resp.res
  resultsMessage.save()
  resp.text = JSON.stringify(resp.res)
  queue.publish('outgoing.' + resp.origin, resp, resultsMessage._id + '.reply.' + resp.action)
}
