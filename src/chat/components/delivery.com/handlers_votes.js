'use strict'
require('kip')
var _ = require('lodash')

var sleep = require('co-sleep')
var googl = require('goo.gl')
var request = require('request-promise')
var api = require('./api-wrapper.js')
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

/*
* S5
* creates message to send to each user with random assortment of suggestions, will probably want to create a better schema
*
*/
function voteMessage (foodSession) {
  // present top 2 local avail and then 2 random sample,
  // if we want to later prime user with previous selected choice can do so with replacing one of the names in the array
  var orderedCuisines = _.map(_.sortBy(foodSession.cuisines, ['count']), 'name')
  var ignoredTopItems = ['Cafe', 'Kosher', 'Sandwiches', 'Italian', 'Pizza', 'Asian']
  var cuisinesWithoutTop = _.pullAll(orderedCuisines, ignoredTopItems)
  var top1 = cuisinesWithoutTop.pop()
  var top2 = cuisinesWithoutTop.pop()
  var randomCuisines = _.sampleSize(_.pull(orderedCuisines, top1, top2), 2)
  var cuisineToUse = [top1, top2, randomCuisines[0], randomCuisines[1]]

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
    text: '× No Food for Me',
    type: 'button',
    style: 'danger'
  })

  var admin = foodSession.convo_initiater

  var res = {
    text: `<@${admin.id}|${admin.name}> is collecting food suggestions, vote now!`,
    fallback: '<@${admin.id}|${admin.name}> is collecting food suggestions, vote now!',
    callback_id: 'food.user.poll',
    color: '#3AA3E3',
    attachment_type: 'default',
    attachments: [{
      'text': 'Type what you want or tap a button',
      'fallback': 'Type what you want or tap a button',
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
  fallback: 'Any preferences?',
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
  cuisine: 'cuisine',
  keyword: 'keyword',
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
function * createSearchRanking (foodSession, sortOrder, direction, keyword) {
  // Set a default sort order
  sortOrder = sortOrder || SORT.cuisine

  // will multiply by -1 depending on ascending or decscending
  var directionMultiplier = direction === SORT.ascending ? 1 : -1

  //
  // Different ways to compute the score for a merchant. Higher scores show up first.
  //
  var scoreAlgorithms = {
    [SORT.cuisine]: (m) => foodSession.votes.filter(v => m.summary.cuisines.includes(v.vote)).length || 0,
    [SORT.keyword]: (m) => {
      if (!keyword) {
        throw new Error('Cannot sort based on keyword without a keyword')
      }
      return (matchingRestaurants.length - matchingRestaurants.indexOf(m.id)) / matchingRestaurants.length
    },
    [SORT.distance]: (m) => _.get(m, 'location.distance', 10000),
    [SORT.rating]: (m) => {
      return _.get(m, 'summary.overall_rating', 0) },
    [SORT.price]: (m) => _.get(m, 'summary.price_rating', 10),
    [SORT.random]: (m) => Math.random()
  }

  // First filter out the ones that are not available for delivery or pickup
  var merchants = foodSession.merchants.filter(m => {
    return _.get(m, 'ordering.availability.' + foodSession.fulfillment_method)
  })

  // next filter out restaurants that don't match the keyword if provided
  if (keyword) {
    var matchingRestaurants = yield utils.matchText(keyword, foodSession.merchants, {
      shouldSort: true,
      threshold: 0.8,
      tokenize: true,
      matchAllTokens: true,
      keys: ['summary.name']
    })
    matchingRestaurants = matchingRestaurants.map(r => r.id)
    merchants = merchants.filter(m => matchingRestaurants.includes(m.id))
  }

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

    // generate some random cuisines to vote from
    var cuisineMessage = voteMessage(foodSession)

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

    if (member.id === foodSession.convo_initiater.id) {
      $replyChannel.sendReplace(message, 'food.admin.restaurant.pick', {type: 'slack', data: response.data})
    } else {
      $replyChannel.send(response, 'food.admin.restaurant.pick', {type: 'slack', data: response.data})
    }
  })
}

handlers['food.user.choice_confirm'] = function * (message) {
  $replyChannel.send(message, 'food.admin.restaurant.pick', {type: 'slack', data: message.example_res})
}

handlers['food.admin.restaurant.pick'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  function addVote (str) {
    var vote = {
      user: message.source.user,
      vote: str
    }

    foodSession.votes.push(vote)
    return foodSession.save()
  }

  if (message.allow_text_matching) {
    // user typed something
    logging.info('using text matching for cuisine choice')
    var res = yield utils.matchText(message.text, foodSession.cuisines, {
      shouldSort: true,
      threshold: 0.8,
      tokenize: true,
      matchAllTokens: true,
      keys: ['name']
    })
    if (res !== null) {
      yield addVote(res[0].name)
    } else {
      yield addVote(message.text)
    }
  } else {
    // user used button click
    // No Lunch For Me
    if (message.data.value === 'user_remove') {
      yield foodSession.update({$pull: {team_members: {id: message.user_id}}}).exec()
      foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.user_id)
    } else {
      yield addVote(message.data.value)
    }
  }
  var numOfResponsesWaitingFor = foodSession.team_members.length - _.uniq(foodSession.votes.map(v => v.user)).length
  var votes = foodSession.votes
  kip.debug('numOfResponsesWaitingFor: ', numOfResponsesWaitingFor, ' votes: ', votes)

  // replace after votes
  $replyChannel.sendReplace(message, 'food.admin.restaurant.pick', {type: 'slack', data: {text: `Thanks for your vote, waiting for the rest of the users to finish voting`}})

  if (numOfResponsesWaitingFor <= 0) {
    yield handlers['food.admin.dashboard.cuisine'](message, foodSession)
    yield handlers['food.admin.restaurant.pick.list'](message, foodSession)
  } else {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
    yield handlers['food.admin.dashboard.cuisine'](message, foodSession)
  }
}

/*
* Confirm all users have voted for a cuisine
*/
handlers['food.admin.dashboard.cuisine'] = function * (message, foodSession) {
  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession

  if (message.allow_text_matching) {
    return yield handlers['food.admin.restaurant.pick'](message)
  }
  // Build the votes tally
  var votes = foodSession.votes
    .map(v => v.vote) // get just the vote, not username
    .map(v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()) // capitalize
    .reduce((counts, v) => { // count
      if (counts.hasOwnProperty(v)) {
        counts[v]++
      } else {
        counts[v] = 1
      }
      return counts
    }, {})
  votes = Object.keys(votes).map(v => `*${v}:* ${votes[v]}`).join('\n')

  // Show which team members are not in the votes array
  var slackers = _.difference(foodSession.team_members.map(m => m.id), foodSession.votes.map(v => v.user))
    .map(id => `<@${id}>`)
    .join(', ')

  var dashboard = {
    // text: 'Kip Café poll ‒ What\'s for lunch?',
    attachments: [{
      color: '#3AA3E3',
      mrkdwn_in: ['text'],
      text: `*Votes from the group* 👋\n${votes}`,
      fallback: `*Votes from the group* 👋\n${votes}`,
      callback_id: 'admin_restaurant_pick',
    }]
  }
  // if (feedbackOn && dashboard) {
  //   dashboard.attachments[0].actions.push({
  //     name: 'food.feedback.new',
  //     text: '⇲ Send feedback',
  //     type: 'button',
  //     value: 'food.feedback.new'
  //   })
  // }

  if (slackers.length > 0) {
    dashboard.attachments.push({
      color: '#49d63a',
      mrkdwn_in: ['text'],
      text: `*Waiting for votes from:* \n${slackers}`,
      actions: [{
        name: 'food.admin.restaurant.pick.list',
        text: 'Finish Voting Early',
        style: 'default',
        type: 'button',
        value: 'food.admin.restaurant.pick.list'
      }]
    })
  }



  if (_.get(foodSession.tracking, 'confirmed_votes_msg')) {
    // replace admins message
    var msgToReplace = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_votes_msg})
    $replyChannel.sendReplace(msgToReplace, 'food.admin.dashboard.cuisine', {
      type: msgToReplace.origin,
      data: dashboard
    })
  } else {
    // admin is confirming, replace their message
    var admin = foodSession.convo_initiater
    var message = {
      mode: 'food',
      action: 'admin.restaurant.pick',
      thread_id: admin.dm,
      origin: message.origin,
      source: {
        team: foodSession.team_id,
        user: admin.id,
        channel: admin.dm
      }
    }

    // if the admin has not yet voted, make sure to set the mode.action to the votable route
    if (foodSession.votes.map(u => u.user).includes(foodSession.convo_initiater.id)) {
      var route = 'food.admin.dashboard.cuisine'
    } else {
      route = 'food.admin.restaurant.pick'
    }

    var sentMessage = yield $replyChannel.send(message, route, {
      type: message.origin,
      data: dashboard
    })
    foodSession.tracking.confirmed_votes_msg = sentMessage._id
    yield foodSession.save()
  }
}

handlers['food.admin.restaurant.pick.list'] = function * (message, foodSession) {
  var index = _.get(message, 'data.value.index', 0)
  var sort = _.get(message, 'data.value.sort', SORT.cuisine)
  var direction = _.get(message, 'data.value.direction', SORT.descending)
  var keyword = _.get(message, 'data.value.keyword')

  // reset to cuisine sort if tyring to keyword sort w/o a keyword
  if (sort === SORT.keyword && !keyword) {
    sort = SORT.cuisine
  }

  // always sort descending for keyword and cuisine matches (sort by highest relevance)
  if ([SORT.cuisine, SORT.keyword].includes(sort)) {
    direction = SORT.descending
  }

  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession
  var viableRestaurants = yield createSearchRanking(foodSession, sort, direction, keyword)
  logging.info('# of restaurants: ', foodSession.merchants.length)
  logging.data('# of viable restaurants: ', viableRestaurants.length)

  var responseForAdmin = {
    'text': 'Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?',
    'attachments': yield viableRestaurants.slice(index, index + 3).map(utils.buildRestaurantAttachment)
  }

  var moreButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': 'More Choices >',
    'type': 'button',
    'value': {index: index + 3, sort: sort, direction: direction, keyword: keyword}
  }

  var backButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': '<',
    'type': 'button',
    'value': {index: index - 3, sort: sort, direction: direction, keyword: keyword}
  }

  var arrow = direction === SORT.descending ? '▾ ' : '▴ '

  // default price sort direction is ascending
  var sortPriceButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.price ? arrow : '') + 'Sort Price',
    'type': 'button',
    'value': {
      index: 0,
      sort: (sort === SORT.price && direction === SORT.descending) ? SORT.keyword : SORT.price,
      keyword: keyword,
      direction: (sort === SORT.price && direction === SORT.ascending) ? SORT.descending : SORT.ascending
    }
  }

  // default rating sort direction is descending
  var sortRatingButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.rating ? arrow : '') + 'Sort Rating',
    'type': 'button',
    'value': {
      index: 0,
      sort: (sort === SORT.rating && direction === SORT.ascending) ? SORT.keyword : SORT.rating,
      keyword: keyword,
      direction: (sort === SORT.rating && direction === SORT.descending) ? SORT.ascending : SORT.descending
    }
  }

  // default distance sort direction is ascending
  var sortDistanceButton = {
    'name': 'food.admin.restaurant.pick.list',
    'text': (sort === SORT.distance ? arrow : '') + 'Sort Distance',
    'type': 'button',
    'value': {
      index: 0,
      sort: (sort === SORT.distance && direction === SORT.descending) ? SORT.keyword : SORT.distance,
      keyword: keyword,
      direction: (sort === SORT.distance && direction === SORT.ascending) ? SORT.descending : SORT.ascending
    }
  }

  var buttons = {
    'mrkdwn_in': [
      'text'
    ],
    'text': '',
    'fallback': 'Restaurant',
    'callback_id': 'admin_restaurant_pick',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'actions': [],
    'footer': 'Powered by Delivery.com',
    'footer_icon': 'http://tidepools.co/kip/dcom_footer.png'
  }

  if (index > 0) {
    buttons.actions.push(backButton)
  }

  if (index + 3 < viableRestaurants.length) {
    buttons.actions.push(moreButton)
  }

  buttons.actions = buttons.actions.concat([sortPriceButton, sortRatingButton, sortDistanceButton])

  responseForAdmin.attachments.push(buttons)

  // admin is confirming, replace their message
  var admin = foodSession.convo_initiater
  var msg = {
    mode: 'food',
    action: 'admin.restaurant.pick.list',
    thread_id: admin.dm,
    origin: message.origin,
    source: {
      team: foodSession.team_id,
      user: admin.id,
      channel: admin.dm
    }
  }

  kip.debug('sending message to admin', admin)
  kip.debug(msg)

  $replyChannel.send(msg, 'food.admin.restaurant.search', {type: 'slack', data: responseForAdmin})
}

handlers['food.admin.restaurant.more_info'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})
  var attachments = []
  // TODO later
}

handlers['food.admin.restaurant.search'] = function * (message) {
  message.data = {
    value: {
      index: 0,
      keyword: message.text,
      sort: SORT.keyword
    }
  }

  return yield handlers['food.admin.restaurant.pick.list'](message)
}

handlers['food.admin.restaurant.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})

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
    url: url,
    minimum: merchant.ordering.minimum
  }

  foodSession.menu = yield api.getMenu(merchant.id)

  foodSession.save()

  return yield handlers['food.admin.restaurant.collect_orders'](message, foodSession)
}

handlers['food.admin.restaurant.confirm_reordering_of_previous_restaurant'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.menu = yield api.getMenu(foodSession.chosen_restaurant.id)
  yield foodSession.save()
  yield handlers['food.admin.restaurant.collect_orders'](message, foodSession)
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
        'fallback': 'Want to be in this order?',
        'callback_id': 'food.participate.confirmation',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'food.menu.quickpicks',
            'text': 'Yes',
            'type': 'button',
            'style': 'primary',
            'value': {}
          },
          {
            'name': 'food.admin.waiting_for_orders',
            'text': 'No',
            'type': 'button',
            'value': 'no thanks',
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

    $replyChannel.send(newMessage, 'food.menu.quickpicks', {type: 'slack', data: msgJson})
  })
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
