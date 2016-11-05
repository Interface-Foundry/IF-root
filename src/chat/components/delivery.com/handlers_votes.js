'use strict'
require('kip')
var _ = require('lodash')
var Fuse = require('fuse.js')
var googl = require('goo.gl')
var request = require('request-promise')
var send_text_reply = require('./utils.js').send_text_reply
var api = require('./api-wrapper.js')
var team_utils = require('./team_utils.js')
var utils = require('./utils')

if (_.includes(['development', 'test'], process.env.NODE_ENV)) {
  googl.setKey('AIzaSyDQO2ltlzWuoAb8vS_RmrNuov40C4Gkwi0')
} else {
  googl.setKey('AIzaSyATd2gHIY0IXcC_zjhfH1XOKdOmUTQQ7ho')
}

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}
var api = require('./api-wrapper')

/*
* S5
* creates message to send to each user with random assortment of suggestions, will probably want to create a better schema
*
*/
function askUserForCuisineTypes (cuisines, admin, user) { // move this into the functiopn later
  // probably should check if user is on slack
  var cuisineToUse = _.sampleSize(cuisines, 4)
    // var cuisineToUse = cuisines.slice(0,2) // use this for testing

  var sampleArray = _.map(cuisineToUse, function (cuisineName) {
    return {
      name: 'food.admin.restaurant.pick',
      value: cuisineName,
      text: cuisineName,
      type: 'button'
    }
  })
  // add cancel button
  sampleArray.push({
    name: 'food.admin.restaurant.pick',
    value: 'user_remove',
    text: '× No Lunch for Me',
    type: 'button',
    style: 'danger'
  })

  var res = {
    text: `<@${admin.id}|${admin.name}> is collecting lunch suggestions, vote now!`,
    fallback: 'You are unable to vote for lunch preferences',
    callback_id: 'food.user.poll',
    color: '#3AA3E3',
    attachment_type: 'default',
    attachments: [{
      'text': 'Type what you want or tap a button',
      'fallback': 'You are unable to tap a button',
      'callback_id': 'food.user.poll',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': sampleArray
    }]
  }
  return res
}

var userFoodPreferencesPlaceHolder = {
  text: 'Here we would ask user for preferences if they didnt have it',
  fallback: 'You are unable to confirm preferences',
  callback_id: 'confirm.user.preferences',
  color: 'grey',
  attachment_type: 'default',
  attachments: [{
    actions: [{
      'name': 'food.user.poll',
      'value': 'food.user.poll',
      'text': 'Confirm',
      'type': 'button'
    },
      {
        'name': 'food.user.preference.cancel',
        'value': 'food.user.preference.cancel',
        'text': '× Cancel',
        'type': 'button'
      }]
  }]
}

//
// enum for sort orders
//
var SORT = {
  bestMatch: 'best match',
  price: 'price',
  rating: 'rating',
  distance: 'distance',
  random: 'random',

  descending: 'descending',
  ascending: 'ascending'
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
function * createSearchRanking (foodSession, sortOrder, direction) {
  // Set a default sort order
  sortOrder = sortOrder || SORT.bestMatch

  // will multiply by -1 depending on ascending or decscending
  var directionMultiplier = direction === SORT.ascending ? 1 : -1

  //
  // Different ways to compute the score for a merchant. Higher scores show up first.
  //
  var scoreAlgorithms = {
    [SORT.bestMatch] : (m) => foodSession.votes.filter(v => m.summary.cuisines.includes(v)).length || 0,
    [SORT.distance] : (m) => _.get(m, 'location.distance', 10000),
    [SORT.rating] : (m) => {
      return _.get(m, 'summary.overall_rating', 0) },
    [SORT.price] : (m) => _.get(m, 'summary.price_rating', 10),
    [SORT.random] : (m) => Math.random()
  }

  // First filter out the ones that are not available for delivery or pickup
  var merchants = foodSession.merchants.filter(m => {
    return _.get(m, 'ordering.availability.' + foodSession.fulfillment_method)
  })

  // now order the restaurants in terms of descending score
  merchants = merchants
    .map(m => {
      m.score = scoreAlgorithms[sortOrder](m)
      return m
    })
    .sort((a, b) => directionMultiplier * (a.score - b.score))

  return merchants
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

// check for user preferences/diet/etc, skipping for now
handlers['food.user.preferences'] = function * (session) {
  var teamMembers = yield db.chatusers.find({team_id: session.source.team, is_bot: false, id: {$ne: 'USLACKBOT'}})
  if (process.env.NODE_ENV === 'test') {
    teamMembers = [teamMembers[0]]
  }
  if (teamMembers.length < 1) {
    kip.debug('fetching team members...')
    teamMembers = yield team_utils.getChatUsers(message)
  }
  teamMembers.map(function (member) {
    var userPreferences = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: session.origin,
      source: session.source,
      res: userFoodPreferencesPlaceHolder
    }
    userPreferences.source.user = member.id
    userPreferences.source.channel = member.dm
    $replyChannel.send(userPreferences, 'food.user.poll', {type: 'slack', data: userPreferences.res})
  })
}

// poll for cuisines
handlers['food.user.poll'] = function * (message) {
  // going to want to move this to s3 probably
  // ---------------------------------------------
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // ---------------------------------------------
  var teamMembers = foodSession.team_members
  if (process.env.NODE_ENV === 'test') {
    teamMembers = [teamMembers[0]]
  }

  // error with mock slack not being able to get all messages
  teamMembers.map(function (member) {
    var source = {
      type: 'message',
      channel: member.dm,
      user: member.id,
      team: member.team_id
    }

    var cuisinesAvailForUser = _.map(_.filter(foodSession.cuisines, function (o) { return o.count > 10 }), 'name')
    var cuisineMessage = askUserForCuisineTypes(cuisinesAvailForUser, foodSession.convo_initiater, member.dm)

    var response = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: message.origin,
      source: source,
      data: cuisineMessage
    }
    foodSession.data = { response_history: []}
    foodSession.data.response_history.push({'handler': 'food.user.poll', 'response': response.data})
    foodSession.save()
    $replyChannel.send(response, 'food.admin.restaurant.pick', {type: 'slack', data: response.data})
  })
}

handlers['food.user.choice_confirm'] = function * (message) {
  $replyChannel.send(message, 'food.admin.restaurant.pick', {type: 'slack', data: message.example_res})
}

handlers['food.admin.restaurant.pick'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  if (message.allow_text_matching) {
    // user typed something
    logging.info('using text matching for cuisine choice')
    var res = yield utils.matchText(message.text, foodSession.cuisines, ['name'])
    if (res !== null) {
      logging.info('using vote', res)
      foodSession.votes.push(res[0].name)
      foodSession.markModified('votes')
    }
  } else {
    // user used button click
    // No Lunch For Me
    if (message.data.value === 'user_remove') {
      foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.user_id)
      foodSession.markModified('team_members')
    }
    foodSession.votes.push(message.data.value)
    foodSession.markModified('votes')
  }
  foodSession.save()
  var numOfResponsesWaitingFor = foodSession.team_members.length - foodSession.votes.length
  var votes = foodSession.votes
  kip.debug('numOfResponsesWaitingFor: ', numOfResponsesWaitingFor, ' votes: ', votes)

  // replace after votes
  $replyChannel.sendReplace(message, 'food.admin.restaurant.pick', {type: 'slack', data: {text: `Thanks for your vote, waiting for the rest of the users to finish voting`}})
  if (numOfResponsesWaitingFor <= 0) {
    var admin = yield db.Chatusers.findOne({id: foodSession.convo_initiater.id}).exec()
    var resp = {
      mode: 'food',
      action: 'admin.restaurant.pick',
      thread_id: admin.dm,
      origin: message.origin,
      source: {
        team: admin.team_id,
        user: admin.id,
        channel: admin.dm
      }
    }
    yield handlers['food.admin.restaurant.pick.list'](resp, foodSession)
  } else {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
  }
}


handlers['food.admin.restaurant.pick.list'] = function * (message, foodSession) {
  var index = _.get(message, 'data.value.index', 0)
  var sort = _.get(message, 'data.value.sort', SORT.bestMatch)
  var direction = _.get(message, 'data.value.direction', SORT.descending)
  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession
  var viableRestaurants = yield createSearchRanking(foodSession, sort, direction)
  logging.info('# of restaurants: ', foodSession.merchants.length)
  logging.data('# of viable restaurants: ', viableRestaurants.length)

  var responseForAdmin = {
    'text': 'Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?',
    'attachments': yield viableRestaurants.slice(index, index+3).map(utils.buildRestaurantAttachment)
  }

  var moreButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': 'More Choices >',
    'type': 'button',
    'value': {index: index + 3, sort: sort, direction: direction}
  }

  var backButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': '<',
    'type': 'button',
    'value': {index: index - 3, sort: sort, direction: direction}
  }

  var arrow = direction === SORT.descending ? '▾ ' : '▴ '

  // default price sort direction is ascending
  var sortPriceButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.price ? arrow : '') + 'Sort Price',
    'type': 'button',
    'value': {index: 0, sort: SORT.price, direction: (sort === SORT.price && direction === SORT.ascending) ? SORT.descending : SORT.ascending }
  }

  // default rating sort direction is descending
  var sortRatingButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.rating ? arrow : '') + 'Sort Rating',
    'type': 'button',
    'value': {index: 0, sort: SORT.rating, direction: (sort === SORT.rating && direction === SORT.descending) ? SORT.ascending : SORT.descending }
  }

  // default distance sort direction is ascending
  var sortDistanceButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.distance ? arrow : '') + 'Sort Distance',
    'type': 'button',
    'value': {index: 0, sort: SORT.distance, direction: (sort === SORT.distance && direction === SORT.ascending) ? SORT.descending : SORT.ascending }
  }

  var buttons = {
    'mrkdwn_in': [
      'text'
    ],
    'text': '',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'food.admin.restaurant.pick',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'actions': []
  }

  if (index > 0) {
    buttons.actions.push(backButton)
  }

  if (index + 3 < viableRestaurants.length) {
    buttons.actions.push(moreButton)
  }

  buttons.actions = buttons.actions.concat([sortPriceButton, sortRatingButton, sortDistanceButton])

  responseForAdmin.attachments.push(buttons)

  $replyChannel.sendReplace(message, 'food.admin.restaurant.confirm', {type: 'slack', data: responseForAdmin})
}

handlers['food.admin.restaurant.more_info'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})
  var attachments = []
  // TODO later
}

handlers['food.admin.restaurant.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  if (message.allow_text_matching) {
    // search for merchant from text input
    var res = yield utils.matchText(message.text, foodSession.merchants, ['summary.name'])
    if (res !== null) {
      var merchant = res[0]
    }
  } else {
    // use button to select merchant
    merchant = _.find(foodSession.merchants, {id: String(message.data.value)})
  }

  if (!merchant) {
    merchant = yield api.getMerchant(message.data.value)
    foodSession.merchants = [merchant]
    foodSession.markModified('merchants')
    foodSession.save()
  }
  var url = yield googl.shorten(merchant.summary.url.complete)

  logging.data('using merchant for food service', merchant.id)
  foodSession.chosen_restaurant = {
    id: merchant.id,
    name: merchant.summary.name,
    url: url
  }

  var menu = yield request({
    url: `https://api.delivery.com/merchant/${merchant.id}/menu?client_id=brewhacks2016`,
    json: true
  })

  foodSession.menu = menu

  foodSession.save()

  return yield handlers['food.admin.restaurant.collect_orders'](message, foodSession)

}

handlers['food.admin.restaurant.collect_orders'] = function * (message, foodSession) {
  foodSession = typeof foodSession !== 'undefined' ? foodSession : yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var waitTime = _.get(foodSession, 'chosen_restaurant_full.ordering.availability.delivery_estimate', '45')
  var cuisines = _.get(foodSession, 'chosen_restaurant_full.summary.cuisines', []).join(', ')
  var msgJson = {
    'text': `<@${foodSession.convo_initiater.id}|${foodSession.convo_initiater.name}> chose <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}> - ${cuisines} - est. wait time ${waitTime} min`,
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
            'value': {}
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

  foodSession.team_members.map(m => {
    console.log(m)
    var newMessage = {
      incoming: false,
      thread_id: m.dm,
      resolved: true,
      user_id: 'kip',
      origin: 'slack',
      source: {
        team: m.team_id,
        user: m.id,
        channel: m.dm,
        type: 'message'
      },
      state: {},
      user: m.id
    }

    $replyChannel.send(newMessage, 'food.menu.quick_picks', {type: 'slack', data: msgJson})
  })
}



module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
