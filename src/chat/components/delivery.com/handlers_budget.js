// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

handlers['food.admin.team_budget'] = function * (message) {
  console.log('TRANS DF EXPRESS')
  console.log(message.text);
  if (message.text) {

  }

  var msg_json = {
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'text': 'I am text hear me text!',
        'fallback': 'I am fallback hear me fall back!',
        'callback_id': 'food.admin.team_budget',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'passthrough',
            'text': 'What iz rap?',
            'style': 'primary',
            'type': 'button',
            'value': 'food.user.poll'
          }
        ]
      }
    ]
  }

  $replyChannel.sendReplace(message, 'food.admin.team_budget', {type: message.origin, data: msg_json})
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
