require('kip')

var co = require('co')
var fs = require('fs')
var _ = require('lodash')
var sm = require('slack-message-builder')
var async = require('async')

var weekly_updates = require('../weekly_updates.js')
var api = require('./api-wrapper.js')

/*
*
*
*
*/
function * initiateDeliverySession (session, teamMembers, location) {
  var foodSessions = yield db.Delivery.find({team_id: session.source.team, active: true}).exec()
  if (foodSessions) {
    yield foodSessions.map((session) => {
      session.active = false
      session.save()
    })
  }
  var admin = yield db.Chatuser.findOne({id: session.source.user}).exec()
  var newSession = new db.Delivery({
    active: true,
    team_id: session.source.team,
    // probably will want team_members to come from weekly_updates getTeam later
    team_members: teamMembers,
    chosen_location: {addr: location},
    fulfillment_method: 'delivery', // set by default and change to pickup if it changes (for now)
    confirmed_orders: [],
    convo_initiater: {
      id: admin.id,
      name: admin.name
    }
  })
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
      fallback: 'You are unable to choose a location',
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

  historySorted = Object.keys(users_top).sort(function (a, b) {
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

function askUserForPreferences (user) {
  var buttons = createPreferencesAttachments()
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

module.exports = {
  initiateFoodMessage: initiateFoodMessage,
  initiateDeliverySession: initiateDeliverySession,
  removeUserFromSession: removeUserFromSession
}
