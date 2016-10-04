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
var cuisines = fs.readFileSync(path.resolve(__dirname, 'extra/cuisinesAvailable.json'), 'utf8')

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
    console.log('>>>'.yellow, incoming.data.text.yellow)
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
      session.mode = history[1].mode
      session.action = history[1].action
      session.route = session.mode + '.' + session.action
      session.prevMode = history[1].mode
      session.prevAction = history[1].action
      session.prevRoute = session.prevMode + '.' + session.prevAction
    }
    var route = yield getRoute(session)
    kip.debug('route', route)
    session.mode = 'food'
    session.action = route.replace(/^food./, '')
    yield handlers[route](session)
    session.save()
    incoming.ack()
  }).catch(kip.err)
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
var handlers = {}

handlers['food.sys_error'] = function * (session) {
  kip.debug('chat session halted.')
}

//
// the user's intent is to initiate a food order
//
handlers['food.begin'] = function * (session) {
  kip.debug('🍕 food order 🌮')
  session.state = {}
  var component = new ui.UIComponentFactory(session.origin).buildTextMessage("yeah let's eat! what address should i use?")
  replyChannel.send(session, 'food.store_context', component.render())
// send_text_reply(message, "yeah let's eat! what address should i use?")
// todo save addresses and show saved addresses
}

handlers['food.store_context'] = function * (session) {
  kip.debug('\n\n\n GETTING TO FOOD.STORE_CONTEXT: ', session, '\n\n\n\n')
  var addr = session.text
  yield dsxClient.createDeliveryContext(addr, 'none', session.source.team, session.source.user)
  var component = new ui.UIComponentFactory(session.origin).buildButtonGroup('Select your order method.', ['Delivery', 'Pickup'], null)
  kip.debug('###  created new delivery context, will now update...')
  replyChannel.send(session, 'food.context_update', component.render())
}

handlers['food.context_update'] = function * (session) {
  kip.debug('\n\n\n GETTING TO FOOD.CONTEXT_UPDATE: ', session, '\n\n\n\n')

  var fulfillmentMethod = session.text
  kip.debug('set fulfillmentMethod', fulfillmentMethod)
  var updatedDeliveryContext = yield dsxClient.setFulfillmentMethodForContext(fulfillmentMethod, session.source.team, session.source.user)

  var component = new ui.UIComponentFactory(session.origin).buildTextMessage('delivery context updated.')
  replyChannel.send(session, 'food.ready_to_poll', component.render())
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
  info_message.save()
  queue.publish('outgoing.' + message.origin, info_message, message._id + '.reply.menu')
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
  // var teamMembers = yield db.groups.find({team_id: sessag.source.team, is_bot: false})
  var msgJson = {
    text: 'Here we would ask user for preferences if they didnt have it',
    fallback: 'You are unable to confirm preferences',
    callback_id: 'confirm.user.preferences',
    color: 'grey',
    attachment_type: 'default',
    attachments: [{
      actions: [{
        'name': 'Confirm',
        'text': 'Confirm',
        'type': 'button',
        'value': 'confirmPreferences'
      },
        {
          'name': 'Cancel',
          'text': 'Cancel',
          'type': 'button',
          'value': 'cancelPreferences'
        }]
    }]
  }
  replyChannel.send(session, 'food.user.poll', {type: 'slack', data: msgJson})
}

// poll for cuisines
handlers['food.user.poll'] = function * (message) {
  // until cuisines is returned from s1-s3
  console.log('got to s5')
  var cuisines = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'extra/cuisinesAvailable.json'), 'utf8'))
  var teamId = message.source.team
  var teamMembers = yield db.chatusers.find({team_id: teamId, is_bot: false})

  // error with mock slack not being able to get all messages
  teamMembers = [teamMembers[0]]
  var admin = yield db.chatusers.findOne({team_id: teamId, is_bot: false, is_admin: true})
  teamMembers.map(function (member) {
    var userPolling = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: message.origin,
      source: message.source,
      res: utils.askUserForCuisineTypes(cuisines, member.dm, admin.real_name)
    }
    userPolling.source.user = member.id
    userPolling.source.channel = member.dm
    replyChannel.send(userPolling, 'food.admin.restaurant.pick', userPolling.res)
  })
}

handlers['food.admin.restaurant.pick'] = function * (message) {
  // var results = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'extra/results.json'), 'utf8'))
  var results = dsxClient._get('context', {team_id: message.source.team, user_id: message.source.user_id})
  console.log(results)
  // var merchants = dsxClient.getNearbyRestaurants(results.address)
  var v = yield db.messages.find({mode: 'food', action: 'user.poll', 'data.voteID': 'XYZXYZ'})
  var votes = utils.getVotesFromMembers(v)
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
  sendIt(resp)
// var merchants = utils.createSearchRanking(results, votes)
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
