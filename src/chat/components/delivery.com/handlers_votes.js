'use strict'
var _ = require('lodash')
var co = require('co')
var sleep = require('co-sleep')
var googl = require('goo.gl')
var rp = require('request-promise')

var api = require('./api-wrapper.js')
var utils = require('./utils')
var cuisineClassifier = require('./cuisine_classifier.js')
var mailer_transport = require('../../../mail/IF_mail.js')
var yelp = require('./yelp')
var menu_utils = require('./menu_utils')
var email_utils = require('./email_utils')

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


const triggerPreferences = false
/*
* S5
* creates message to send to each user with random assortment of suggestions, will probably want to create a better schema
*
*/
function sampleCuisines (foodSession) {
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
  // Set a default sort order
  sortOrder = sortOrder || SORT.cuisine

  logging.info('foodSession.votes', foodSession._id)

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


  // filter out restaurants that don't match the keyword if provided
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

  //keep track of the highest yelp review score in this particular batch of restaurants
  var maxStars = 0;

  merchants = merchants
    .map(m => {
      m.score = scoreAlgorithms[sortOrder](m)
      if (sortOrder == SORT.cuisine) {

        //score based on yelp reviews
        m.stars = m.yelp_info.rating.review_count * m.yelp_info.rating.rating;

        if (m.stars > maxStars) maxStars = m.stars
      }
      return m;
    })

  //if we are sorting by cuisine type and want to incorporate yelp reviews into the order
  if (sortOrder == SORT.cuisine) {
    merchants = merchants
      .map(m => {

        //normalize yelp score to be in [0, 1]
        m.stars = m.stars / maxStars;

        //restaurant score equal to the yelp score (which is always <= 1) added to the (integer) number of votes for its cuisine-type(s)
        m.score = m.score + m.stars;

        return m;
      })
  }

  merchants.sort((a, b) => directionMultiplier * (a.score - b.score));

  // filter out restaurants whose delivery minimum is significantly above the team's total budget
  if (foodSession.budget) {
    var max = 1.25 * foodSession.team_members.length * foodSession.budget;
    var cheap_merchants = merchants.filter(m => m.ordering.minimum <= max);
    if (cheap_merchants.length <= 0) {
      return merchants
    }
    else return cheap_merchants
  }

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
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  var admin = foodSession.team_members[0]

  yield db.Delivery.update({team_id: message.source.team, active: true}, {$set: {votes: [{user: admin.id, vote: message.data.value}]}})

  yield handlers['food.admin.restaurant.pick.list'](message)
}

//for when the admin "skip"s the poll
handlers['food.admin.poll'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  db.waypoints.log(1121, foodSession._id, message.user_id, {original_text: message.original_text})
  sendAdminDashboard(foodSession)
}

// poll for cuisines
handlers['food.user.poll'] = function * (message) {
  logging.debug('in food.user.poll')
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  db.waypoints.log(1120, foodSession._id, message.user_id, {original_text: message.original_text})

  var teamMembers = foodSession.team_members
  console.log('found', teamMembers.length, 'team members')

  if (teamMembers.length === 0) {
    $replyChannel.sendReplace(message, 'food.admin.select_address', {
      type: message.origin,
      data: {text: 'Oops I had a brain freeze, please try again'}
    })
    return yield $allHandlers['food.admin.select_address'](message)
  }

  yield teamMembers.map(function * (member) {
    logging.debug('checkign if we should do food_preferences')
    if (triggerPreferences && (_.get(member, 'food_preferences.asked') !== true)) {
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

//
// User just clicked "thai" or something
//
handlers['food.vote.submit'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  function addVote (str) {
    var vote = {
      user: message.source.user,
      vote: str
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

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

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
  foodSession.team_members.map(user => {
    sendUserDashboard(foodSession, message, user)
  })

  // oops well the above didn't send the admin the dashboard if they were the one that clicked "No Food"
  if (isAdmin) {
    // the 'food.exit.confirm' handler used above removes normal users from the order, here we have to
    // manually remove the admin from foodSession.team_members
    foodSession.markModified('team_members')
    yield foodSession.save()
    sendUserDashboard(foodSession, message, foodSession.convo_initiater)
  }

  // omg another case: when the admin has already clicked "No Food" and then another user clicks "No Food"
  if (!isAdmin && adminIsOut) {
    sendUserDashboard(foodSession, message, foodSession.convo_initiater)
  }

}

function buildCuisineDashboard(foodSession) {
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
      callback_id: 'admin_restaurant_pick',
    }]
  }

  if (slackers.length > 0 ) {
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

//
// Sends new or updates the admin's cuisine vote dashboard
//
function * sendAdminDashboard(foodSession, message, user) {
  logging.debug('sending admin dashboard')

  // wait a little and refresh the foodSession to make sure we're using the most recent votes
  // but don't wait if the user is the admin because we want their own clicks to be responsive
  if (message.source.user !== foodSession.convo_initiater.id) {
    yield sleep(2000)
    foodSession = yield db.Delivery.findById(foodSession._id).exec()
  }

  var basicDashboard = buildCuisineDashboard(foodSession)

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
    prevMessage = prevMessage[0];
    var sampleArray = _.get(prevMessage, ['reply', 'data', 'attachments', '2', 'actions'], sampleCuisines(foodSession))

    // make sure the message that we are stripping the buttons from is actually a dashboard message
    if (sampleArray.length !== 5 || !sampleArray[4].text.includes('No Food for Me')) {
      sampleArray = sampleCuisines(foodSession)
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

//
// Sends new or updates the user's cuisine vote dashbaord
//
function * sendUserDashboard(foodSession, message, user) {
  console.log('send user dashboard to', user.id, 'initiated by', foodSession.convo_initiater.id)
  if (user.id === foodSession.convo_initiater.id) {
    return yield sendAdminDashboard(foodSession, message, user)
  }
  var userHasVoted = foodSession.votes.map(v => v.user).includes(user.id)
  var basicDashboard = buildCuisineDashboard(foodSession)
  if (!userHasVoted) {
    var prevMessage = yield db.Message.find({'source.user': user.id}).sort('-ts').limit(1).exec()
    prevMessage = prevMessage[0];
    var sampleArray = _.get(prevMessage, ['reply', 'data', 'attachments', '2', 'actions'], sampleCuisines(foodSession))

    // make sure the message that we are stripping the buttons from is actually a dashboard message
    if (sampleArray.length !== 5 || !sampleArray[4].text.includes('No Food for Me')) {
      sampleArray = sampleCuisines(foodSession)
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
            user: m.id,
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

handlers['food.admin.restaurant.pick.list'] = function * (message, foodSession) {
  console.log('picklistmessage', message);
  console.log('SORT.cuisine', SORT.cuisine)
  var index = _.get(message, 'data.value.index', 0)
  var sort = _.get(message, 'data.value.sort', SORT.cuisine)
  console.log(sort);
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

  var arrow = direction === SORT.descending ? '▾ ' : '▴ '

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

  //buttons.actions = buttons.actions.concat([sortPriceButton, sortRatingButton, sortDistanceButton])

  responseForAdmin.attachments.push(buttons)

  //adding writing prompt
  responseForAdmin.attachments.push({
    'fallback': 'Search for a restaurant',
    'text': '✎ Type below to search for a restaurant by name (Example: _Azuki Japanese Restaurant_)',
    'mrkdwn_in': ['text']
  })

  // admin is confirming, replace their message
  var admin = foodSession.convo_initiater

  if (message.source.user === admin.id) {
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
  $replyChannel.sendReplace(msg, 'food.admin.restaurant.search', {'type': message.origin, 'data': responseForAdmin})
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
  console.log('admin collect orders called')
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

  var team_info = yield rp(options);
  var slacklink = 'https://' + team_info.team.domain + '.slack.com'

  for (var i = 0; i < foodSession.email_users.length; i++) {

    var m = foodSession.email_users[i];
    var user = yield db.email_users.findOne({email: m, team_id: foodSession.team_id});
    var html = yield email_utils.quickpickHTML(foodSession, slackbot, slacklink, m)

    var resto = yield db.merchants.findOne({id: foodSession.chosen_restaurant.id});

    var mailOptions = {
      to: `<${m}>`,
      from: `Kip Café <hello@kipthis.com>`,
      subject: `${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name} is collecting orders for ${slackbot.team_name}!`,
      html: '<html><body>' + '<img src="http://tidepools.co/kip/oregano/cafe.png"><br/>' +
        `<h1 style="font-size:2em;">${foodSession.chosen_restaurant.name}` + '</h1>' +
      '<p><a style="color:#47a2fc;text-decoration:none;" href="' + merch_url + '">Click to View Full Menu ' + menu_utils.cuisineEmoji(resto.data.summary.cuisines[0]) + '</a></p><table style="width:100%" border="0">'
    };

    var sortedMenu = menu_utils.sortMenu(foodSession, user, []);
    var quickpicks = sortedMenu.slice(0, 9);

    function formatItem (i, j) {
      return `<table border="0">` +
      `<tr><td style="font-weight:bold;width:70%">${quickpicks[3*i+j].name}</td>` +
      `<td style="width:30%;">$${parseFloat(quickpicks[3*i+j].price).toFixed(2)}</td></tr>` +
      `<tr><td>${quickpicks[3*i+j].description}</td></tr>` +
      `<tr><p style="color:#fa2d48">Add to Cart</p></tr>` +
      `</table>`;
    }

    for (var i = 0 ; i < 3; i++) {
      mailOptions.html += '<tr>';
      for (var j = 0; j < 3; j++) {
        var item_url = yield menu_utils.getUrl(foodSession, user.id, [quickpicks[3*i+j].id])
        mailOptions.html += `<td bgcolor="#F5F5F5"><a style="color:black;text-decoration:none;display:block;width:100%;height:100%" href="` + `${item_url}` + `">`
        mailOptions.html += formatItem(i, j) + '</a>' + '</td>';
      }
      mailOptions.html += '</tr>';
    }

    mailOptions.html += '</table><br/>' +
    `<a style="color:#47a2fc;text-decoration:none;" href="${slackLink}">Join your team on Slack!</a><br/>` +
    '<a style="color:#47a2fc;text-decoration:none;" href="https://kipthis.com/legal.html">Terms of Service</a>' +
    '</body></html>';

    logging.info('mailOptions', mailOptions);
     mailer_transport.sendMail(mailOptions, function (err) {
      if (err) console.log(err);
    });
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