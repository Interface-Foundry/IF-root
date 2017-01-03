console.log('and now email_handlers.js')

'use strict'
var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.admin.team.add_order_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec();
  var e = message.source.callback_id;
  foodSession.email_users.push(e);
  yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {email_users: foodSession.email_users}});
  yield handlers['food.admin.team.email_members'](message);
}

//~~~~~~~~~~//

handlers['food.admin.team.remove_order_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()
  var e = message.source.callback_id;
  foodSession.email_users.splice(foodSession.email_users.indexOf(e), 1);
  yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {email_users: foodSession.email_users}});
  yield handlers['food.admin.team.email_members'](message);
}

//~~~~~~~~~~//

handlers['food.admin.team.delete_email'] = function * (message) {
  // var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()
  var e = message.source.callback_id;

  // if (foodSession.email_users.indexOf(e)) {
  //   foodSession.email_users.splice(foodSession.email_users.indexOf(e), 1);
  //   yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {email_users: foodSession.email_users}});
  // }

  yield db.email_users.remove({team_id: message.source.team, email: e})

  // yield handlers['food.admin.team.email_members'](message);
  yield handlers['food.admin.team.remove_order_email'](message)
}

//~~~~~~~~~~//

handlers['food.admin.team.email_members'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var et = yield db.email_users.find({team_id: message.source.team});
  console.log('emily taylor', Array.isArray(et), et);

  var index = parseInt(_.get(message, 'data.value.index')) || 0
  var inc = 4;

  var msg_json = {'attachments': []};

  if (et.length) {
    var addedButton = {
      "name": "food.admin.team.remove_order_email",
      "text": "✓ Added",
      "type": "button",
      "value": {
        index: index
      }
    };

    var addButton = {
      "name": "food.admin.team.add_order_email",
      "text": "○ Add",
      "type": "button",
      "value": {
        index: index
      }
    };

    var emails = [];
    //I don't even know what's going on anymore
    et.slice(index, index + 4).map(function (e) {
      msg_json.attachments.push({
        "text": e.email,
        "fallback": "A bridge to the over-man",
        "callback_id": e.email,
        "attachment_type": "default",
        "actions": [
          (foodSession.email_users.indexOf(e.email) > -1 ? addedButton : addButton),
          {
            "name": "food.admin.team.delete_email",
            "text": "× Delete",
            "type": "button",
            "value": {
              index: index
            }
          }
      ]});
    });


    var prev = {
      "name": "food.admin.team.email_members",
      "text": "< Previous",
      "type": "button",
      "value": {
        index: index - inc
      }
    };

    var next =  {
      "name": "food.admin.team.email_members",
      "text": "Next >",
      "type": "button",
      "value": {
        index: index + inc
      }
    };

    var scrollButtons = {
      "text": "",
      "fallback": "fallback",
      "callback_id": "callback_id",
      "attachment_type": "default",
      "actions": []
    };

    if (index >= inc) scrollButtons.actions.push(prev);
    if (index <= et.length-inc) scrollButtons.actions.push(next);

    msg_json.attachments.push(scrollButtons);

  }
  else {
    console.log('no email users saved')
  }

  msg_json.attachments.push({
     'mrkdwn_in': [
       'text'
     ],
     'text': '',
     'fallback': 'I am fallback hear me fall back!',
     'callback_id': 'food.admin.team.add_email',
    //  'color': '#3AA3E3',
     'attachment_type': 'default',
     'actions': [{
         'name': 'passthrough',
         'text': 'Add Email',
         'style': 'default',
         'type': 'button',
         'value': 'food.admin.team.add_email'
       }]
   });

   msg_json.attachments.push({
      'mrkdwn_in': [
        'text'
      ],
      'text': (foodSession.email_users.length ? `*Added:* ${foodSession.email_users.join(', ')}` : ''),
      'fallback': 'I am fallback hear me fall back!',
      'callback_id': 'food.admin.team.add_email',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': [
        {
          'name': 'passthrough',
          'text': 'Finish',
          'style': 'primary',
          'type': 'button',
          'value': 'food.admin.team.members'
        }
        // {
        //   'name': 'passthrough',
        //   'text': '< Back',
        //   'style': 'default',
        //   'type': 'button',
        //   'value': 'food.admin.team.add_email'
        // }
      ]
  });

  $replyChannel.sendReplace(message, 'food.admin.team.email_members', {type: message.origin, data: msg_json});
}

//~~~~~~~~~~//

handlers['food.admin.team.add_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec();

  var msg_text = 'Please type an email address below';
  var confirm = false;

  function validateEmail (str) {

    var email = str.match(/(\b[A-Za-z0-9!#\$%&'\*\+\/=\?^-][A-Za-z0-9!_\.#\$%&'\*\+\/=\?^-]*[A-Za-z0-9!#\$%&'\*\+\/=\?^-]@[a-z0-9-]+\.[a-z0-9-]+\b)/);

    if (email) return email[1];
    else return null;
  }

  if (message.text && message.text != "food.admin.team.add_email") {
    var email = validateEmail(message.text);
    var alreadyInDb = yield db.email_users.findOne({email: email, team_id: message.source.team});
    if (email && !alreadyInDb) {
      confirm = true;
      console.log('email up here:', email)
      msg_text = `Is ${email} the email you want to add?`;
      yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {data: {temp_email: email}}}, {strict: false})
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
           'value': 'food.admin.team.confirm_email'
         }

       ] : [])
     }
   ]
 }

  $replyChannel.sendReplace(message, 'food.admin.team.add_email', {type: message.origin, data: msg_json})
}

//~~~~~~~~~~//

handlers['food.admin.team.confirm_email'] = function * (message) {

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var email = foodSession.data.temp_email;

  function newId (n) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id = '';
    for (var i = 0; i < n; i++) {
      id += chars.split('')[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  var eu = new db.Email_user({
    team_id: message.source.team,
    id: newId(10),
    email: email
  });

  yield eu.save();
  console.log('the new eu should have been saved');

  var tm = foodSession.email_users;
  tm.push(eu.email);

  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {
      email_users: tm,
      data: {}
    }});

  yield $allHandlers['food.admin.team.email_members'](message)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
