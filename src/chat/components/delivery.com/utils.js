/* global db logging */

require('kip')

var co = require('co')
var fs = require('fs')
var _ = require('lodash')
var sm = require('slack-message-builder')
var async = require('async')
// var api = require('./api-wrapper.js')

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

function newAdminAddress (admin) {
  // create message that says 'cool whats your new address' or whatever
  co(function * () {
    var newAddress = yield gotNewAddress(admin)
    var address = new db.Address({
      admin: admin.id
    })
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
* creates attachments to display to admin for merchant
*
*
*/
function chooseRestaurant (restaurants, orderBy) {
  var viable = restaurants.slice(0, 3)
  var attachments = [buildRestaurantAttachment(viable[0]), buildRestaurantAttachment(viable[1]), buildRestaurantAttachment(viable[2])]
  var res = {
    'text': 'Here are 3 restaurant suggestions based on your team vote',
    'attachments': attachments
  }
  res.attachments.push({
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
        'name': 'chess',
        'text': 'More',
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
  })
  return res
}

function buildRestaurantAttachment (restaurant) {
  // will need to use picstitch for placeholder image in future
  var placeholderImage = 'https://storage.googleapis.com/kip-random/laCroix.gif'
  var obj = {
    'text': restaurant.summary.name,
    'image_url': placeholderImage,
    'color': '#3AA3E3',
    'callback_id': restaurant.id,
    'fallback': 'You are unable to choose a restaurant',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'choose',
        'text': 'choose',
        'type': 'button',
        'value': restaurant.id
      }]
  }
  return obj
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
  opts.push('Suprise Me', 'Nothing')
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

/*
* create ranking from searches given votes
*
* @param {array} voteParam array with each object is same as searchNearby input
*                params except additional param of total votes
*                voteParams has two objects basically, vote count and params to search
*
* @returns {} object that is ranked listing of places or whatever
*/
function createSearchRanking (results, votes) {
  // filter results based on what results want
  var merchants = (_.get(results, 'merchants')) ? results.merchants : merchants
  var eligible = []
  _.forEach(votes, function (v) {
    // get all merchants who satisfy cuisine type being v
    eligible = _.union(eligible, _.filter(merchants, function (c) {
      return _.includes(c.summary.cuisines, v)
    }))
  })
  return eligible
}

function sortMerchantsByDistance (merchants) {
  return _.orderBy(merchants, 'location.distance', ['asc'])
}

function sortMerchantsByRating (merchants) {
  return _.orderBy(merchants, 'summary.overall_rating', ['desc'])
}

function getVotesFromMembers (messages) {
  return _.map(messages, 'data.vote')
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
* s5 on layout
* creates message to send to each user with random assortment of suggestions, will probably want to create a better schema
*
*/
function askUserForCuisineTypes (cuisines, user, adminName) {
  // probably should check if user is on slack
  var s = _.sampleSize(cuisines, 4)
  var res = sm().text('`' + adminName + '` is collecting lunch suggestions vote now!')
  var a = res.attachment()
    .color('#3AA3E3')
    .ts(Date.now())
  _.forEach(s, function (cuisineName) {
    a.button().name(cuisineName).value(cuisineName).text(cuisineName).end()
  })
  a.button().name('Nothing').value('Nothing').text('Nothing').style('danger').end()
  return res.json()
}

function confirmRestaurant (restaurantName) {
  var res = {
    text: "Okay I'll collect orders for `" + restaurantName + '`',
    attachments: [{
      fallback: 'You are unable to confirm',
      callback_id: 'confirmRestaurant',
      color: '#3AA3E3',
      actions: [
        {
          name: 'confirm',
          text: 'confirm',
          style: 'primary',
          type: 'button',
          value: 'confirm'
        },
        {
          name: 'view team members',
          text: 'view team members',
          type: 'button',
          value: 'view team members'
        },
        {
          name: 'Confirm',
          text: 'Confirm',
          type: 'button',
          value: 'buttons'
        }
      ]
    }
    ]
  }
  return res
}

module.exports.askUserForCuisineTypes = askUserForCuisineTypes
module.exports.chooseRestaurant = chooseRestaurant
module.exports.createSearchRanking = createSearchRanking
module.exports.getVotesFromMembers = getVotesFromMembers
module.exports.initiateFoodMessage = initiateFoodMessage
module.exports.sortMerchantsByDistance = sortMerchantsByDistance
module.exports.sortMerchantsByRating = sortMerchantsByRating
module.exports.confirmRestaurant = confirmRestaurant

// former quick testing stuff
if (!module.parent) {
  co(function * () {
    var testingParams = {
      addr: '21 Essex St 10002',
      votes: {
        'Asian': 3,
        'Sandwiches': 2
      }
    }
    // fs.writeFile('./data.json', JSON.stringify(results) , 'utf-8')
    // var c = yield getMerchatsWithCuisine(results, 'Asian')
    // logging.info('cuisine types avail: ', c)
    var cuisines = JSON.parse(fs.readFileSync('extra/cuisinesAvailable.json', 'utf8'))
    var res = askUserForCuisineTypes(cuisines, 'userXXX', 'Alyx')
    logging.debug(res)
  })
}
