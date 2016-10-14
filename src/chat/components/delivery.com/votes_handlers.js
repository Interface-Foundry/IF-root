'use strict'
var _ = require('lodash')

var team_utils = require('./team_utils.js')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

/*
* creates attachments to display to admin for merchant
*
*
*/
function chooseRestaurant (restaurants, orderBy) {
  var viable = restaurants.slice(0, 3)
  var attachments = viable.map(buildRestaurantAttachment)
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
        'name': 'food.admin.restaurant.confirm',
        'text': '✓ Choose',
        'type': 'button',
        'style': 'primary',
        'value': restaurant.id
      },
      {
        'name': 'food.admin.restaurant.more_info',
        'text': 'More Info',
        'type': 'button',
        'value': restaurant.id
      }]
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
function * createSearchRanking (merchants, votes) {
  // filter results based on what results want
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

// check for user preferences/diet/etc, skipping for now
handlers['food.user.preferences'] = function * (session) {
  var teamMembers = yield db.chatusers.find({team_id: session.source.team, is_bot: false})
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
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var address = foodSession.chosen_location.addr.address_1
  var results = yield api.searchNearby({addr: address})
  foodSession.merchants = _.get(results, 'merchants')
  foodSession.cuisines = _.get(results, 'cuisines')
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
    var resp = {
      mode: 'food',
      action: 'user.poll',
      thread_id: member.dm,
      origin: message.origin,
      source: source,
      res: utils.askUserForCuisineTypes(
        _.map(
          _.filter(foodSession.cuisines, function (o) {
            return o.count > 10
          }), 'name'),
        member.dm, foodSession.convo_initiater)
    }
    foodSession.data = { response_history: []}
    foodSession.data.response_history.push({'handler': 'food.user.poll', 'response': resp.res})
    foodSession.save()
    // need to sendreplace probably
    replyChannel.send(resp, 'food.admin.restaurant.pick', {type: 'slack', data: resp.res})
  })
}

handlers['food.user.choice_confirm'] = function * (message) {
  replyChannel.send(message, 'food.admin.restaurant.pick', {type: 'slack', data: message.example_res})
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
    kip.debug('\n\ninside food.admin.restaurant.pick 779 fuse returned: ', res, message.data, '\n\n')
  } else {
    kip.debug('\n\ninside food.admin.restaurant.pick 786', message.data, '\n\n')
  }
  foodSession.votes.push(message.data.value)
  foodSession.save()
  var numOfResponsesWaitingFor = foodSession.team_members
  var votes = foodSession.votes
  if (votes.length < numOfResponsesWaitingFor) {
    logging.error('waiting for more responses have, votes: ', votes.length)
    logging.error('need', numOfResponsesWaitingFor)
    return
  }
  var viableRestaurants = yield createSearchRanking(foodSession.merchants, votes)

  logging.info('# of restaurants: ', foodSession.merchants.length)
  logging.data('# of viable restaurants: ', viableRestaurants.length)
  var responseForAdmin = chooseRestaurant(viableRestaurants)
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
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})

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

  var resp = {
    mode: 'food',
    action: 'admin.restaurant.collect_orders',
    thread_id: message.dm,
    origin: message.origin,
    source: message.source,
    res: utils.confirmRestaurant(foodSession.chosen_restaurant)
  }

  replyChannel.send(resp, 'food.admin.restaurant.collect_orders', {type: 'slack', data: resp.res})
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

    replyChannel.send(newMessage, 'food.menu.quick_picks', {type: 'slack', data: msgJson})
  })
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
