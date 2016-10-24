'use strict'
var _ = require('lodash')
var Fuse = require('fuse.js')
var googl = require('goo.gl')
var request = require('request-promise')
var send_text_reply = require('./delivery.com').send_text_reply
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
function askUserForCuisineTypes (cuisines, admin, user) {
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
      'title': 'Delivery Contact',
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

/*
* creates attachments to display to admin for merchant
*
*
*/
function chooseRestaurant (restaurants, orderBy) {
  var attachments = restaurants.slice(0, 3).map(buildRestaurantAttachment)
  var res = {
    'text': 'Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?',
    'attachments': attachments
  }
  res.attachments.push({
    'mrkdwn_in': [
      'text'
    ],
    'text': '',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'food.admin.restaurant.pick',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'More Choices >',
        'type': 'button',
        'value': 'more'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Price',
        'type': 'button',
        'value': 'sort_price'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Rating',
        'type': 'button',
        'value': 'sort_rating'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Distance',
        'type': 'button',
        'value': 'sort_distance'
      }
    ]
  })
  return res
}

function * buildRestaurantAttachment (restaurant) {
  // will need to use picstitch for placeholder image in future
  // var placeholderImage = 'https://storage.googleapis.com/kip-random/laCroix.gif'
  try {
    var realImage = yield request({
        uri: kip.config.picstitchDelivery,
        json: true,
        body: {
          origin: 'slack',
          cuisines: restaurant.summary.cuisines,
          location: restaurant.location,
          ordering: restaurant.ordering,
          summary: restaurant.summary,
          url: restaurant.summary.merchant_logo
        }
      })
  } catch (e) {
    kip.err(e)
    realImage = 'https://storage.googleapis.com/kip-random/laCroix.gif'
  }
  var shortenedRestaurantUrl = yield googl.shorten(restaurant.summary.url.complete)
  var obj = {
    'text': `<${shortenedRestaurantUrl}|${restaurant.summary.name}>`,
    'image_url': realImage,
    'color': '#3AA3E3',
    'callback_id': restaurant.id,
    'fallback': 'You are unable to choose a restaurant',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.admin.restaurant.confirm',
        'text': '✓ Choose',
        'type': 'button',
        'style': 'primary',
        'value': restaurant.id
      },
      // {
      //   'name': 'food.admin.restaurant.more_info',
      //   'text': 'More Info',
      //   'type': 'button',
      //   'value': restaurant.id
      // }
    ]
  }
  return obj
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
function * createSearchRanking (foodSession) {
  // filter results based on what results want
  var eligible = []
  _.forEach(foodSession.votes, function (v) {
    // get all merchants who satisfy cuisine type being v
    eligible = _.union(eligible, _.filter(foodSession.merchants, function (c) {
      return _.includes(c.summary.cuisines, v) && c.deliverable
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
  var addr = (foodSession.data && foodSession.data.input) ? foodSession.data.input : '';
  if (!addr) return send_text_reply(message, 'Sorry! We couldn\'t find that address!');
  var res = yield api.searchNearby({addr: addr})
  foodSession.merchants = _.get(res, 'merchants')
  foodSession.cuisines = _.get(res, 'cuisines')
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

    var cuisineMessage = askUserForCuisineTypes(_.map(_.filter(foodSession.cuisines, function (o) { return o.count > 10 }), 'name'), foodSession.convo_initiater, member.dm)

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
  if (!message.data) {
    var choices = _.get(foodSession, 'data.response_history[0].response.attachments[0].actions')
    if (choices) choices.splice(-1, 1)
    var key = choices ? 'text' : 'name'
    var set = choices ? choices : foodSession.cuisines
    var options = {
      keys: [{ name: key, weight: 1}],
      shouldSort: true,
      threshold: 0.6
    }
    var fuse = new Fuse(set, options)
    var res = yield fuse.search(message.text)
    if (res && res.length > 0) {
      message.data = {
        'value': res[0][key],
        'action': 'admin.restaurant.pick',
        'mode': 'food'
      }
    } else {
      // TODO: Handle if user inputs nonsense here
      kip.debug('User typed in an invalid response.')
    }
    // kip.debug('\n\ninside food.admin.restaurant.pick 779 fuse returned: ', res, message.data, '\n\n')
  } else {
    // kip.debug('\n\ninside food.admin.restaurant.pick 786', message.data, '\n\n')
  }
  foodSession.votes.push(message.data.value)
  foodSession.markModified('votes')
  foodSession.save()
  var numOfResponsesWaitingFor = foodSession.team_members.length - foodSession.votes.length
  var votes = foodSession.votes
  kip.debug('numOfResponsesWaitingFor: ', numOfResponsesWaitingFor, ' votes: ', votes)

  // replace after votes
  $replyChannel.sendReplace(message, 'food.admin.restaurant.pick', {type: 'slack', data: {text: `Thanks for your vote, waiting for the rest of the users to finish voting`}})
  if (numOfResponsesWaitingFor <= 0) {
    yield handlers['food.admin.restaurant.pick.list'](message, foodSession)
  } else {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
  }
}

handlers['food.admin.restaurant.pick.list'] = function * (message, foodSession) {
  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession
  var admin = yield db.Chatusers.findOne({id: foodSession.convo_initiater.id}).exec()
  var viableRestaurants = yield createSearchRanking(foodSession)
  logging.info('# of restaurants: ', foodSession.merchants.length)
  logging.data('# of viable restaurants: ', viableRestaurants.length)

  var responseForAdmin = {
    'text': 'Here are 3 restaurant suggestions based on your team vote. \n Which do you want today?',
    'attachments': yield viableRestaurants.slice(0, 3).map(buildRestaurantAttachment)
  }
  logging.data('responseForAdmin', responseForAdmin)
  responseForAdmin.attachments.push({
    'mrkdwn_in': [
      'text'
    ],
    'text': '',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'food.admin.restaurant.pick',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'More Choices >',
        'type': 'button',
        'value': 'more'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Price',
        'type': 'button',
        'value': 'sort_price'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Rating',
        'type': 'button',
        'value': 'sort_rating'
      },
      {
        'name': 'food.admin.restaurant.pick',
        'text': 'Sort Distance',
        'type': 'button',
        'value': 'sort_distance'
      }
    ]
  })

  var resp = {
    mode: 'food',
    action: 'admin.restaurant.pick',
    thread_id: admin.dm,
    origin: message.origin,
    source: {
      team: admin.team_id,
      user: admin.id,
      channel: admin.dm
    },
    data: responseForAdmin
  }
  $replyChannel.send(resp, 'food.admin.restaurant.confirm', {type: 'slack', data: resp.data})
}

handlers['food.admin.restaurant.more_info'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})
  var attachments = []

  // TODO later
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

  logging.data('using merchant for food service', merchant.id)
  foodSession.chosen_restaurant = {
    id: merchant.id,
    name: merchant.summary.name,
    url: yield googl.shorten(merchant.summary.url.complete)
  }

  var menu = yield request({
    url: `https://api.delivery.com/merchant/${merchant.id}/menu?client_id=brewhacks2016`,
    json: true
  })
  foodSession.menu = menu

  foodSession.save()

  var response = {
    mode: 'food',
    action: 'admin.restaurant.collect_orders',
    thread_id: message.dm,
    origin: message.origin,
    source: message.source,
    data: {
      'text': `Okay I'll collect orders for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
      'attachments': [{
        'fallback': 'You are unable to confirm',
        'callback_id': 'confirmRestaurant',
        'color': '#3AA3E3',
        'actions': [
          {
            'name': 'food.admin.restaurant.collect_orders',
            'text': 'Confirm',
            'style': 'primary',
            'type': 'button',
            'value': 'confirm'
          },
          {
            'name': 'food.admin.view_team_members',
            'text': 'View Team Members',
            'type': 'button',
            'value': 'view_team_members'
          },
          {
            'name': 'food.admin.change_restaurant',
            'text': '< Change Restaurant',
            'type': 'button',
            'value': 'change_restaurant'
          }
        ]
      }
      ]
    }
  }

  $replyChannel.send(response, 'food.admin.restaurant.collect_orders', {type: 'slack', data: response.data})
}

handlers['food.admin.restaurant.collect_orders'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
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
