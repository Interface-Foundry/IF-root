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
    return yield handlers['start'](message);
  } else {
    if (!message.data){
      var action = 'sorry'
    } else {
      var data = _.split(message.data.value, '.');
      var action = data[0];
      data.splice(0,1);
    }
    kip.debug('\n\n\n🤖 action : ',action, 'data: ', data, ' 🤖\n\n\n');
    return yield handlers[action](message, data);
  }
}
 
module.exports.handle = handle;

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

 handlers['remind'] = function (message) {
   var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
   if (team_id == null) {
     return kip.debug('incorrect team id : ', message);
   }
   var attachments = [];
   attachments.push({
     text: 'Ok! When would you like to be reminded?',
     color: '#49d63a',
     mrkdwn_in: ['text'],
     fallback: 'Onboard',
     actions: cardTemplate.slack_remind,
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
   attachments.map(function(a) {
     a.mrkdwn_in = ['text'];
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
handlers['confirm_remind'] = function*(message, data) {
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
      msInFuture = determineLaterToday(now);
      dateDescrip = 'in a bit';
      break;
    case 'tomorrow':
      msInFuture = ONE_DAY;
      dateDescrip = 'tomorrow';
      break;
    case 'one_week':
      msInFuture = ONE_DAY * 7;
      dateDescrip = 'next week';
      break;
    case 'choose':
      msInFuture = ONE_DAY * 3; // 3 days for now
      dateDescrip = 'in a bit';
      break;
    default:
      break;
  }
  var messageText = (msInFuture > 0) ?
    `Ok, I'll talk to you ${dateDescrip}.` :
    'Ok! I won\'t set any reminders.';
  messageText += ' Thanks and have a great day. Type `help` if you\'re feeling a bit wobbly :)';

  if (msInFuture > 0) {
    var currentUser = yield db.Chatusers.findOne({
      id: message.source.user
    });
    var cronAttachments = [];
    cronAttachments.push({
      // image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
      text: 'Hey, it\'s me again. Ready to get started?'
    });
    cronAttachments.push({
      text: ' What are looking for?',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback: 'Onboard',
      actions: cardTemplate.slack_onboard_start,
      callback_id: 'none'
    })
    cronAttachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback: 'Onboard',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
    cronAttachments.map(function(a) {
      a.mrkdwn_in = ['text'];
      a.color = '#45a5f4';
    });
    var cronMsg = {
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'onboard',
      action: 'home',
      reply: cronAttachments
    }
    createCronJob([currentUser], cronMsg, team, new Date(msInFuture + now.getTime()));
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
  attachments.map(function(a) {
    a.mrkdwn_in = ['text'];
    a.color = '#45a5f4';
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
 var cart_id = message.cart_reference_id || message.source.team; 

 yield bundles.addBundleToCart(choice, message.user_id,cart_id)

 // var cart_id = message.source.team
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
    attachments.push(item_message);
   }
    var summaryText = `*Team Cart Summary*
    *Total:* ${cart.total}`;
    attachments.push({
      text: summaryText,
      mrkdwn_in: ['text', 'pretext'],
      color: '#49d63a'
    })
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
  
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var cartChannels = team.meta.cart_channels;
  var attachments = [];
  attachments.push({ 
    text: ''
  });
  var channels = yield utils.getChannels(team);
  var cartChannels = team.meta.cart_channels;
  var buttons = channels.map(channel => {
    var checkbox = cartChannels.find(id => { return (id == channel.id) }) ? '✓ ' : '☐ ';
      return {
        name: 'channel_btn',
        text: checkbox + channel.name ,
        type: 'button',
        value: channel.id
      }
  });
  attachments.push({text: 'Which channels do you want to include? ', actions: buttons, callback_id: "none"});
  attachments.push({
      text: '',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Onboard',
      actions: cardTemplate.slack_onboard_team,
      callback_id: 'none'
    });
  attachments.map(function(a) {
      a.mrkdwn_in =  ['text', 'fields'];
      a.color = '#45a5f4';
    });

  var msg = message;
  msg.mode = 'onboard';
  msg.action = 'home'
  msg.text = '';
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];

}

/**
 * S4A1 
 */
handlers['reminder'] = function (message) { 
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var attachments = [];
  attachments.push({
    text: 'Awesome! I\'ve let them know',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard'
  })
  attachments.push({
    text: 'Would you like to set a reminder for collecting shopping orders from your team?',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_reminder,
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

/**
 * S4A2
 */

handlers['confirm_reminder'] = function*(message, data) {
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
      msInFuture = determineLaterToday(now); //4 hours for now
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
  var attachments = [];
  attachments.push({
    text: messageText,
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard'
  });
  attachments.push({
    text: '',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Onboard',
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  });
  attachments.map(function(a) {
    a.mrkdwn_in = ['text'];
    a.color = '#45a5f4';
  });
  var msg = message;
  msg.mode = 'onboard'
  msg.action = 'home'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;

  if (msInFuture > 0) {
    var channelMembers = [];
    yield team.meta.cart_channels.map(function*(channel) {
      var members = yield utils.getChannelMembers(team, channel);
      if (channelMembers.length == 0) {
        channelMembers = members;
      } else {
        channelMembers = channelMembers.concat(_.differenceWith(channelMembers, members, (a, b) => a.id == b.id));
      }
    });
    var currentUser = yield db.Chatusers.findOne({
      id: message.source.user
    });
    var cronAttachments = [{
      "image_url": "http://kipthis.com/kip_modes/mode_teamcart_collect.png",
      "text": "",
      "mrkdwn_in": [
        "text",
        "pretext"
      ],
      "color": "#45a5f4"
    }];
    cronAttachments.push({
      text: `Hi, <@${currentUser.id}> is collecting Amazon orders`,
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback: 'Onboard',
      callback_id: 'none'
    });
    cronAttachments.map(function(a) {
      a.mrkdwn_in = ['text'];
      a.color = '#45a5f4';
    })
    var cronMsg = {
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'onboard',
      action: 'home',
      reply: cronAttachments
    }
    createCronJob(channelMembers, cronMsg, team, new Date(msInFuture + now.getTime()));
  }
  return [msg];
}


/**
 * S5
 */
handlers['member'] = function * (message) {
 var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var cartChannels = team.meta.cart_channels;
  var attachments = [];
  attachments.push({ 
    text: ''
  });
  var cartMembers = [];
  yield cartChannels.map(function * (cid) {
    let channelMembers = yield utils.getChannelMembers(cid);
    cartMembers = cartMembers.concat(channelMembers);
  });
  yield cartMembers.map( function * (m) {
        //Send onboarding stuff for each individual member
  });
}

/**
 * S6
 */
handlers['checkout'] = function * (message) {

 var cart_id = message.source.team
 var cart = yield kipcart.getCart(cart_id)
  var attachments = [];
  attachments.push({
    text: '',
    color: '#45a5f4',
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  });
  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    var item_message = {
      mrkdwn_in: ['text', 'pretext'],
      color: item.ASIN === '#7bd3b6',
      thumb_url: item.image
    }
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');
    var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
    item_message.text = [
      `*${i + 1}.* <${link}|${item.title}>`,
      `*Price:* ${item.price} each`,
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`
    ].filter(Boolean).join('\n');
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
      summaryText += `
   <${cart.link}|*➤ Click Here to Checkout*>`;
      attachments.push({
        text: summaryText,
        mrkdwn_in: ['text', 'pretext'],
        color: '#49d63a'
      })
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
 * catcher
 */
handlers['sorry'] = function * (message) {

 // kip.debug('\n\n\n  settings.js : 453 : could not understand message : ', message ,'\n\n\n')
   message.text = "Sorry, my brain froze!"
   message.mode = 'onboard';
   message.action = 'home';
   var attachments = [];
   attachments.push({
      text: 'Don’t have any changes? Type `exit` to quit settings',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
   message.reply = attachments;
   return [message];

}

function createCronJob(people, msg, team, date) {
  kip.debug('\n\n\nsetting cron job day: ', date.getSeconds() + ' ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), '\n\n\n');
  new cron.CronJob(date, function() {
      people.map(function(a) {
        msg.user_id = a.id;
        msg.user = a;
        msg.source = {
          team: team.team_id,
          channel: a.dm,
          user: a.id,
          type: "message",
          subtype:"bot_message"
        }
        var newMessage = new db.Message(msg);
        newMessage.save()
        queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
      });
    }, function() {
      console.log('just finished the scheduled update thing for team ' + team.team_id + ' ' + team.team_name);
      this.stop();
    },
    true,
    team.meta.weekly_status_timezone);
};

// based on the current time, determine a later time
function determineLaterToday(now) {
  var ONE_HOUR = 60*60*1000;
  if (now.getHours() < 12) return ONE_HOUR;
  else if (now.getHours() < 14) return ONE_HOUR * 2;
  else if (now.getHours() < 17) return (17 - now.getHours()) * ONE_HOUR;
  else return ONE_HOUR;
}
