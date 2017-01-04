var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

handlers['food.admin.team_budget'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var msg_text = 'How much would you like each person on your team to spend on food?';

  var parseNumber = function (str) {
    var num = str.match(/([\d]+(?:\.\d\d)?)/);
    // console.log('Regex returns:', num[1]);
    if (num) return num[1];
    else return null;
  }

  console.log('message.text', message.text)

  if (message.text) {
    var num = parseNumber(message.text)
    // if (num) {
    //   if (num <=0) {
    //      msg_text = "That's not a valid number"
    //   }
    //   else {
    //     // individual_num = Math.round(num/foodSession.team_members.length)
    //     // yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {temp_budget: num}})
    //     // console.log('yielded, updated, etc')
    //     msg_text = `To confirm, you want your team to spend around $${num} per person?`;
    //     confirm = true;
    //   }
    // }
    // else {
    //   //send an oops didn't get that message
    //   msg_text = "I'm sorry, I didn't understand that -- please type a number!"
    // }
    message.data = {};
    message.data.value = {};
    message.data.value.budget = num;
    message.data.value.new = true;
    yield handlers['food.admin.confirm_budget'](message);
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
        'actions': []
      }
    ]
  }

  // var lastTeamSession = yield db.Delivery.find({team_id: message.source.team}, {possible_budgets: 1}).sort('-time_started').limit(2).exec() //too big yikes
  // lastTeamSession = lastTeamSession[1]

  for (var i = 0; i < foodSession.possible_budgets.length; i++) {
    msg_json.attachments[0].actions.push({
      'name': 'food.admin.confirm_budget',
      'text': `$${foodSession.possible_budgets[i]}`,
      'style': 'default',
      'type': 'button',
      'value': {
        budget: foodSession.possible_budgets[i],
        new: true
      }
    })
  }

  msg_json.attachments[0].actions.push({
    'name': 'passthrough',
    'text': 'None',
    'style': 'default',
    'type': 'button',
    'value': 'food.admin_polling_options'
  })

  if (!message.text) {
    msg_json.attachments.push({
      'fallback': 'Search the menu',
      'text': '✎ Or type a budget below',
      'mrkdwn_in': ['text']
    })
  }

  $replyChannel.sendReplace(message, 'food.admin.team_budget', {type: message.origin, data: msg_json})
}

handlers['food.admin.confirm_budget'] = function * (message) {

  budget = message.data.value.budget;
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  if (message.data.value.new) {
    var pbs = foodSession.possible_budgets;
    for (var i = 0; i < pbs.length; i++) {
      if (budget <= pbs[i]) {
        pbs.splice(i, 0, budget);
        break;
      }
    }
  }

  var user_budgets = {};
  for (var i = 0; i < foodSession.team_members.length; i++) {
    user_budgets[foodSession.team_members[i].id] = budget;
  }

  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {
      budget: budget,
      user_budgets: user_budgets,
      possible_budgets: (pbs ? pbs : foodSession.possible_budgets)
    }
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
