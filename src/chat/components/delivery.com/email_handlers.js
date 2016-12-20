'use strict'
var _ = require('lodash')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.admin.team.email_members'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()
  var et = yield db.email_team.findOne({team_id: message.source.team});
  var msg_json = {'attachments': []};

  if (et) {

    et.emails.map(function (e) {
      msg_json.attachments.push({
        "text": e,
        "fallback": "A bridge to the over-man",
        "callback_id": "The Will to Power",
        "attachment_type": "default",
        "actions": [
          {
            "name": 'zarathustra',
            "text": "✓ Added",
            "type": "button",
            "value": "zarathustra"
          },
          {
            "name": "ecce_homo",
            "text": "× Delete",
            "type": "button",
            "value": "ecce_homo"
          }
        ]
      });
    });
  }

  msg_json.attachments.push({
     'mrkdwn_in': [
       'text'
     ],
     'text': (et ? 'These are your email members' : 'It looks like you don\'t have any email members yet!'),
     'fallback': 'I am fallback hear me fall back!',
     'callback_id': 'food.admin.team.add_email',
     'color': '#3AA3E3',
     'attachment_type': 'default',
     'actions': [
       {
         'name': 'passthrough',
         'text': 'Add Email',
         'style': 'primary',
         'type': 'button',
         'value': 'food.admin.team.add_email'
       }
     ]
   });

  $replyChannel.sendReplace(message, 'food.admin.team.email_members', {type: message.origin, data: msg_json})
}

//~~~~~~~~~~//

handlers['food.admin.team.add_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  var msg_text = 'Please type an email address below';
  var confirm = false;

  function validateEmail (str) {

    var email = str.match(/(\b[A-Za-z0-9!#\$%&'\*\+\/=\?^-][A-Za-z0-9!_\.#\$%&'\*\+\/=\?^-]*[A-Za-z0-9!#\$%&'\*\+\/=\?^-]@[a-z0-9-]+\.[a-z0-9-]+\b)/);

    if (email) return email[1];
    else return null;
  }

  if (message.text && message.text != "food.admin.team.add_email") {
    var email = validateEmail(message.text);
    if (email) {
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

  var et = yield db.Email_team.findOne({team_id: message.source.team}); // null if not there

  if (! et) {
    et = new db.Email_team({team_id: message.source.team, emails: []});
  }

  et.emails.push(email);
  yield et.save();

  var tm = foodSession.team_members;
  tm.push({email: email, email_user: true});

  yield db.Delivery.update({team_id: message.source.team, active: true}, {
    $set: {
      team_members: tm,
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
