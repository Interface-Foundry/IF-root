'use strict'
var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.admin.team.members'] = function * (message) {
  console.log(message.data)
  var index = _.get(message, 'data.value.index', 0)
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var userToRemove = _.get(message, 'data.value.user_id')
  if (userToRemove) {
    kip.debug('removing user', userToRemove)
    foodSession.team_members = foodSession.team_members.filter(user => user.id !== userToRemove)
    foodSession.markModified('team_members')
    foodSession.save()
  }

  if (foodSession.team_members.length === 0) {
    $replyChannel.sendReplace(message, 'food.begin', {type: message.origin, data: {text: "Oops I had a brain freeze, please try again"}})
    return yield $allHandlers['food.begin'](message)
  }

  var attachments = foodSession.team_members.map(user => {
    return {
      mrkdwn_in: ['text'],
      callback_id: user.id,
      text: `*${user.real_name || user.name}* - <@${user.id}|${user.name}>`,
      actions: [{
        name: 'food.admin.team.members',
        text: '× Remove',
        type: 'button',
        value: {
          index: index,
          user_id: user.id
        }
      }]
    }
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
    fallback: 'You are unable to navigate the admin option menu',
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
    text: 'Send Poll',
    type: 'button',
    style: 'primary'
  })

  buttons.actions.push({
    name: 'food.exit.confirm',
    text: '× Cancel',
    type: 'button',
    'confirm': {
      'title': 'Are you sure?',
      'text': "Are you sure you don't want to order food?",
      'ok_text': 'Yes',
      'dismiss_text': 'No'
    }
  })

  attachments.push(buttons)

  var msg_json = {
    text: 'Users in the order:',
    attachments: attachments
  }

  $replyChannel.sendReplace(message, 'food.begin', {type: message.origin, data: msg_json})

}


module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
