var co = require('co')
var _ = require('lodash')
var googl = require('goo.gl')
var request = require('request-promise')
var Fuse = require('fuse.js')

var queue = require('../queue-mongo')
var UserChannel = require('./UserChannel')
var replyChannel = new UserChannel(queue)
var yelp = require('./yelp.js')

/*
* use this to match on terms where key_choices are
* @param {String} text is what user entered,
* @param {Array} allChoices is array of all the options to search thru
* @param {Object options is object with everything such as
  @returns {Array} results from fuse match
* options = {
*   threshold: 0.8,
*   tokenize: true,
*   matchAllTokens: true,
*   keys: ['name']
* }
*/
function * matchText (text, allChoices, options) {
  // might want to use id, but dont for now
  var baseOptions = {
    shouldSort: true,
    threshold: 0.8,
    tokenize: true
  }
  _.merge(baseOptions, options)
  var fuse = new Fuse(allChoices, baseOptions)
  var res = yield fuse.search(text)
  //
  if (res.length > 0) {
    return res
  } else {
    // no matches
    return null
  }
}

function * matchTextToButton (message) {
  // find previous buttons displayed to user

  // need to grab last message we sent to user that contained attachments
  var prevMessage = yield db.Message.findOne({id: message.source.id, incoming: false}).exec()
  // combine all the previous attachments actions
  var prevButtons = _.map(_.flatten(prevMessage.reply.data.attachments), 'actions')
  var fuse = new Fuse(prevButtons, {
    shouldSort: true,
    threshold: 0.4,
    keys: ['text']
  })
  var res = yield fuse.search(message.data.text)

  if (res.length > 0) {
    return res
  } else {
    // no matches
    return null
  }
}

function defaultReply (message) {
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

function textReply (message, text) {
  var msg = defaultReply(message)
  msg.text = text
  return msg
}

function sendTextReply (message, text) {
  var msg = textReply(message, text)
  msg.save()
  logging.info('<<<'.yellow, text.yellow)
  queue.publish('outgoing.' + message.origin, msg, message._id + '.reply.' + (+(Math.random() * 100).toString().slice(3)).toString(36))
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

/*
*
*
*
*/
function * initiateDeliverySession (session) {
  var foodSessions = yield db.Delivery.find({team_id: session.source.team, active: true}).exec()

  if (foodSessions) {
    yield foodSessions.map((session) => {
      logging.info('send message to old admin that their order is being canceled')
      // var lastMessage = yield db.Messages.find({
      //   incoming: false,
      //   mode: 'food',
      //   source: {
      //     'user': session.convo_initiater.id}})
      //   .sort({'ts': -1})
      //   .limit(1).exec()

      // replyChannel.send(lastMessage[0], 'food.cancel_previous', {type: session.origin, data: {text: 'Hey we are canceling your old order! Someone is starting a new order'}})
      session.active = false
      session.save()
    })
  }

  // TEMP HACK for Spark demo
  var WHITELISTS = {
    T0299Q668: ['jeff', 'christafogleman', 'donnasokolsky'], // Spark
    // T1JTUM7RN: ['peter', 'elon'], // Mars Vacation Condos
    // T1P8S8C91: ['peter', 'graham', 'alyx', 'rachel', 'muchimoto', 'chris'] // Kip
  }

  var teamMembers = yield db.Chatusers.find({
    team_id: session.source.team,
    is_bot: {$ne: true},
    deleted: {$ne: true},
    type: {$ne: 'email'}, // the email db.chatusers is outdated
    id: {$ne: 'USLACKBOT'}}).exec()

  if (WHITELISTS[session.source.team]) {
    teamMembers = teamMembers.filter(u => WHITELISTS[session.source.team].includes(u.name))
  }

  var admin = yield db.Chatuser.findOne({id: session.source.user}).exec()
  var newSession = new db.Delivery({
    active: true,
    team_id: session.source.team,
    team_members: teamMembers,
    all_members: teamMembers,
    fulfillment_method: 'delivery', // set by default and change to pickup if it changes
    confirmed_orders: [],
    convo_initiater: {
      id: admin.id,
      name: admin.name,
      first_name: _.get(admin, 'first_name') ? admin.first_name : admin.profile.real_name,
      last_name: _.get(admin, 'last_name') ? admin.last_name : '',
      email: admin.profile.email,
      dm: admin.dm
    },
    data: {
      instructions: ' '
    },
    tracking: {
    // last_sent_message to replace, and specific id's to
      confirmed_orders_msg: null,
      confirmed_votes_msg: null
    }
  })
  if (_.get(admin, 'phone_number')) {
    newSession.phone_number = admin.phone_number
  }
  // check if user has entered phone number before
  if (_.get(admin, 'phone_number')) {
    newSession.convo_initiater.phone_number = admin.phone_number
  }
  return newSession
}

function * initiateFoodMessage (message) {
  return co(function * () {
    var obj = {
      order: false,
      text: '',
      source: message.source,
      origin: message.origin
    }
    var user = yield db.Chatuser.findOne({'id': message.user_id}, {}, {sort: { ts: -1 }}).exec()
    if (!user) {
      // queue outgoing message and return
      obj['text'] = 'not even a user'
    } else if (user.is_admin === false) {
      // queue outgoing message and return
      obj['text'] = 'sorry have your admin initiate it'
    } else {
      obj['toDM'] = user.dm
      obj['order'] = true
      obj['text'] = 'Done, check your DMs'
    }
    return obj
  })
}
/*
* when person says X thing we initiate food ordering handler
*
*
*/
function initiateFoodOrdering (admin) {
  co(function * () {
    // -----
    var res = {mode: 'food', action: 'initiate'}
    var buttonAttachment
    var stickerUrl = 'https://storage.googleapis.com/kip-random/laCroix.gif'
    // -----

    res['id'] = admin.dm
    res['newMessage'] = [stickerUrl]
    var addresses = yield db.Address.find({id: admin.id})
    if (addresses) {
      addresses = _.map(addresses, 'address')
      buttonAttachment = _(addresses).forEach(function (value) {
        buttonAttachment.push(createButton(value))
      })
    }

    buttonAttachment.push(createButton('New +'))
    var locationMessage = {}
    locationMessage['text'] = 'Great! Which address is this for?'
    locationMessage['attachments'] = {
      fallback: 'Great! Which address is this for?',
      callback_id: 'adminLocationPicker',
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: buttonAttachment
    }
    res.newMessage.push(locationMessage)
    return res
  })
}

/*
* creates button for slack stuff
*
*
*/
function createButton (name, buttonType) {
  name = name.toLowerCase()
  var firstLetterCap = name[0].toUpperCase() + name.slice(1)

  if (name === '+' || name === '-') {
    firstLetterCap = (name === '+') ? 'plus' : 'minus'
  }

  var tmp = {
    name: name,
    text: firstLetterCap, // can make first letter capitalized later
    type: 'button',
    value: name
  }
  var primaryStyleNames = ['confirm', 'confirm order']
  var dangerStyleNames = ['none', 'cancel']
  if (_.includes(name, primaryStyleNames) || _.includes(name, dangerStyleNames)) {
    tmp['style'] = _.includes(name, primaryStyleNames) ? 'primary' : 'danger'
  }
  // need some way to conform to button styles shit
  if (buttonType) {
    tmp['style'] = buttonType
  }
  return tmp
}

/*
* returns options to show to users given available cuisines
* @param {array} users
* @param {Object} results for search location
* @returns {Object} object that contains what to display user given available
*                   cuisines and their preferences
*/
function presentCuisineOptions (users, results) {
  var availCuisines = getAvailCuisines(results.cuisines)
  var presentToUser = {}
  _.map(users, function (value) {
    presentToUser[value.user.id] = createCuisineOptionForUser(value.user, availCuisines)
  })
  return presentToUser
}

/* get available cuisines from results that have some cuisine type
* _TO BE PRESENTED TO USERS_
*  could also just use results.popular_cuisines
*
* @param {Object} results from search
* @returns {array} array of merchants satisfying results from votes
*/
function getAvailCuisines (results) {
  /*filter out objects with less count 3 for time being since we want to
  always display at least 3 options*/
  if (results.hasOwnProperty('cuisines')) {
    results = results.cuisines
  }

  var all_cuisines = _.filter(results, function (o) {
    return o.count > 2
  })

  var c = _.map(all_cuisines, 'name')
  return c
}

/* create array with first two options being based on history
*
* @param {Object} user - containing history and diet
* @param {array} cuisines - available cuisines for location
* @return {array} array to display to user
*
*/
function createCuisineOptionForUser (user, cuisines) {
  var opts = [] // array of stuff to return to them
  var randomsToUse = 1
  var users_top = _.countBy(user.history)

  var historySorted = Object.keys(users_top).sort(function (a, b) {
    return users_top[b] - users_top[a]
  })

  opts.concat(historySorted.slice(0, 2)) // first two options if avail but works with 0 or 1

  while (opts.length < 3) { // get 3 total options
    opts.push(_.sample(_.difference(cuisines, opts)))
  }
  // opts.push(_.sample(_.difference(cuisines, opts))) // random sample not already in users opts
  opts.push('Surprise Me', 'Nothing')
  return opts
}

/*
*
*
*/
function getMerchatsWithCuisine (merchants, cuisineType) {
  // cuisine is one type
  logging.debug('getting all merchants that use cuisine_type: ', cuisineType)
  return _.filter(merchants, function (m) {
    return _.includes(m.summary.cuisines, cuisineType)
  })
}

function createPreferencesAttachments () {
  // create button attachments
  var buttonGroup1 = ['Vegetarian', 'Vegan', 'Paleo', 'Pescetarian', 'None']
  var buttonGroup2 = ['Peanut', 'Gluten ', 'Shellfish', 'Chicken', 'None']
  var buttonGroup3 = ['Confirm', 'Edit Diet']
  var attach1 = []
  var attach2 = []
  var attach3 = []
  _(buttonGroup1).forEach(function (value) { attach1.push(createButton(value)) })
  _(buttonGroup2).forEach(function (value) { attach2.push(createButton(value)) })
  _(buttonGroup3).forEach(function (value) { attach3.push(createButton(value)) })
  return [attach1, attach2, attach3]
}

/*
* general use for when you need to remove a user from a session for delivery session
*
*
*/
function * removeUserFromSession (team, user) {
  var foodSession = yield db.Delivery.findOne({team_id: team, active: true}).exec()
  logging.info(`removing: ${user} from team: ${team} on mongo._id: ${foodSession._id}`)
  _.remove(foodSession.team_members, {id: user})
  foodSession.save()
}

function * buildRestaurantAttachment (restaurant) {
  // will need to use picstitch for placeholder image in future
  // var placeholderImage = 'https://storage.googleapis.com/kip-random/laCroix.gif'

  try {
    var realImage = yield request({
      uri: kip.config.picstitchDelivery,
      method: 'POST',
      json: true,
      body: {
        origin: 'slack',
        cuisines: restaurant.summary.cuisines,
        location: restaurant.location,
        ordering: restaurant.ordering,
        summary: restaurant.summary,
        url: restaurant.summary.merchant_logo,
        yelp_rating: _.get(restaurant, 'yelp_info.rating', '')
      }
    })
  } catch (e) {
    kip.err(e)
    realImage = 'https://storage.googleapis.com/kip-random/laCroix.gif'
  }

  // var shortenedRestaurantUrl = yield googl.shorten(restaurant.summary.url.complete)

  var url = yield yelp(restaurant);

  var obj = {
    'text': `<${url}|*${restaurant.summary.name}*> - <${url}|Check out on Yelp>`,
    'image_url': realImage,
    'color': '#3AA3E3',
    'callback_id': restaurant.id,
    'fallback': `<${url}|*${restaurant.summary.name}*> - <${url}|Check out on Yelp>`,
    'attachment_type': 'default',
    'mrkdwn_in': ['text'],
    'actions': [
      {
        'name': 'food.admin.restaurant.confirm',
        'text': '✓ Order Here',
        'type': 'button',
        'style': 'primary',
        'value': restaurant.id
      }
    ]
  }
  return obj
}

module.exports = {
  initiateFoodMessage: initiateFoodMessage,
  initiateDeliverySession: initiateDeliverySession,
  removeUserFromSession: removeUserFromSession,
  buildRestaurantAttachment: buildRestaurantAttachment,
  default_reply: defaultReply,
  text_reply: textReply,
  send_text_reply: sendTextReply,
  yesOrNo: yesOrNo,
  matchText: matchText,
  matchTextToButton: matchTextToButton
}
