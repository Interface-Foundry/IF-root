var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

handlers['food.admin.team_budget'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var msg_text = 'How much would you like each of your team members to spend on food?';

  // var next_mode = 'food.admin.team_budget';
  var confirm = false;

  if (message.text) {
    if (! isNaN(Number(message.text))) {
      if (message.text <=0) {
         msg_text = "That's not a valid number"
      }
      else {
        yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {temp_budget: Number(message.text)}})
        console.log('yielded, updated, etc')
        msg_text = `To confirm, you want each team member to spend around $${message.text}?`;
        confirm = true;
      }
    }
    else {
      //send an oops didn't get that message
      msg_text = "I'm sorry, I didn't understand that -- please type a number!"
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
        'callback_id': 'food.admin.team_budget',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': (confirm ? [
          {
            'name': 'passthrough',
            'text': 'Yes, that\'s right',
            'style': 'primary',
            'type': 'button',
            'value': 'food.admin.confirm_budget'
          } //food.user.poll
        ] : [])
      }
    ]
  }

  $replyChannel.sendReplace(message, 'food.admin.team_budget', {type: message.origin, data: msg_json})
}

handlers['food.admin.confirm_budget'] = function * (message) {

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {budget: foodSession.temp_budget},
    $unset: {temp_budget: ""}
  });

  console.log('B.O.B. PLAY THE GUITAR');

  yield $allHandlers['food.poll.confirm_send'](message)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
