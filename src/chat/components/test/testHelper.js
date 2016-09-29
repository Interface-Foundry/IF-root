var _ = require('lodash')

// check if button array is same as json
function checkButtonAttachment (attachment, correct) {
  if (!Array.isArray(correct)) { // just check if array
    return false
  }
  return _.isEqual(_.map(attachment.actions, 'text'), correct)
}

// helper funtion for tests
function * setPrevModeActionRoute (mode, action, route) {
  process.env._PREV_MODE = mode
  process.env._PREV_ACTION = action
  process.env._PREV_ROUTE = route || mode + '.' + action
}

// PRECONFIGURED TO ALLOW

var confirmMessage = {
  'text': 'Send poll for lunch cuisine to the team members at `902 Broadway`?',
  'attachments': [
    {
      'text': '',
      'fallback': 'You are unable to choose a game',
      'callback_id': 'wopr_game',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': [
        {
          'name': 'confirm',
          'text': 'Confirm',
          'style': 'primary',
          'type': 'button',
          'value': 'confirm'
        },
        {
          'name': 'view team members',
          'text': 'View Team Members',
          'type': 'button',
          'value': 'view team members'
        },
        {
          'name': 'cancel',
          'text': 'cancel',
          'style': 'danger',
          'type': 'button',
          'value': 'cancel',
          'confirm': {
            'title': 'Are you sure?',
            'text': "Wouldn't you prefer to order lunch?",
            'ok_text': 'Yes',
            'dismiss_text': 'No'
          }
        }
      ]
    }
  ]
}

module.exports = {
  checkButtonAttachment: checkButtonAttachment,
  confirmMessage: confirmMessage,
  setPrevModeActionRoute: setPrevModeActionRoute
}
