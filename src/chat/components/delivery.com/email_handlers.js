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

handlers['food.admin.team.add_all_emails'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec();
  var et = yield db.email_users.find({team_id: message.source.team});
  et.map(function (eu) {
    foodSession.email_users.push(eu.email)
  })
  yield foodSession.save()
  yield handlers['food.admin.team.email_members'](message);
}

//~~~~~~~~~~//

handlers['food.admin.team.remove_order_email'] = function * (message) {
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()
  var e = message.source.callback_id;
  if (foodSession.email_users.indexOf(e) > -1) {
    foodSession.email_users.splice(foodSession.email_users.indexOf(e), 1);
    yield db.delivery.update({team_id: message.source.team, active: true}, {$set: {email_users: foodSession.email_users}});
  }
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
  console.log('email handlers')
  console.log('lodash', _.get(message, 'data.value.reorder'))
  var reorder = _.get(message, 'data.value.reorder') || message.history[1]._doc.action === 'admin.team.members.reorder'
  var previousRestaurant = _.get(message, 'data.value.resto')
  //fallback find the message with the last restaurant? where reorder is selected
  if (reorder && !previousRestaurant && message.history) previousRestaurant = message.history[1]._doc.data.value
  if (reorder && !previousRestaurant) {
    var reorderMessage = yield db.Messages.find({action: 'ready_to_poll'}).sort('-ts').limit(1).exec()
    reorderMessage = reorderMessage[0]
    previousRestaurant = reorderMessage.source.original_message.attachments[1].actions[0].value
  }

  console.log('REORDER', reorder)
  var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1112, foodSession._id, message.user_id, {original_text: message.original_text})

  var et = yield db.email_users.find({team_id: message.source.team});
  var index = parseInt(_.get(message, 'data.value.index')) || 0
  var inc = 4;

  var msg_json = {'attachments': []};

  if (et.length) {
    var addedButton = {
      "name": "food.admin.team.remove_order_email",
      "text": "✓ Added",
      "type": "button",
      "value": {
        index: index,
        reorder: reorder,
        resto: previousRestaurant
      }
    };

    var addButton = {
      "name": "food.admin.team.add_order_email",
      "text": "○ Add",
      "type": "button",
      "value": {
        index: index,
        reorder: reorder,
        resto: previousRestaurant
      }
    };

    // var emails = [];
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
              index: index,
              reorder: reorder,
              resto: previousRestaurant
            }
          }
      ]});
    });

    var prev = {
      "name": "food.admin.team.email_members",
      "text": "< Previous",
      "type": "button",
      "value": {
        index: index - inc,
        reorder: reorder,
        resto: previousRestaurant
      }
    };

    var next =  {
      "name": "food.admin.team.email_members",
      "text": "Next >",
      "type": "button",
      "value": {
        index: index + inc,
        reorder: reorder,
        resto: previousRestaurant
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
         'name': 'food.admin.team.add_email',
         'text': 'Add Email',
         'style': 'default',
         'type': 'button',
         'value': {
           reorder: reorder,
           resto: previousRestaurant
         }
       }, {
         'name': 'food.admin.team.add_all_emails',
         'text': 'Add All',
         'style': 'default',
         'type': 'button',
         'value': {
           reorder: reorder,
           resto: previousRestaurant
         }
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
          'name': (reorder ? 'food.admin.restaurant.reordering_confirmation' : 'food.poll.confirm_send'),
          'text': 'Finish',
          'style': 'primary',
          'type': 'button',
          'value': (reorder ? previousRestaurant : '')//'food.admin.team.members' // but should sometimes be reorder confirmation
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
  // var foodSession = yield db.delivery.findOne({team_id: message.source.team, active: true}).exec();

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

  var admin = yield db.Chatusers.findOne({id: message.source.user})
  // console.log('admin:', admin)

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
    email: email,
    tz: admin.tz,
    tz_label: admin.tz_label,
    tz_offset: admin.tz_offset
  });

  yield eu.save();
  console.log('new eu saved');

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
