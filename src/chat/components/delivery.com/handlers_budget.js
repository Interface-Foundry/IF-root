var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

handlers['food.admin.team_budget'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var msg_text = 'How much would you like your team to spend on food?';

  // var next_mode = 'food.admin.team_budget';
  var confirm = false;

  var parseNumber = function (str) {
    var num = str.match(/([\d]+(?:\.\d\d)?)/);
    // console.log('Regex returns:', num[1]);
    if (num) return num[1];
    else return null;
  }

  console.log('message.text', message.text)

  if (message.text) {
    var num = parseNumber(message.text)
    if (num) {
      if (num <=0) {
         msg_text = "That's not a valid number"
      }
      else {
        individual_num = Math.round(num/foodSession.team_members.length)
        yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {temp_budget: individual_num}})
        console.log('yielded, updated, etc')
        msg_text = `To confirm, you want your team to spend around $${num}, which works out to around $${individual_num} per person.`;
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
          }, //food.user.poll
          {
            'name': 'food.admin.team_budget',
            'text': 'No, that\'s not right',
            'style': 'default',
            'type': 'button',
            'value': 'food.admin.team_budget'
          },
          {
            'name': 'passthrough',
            'text': '< Back',
            'style': 'default',
            'type': 'button',
            'value': 'food.admin_polling_options'
          }
        ] : [])
      }
    ]
  }

  $replyChannel.sendReplace(message, 'food.admin.team_budget', {type: message.origin, data: msg_json})
}

handlers['food.admin.confirm_budget'] = function * (message) {

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  var user_budgets = {};
  for (var i = 0; i < foodSession.team_members.length; i++) {
    user_budgets[foodSession.team_members[i].id] = foodSession.temp_budget;
  }

  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {
      budget: foodSession.temp_budget,
      user_budgets: user_budgets
    },
    $unset: {temp_budget: ""}
  });

  yield $allHandlers['food.admin_polling_options'](message)
  //make this a sendReplace
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
