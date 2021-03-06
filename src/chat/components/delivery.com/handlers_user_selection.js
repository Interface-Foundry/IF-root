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
  var textWithPrevChannel
  db.waypoints.log(1102, foodSession._id, message.user_id, {original_text: message.original_text})

  var prevFoodSession = yield db.Delivery.find({team_id: message.source.team, active: false})
    .sort({_id: -1})
    .limit(1)
    .exec()
  prevFoodSession = prevFoodSession[0]

  var addr = _.get(foodSession, 'chosen_location.address_1', 'the office')
  if (_.get(prevFoodSession, 'chosen_channel.name')) {
    // allow special cases for everyone, just me and channel specifics

    // if no team members then start w/ admin at least
    if (prevFoodSession.team_members.length < 1) {
      foodSession.team_members = yield db.Chatusers.find({id: message.user_id, deleted: {$ne: true}, is_bot: {$ne: true}}).exec()
    }

    // setup team members/text per selection

    // setup team_members for using everyone
    if (prevFoodSession.chosen_channel.id === 'everyone') {
      textWithPrevChannel = `Start vote for cuisine for _everyone_ at \`${addr}\`?`
      foodSession.team_members = yield db.Chatusers.find({
        team_id: foodSession.team_id,
        is_bot: {$ne: true},
        deleted: {$ne: true},
        type: {$ne: 'email'}, // the email db.chatusers is outdated
        id: {$ne: 'USLACKBOT'}}).exec()

    // if its just_me
    } else if (prevFoodSession.chosen_channel.id === 'just_me') {
      textWithPrevChannel = `Start vote for cuisine for _just me_ at \`${addr}\`?`
      foodSession.team_members = yield db.Chatusers.find({id: message.user_id, deleted: {$ne: true}, is_bot: {$ne: true}}).exec()

    // if its a specific channel
    } else {
      textWithPrevChannel = `Start vote for cuisine for <#${prevFoodSession.chosen_channel.id}|${prevFoodSession.chosen_channel.name}> at \`${addr}\``
      if (prevFoodSession.budget) textWithPrevChannel += ` with a budget of $${prevFoodSession.budget}`
      textWithPrevChannel += '?'
      foodSession.team_members = prevFoodSession.team_members
      if (!prevFoodSession.team_members.find(c => c.id === foodSession.convo_initiater.id)) {
        var convoInit = yield db.Chatusers.findOne({id: message.user_id, is_bot: {$ne: true}}).exec()
        foodSession.team_members.push(convoInit)
      }
    }

    if (prevFoodSession.email_members) {
      foodSession.email_members = prevFoodSession.email_members
    }
    foodSession.chosen_channel = {
      'id': prevFoodSession.chosen_channel.id,
      'name': prevFoodSession.chosen_channel.name,
      'is_channel': prevFoodSession.chosen_channel.is_channel
    }
    yield foodSession.save()
  } else {
    textWithPrevChannel = `Start vote for cuisine for _all_ team members at \`${addr}\`?`
  }
  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': textWithPrevChannel,
        'fallback': 'Collect cuisine votes from team members?',
        'callback_id': 'food.poll.confirm_send_initial',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Start Vote',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          },
          {
            'name': 'passthrough',
            'value': 'food.admin.display_channels',
            'text': 'Manage Voters',
            'type': 'button'
          },
        ]}
      // }, {
      //   'mrkdwn_in': [
      //     'text'
      //   ],
      //   'text': '_Tip:_ `✓ Send Poll` polls your team on what type of food they want',
      //   'fallback': 'Send poll for cuisine to the team members',
      //   'callback_id': 'food.poll.confirm_send_initial',
      //   'attachment_type': 'default',
      //   'actions': []
      // }
    ]
  }

  if (process.env.NODE_ENV == 'development_hannah') {
    msg_json.attachments[0].actions.push({
      'name': 'passthrough',
      'text': 'Email Members',
      'type': 'button',
      'value': 'food.admin.team.email_members'
    })
  }

  if (!foodSession.onboarding) {
    msg_json.attachments[0].actions.push( {
      'name': 'passthrough',
      'value': 'food.admin.restaurant.pick.list',
      'text': '> Skip',
      'type': 'button'
    })
  }

  if (foodSession.onboarding) {
    msg_json.attachments.unshift(
    // {
    //   'text': '',
    //   'fallback': 'Team voting',
    //   'color': '#A368F0',
    //   'image_url': 'http://tidepools.co/kip/onboarding_2.png'
    // },
      {
        'text': `*Step 4.* Let your team vote for the cuisine they want, so everyone gets a choice`,
        'color': `#A368F0`,
        'mrkdwn_in': ['text']
      })
  }

  $replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}

handlers['food.poll.confirm_send'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1102, foodSession._id, message.user_id, {original_text: message.original_text})

  var addr = _.get(foodSession, 'chosen_location.address_1', 'the office')

  if (_.get(foodSession, 'chosen_channel.id')) {
    if (foodSession.chosen_channel.id === 'everyone') {
      var textWithChannelMaybe = `Start vote for cuisine with _everyone_ at \`${addr}\`?`
    } else if (foodSession.chosen_channel.id === 'just_me') {
      textWithChannelMaybe = `Start vote for cuisine with _just me_ at \`${addr}\`?`
    } else {
      textWithChannelMaybe = `Start vote for cuisine with <#${foodSession.chosen_channel.id}|${foodSession.chosen_channel.name}> at \`${addr}\``
      // if (foodSession.budget) textWithPrevChannel += ` with a budget of $${foodSession.budget}`
      textWithChannelMaybe += '?';
    }
  } else {
    textWithChannelMaybe = `Start vote for cuisine with the team members at \`${addr}\``
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
        'fallback': 'Start vote for cuisine with the team members',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': '✓ Start Vote',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          } //,
          // {
          //   'name': 'passthrough',
          //   'value': 'food.admin.display_channels',
          //   'text': 'Edit Poll Members',
          //   'type': 'button'
          // }
        ]
      }
    ]
  }

  if (process.env.NODE_ENV == 'development_hannah') {
    msg_json.attachments[0].actions.push({
      'name': 'passthrough',
      'text': 'Email Members',
      'type': 'button',
      'value': 'food.admin.team.email_members'
    })
  }

  msg_json.attachments[0].actions.push( {
    'name': 'passthrough',
    'value': 'food.admin.restaurant.pick.list',
    'text': '> Skip',
    'type': 'button'
  })

  $replyChannel.sendReplace(message, 'food.user.poll', {type: message.origin, data: msg_json})
}

handlers['food.admin.display_channels_reorder'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var mostRecentMerchant = message.data.value
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  db.waypoints.log(1111, foodSession._id, message.user_id, {original_text: message.original_text})

  if (!foodSession.chosen_channel.id) foodSession.chosen_channel.id = 'everyone'

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
      'text': `Manage Channels`,
      'type': 'button'
    }]
  })

  // if (process.env.NODE_ENV == 'development_hannah') {
  //   msg_json.attachments[msg_json.attachments.length-1].actions.push({
  //     'name': 'food.admin.team.email_members',
  //     'text': 'Email Members',
  //     'type': 'button',
  //     'value': {
  //       reorder: true
  //     }
  //   })
  // }

  msg_json.attachments[msg_json.attachments.length-1].actions.push({
    'text': `< Back`,
    'name': 'food.admin.restaurant.reordering_confirmation',
    'value': message.data.value,
    'type': 'button'
  })

  $replyChannel.sendReplace(message, 'food.admin.select_channel_reorder', {type: message.origin, data: msg_json})
}


// allow specific channel to be used
handlers['food.admin.display_channels'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  if (!foodSession.chosen_channel.id) foodSession.chosen_channel.id = 'everyone'

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

  msg_json.attachments.unshift({
    text: `Messages from Kip will be sent in direct messages to each of the users in the selected channel:`,
    fallback: `Messages from Kip will be sent in direct messages to each of the users in the selected channel:`,
    color: (foodSession.onboarding ? '#A368F0' : '#3AA3E3')
  })

  // msg_json.attachments[0].text = `Messages from Kip will be sent in Direct Messages to each of the users in the selected channel:`

  // final attachment with send, edit members, < back
  msg_json.attachments.push({
    'text': ``,
    'fallback': '✓ Start Vote',
    'color':'#2ab27b',
    'callback_id': 'channel_select',
    'attachment_type': 'default',
    'actions': [
      {
        'text': `✓ Start Vote`,
        'name': 'passthrough',
        'value': 'food.user.poll',
        'type': 'button',
        'style': 'primary'
      }
      // }, {
      //   'name': 'passthrough',
      //   'value': 'food.admin.team.members',
      //   'text': `Edit Members`,
      //   'type': 'button'
      // }
    ]
  })

  // if (process.env.NODE_ENV == 'development_hannah') {
  //   msg_json.attachments[msg_json.attachments.length-1].actions.push({
  //     'name': 'passthrough',
  //     'text': 'Email Members',
  //     'type': 'button',
  //     'value': 'food.admin.team.email_members'
  //   })
  // }

  msg_json.attachments[msg_json.attachments.length-1].actions.push({
    'text': `< Back`,
    'name': 'food.poll.confirm_send',
    'value': 'food.poll.confirm_send',
    'type': 'button'
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
  yield handlers['food.admin.display_channels_reorder'](message)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
