'use strict'
var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.admin.team.members'] = function * (message) {
  var index = _.get(message, 'data.value.index', 0)
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1110, foodSession._id, message.user_id, {original_text: message.original_text})

  var userToRemove = _.get(message, 'data.value.user_id')
  if (userToRemove) {
    kip.debug('removing user', userToRemove)
    foodSession.team_members = foodSession.team_members.filter(user => user.id !== userToRemove)
    foodSession.markModified('team_members')
    foodSession.save()
  }

  if (foodSession.team_members.length === 0) {
    $replyChannel.sendReplace(message, 'food.admin.select_address', {type: message.origin, data: {text: "Oops I had a brain freeze, please try again"}})
    return yield $allHandlers['food.admin.select_address'](message)
  }

  var attachments = [];

  foodSession.team_members.map(user => {

        attachments.push({
        mrkdwn_in: ['text'],
        callback_id: user.id,
        text:`*${user.real_name || user.name}* - <@${user.id}|${user.name}>`,
        actions: [{
          name: 'food.admin.team.members',
          text: '× Remove',
          type: 'button',
          value: {
            index: index,
            user_id: user.id
          }
        }]
      })
    })

  var moreButton = {
    name: 'food.admin.team.members',
    text: 'More Users >',
    type: 'button',
    value: {
      index: index + 5
    }
  }

  var backButton = {
    name: 'food.admin.team.members',
    text: '<',
    type: 'button',
    value: {
      index: Math.max(index - 5, 0)
    }
  }

  var buttons = {
    fallback: 'Button',
    'color': '#3AA3E3',
    actions: []
  }

  if (index > 0) {
    buttons.actions.push(backButton)
  }

  if (index + 5 < foodSession.team_members.length) {
    buttons.actions.push(moreButton)
  }

  buttons.actions.push({
    name: 'food.user.poll',
    text: '✓ Send Poll',
    type: 'button',
    style: 'primary'
  })

  buttons.actions.push({
    'name': 'food.admin.display_channels',
    'text': 'Use a #channel',
    'type': 'button',
    'value': 'select_team_members'
  })

  if (process.env.NODE_ENV == 'development_hannah') {
    buttons.actions.push({
      'name': 'passthrough',
      'text': 'View Email Members',
      'type': 'button',
      'value': 'food.admin.team.email_members'
    })
  }

  buttons.actions.push({
    name: 'passthrough',
    value: 'food.poll.confirm_send',
    text: '< Back',
    type: 'button'
  })

  attachments.push(buttons)

  var msg_json = {
    text: 'Team members in the order:',
    attachments: attachments
  }

  $replyChannel.sendReplace(message, 'food.admin.select_address', {type: message.origin, data: msg_json})
}

handlers['food.admin.team.members.reorder'] = function * (message) {
  var index = _.get(message, 'data.value.index', 0)
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1110, foodSession._id, message.user_id, {original_text: message.original_text})

  var userToRemove = _.get(message, 'data.value.user_id')
  if (userToRemove) {
    kip.debug('removing user', userToRemove)
    foodSession.team_members = foodSession.team_members.filter(user => user.id !== userToRemove)
    foodSession.markModified('team_members')
    foodSession.save()
  }

  if (foodSession.team_members.length === 0) {
    $replyChannel.sendReplace(message, 'food.admin.select_address', {type: message.origin, data: {text: "Oops I had a brain freeze, please try again"}})
    return yield $allHandlers['food.admin.select_address'](message)
  }


 var attachments = [];

 foodSession.team_members.map(user => {

        attachments.push({
        mrkdwn_in: ['text'],
        callback_id: user.id,
        text:`*${user.real_name || user.name}* - <@${user.id}|${user.name}>`,
        actions: [{
          name: 'food.admin.team.members',
          text: '× Remove',
          type: 'button',
          value: {
            index: index,
            user_id: user.id
          }
        }]
      })
    })

  var moreButton = {
    name: 'food.admin.team.members.reorder',
    text: 'More Users >',
    type: 'button',
    value: {
      index: index + 5
    }
  }

  var backButton = {
    name: 'food.admin.team.members.reorder',
    text: '<',
    type: 'button',
    value: {
      index: Math.max(index - 5, 0)
    }
  }

  var buttons = {
    fallback: 'Button',
    'color': '#3AA3E3',
    actions: []
  }

  if (index > 0) {
    buttons.actions.push(backButton)
  }

  if (index + 5 < foodSession.team_members.length) {
    buttons.actions.push(moreButton)
  }

  buttons.actions.push({
    'name': 'food.admin.restaurant.confirm_reordering_of_previous_restaurant',
    'text': '✓ Collect Orders',
    'style': 'primary',
    'type': 'button'
  })

  buttons.actions.push({
    'name': 'food.admin.display_channels_reorder',
    'text': 'Use a #channel',
    'type': 'button',
    'value': message.data.value
  })

  if (process.env.NODE_ENV == 'development_hannah') {
    buttons.actions.push({
      'name': 'passthrough',
      'text': 'View Email Members',
      'type': 'button',
      'value': 'food.admin.team.email_members'
    })
  }

  buttons.actions.push({
    name: 'food.admin.restaurant.reordering_confirmation',
    value: message.data.value,
    text: '< Back',
    type: 'button'
  })

  attachments.push(buttons)

  var msg_json = {
    text: 'Team members in the order:',
    attachments: attachments
  }

  $replyChannel.sendReplace(message, 'food.admin.select_address', {type: message.origin, data: msg_json})
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
