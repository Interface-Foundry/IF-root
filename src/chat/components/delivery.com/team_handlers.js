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
    $replyChannel.sendReplace(message, 'food.admin.select_address', {type: message.origin, data: {text: "Oops I had a brain freeze, please try again"}})
    return yield $allHandlers['food.admin.select_address'](message)
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

  buttons.actions.push({
    'name': 'passthrough',
    'text': 'Add email',
    'type': 'button',
    'value': 'food.admin.team.add_email'
  })

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

//~~~~~~~~~~//

handlers['food.admin.team.add_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var msg_text = 'Please type an email address below';
  var confirm = false;

  function validateEmail (str) {
    //TODO -- real validation
    //Part one: a-z, A-Z, 0-9, !#$%&'*+-/=?^ --> . may not be first, or last, or next to itself consecutively
    //Part two: a-z, -, 0-9 (case insensitive)
    //Should probably split by . and @, etc, whatever

    var email = str.match(/(\b[A-Za-z0-9!#\$%&'\*\+\/=\?^-][A-Za-z0-9!\.#\$%&'\*\+\/=\?^-]*[A-Za-z0-9!#\$%&'\*\+\/=\?^-]@[a-z0-9-]+\.[a-z0-9-]+\b)/);

    if (email) return email[1];
    else return null;
  }

  if (message.text && message.text != "food.admin.team.add_email") {
    confirm = true;
    var email = validateEmail(message.text);
    if (email) {
      msg_text = `Is ${email} the email you want to add?`;
    }
    else {
      msg_text = "That wasn't a valid email; please try again!";
      confirm = false;
    }
  }

  var msg_json = {
   'attachments': [
     {
       'mrkdwn_in': [
         'text'
       ],
       'text': msg_text,
       'fallback': 'I am fallback hear me fall back!',
       'callback_id': 'food.admin.team.add_email',
       'color': '#3AA3E3',
       'attachment_type': 'default',
       'actions': (confirm ? [
         {
           'name': 'passthrough',
           'text': 'Yes, that\'s right',
           'style': 'primary',
           'type': 'button',
           'value': 'food.admin.select_address'
         }

       ] : [])
     }
   ]
 }

  $replyChannel.sendReplace(message, 'food.admin.team.add_email', {type: message.origin, data: msg_json})
}

//~~~~~~~~~~//

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
