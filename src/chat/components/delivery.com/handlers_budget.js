var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

handlers['food.admin.team_budget'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var budget_options;
  var locations = (yield db.slackbots.findOne({team_id: message.source.team})).meta.locations
  for (var i = 0; i < locations.length; i++) {
    if (locations[i].address_1 == foodSession.chosen_location.address_1 && locations[i].zip_code == foodSession.chosen_location.zip_code) {
      budget_options = locations[i].budgets;
    }
  }

  var msg_text = 'How much would you like each person on your team to spend on food?';

  var parseNumber = function (str) {
    var num = str.match(/([\d]+(?:\.\d\d)?)/);
    if (num) return num[1];
    else return null;
  }

  console.log('message.text', message.text)

  if (message.text) {
    var num = parseNumber(message.text)

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

  for (var i = 0; i < budget_options.length; i++) {
    msg_json.attachments[0].actions.push({
      'name': 'food.admin.confirm_budget',
      'text': `$${budget_options[i]}`,
      'style': 'default',
      'type': 'button',
      'value': {
        budget: budget_options[i],
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

    var budget_options;
    var locations = (yield db.slackbots.findOne({team_id: message.source.team})).meta.locations
    for (var i = 0; i < locations.length; i++) {
      if (locations[i].address_1 == foodSession.chosen_location.address_1 && locations[i].zip_code == foodSession.chosen_location.zip_code) {
        budget_options = locations[i].budgets;
        var duplicate = false;
        for (var j = 0; j < budget_options.length; j++) {
          if (Number(budget) == Number(budget_options[j])) duplicate = true;
          if (Number(budget) <= Number(budget_options[j])) {
            budget_options.splice(j, (duplicate ? 1 : 0), budget);
            break;
          }
        }
        if (Number(budget) > Number(budget_options[budget_options.length])) {
          budget_options.push(budget)
        }
        locations[i].budgets = budget_options
      }
    }

    yield db.slackbots.update({team_id: message.source.team}, {$set: {'meta.locations': locations}})
  }

  var user_budgets = {};
  for (var i = 0; i < foodSession.team_members.length; i++) {
    user_budgets[foodSession.team_members[i].id] = budget;
  }

  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {
      budget: budget,
      user_budgets: user_budgets
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
