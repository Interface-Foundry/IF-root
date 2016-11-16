var handlers = module.exports = {};
var db = require('db');
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var dutils = require('../delivery.com/utils');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var cron = require('cron');
var cronJobs = {};
var momenttz = require('moment-timezone');
var amazon = require('../amazon_search.js');
var kipcart = require('../cart');
var slackcart = require('../slack/cart');
var bundles = require('../bundles');
var sleep = require('co-sleep');
var eachSeries = require('async-co/eachSeries');
var processData = require('../process');

function * handle(message) {
  var last_action = _.get(message, 'history[0].action');
  if (!last_action || last_action.indexOf('home') == -1) {
    return yield handlers['start'](message)
  } else {
    var data = _.split(message.data.value, '.')
    var action = data[0];
    data.splice(0,1);
    kip.debug('\n\n\n🤖 action : ',action, 'data: ', data, ' 🤖\n\n\n');
    return yield handlers[action](message, data)
  }
}
 
module.exports.handle = handle;

// arg1: {
//   "query": "jacket"
// }  
// arg2: slack
  // var results = yield amazon_search.search(exec.params,message.origin);

/**
 * S1
 */
handlers['start'] = function * (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  //adding onboard sticker
  attachments.push({
    // image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: 'Welcome to Kip!  We\'ll help you get started :)'
  });
  attachments.push({
      text: ' What are looking for?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_start,
      callback_id: 'none'
    })
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   // msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];
 }

/**
 * S2
 */
handlers['supplies'] = function * (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  attachments.push({
      text: ' What are looking for?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_bundles,
      callback_id: 'none'
    })
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];
}

handlers['lunch'] = function * (message) {   
  var msg = message;
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  msg.mode = 'food'
  msg.action = 'begin'
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.state = {}
  var foodSession = yield dutils.initiateDeliverySession(msg)
  yield foodSession.save()
  var address_buttons = _.get(team, 'meta.locations', []).map(a => {
    return {
      name: 'passthrough',
      text: a.address_1,
      type: 'button',
      value: JSON.stringify(a)

    }
  })
  address_buttons.push({
    name: 'passthrough',
    text: 'New +',
    type: 'button',
    value: 'address.new'
  })
  var msg_json = {
    'attachments': [
    {
        'fallback': 'Kip Cafe',
        'title': '',
        'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
      },
      {
        'text': 'Great! Which address is this for?',
        'fallback': 'You are unable to choose an address',
        'callback_id': 'address',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': address_buttons
      }
    ]
  }
  msg.reply = msg_json;  
  return [msg];

}

/**
 * S3
 */
handlers['bundle'] = function * (message, data) {
 var choice = data[0];
 var bundle = bundles.getBundle(choice);
 var cart_id = message.cart_reference_id || message.source.team; 

 yield eachSeries(bundle, function * (asin) {
   try {
    var res = yield amazon.lookup({ ASIN: asin, IdType: 'ASIN'}); 
    yield kipcart.addToCart(cart_id, message.user_id, res[0], 'team');
   } catch (e) {
    kip.debug(' \n\n\n\n\n\n\n onboard.js:193:eachseries error: ',e, ' \n\n\n\n\n\n\n');
    // return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊', e)
   }
 });

 yield sleep(1000)

 var cart_id = message.source.team
 var cart = yield kipcart.getCart(cart_id)
 // all the messages which compose the cart
 var attachments = [];

  attachments.push({
    text: 'Awesome! You added your first bundle.',
    color: '#45a5f4',
    // image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  })

  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];

    // the slack message for just this item in the cart list
    var item_message = {
      mrkdwn_in: ['text', 'pretext'],
      color: '#45a5f4',
      thumb_url: item.image
    }

    // multiple people could have added an item to the cart, so construct a string appropriately
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');
    var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());

    // make the text for this item's message
    item_message.text = [
      `*${i + 1}.* ` + `<${link}|${item.title}>`,
      `*Price:* ${item.price} each`,
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`,
      
    ].filter(Boolean).join('\n');

    // add the item actions if needed
      item_message.callback_id = item._id.toString();
      var buttons = [{
        "name": "additem",
        "text": "+",
        "style": "default",
        "type": "button",
        "value": "add"
      }, {
        "name": "removeitem",
        "text": "—",
        "style": "default",
        "type": "button",
        "value": "remove" 
      }];

      if (item.quantity > 1) {
        buttons.push({
          name: "removeall",
          text: 'Remove All',
          style: 'default',
          type: 'button',
          value: 'removeall'
        })
      }

      item_message.actions = buttons;
    

    attachments.push(item_message)
   }
    var summaryText = `*Team Cart Summary*
    *Total:* ${cart.total}`;
    attachments.push({
      text: summaryText,
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })

   // yield sleep(1000)

   attachments.push({
      text: 'Do you want to let others add stuff to cart?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_basic,
      callback_id: 'none'
    });
   attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home';
   msg.text = ''
   msg.source.team = message.source.team;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];

}

/**

 * S4
 */
handlers['team'] = function * (message) { 
 

}

/**
 * S4A1 
 */
handlers['reminder'] = function * (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var teamMembers = yield utils.getTeamMembers(team);
  var admins = yield utils.findAdmins(team);
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  var attachments = [];
  attachments.push({
      text: 'Would you like to set a reminder for collecting shopping orders from your team?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_reminder,
      callback_id: 'none'
    });
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = 'Awesome! I\'ve let them know.'
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];
}

/**
 * S4A2
 */

handlers['confirm_reminder'] = function * (message, data) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();

  const ONE_DAY = 24 * 60 * 60 * 1000; //hours in a day * mins in hour * seconds in min * milliseconds in second
  var dateDescrip,
    msInFuture = -1,
    alertTime = data[0],
    now = new Date();
  switch (alertTime) {
    case 'today':
      msInFuture = ONE_DAY / 6; //4 hours for now
      dateDescrip = 'later today';
      break;
    case 'tomorrow':
      msInFuture = ONE_DAY;
      dateDescrip = 'tomorrow';
      break;
    case 'one_week':
      msInFuture = ONE_DAY * 7;
      dateDescrip = 'in a week';
      break;
    case 'one_month':
      msInFuture = ONE_DAY * 30;
      dateDescrip = 'in a month';
      break;
    case 'never':
    default:
      break;
  }
  var messageText = (msInFuture > 0) ?
    `Awesome! I'll give you a heads up for your order ${dateDescrip}.` :
    'Ok! I won\'t set any reminders.';
  messageText += ' Thanks and have a great day. Type `help` if you\'re feeling a bit wobbly :)';

  if (msInFuture > 0) {
    yield updateCronJob(team, message, new Date(msInFuture + now.getTime()));
  }

  var msg = message;
  var attachments = [];
  attachments.push({
    text: messageText,
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    callback_id: 'none'
  });
  attachments.push({
    text: '',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  });

  msg.action = 'home'
  msg.mode = 'onboard'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];
}


/**
 * S5
 */
handlers['member'] = function * (message) {


}

/**
 * S6
 */
handlers['checkout'] = function * (message) {


}

/**
 * catcher
 */
handlers['sorry'] = function * (message) {


}

function * updateCronJob(team, message, date) {
  if (cronJobs[team.team_id]) {
    cronJobs[team.team_id].stop();
  }
  kip.debug('\n\n\nsetting cron job day: ', '00 ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), '\n\n\n')
  var teamMembers = yield utils.getTeamMembers(team);
  var currentUser = yield db.Chatusers.findOne({
    id: message.source.user
  });

  cronJobs[team.team_id] = new cron.CronJob('00 ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), function() {
      team.meta.office_assistants.map(function(a) {
        var assistant = teamMembers.find(function(m, i) {
          return m.id == a
        });

        var attachments = [{
          // "pretext": "Hi, this is your weekly reminder.  Would you like to send out a last call?",
          "image_url": "http://kipthis.com/kip_modes/mode_teamcart_collect.png",
          "text": "",
          "mrkdwn_in": [
            "text",
            "pretext"
          ],
          "color": "#45a5f4"
        }];
        attachments.push({
          text: `Hi, <@${currentUser.id}> is collecting Amazon orders`,
          color: '#49d63a',
          mrkdwn_in: ['text'],
          fallback: 'Onboard',
          callback_id: 'none'
        });
        attachments.map(function(a) {
          a.mrkdwn_in = ['text'];
          a.color = '#45a5f4';
        })
        var newMessage = new db.Message({
          incoming: false,
          thread_id: message.thread_id,
          user_id: assistant.id,
          origin: 'slack',
          source: message.source,
          mode: 'onboard',
          action: 'home',
          user: message.source.user,
          reply: attachments
        })
        kip.debug('\n\n\n Firing Cron Job: assistant: ', assistant, message, newMessage, '\n\n\n')

        newMessage.save()
        queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');

        // slackBot.web.chat.postMessage(assistant.dm, '', reply);
        //   // SHOW CART STICKER
        //  //* * * * * * * * * * * * * * * * * //
        //  //CHECKING HERE IF NO EMAILS users or channels. If none, Show User Cart Members, prompt to add people, defaults to <#general>
        //  //* * * * * * * * * * * * * * * * * //
        //   //* * * *  SHOW TEAM CART USERS  ** * * * //
        //   convo.ask('Would you like me to send an last call message to *SHOW TEAM LIST*', lastCall)
      });
    }, function() {
      console.log('just finished the scheduled update thing for team ' + team.team_id + ' ' + team.team_name);
    },
    true,
    team.meta.weekly_status_timezone);
};
