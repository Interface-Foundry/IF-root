var request = require('request-promise')
var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

/*
* gets resp from slack api about channel/group
* @@NOTE FROM GRAHAM: Ideally this should be put into something slack centric
* but putting here for now since no time to abstract into slack centric portion@@
* @param {Object} slackboot object with slackbot access token stuff
* @param {Object} chosenChannel object with channel id and if its a group
* @returns {Object} resp from slack
*/
function * infoForChannelOrGroup (slackbot, chosenChannel) {
  try {
    if (!chosenChannel.is_channel) {
      // use group api
      resp = yield request({
        uri: `https://slack.com/api/groups.info?token=${slackbot.bot.bot_access_token}&channel=${chosenChannel.id}`,
        json: true
      })
      resp = resp.group
    } else {
      // try using channel api by default
      var resp = yield request({
        uri: `https://slack.com/api/channels.info?token=${slackbot.bot.bot_access_token}&channel=${chosenChannel.id}`,
        json: true
      })
      resp = resp.channel
    }
  } catch (err) {
    logging.error('channel didnt seem to fit in channel or group slack api thing', chosenChannel)
  }
  return resp
}

// start of actual handlers
handlers['food.poll.confirm_send_initial'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1102, foodSession._id, message.user_id, {original_text: message.original_text})

  var prevFoodSession = yield db.Delivery.find({team_id: message.source.team, active: false}).limit(1).sort({_id: -1}).exec()
  var addr = _.get(foodSession, 'chosen_location.address_1', 'the office')
  prevFoodSession = prevFoodSession[0]
  if (_.get(prevFoodSession, 'chosen_channel.name')) {
    // allow special cases for everyone, just me and channel specifics
    if (prevFoodSession.chosen_channel.id === 'everyone') {
      var textWithPrevChannel = `Send poll for cuisine to _everyone_ at \`${addr}\`?`
    } else if (prevFoodSession.chosen_channel.id === 'just_me') {
      textWithPrevChannel = `Send poll for cuisine to _just me_ at \`${addr}\`?`
    } else {
      textWithPrevChannel = `Send poll for cuisine to <#${prevFoodSession.chosen_channel.id}|${prevFoodSession.chosen_channel.name}> at \`${addr}\``
      if (prevFoodSession.budget) textWithPrevChannel += ` with a budget of $${prevFoodSession.budget}`
      textWithPrevChannel += '?';
    }
    if(prevFoodSession.team_members.length < 1){
      foodSession.team_members = yield db.Chatusers.find({id: message.user_id, deleted: {$ne: true}, is_bot: {$ne: true}}).exec()
    } else {
      foodSession.team_members = prevFoodSession.team_members
    }
    if (prevFoodSession.email_members) {
      foodSession.email_members = prevFoodSession.email_members;
    }
    foodSession.chosen_channel = {
      'id': prevFoodSession.chosen_channel.id,
      'name': prevFoodSession.chosen_channel.name,
      'is_channel': prevFoodSession.chosen_channel.is_channel
    }
    yield foodSession.save()
  } else {
    textWithPrevChannel = `Send poll for cuisine to team members at \`${addr}\`?`
  }
  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': textWithPrevChannel,
        'fallback': 'Send poll for cuisine to the team members',
        'callback_id': 'food.poll.confirm_send_initial',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Send Poll',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          },
          // {
          //   'name': 'food.admin.team_budget',
          //   'type': 'button',
          //   'text': 'Set a Budget',
          //   'value': 'food.admin.team_budget'
          // },
          {
            'name': 'passthrough',
            'value': 'food.admin.team.members',
            'text': 'Edit Poll Members',
            'type': 'button'
          },
          // {
          //   'name': 'food.admin.display_channels',
          //   'text': 'Use a #channel',
          //   'type': 'button',
          //   'value': 'select_team_members'
          // },
          // {
          //   'name': 'passthrough',
          //   'text': '< Back',
          //   'type': 'button',
          //   'value': 'food.admin.select_address'
          {
            'name': 'passthrough',
            'value': 'food.admin.restaurant.pick.list',
            'text': '> Skip',
            'type': 'button'
          }
        ]
      }, {
        'mrkdwn_in': [
          'text'
        ],
        'text': '_Tip:_ `✓ Send Poll` polls your team on what type of food they want',
        'fallback': 'Send poll for cuisine to the team members',
        'callback_id': 'food.poll.confirm_send_initial',
        'attachment_type': 'default',
        'actions': []
      }
    ]
  }

  if(foodSession.onboarding){
    msg_json.attachments.unshift(
    // {
    //   'text': '',
    //   'fallback': 'Team voting',
    //   'color': '#A368F0',
    //   'image_url': 'http://tidepools.co/kip/onboarding_2.png'
    // },
    {
      'text':'*Step 5.* Choose who you want to be part of your food order',
      'color':'#A368F0',
      'mrkdwn_in': ['text']
    })
  }

  $replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}

handlers['food.poll.confirm_send'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1102, foodSession._id, message.user_id, {original_text: message.original_text})

  var addr = _.get(foodSession, 'chosen_location.address_1', 'the office')
  var budget = foodSession.budget;

  if (_.get(foodSession, 'chosen_channel.id')) {
    var textWithChannelMaybe = `Send poll for cuisine to <#${foodSession.chosen_channel.id}|${foodSession.chosen_channel.name}> at \`${addr}\``
  } else {
    textWithChannelMaybe = `Send poll for cuisine to the team members at \`${addr}\``
  }

  if (foodSession.budget) {
    textWithChannelMaybe += `, with a budget of $${foodSession.budget} per person`;
  }
  textWithChannelMaybe += '?';

  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': textWithChannelMaybe,
        'fallback': 'Send poll for cuisine to the team members',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Send Poll',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          },
          {
            'name': 'passthrough',
            'value': 'food.admin.team.members',
            'text': 'View Team Members',
            'type': 'button'
          },
          // {
          //   'name': 'food.admin.team_budget',
          //   'type': 'button',
          //   'text': 'Set a Budget',
          //   'value': 'food.admin.team_budget'
          // },
          {
            'name': 'food.admin.display_channels',
            'text': 'Use a #channel',
            'type': 'button',
            'value': 'select_team_members'
          },
          {
            'name': 'passthrough',
            'text': '< Back',
            'type': 'button',
            'value': 'food.admin.select_address'
          }
        ]
      }
    ]
  }

  $replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}


handlers['food.admin.display_channels_reorder'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var mostRecentMerchant = message.data.value
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  db.waypoints.log(1111, foodSession._id, message.user_id, {original_text: message.original_text})

  var checkbox
  // basic buttons
  var genericButtons = [{
    name: `Everyone`,
    id: `everyone`
  }, {
    name: `Just Me`,
    id: `just_me`
  }].map((channel) => {
    checkbox = (channel.id === _.get(foodSession, 'chosen_channel.id')) ? '◉' : '○'
    return {
      'text': `${checkbox} ${channel.name}`,
      'value': channel.id,
      'name': `food.admin.toggle_channel_reorder`,
      'type': `button`
    }
  })

  var channelButtons = slackbot.meta.all_channels.map((channel) => {
    checkbox = (channel.id === _.get(foodSession, 'chosen_channel.id')) ? '◉' : '○'
    return {
      'text': `${checkbox} #${channel.name}`,
      'value': channel.id,
      'name': `food.admin.toggle_channel_reorder`,
      'type': `button`
    }
  })

  var groupedButtons = _.chunk(genericButtons.concat(channelButtons), 5)
  var msg_json = {
    title: `Which team members are you ordering food for?`,
    attachments: groupedButtons.map((buttonGroup) => {
      return {
        'text': '',
        'fallback': 'Which team members are you ordering food for?',
        'callback_id': 'channel_select',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': buttonGroup,
        'mrkdwn_in':['text']
      }
    })
  }

  msg_json.attachments[0].text = `Messages from Kip will be sent in Direct Messages to each of the users in the selected channel:`

  // final attachment with send, edit members, < back
  msg_json.attachments.push({
    'text': ``,
    'fallback': '✓ Send to Members',
    'color':'#2ab27b',
    'callback_id': 'channel_select',
    'attachment_type': 'default',
    'actions': [{
      'name': 'passthrough',
      'text': '✓ Collect Orders',
      'style': 'primary',
      'type': 'button',
      'value': 'food.admin.restaurant.confirm_reordering_of_previous_restaurant'
    }, {
      'name': 'food.admin.team.members.reorder',
      'value': mostRecentMerchant,
      'text': `Edit Members`,
      'type': 'button'
    }, {
      'text': `< Back`,
      'name': 'food.admin.restaurant.reordering_confirmation',
      'value': message.data.value,
      'type': 'button'
    }]
  })

  $replyChannel.sendReplace(message, 'food.admin.select_channel_reorder', {type: message.origin, data: msg_json})
}


// allow specific channel to be used
handlers['food.admin.display_channels'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  var checkbox
  // basic buttons
  var genericButtons = [{
    name: `Everyone`,
    id: `everyone`
  }, {
    name: `Just Me`,
    id: `just_me`
  }].map((channel) => {
    checkbox = (channel.id === _.get(foodSession, 'chosen_channel.id')) ? '◉' : '○'
    return {
      'text': `${checkbox} ${channel.name}`,
      'value': channel.id,
      'name': `food.admin.toggle_channel`,
      'type': `button`
    }
  })

  var channelButtons = slackbot.meta.all_channels.map((channel) => {
    checkbox = (channel.id === _.get(foodSession, 'chosen_channel.id')) ? '◉' : '○'
    return {
      'text': `${checkbox} #${channel.name}`,
      'value': channel.id,
      'name': `food.admin.toggle_channel`,
      'type': `button`
    }
  })

  var groupedButtons = _.chunk(genericButtons.concat(channelButtons), 5)
  var msg_json = {
    title: `Which team members are you ordering food for?`,
    attachments: groupedButtons.map((buttonGroup) => {
      return {
        'text': '',
        'fallback': 'Which team members are you ordering food for?',
        'callback_id': 'channel_select',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': buttonGroup,
        'mrkdwn_in':['text']
      }
    })
  }

  msg_json.attachments[0].text = `Messages from Kip will be sent in Direct Messages to each of the users in the selected channel:`

  // final attachment with send, edit members, < back
  msg_json.attachments.push({
    'text': ``,
    'fallback': '✓ Send to Members',
    'color':'#2ab27b',
    'callback_id': 'channel_select',
    'attachment_type': 'default',
    'actions': [{
      'text': `✓ Send to Members`,
      'name': 'passthrough',
      'value': 'food.user.poll',
      'type': 'button',
      'style': 'primary'
    }, {
      'name': 'passthrough',
      'value': 'food.admin.team.members',
      'text': `Edit Members`,
      'type': 'button'
    }, {
      'text': `< Back`,
      'name': 'food.poll.confirm_send',
      'value': 'food.poll.confirm_send',
      'type': 'button'
    }]
  })

  $replyChannel.sendReplace(message, 'food.admin.select_channel', {type: message.origin, data: msg_json})
}

handlers['food.admin.toggle_channel_reorder'] = function * (message) {
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  if (message.data.value.toLowerCase() === 'everyone') {
    foodSession.team_members = foodSession.all_members
    foodSession.chosen_channel.name = foodSession.chosen_channel.id = 'everyone'
  } else if (message.data.value.toLowerCase() === 'just_me') {
    foodSession.team_members = yield db.Chatusers.find({id: message.user_id, deleted: {$ne: true}, is_bot: {$ne: true}}).exec()
    foodSession.chosen_channel.name = foodSession.chosen_channel.id = 'just_me'
  } else {
    try {
      // find channel in meta.all_channels
      var channel = _.find(slackbot.meta.all_channels, {'id': message.data.value})
      foodSession.chosen_channel.name = channel.name
      foodSession.chosen_channel.id = channel.id
      foodSession.chosen_channel.is_channel = channel.is_channel

      var resp = yield infoForChannelOrGroup(slackbot, foodSession.chosen_channel)
      logging.debug('got resp back for select_channel members', resp)
      foodSession.team_members = foodSession.all_members.filter(user => {
        return _.includes(resp.members, user.id)
      })
    } catch (err) {
      $replyChannel.send(message, 'food.admin.select_channel_reorder', {type: message.origin, data: {text: 'hmm that didn\'t seem to work'}})
      logging.error('error getting members', err)
    }
  }
  foodSession.markModified('team_members')
  yield foodSession.save()
  yield handlers['food.admin.display_channels_reorder'](message)
}

handlers['food.admin.toggle_channel'] = function * (message) {
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  if (message.data.value.toLowerCase() === 'everyone') {
    foodSession.team_members = foodSession.all_members
    foodSession.chosen_channel.name = foodSession.chosen_channel.id = 'everyone'
  } else if (message.data.value.toLowerCase() === 'just_me') {
    foodSession.team_members = yield db.Chatusers.find({id: message.user_id, deleted: {$ne: true}, is_bot: {$ne: true}}).exec()
    foodSession.chosen_channel.name = foodSession.chosen_channel.id = 'just_me'
  } else {
    try {
      // find channel in meta.all_channels
      var channel = _.find(slackbot.meta.all_channels, {'id': message.data.value})
      foodSession.chosen_channel.name = channel.name
      foodSession.chosen_channel.id = channel.id
      foodSession.chosen_channel.is_channel = channel.is_channel

      var resp = yield infoForChannelOrGroup(slackbot, foodSession.chosen_channel)
      logging.debug('got resp back for select_channel members', resp)
      foodSession.team_members = foodSession.all_members.filter(user => {
        return _.includes(resp.members, user.id)
      })
      logging.info('filtered down members to these members: ', foodSession.team_members)
    } catch (err) {
      $replyChannel.send(message, 'food.admin.select_channel', {type: message.origin, data: {text: 'hmm that didn\'t seem to work'}})
      logging.error('error getting members', err)
    }
  }
  foodSession.markModified('team_members')
  yield foodSession.save()
  yield handlers['food.admin.display_channels'](message)
}

handlers['food.admin.select_channel'] = function * (message) {
  yield handlers['food.poll.confirm_send'](message)
}

handlers['food.admin.select_channel_reorder'] = function * (message) {
  yield handlers['food.admin.restaurant.reordering_confirmation'](message)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
