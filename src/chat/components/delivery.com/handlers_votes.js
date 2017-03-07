'use strict'
var _ = require('lodash')
var co = require('co')
var sleep = require('co-sleep')
var googl = require('goo.gl')
var rp = require('request-promise')

var api = require('./api-wrapper.js')
var utils = require('./utils')
var cuisineClassifier = require('./cuisine_classifier.js')
var mailerTransport = require('../../../mail/IF_mail.js')
var email_utils = require('./email_utils')
var score_utils = require('./score_utils')
// var menu_utils = require('./menu_utils')
var agenda = require('../agendas')

if (_.includes(['development', 'test'], process.env.NODE_ENV)) {
  googl.setKey('AIzaSyDQO2ltlzWuoAb8vS_RmrNuov40C4Gkwi0')
} else {
  googl.setKey('AIzaSyATd2gHIY0IXcC_zjhfH1XOKdOmUTQQ7ho')
}

// injected dependencies
var $replyChannel
var $allHandlers

/** @namespace handlers */ //exports
var handlers = {}

/*
* S5
* creates message to send to each user with random assortment of suggestions, will probably want to create a better schema
*
*/

/**
* Chooses four sample cuisines for the user to select from. The first two are the two most popular cuisines in the area.
* The third is the cuisine most frequently ordered by the team. The fourth is randomly selected from the cuisines available at the location.
* @param {object} foodSession
* @param {object} slackbot
* @returns {array} Array of four cuisines the voter will select from
*/
function sampleCuisines (foodSession, slackbot) {
  // present top 2 local avail and then 2 random sample,
  // if we want to later prime user with previous selected choice can do so with replacing one of the names in the array
  var orderedCuisines = _.map(_.sortBy(foodSession.cuisines, ['count']), 'name')
  var ignoredTopItems = ['Cafe', 'Kosher', 'Sandwiches', 'Italian', 'Pizza', 'Asian']
  var cuisinesWithoutTop = _.pullAll(orderedCuisines, ignoredTopItems)
  var top1 = cuisinesWithoutTop.pop() //two most locally popular cuisines
  var top2 = cuisinesWithoutTop.pop()
  var randomCuisines = _.sampleSize(_.pull(orderedCuisines, top1, top2), 2)

  if (slackbot.meta.cuisine_frequency) {
    var teamCuisines = Object.keys(slackbot.meta.cuisine_frequency).sort(function (a, b) { //cuisines sorted in order of how frequently this team orders them
      return slackbot.meta.cuisine_frequency[b] - slackbot.meta.cuisine_frequency[a]
    })
  }
  else var teamCuisines = null;

  var cuisineToUse = [top1, top2, (teamCuisines && orderedCuisines.indexOf(teamCuisines[0]) > -1 ? teamCuisines[0] : randomCuisines[0]), randomCuisines[1]]

  var sampleArray = _.map(cuisineToUse, function (cuisineName) {
    return {
      name: 'food.vote.submit',
      value: cuisineName,
      text: cuisineName,
      type: 'button'
    }
  })
  // add cancel button
  sampleArray.push({
    name: 'food.vote.abstain',
    value: 'user_remove',
    text: '× No Food for Me',
    type: 'button',
    style: 'danger'
  })

  return sampleArray
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
  var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id})
  // Set a default sort order
  sortOrder = sortOrder || SORT.cuisine

  logging.info('foodSession.votes', foodSession._id)

  // will multiply by -1 depending on ascending or decscending
  var directionMultiplier = direction === SORT.ascending ? 1 : -1

  //
  // Different ways to compute the score for a merchant. Higher scores show up first.
  //

  var scoreAlgorithms = {
    [SORT.cuisine]: (m) => score_utils.cuisineSort(m, foodSession.votes, slackbot),
    // [SORT.cuisine]: (m) => foodSession.votes.filter(v => m.summary.cuisines.includes(v.vote)).length || 0,
    [SORT.keyword]: (m) => {
      if (!keyword) {
        throw new Error('Cannot sort based on keyword without a keyword')
      }
      return (matchingRestaurants.length - matchingRestaurants.indexOf(m.id)) / matchingRestaurants.length
    },
    [SORT.distance]: (m) => _.get(m, 'location.distance', 10000),
    [SORT.rating]: (m) => {
      return _.get(m, 'summary.overall_rating', 0)
    },
    [SORT.price]: (m) => _.get(m, 'summary.price_rating', 10),
    [SORT.random]: (m) => Math.random()
  }

  // First filter out the ones that are not available for delivery or pickup
  var merchants = foodSession.merchants.filter(m => {
    return _.get(m, 'ordering.availability.' + foodSession.fulfillment_method)
  })

  // filter out restaurants whose delivery minimum is significantly above the team's total budget
  if (foodSession.budget) {
    var max = 1.25 * foodSession.team_members.length * foodSession.budget;
    var cheap_merchants = merchants.filter(m => m.ordering.minimum <= max);
    if (cheap_merchants.length > 2) {
      merchants = cheap_merchants
    }
  }

  // filter out restaurants that don't match the keyword if provided
  if (keyword) {
    var matchingRestaurants = yield utils.matchText(keyword, foodSession.merchants, {
      shouldSort: true,
      threshold: 0.35,
      tokenize: true,
      matchAllTokens: true,
      findAllMatches: false,
      keys: ['summary.name']
    })
    matchingRestaurants = matchingRestaurants.map(r => r.id)
    var merchantsMatched = merchants.filter(m => matchingRestaurants.includes(m.id))
    // if including all other results as well, concat merchantsNotMatched)
    // var merchantsNotMatched = merchants.filter(m => !matchingRestaurants.includes(m.id))
    if (merchantsMatched.length < 1) {
      logging.error('no matched results in createSearchRanking', {foodSession, sortOrder, direction, keyword})
    } else {
      merchants = merchantsMatched
    }
  }

  // filter out restaurants that aggregate below a 3 on yelp
  merchants = merchants.filter(m => parseFloat(m.yelp_info.rating.rating) > 2)

  // now order the restaurants in terms of descending score
  // keep track of the highest yelp review score in this particular batch of restaurants
  var maxStars = 0;

  merchants = merchants
    .map(m => {
      m.score = scoreAlgorithms[sortOrder](m)
      if (sortOrder == SORT.cuisine) {
        //score based on yelp reviews
        m.stars = m.yelp_info.rating.review_count * m.yelp_info.rating.rating;
        if (m.stars > maxStars) maxStars = m.stars
      }
      return m
    })

  // if we are sorting by cuisine type and want to incorporate yelp reviews into the order
  if (sortOrder === SORT.cuisine) {
    merchants = merchants
      .map(m => {
        // normalize yelp score to be in [0, 1]
        m.stars = m.stars / maxStars

        // restaurant score equal to the yelp score (which is always <= 1) added to the (integer) number of votes for its cuisine-type(s)
        m.score = m.score + m.stars

        return m
      })
  }

  merchants.sort((a, b) => directionMultiplier * (a.score - b.score))

  logging.info(merchants.map(m => m.score))

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

handlers['food.admin.vote'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()

  var admin = foodSession.team_members[0]

  yield db.Delivery.update({team_id: message.source.team, active: true}, {$set: {votes: [{user: admin.id, vote: message.data.value}]}})

  yield handlers['food.admin.restaurant.pick.list'](message)
}

/**
* for when the admin "skip"s the poll
* @param message
*/
handlers['food.admin.poll'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  db.waypoints.log(1121, foodSession._id, message.user_id, {original_text: message.original_text})
  sendAdminDashboard(foodSession)
}

/**
* poll user for cuisines
* @param message
*/
handlers['food.user.poll'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  db.waypoints.log(1120, foodSession._id, message.user_id, {original_text: message.original_text})

  var teamMembers = foodSession.team_members

  if (teamMembers.length === 0) {
    $replyChannel.sendReplace(message, 'food.admin.select_address', {
      type: message.origin,
      data: {text: 'Oops I had a brain freeze, please try again'}
    })
    return yield $allHandlers['food.admin.select_address'](message)
  }

  yield teamMembers.map(function * (member) {
    logging.debug('checking if we should do food_preferences')
    if (kip.config.preferences.asking &&
      (_.get(member, 'food_preferences.asked') !== true) &&
      (_.includes(kip.config.preferences.users, member.id))) {
      // send user thing for food pref if triggerPref const and havent asked
      yield handlers['food.user.preferences'](message, member, foodSession)
    } else {
      yield sendUserDashboard(foodSession, message, member)
    }
  })
}

handlers['food.user.preferences'] = function * (message, member, foodSession) {
  // seems to be an error sometimes idk
  if (_.get(member, 'id') === undefined) {
    logging.error('error with member, just continue on')
    yield sendUserDashboard(foodSession, message, member)
  }
  // find user in db, present items, if they click update their profile and their object in the foodsession
  var user = yield db.Chatusers.findOne({'id': member.id, deleted: {$ne: true}}).exec()

  if ((_.get(user, 'food_preferences.asked') === undefined) || (_.get(user, 'food_preferences.asked') === false)) {
    user.food_preferences = {
      asked: true,
      vegetarian: false,
      vegan: false,
      pescetarian: false,
      paleo: false,
      peanut: false,
      gluten: false,
      shellfish: false,
      chicken: false
    }
    yield user.save()
  }

  var attachment1 = {
    'text': `Type or tap any dietary concerns you have`,
    'fallback': `Type or tap any dietary concerns you have`,
    'callback_id': 'food.admin.restaurant.pick.diet',
    'attachment_type': 'default',
    'actions': ['vegetarian', 'pescetarian', 'paleo', 'vegan'].map((food) => {
      var checkbox = (_.get(user, `food_preferences.${food}`) === true) ? '✓' : '☐'
      return {
        'name': 'food.user.preferences.toggle',
        'value': food,
        'text': `${checkbox} ${food}`,
        'type': 'button'
      }
    })
  }

  var attachment2 = {
    'text': ``,
    'fallback': `Type or tap any dietary concerns you have`,
    'callback_id': 'food.admin.restaurant.pick.allergy',
    'attachment_type': 'default',
    'actions': ['peanut', 'gluten', 'shellfish', 'chicken'].map((food) => {
      var checkbox = (_.get(user, `food_preferences.${food}`) === true) ? '✓' : '☐'
      return {
        'name': 'food.user.preferences.toggle',
        'value': food,
        'text': `${checkbox} ${food}`,
        'type': 'button'
      }
    })
  }

  var attachment3 = {
    'text': '',
    'fallback': 'Done with food preferences',
    'callback_id': 'food.user.preferences',
    'attachment_type': 'default',
    'actions': [{
      'name': 'food.user.preferences.done',
      'value': 'food.user.preferences.done',
      'text': 'Done',
      'type': 'button'
    }]
  }

  var userPreferences = _.merge(message, {
    'mode': 'food',
    'action': 'user.preferences',
    'thread_id': user.dm,
    'origin': message.origin,
    'source': {
      'type': 'message',
      'channel': user.dm,
      'user': user.id,
      'team': user.team_id
    },
    'data': {
      'text': 'Hey do you have any',
      'fallback': 'Food allergies or preferences?',
      'callback_id': 'food.user.preferences',
      'color': 'grey',
      'attachment_type': 'default',
      'attachments': [attachment1, attachment2, attachment3]
    }
  })

  yield $replyChannel.sendReplace(userPreferences, 'food.user.preferences', {type: 'slack', data: userPreferences.data})
}

handlers['food.user.preferences.toggle'] = function * (message) {
  // update the chatuser item
  var user = yield db.Chatusers.findOne({'id': message.source.user})
  var foodPreferenceToggle = message.data.value
  logging.debug('toggling ', foodPreferenceToggle)
  user.food_preferences[foodPreferenceToggle] = !user.food_preferences[foodPreferenceToggle]
  yield user.save()
  yield handlers['food.user.preferences'](message, user)
}

handlers['food.user.preferences.done'] = function * (message) {
  // get users document and update the delivery object
  var user = yield db.Chatusers.findOne({'id': message.source.user}).exec()
  yield db.Delivery.update({
    'team_id': message.source.team,
    'team_members.id': message.source.user,
    'active': true
  }, {
    $set: {'team_members.$': user}
  }).exec()

  var foodSession = yield db.Delivery.findOne({'team_id': message.source.team, active: true}).exec()
  var member = _.find(foodSession.team_members, {'id': message.source.user})
  yield sendUserDashboard(foodSession, message, member)
}

/**
* User just clicked "thai" or something -- submitting the user's vote
* @param message
*/
handlers['food.vote.submit'] = function * (message) {
  // debugger;
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()
  var user = yield db.chatusers.findOne({id: message.source.user})

  function addVote (str) {
    var vote = {
      user: message.source.user,
      vote: str,
      weight: user.vote_weight
    }

    foodSession.votes.push(vote)

    foodSession.markModified('votes')
    return foodSession.save()
  }

  // user is typing food or another category but fuck voter fraud
  if (_.includes(_.map(foodSession.votes, 'user'), message.source.user)) {
    if (message.text === 'food') {
      var exitEarlyMessage = {
        'text': 'You typed food, but we are choosing a cuisine so thats ambiguous.  Would you like to restart or just continue',
        'fallback': 'Any preferences?',
        'callback_id': 'confirm.confirm.exit',
        'attachment_type': 'default',
        'attachments': [{
          'text': '',
          'fallback': 'Want to exit the kip Cafe?',
          'callback_id': 'food.admin.restaurant.pick',
          'attachment_type': 'default',
          'actions': [{
            'name': 'passthrough',
            'value': 'food.begin',
            'text': 'Restart Order',
            'style': 'danger',
            'type': 'button'
          }, {
            'name': 'passthrough',
            'value': 'food.null.continue',
            'text': '× Cancel',
            'type': 'button'
          }]
        }]
      }
      return yield $replyChannel.send(message, 'food.begin', {
        type: message.origin,
        data: exitEarlyMessage
      })
    } else {
      return yield $replyChannel.send(message, 'food.admin.restaurant.pick', {
        type: message.origin,
        data: { text: 'Waiting for others to submit their votes. Hang on a sec :smile:' }
      })
    }
  }

  if (message.allow_text_matching) {
    // user typed something
    logging.info('using text matching for cuisine choice')

    var res = cuisineClassifier(message.text, foodSession.cuisines)
    if (res !== null) {
      yield addVote(res)
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

  // update all the user's dashbaords
  yield foodSession.team_members.map(function (member) {
    return sendUserDashboard(foodSession, message, member)
  })

  var isAdmin = message.source.user === foodSession.convo_initiater.id
  var adminIsOut = isAdmin || foodSession.team_members.filter(u => u.id === foodSession.convo_initiater.id).length === 0

  // if this is the last vote, then send the choices to the admin
  var numOfResponsesWaitingFor = foodSession.team_members.length - _.uniq(foodSession.votes.map(v => v.user)).length
  var votes = foodSession.votes
  kip.debug('numOfResponsesWaitingFor: ', numOfResponsesWaitingFor, ' votes: ', votes)

  if (numOfResponsesWaitingFor <= 0) {
    logging.info('have all the votes')

    // cancel any pending
    agenda.cancel({
      name: 'mock user message',
      'data.user': message.user_id
    }, function (e, numRemoved) {
      if (e) logging.error(e)
    })

    yield handlers['food.admin.restaurant.pick.list'](message, foodSession)
  } else {
    logging.info('waiting for more responses have, votes: ', votes.length, 'need ', numOfResponsesWaitingFor, ' more votes')
    if (adminIsOut) {
      sendUserDashboard(foodSession, message, foodSession.convo_initiater)
    }
  }
}

//
// No Food For Me
//
handlers['food.vote.abstain'] = function * (message) {
  // TODO add metric for "No food for me" click

  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()

  // some states
  var isAdmin = message.source.user === foodSession.convo_initiater.id
  var adminIsOut = isAdmin || foodSession.team_members.filter(u => u.id === foodSession.convo_initiater.id).length === 0

  // if user is not the admin, take them to shopping mode
  if (!isAdmin) {
    // This route takes them to the home menu and also removes them from the current foodSession
    yield $allHandlers['food.exit.confirm'](message)
  }

  // re-send all the dashbaords to all the remaining team members
  foodSession.team_members = foodSession.team_members.filter(user => user.id !== message.source.user)
  yield foodSession.team_members.map(function * (user) {
    yield sendUserDashboard(foodSession, message, user)
  })

  // oops well the above didn't send the admin the dashboard if they were the one that clicked "No Food"
  if (isAdmin) {
    // the 'food.exit.confirm' handler used above removes normal users from the order, here we have to
    // manually remove the admin from foodSession.team_members
    foodSession.markModified('team_members')
    yield foodSession.save()
    yield sendUserDashboard(foodSession, message, foodSession.convo_initiater)
  }

  // omg another case: when the admin has already clicked "No Food" and then another user clicks "No Food"
  if (!isAdmin && adminIsOut) {
    yield sendUserDashboard(foodSession, message, foodSession.convo_initiater)
  }
}

/**
* Builds the initial voting dashboard
* @param foodSession
* @returns dashboard
*/
function buildCuisineDashboard (foodSession) {
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

  if (slackers.length > 5) {
    slackers = slackers.length + ' users'
  } else {
    slackers = slackers.join(', ')
  }

  var admin = foodSession.convo_initiater

  var dashboard = {
    text: `<@${admin.id}|${admin.name}> is collecting food suggestions, vote now!`,
    fallback: '<@${admin.id}|${admin.name}> is collecting food suggestions, vote now!',
    callback_id: 'food.user.poll',
    color: '#3AA3E3',
    attachment_type: 'default',
    attachments: [{
      color: '#3AA3E3',
      mrkdwn_in: ['text'],
      text: `*Votes from the group* 👋\n${votes}`,
      fallback: `*Votes from the group* 👋\n${votes}`,
      callback_id: 'admin_restaurant_pick'
    }]
  }

  if (slackers.length > 0) {
    dashboard.attachments.push({
      color: '#49d63a',
      mrkdwn_in: ['text'],
      text: `*Waiting for votes from:* \n${slackers}`
    })
  } else {
    dashboard.attachments.push({
      color: '#49d63a',
      mrkdwn_in: ['text'],
      text: '*Team has finished voting* Drumroll, please'
    })
  }

  return dashboard
}

/**
* Sends new or updates the admin's cuisine vote dashboard
* @param foodSession
* @param message
* @param user {object} The user the dashboard is being sent to
*/
function * sendAdminDashboard (foodSession, message, user) {
  logging.debug('sending admin dashboard')
  var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id})

  // wait a little and refresh the foodSession to make sure we're using the most recent votes
  // but don't wait if the user is the admin because we want their own clicks to be responsive
  if (message.source.user !== foodSession.convo_initiater.id) {
    yield sleep(2000)
    foodSession = yield db.Delivery.findById(foodSession._id).exec()
  }

  var basicDashboard = buildCuisineDashboard(foodSession)

  if (process.env.NODE_ENV.includes('development')) {
    basicDashboard.attachments.unshift({
      text: `Your vote-weight is ${user.vote_weight.toFixed(2)}`,
      fallback: 'vote-weight'
    })
  }

  // add the special button to end early
  basicDashboard.attachments[0].actions = [{
    name: 'food.admin.restaurant.pick.list',
    text: 'Finish Voting Early',
    style: 'default',
    type: 'button',
    value: 'food.admin.restaurant.pick.list'
  }]

  // add the buttons if they didn't respond already
  var adminHasVoted = foodSession.votes.map(v => v.user).includes(foodSession.convo_initiater.id)
  var adminInOrder = foodSession.team_members.map(u => u.id).includes(foodSession.convo_initiater.id)
  if (!adminHasVoted && adminInOrder) {
    var prevMessage = yield db.Message.find({
      'source.user': user.id
    }).sort('-ts').limit(1).exec()
    prevMessage = prevMessage[0]
    var sampleArray = _.get(prevMessage, ['reply', 'data', 'attachments', '2', 'actions'], sampleCuisines(foodSession, slackbot))

    // make sure the message that we are stripping the buttons from is actually a dashboard message
    if (sampleArray.length !== 5 || !sampleArray[4].text.includes('No Food for Me')) {
      sampleArray = sampleCuisines(foodSession, slackbot)
    }

    basicDashboard.attachments.push({
      'text': 'Tap a button to choose a cuisine',
      'fallback': 'Tap a button to choose a cuisine',
      'callback_id': 'food.user.poll',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': sampleArray
    })

    basicDashboard.attachments.push({
      'fallback': 'Search for a restaurant',
      'text': '✎ Or type what you want below (Example: _japanese_)',
      'mrkdwn_in': ['text']
    })
  } else if (!adminInOrder) {
    basicDashboard.text = 'Waiting for teammates to submit votes'
  } else {
    basicDashboard.text = 'Thanks for your vote!'
  }

  var existingDashbaord = foodSession.cuisine_dashboards.filter(d => d.user === foodSession.convo_initiater.id)[0]
  if (existingDashbaord) {
    return co(function * () {
      var dashboardMessage = yield db.Messages.findById(existingDashbaord.message)
      return yield $replyChannel.sendReplace(dashboardMessage, 'food.vote.submit', {type: 'slack', data: basicDashboard})
    }).catch(logging.error)
  } else {
    return co(function * () {
      var dashboardMessage = yield $replyChannel.sendReplace(message, 'food.vote.submit', {type: 'slack', data: basicDashboard})
      foodSession.update({$push: { cuisine_dashboards: {
        user: message.source.user,
        message: dashboardMessage._id
      }}}).exec()
    }).catch(logging.error)
  }
}

/**
* Sends new or updates any user's cuisine vote dashboard
* @param foodSession
* @param message
* @param user {object} The user the dashboard is being sent to
*/
function * sendUserDashboard (foodSession, message, user) {
  console.log('sendUserDash called')
  var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id})
  console.log('found slackbot')
  var user = yield db.chatusers.findOne({id: user.id})
  console.log('send user dashboard to', user.id, 'initiated by', foodSession.convo_initiater.id)
  if (user.id === foodSession.convo_initiater.id) {
    return yield sendAdminDashboard(foodSession, message, user)
  }
  var userHasVoted = foodSession.votes.map(v => v.user).includes(user.id)
  var basicDashboard = buildCuisineDashboard(foodSession)

  if (process.env.NODE_ENV.includes('development')) {
    basicDashboard.attachments.unshift({
      text: `Your vote-weight is ${user.vote_weight.toFixed(2)}`,
      fallback: 'vote-weight'
    })
  }

  if (!userHasVoted) {
    var prevMessage = yield db.Message.find({'source.user': user.id}).sort('-ts').limit(1).exec()
    prevMessage = prevMessage[0]
    var sampleArray = _.get(prevMessage, ['reply', 'data', 'attachments', '2', 'actions'], sampleCuisines(foodSession, slackbot))

    // make sure the message that we are stripping the buttons from is actually a dashboard message
    if (sampleArray.length !== 5 || !sampleArray[4].text.includes('No Food for Me')) {
      sampleArray = sampleCuisines(foodSession, slackbot)
    }

    basicDashboard.attachments.push({
      'text': 'Tap a button to choose a cuisine',
      'fallback': 'Tap a button to choose a cuisine',
      'callback_id': 'food.user.poll',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': sampleArray
    })

    basicDashboard.attachments.push({
      'fallback': 'Search for a restaurant',
      'text': '✎ Or type what you want below (Example: _japanese_)',
      'mrkdwn_in': ['text']
      // 'actions': [{
      //   'name': 'food.user.preferences',
      //   'text': 'Edit my food preferences',
      //   'style': 'default',
      //   'type': 'button',
      //   'value': 'food.user.preferences'
      // }]
    })
  } else {
    basicDashboard.text = 'Thanks for your vote!'
  }

  var existingDashbaord = foodSession.cuisine_dashboards.filter(d => d.user === user.id)[0]
  if (existingDashbaord) {
    logging.debug('found existing dashboard, will attempt to replace it')
    return co(function * () {
      var dashboardMessage = yield db.Messages.findById(existingDashbaord.message)
      logging.debug(dashboardMessage.slack_ts)
      return yield $replyChannel.sendReplace(dashboardMessage, 'food.vote.submit', {type: 'slack', data: basicDashboard})
    }).catch(logging.error)
  } else {
    return co(function * () {
      var source = {
        'type': 'message',
        'channel': user.dm,
        'user': user.id,
        'team': user.team_id
      }

      var userMessage = {
        'incoming': false,
        'mode': 'food',
        'action': 'food.vote.submit',
        'thread_id': user.dm,
        'origin': message.origin,
        'source': source
      }
      var dashboardMessage = yield $replyChannel.sendReplace(userMessage, 'food.vote.submit', {type: 'slack', data: basicDashboard})
      foodSession.update({$push: { cuisine_dashboards: {
        user: user.id,
        message: dashboardMessage._id
      }}}).exec()
    }).catch(logging.error)
  }
}

/*
* Confirm all users have voted for a cuisine
*/
handlers['food.admin.dashboard.cuisine'] = function * (message, foodSession) {
  if (foodSession === undefined) {
    logging.info('foodSession wasnt passed into food.admin.dashboard.cuisine')
    foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  }

  db.waypoints.log(1130, foodSession._id, message.user_id, {original_text: message.original_text})

  var userHasVoted = foodSession.votes.map(v => v.user).includes(message.source.user)
  if (message.allow_text_matching && !userHasVoted) {
    return yield handlers['food.admin.restaurant.pick'](message)
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
    yield foodSession.team_members.map(function * (m) {
      if (foodSession.votes.map(v => v.user).includes(m.id)) {
        var admin = foodSession.convo_initiater
        var user = message.source.user
        var channel = message.source.channel
        var msg = {
          mode: 'food',
          action: 'admin.restaurant.pick',
          thread_id: m.dm,
          origin: message.origin,
          source: {
            team: foodSession.team_id,
            user: convo_initiater.id,
            channel: m.dm
          }
        }
         // if the admin has not yet voted, make sure to set the mode.action to the votable route
        if (foodSession.votes.map(u => u.user).includes(foodSession.convo_initiater.id)) {
          var route = 'food.admin.dashboard.cuisine'
        } else {
          route = 'food.admin.restaurant.pick'
        }

        var sentMessage = yield $replyChannel.send(msg, route, {'type': msg.origin, 'data': dashboard})

        logging.debug('~~~~sentMessage in food.admin.dashboard.cuisine', sentMessage)
        if (msg.source.user === admin.id) {
          foodSession.tracking.confirmed_votes_msg = sentMessage._id
          foodSession.save()
        }
      }
    })
  }
}

/**
* Displays list of restaurants for the admin to choose from
* @param message
* @param foodSession
*/
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

  if (foodSession.votes.length && sort === SORT.cuisine) {
    var countWinner = score_utils.voteWinner(foodSession.votes) //the cuisine that would have won without vote-weighting
    var realWinner = viableRestaurants[0].summary.cuisines[0] //the cuisine that did win with vote-weighting
    console.log('countWinner, realWinner, firstRestoCuisines', countWinner, realWinner, viableRestaurants[0].summary.cuisines)
    if (countWinner && (countWinner != realWinner || viableRestaurants[0].summary.cuisines.indexOf(countWinner) > -1)) {
      //kip chose the cuisine it would have chosen by simply counting votes, so no explanation is necessary
      var explanationText = `${viableRestaurants[0].summary.cuisines[0]}`
    }
    else {
      var votes = foodSession.votes.filter(v => v.vote == realWinner) //votes for the winning cuisine
      console.log('these should all be votes for the winning cuisine', votes)
      var vote = votes.reduce(function (acc, val) {
        return (acc.weight > val.weight ? acc : val)
      }, {weight: -100}) //user who voted for the winning cuisine the hardest / whose vote for the winning cuisine is prioritized the most
      console.log('winning vote', vote)
      // explanation text explaining the choice when it is different / not obvious from the simple voting result
      var explanationText = `<@${vote.user}> hasn't had much of a say lately, so we went with ${vote.vote} 🎉`
      //send explanation message to the non-admin users
    }

    yield foodSession.team_members.map(function * (user) {
      if (user.id != foodSession.convo_initiater.id) {
        console.log('sending victory message to', user.name)
        yield $replyChannel.send({
          mode: 'food',
          origin: message.origin,
          channel: user.dm,
          thread_id: user.dm,
          user_id: user.id,
          source: {
            team: foodSession.team_id,
            channel: user.dm,
            user: user.id,
            origin: 'slack',
            callback_id: 'callback'
          }
        }, 'food.admin.restaurant.pick.list', {
            type: 'slack',
            data: {
              text: '*Vote Result:*',
              attachments: [{
                color: '#3AA3E3',
                fallback: "votes submitted",
                text: explanationText
              }]
            }
        })
      }
    })
  }

  var responseForAdmin = {
    'text': '*Vote Result:* ' + explanationText + '\n Here are 3 restaurant suggestions based on the team vote.'+ '\n Which restaurant do you want today?',
    'attachments': yield viableRestaurants.slice(index, index + 3).reverse().map(utils.buildRestaurantAttachment)
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

  // var arrow = direction === SORT.descending ? '▾ ' : '▴ '

  // // default price sort direction is ascending
  // var sortPriceButton = {
  //   'name': 'food.admin.restaurant.pick.list',
  //   'text': (sort === SORT.price ? arrow : '') + 'Sort Price',
  //   'type': 'button',
  //   'value': {
  //     index: 0,
  //     sort: (sort === SORT.price && direction === SORT.descending) ? SORT.keyword : SORT.price,
  //     keyword: keyword,
  //     direction: (sort === SORT.price && direction === SORT.ascending) ? SORT.descending : SORT.ascending
  //   }
  // }

  // // default rating sort direction is descending
  // var sortRatingButton = {
  //   'name': 'food.admin.restaurant.pick.list',
  //   'text': (sort === SORT.rating ? arrow : '') + 'Sort Rating',
  //   'type': 'button',
  //   'value': {
  //     index: 0,
  //     sort: (sort === SORT.rating && direction === SORT.ascending) ? SORT.keyword : SORT.rating,
  //     keyword: keyword,
  //     direction: (sort === SORT.rating && direction === SORT.descending) ? SORT.ascending : SORT.descending
  //   }
  // }

  // // default distance sort direction is ascending
  // var sortDistanceButton = {
  //   'name': 'food.admin.restaurant.pick.list',
  //   'text': (sort === SORT.distance ? arrow : '') + 'Sort Distance',
  //   'type': 'button',
  //   'value': {
  //     index: 0,
  //     sort: (sort === SORT.distance && direction === SORT.descending) ? SORT.keyword : SORT.distance,
  //     keyword: keyword,
  //     direction: (sort === SORT.distance && direction === SORT.ascending) ? SORT.descending : SORT.ascending
  //   }
  // }

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

  responseForAdmin.attachments.push(buttons)

  // adding writing prompt
  responseForAdmin.attachments.push({
    'fallback': 'Search for a restaurant',
    'text': '✎ Type below to search for a restaurant by name (Example: _Azuki Japanese Restaurant_)',
    'mrkdwn_in': ['text']
  })

  // admin is confirming, replace their message
  var admin = foodSession.convo_initiater

  if (message.source.user === admin.id) {
    console.log('this message comes from the admin') // true
    var msg = message
  } else if (_.find(foodSession.cuisine_dashboards, {user: admin.id})) {
    var dashboard = _.find(foodSession.cuisine_dashboards, {user: admin.id})
    msg = yield db.Messages.findById(dashboard.message)
  } else {
    msg = _.merge({}, message, {
      mode: 'food',
      action: 'admin.restaurant.pick.list',
      origin: message.origin,
      channel: admin.dm,
      thread_id: admin.dm,
      user_id: admin.id,
      source: {
        team: foodSession.team_id,
        user: admin.id,
        channel: admin.dm
      }
    })
  }

  logging.debug('sending message to admin: ', message, responseForAdmin)
  $replyChannel.send(msg, 'food.admin.restaurant.search', {'type': message.origin, 'data': responseForAdmin})
}

handlers['food.admin.restaurant.more_info'] = function * (message) {
  // var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  // var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})
  // var attachments = []
  // TODO later
}

/**
* User can search for restaurants by keywords
* @param message
*/
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

/**
* Process the admin's selection of a restaurant
*/
handlers['food.admin.restaurant.confirm'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  var merchant = _.find(foodSession.merchants, {id: String(message.data.value)})

  // update chatusers with information about which users won / lost the pollin
  var votes = foodSession.votes
  var cuisines = merchant.summary.cuisines
  yield votes.map(function * (v) {
    var weight = (cuisines.indexOf(v.vote) > -1 ? -0.05 : 0.05)
    var user = yield db.chatusers.findOne({id: v.user})
    if (user.vote_weight + weight > 0) yield db.chatusers.update({id: v.user}, {$inc: {vote_weight: weight}}) // vote value cannot go to or below zero
    else yield db.chatusers.updatae({id: v.user}, {$set: {vote_weight: 0.1}})
  })

  // stores the cuisines in the slackbot
  var sb = yield db.Slackbot.findOne({team_id: foodSession.team_id})
  if (! sb.meta.cuisine_frequency) sb.meta.cuisine_frequency = {}
  cuisines.map(function (c) {
    if (sb.meta.cuisine_frequency[c]) sb.meta.cuisine_frequency[c]++
    else sb.meta.cuisine_frequency[c] = 1
  })

  // stores the restaurant in the slackbot order history
  if (!sb.meta.order_frequency) sb.meta.order_frequency = {}
  if (sb.meta.order_frequency[merchant.id]) {
    console.log('does exist in the history')
    var oldestDate = new Date(sb.meta.order_frequency[merchant.id].dates[0])
    logging.info('oldest date:', oldestDate)
    var monthDifference = foodSession.time_started.getMonth() - oldestDate.getMonth()
    //cut the restaurant out of the history if it's been there for more than 2 months
    if (monthDifference > 2 || monthDifference < 0 && monthDifference > -10) {
      console.log('outdated history being removed')
      sb.meta.order_frequency[merchant.id].dates.shift()
      sb.meta.order_frequency[merchant.id].count--
    }
    sb.meta.order_frequency[merchant.id].count++
    sb.meta.order_frequency[merchant.id].dates.push(foodSession.time_started)
  }
  else {
    console.log('does not exist in the history')
    console.log('this is the merchant id', merchant.id)
    sb.meta.order_frequency[merchant.id] = {
      count: 1,
      dates: [foodSession.time_started]
    }
  }
  console.log('sb.meta.order_frequency', sb.meta.order_frequency)

  yield db.slackbots.update({team_id: foodSession.team_id}, {meta: sb.meta})

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
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, 'convo_initiater.id': message.source.user, active: true}).exec()
  foodSession.menu = yield api.getMenu(foodSession.chosen_restaurant.id)
  yield foodSession.save()
  yield handlers['food.admin.restaurant.collect_orders'](message, foodSession)
}

handlers['food.admin.restaurant.collect_orders'] = function * (message, foodSession) {
  foodSession = typeof foodSession !== 'undefined' ? foodSession : yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // If the admin isn't part of the order, send them a message confirming that their click went through
  var adminAbstained = foodSession.team_members.filter(u => u.id === foodSession.convo_initiater.id).length === 0
  if (adminAbstained) {
    var confirmation = {
      attachments: [{
        mrkdwn_in: ['text'],
        fallback: 'Collecting order from the rest of the team!',
        'color': '#3AA3E3',
        text: `Thank you for selecting a restaurant. \n Now I'm collecting orders from the rest of the team from ${foodSession.chosen_restaurant.name}, and I'll get back to you once they've chosen their food!`
      }],
      text: ''
    }
    $replyChannel.sendReplace(message, '', {type: 'slack', data: confirmation})
  }

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
            'text': '✓ Yes',
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

  var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id}).exec()

  var options = {
    uri: 'https://slack.com/api/team.info',
    json: true,
    qs: {
      token: slackbot.bot.bot_access_token
    }
  }

  var teamInfo = yield rp(options)
  var slacklink = 'https://' + teamInfo.team.domain + '.slack.com'

  for (var i = 0; i < foodSession.email_users.length; i++) {
    var m = foodSession.email_users[i]
    // var user = yield db.email_users.findOne({email: m, team_id: foodSession.team_id});
    var html = yield email_utils.quickpickHTML(foodSession, slackbot, slacklink, m)

    var mailOptions = {
      to: `<${m}>`,
      from: `Kip Café <hello@kipthis.com>`,
      subject: `${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name} is collecting orders for ${slackbot.team_name}!`,
      html: html
    }

    logging.info('mailOptions', mailOptions)
    mailerTransport.sendMail(mailOptions, function (err) {
      if (err) console.log(err)
    })
    logging.info('email sent')
  }

  foodSession.team_members.map(m => {
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
