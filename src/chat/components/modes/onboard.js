var handlers = module.exports = {};
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var dutils = require('../delivery.com/utils');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var cron = require('cron');
var kipcart = require('../cart');
var bundles = require('../bundles');
var processData = require('../process');
var request = require('request');
var Fuse = require('fuse.js');
var tz = require('moment-timezone')

function * handle(message) {
  var last_action = _.get(message, 'history[0].action');
  if ((!last_action || last_action.indexOf('home') == -1) && (_.get(message,'action') != 'start.supplies')) {
    return yield handlers['start'](message);
  } else {
    if (!message.data){
      var action = 'text'
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
  var attachments = [];
  //adding onboard sticker
  attachments.push({
    // image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: 'Welcome to Kip!  We\'ll help you get started :)',
    fallback: 'Would you like a short tour?',
  });
  attachments.push({
      image_url: "http://tidepools.co/kip/kip_menu.png",
      text: 'Would you like a short tour?',
      fallback: 'Would you like a short tour?',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      actions: cardTemplate.slack_onboard_start,
      callback_id: 'none'
    })
  attachments.push({
      text: '',
      mrkdwn_in: ['text'],
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });

   var msg = message;
   msg.mode = 'onboard'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   msg.fallback = 'Let\'s get started!';
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
     color: '#45a5f4',
     mrkdwn_in: ['text'],
     fallback: 'Ok! When would you like to be reminded?',
     actions: cardTemplate.admin_reminder,
     callback_id: 'none'
   });
   attachments.push({
     text: '',
     mrkdwn_in: ['text'],
     fallback: 'Ok! When would you like to be reminded?',
     actions: cardTemplate.slack_onboard_default,
     callback_id: 'none'

   });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   msg.fallback = 'Ok! When would you like to be reminded?';
   return [msg];
 }

handlers['confirm_admin_reminder'] = function*(message, data) {
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
      msInFuture = determineLaterToday();
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
  messageText += ' Thanks and have a great day :)';

  if (msInFuture > 0) {
    var currentUser = yield db.Chatusers.findOne({
      id: message.source.user
    });
    var cronAttachments = [];
    cronAttachments.push({
      // image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
      text: 'Hey, it\'s me again. Ready to get started?',
      fallback: 'Hey, it\'s me again. Ready to get started?'
    });
    cronAttachments.push({
      image_url: "http://tidepools.co/kip/kip_menu.png",
      text: 'What are you looking for?',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback: 'What are you looking for?',
      actions: cardTemplate.slack_onboard_start,
      callback_id: 'none'
    })
    cronAttachments.push({
      text: '',
      mrkdwn_in: ['text'],
      fallback: 'What are you looking for?',
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
    var cronMsg = {
      mode: 'onboard',
      action: 'home',
      reply: cronAttachments,
      fallback: 'Hey, it\'s me again. Ready to get started?'
    }
    createCronJob([currentUser], cronMsg, team, new Date(msInFuture + now.getTime()));
  }
  var msg = message;
  var attachments = [];
  attachments.push({
    text: messageText,
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    fallback: messageText,
    callback_id: 'none'
  });
  attachments.push({
    text: '',
    mrkdwn_in: ['text'],
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  });
  msg.action = 'home'
  msg.mode = 'onboard'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  msg.fallback = messageText;
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
  var attachments = [];
  attachments.push({
      text: '*Step 1:* Choose a bundle:',
      mrkdwn_in: ['text'],
      color: '#A368F0',
      fallback:'Step 1: Choose a bundle',
      actions: cardTemplate.slack_onboard_bundles,
      callback_id: 'none'
    })
  attachments.push({
      text: '',
      mrkdwn_in: ['text'],
      actions: cardTemplate.slack_onboard_default,
      callback_id: 'none'
    });
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   msg.fallback = 'Step 1: Choose a bundle'
   return [msg];
}

handlers['lunch'] = function * (message) {
  var msg = message;
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var banner
  msg.mode = 'food'
  msg.action = 'begin'
  msg.source.team = team_id;
  msg.fallback = 'Add an address by tapping the \'New Location +\' button'
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.state = {};
  var foodSession = yield dutils.initiateDeliverySession(msg)
  yield foodSession.save();
  var addressButtons = _.get(team, 'meta.locations', []).map(a => {
    return {
      name: 'passthrough',
      text: a.address_1,
      type: 'button',
      value: JSON.stringify(a)
    }
  })
 //no addresses yet, show onboarding
  if(addressButtons.length < 1){
    foodSession.onboarding = true
    banner = false
    yield foodSession.save()
  }
  //if user taps < back button back to this view
  else if(foodSession.onboarding){
    foodSession.onboarding = true
    banner = false
  }
  //dont use onboarding for this session
  else {
    foodSession.onboarding = false
  }

  addressButtons = _.chunk(addressButtons, 5)
  var msg_json = {
    'attachments':
    [{
      'text': 'Great! Which address is this for?',
      'fallback': 'Great! Which address is this for?',
      'callback_id': 'address',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': addressButtons[0]
    }]
  }

  //modify message for onboarding
  if (foodSession.onboarding) {
    msg_json.attachments[0].text = '*Step 1.* Add an address for delivery by tapping the `New Location +` button'
    msg_json.attachments[0].fallback = 'Step 1: Add an address for delivery by tapping the `New Location +` button'
    msg_json.attachments[0].mrkdwn_in = ["text"]
    msg_json.attachments[0].color = '#A368F0'

    //add onboard sticker #1
    msg_json.attachments.unshift({
      'text':'Hi there, I\'m going to walk you through your first Kip Café order!',
      'fallback':'Hi there, I\'m going to walk you through your first Kip Café order!',
      'image_url':'http://tidepools.co/kip/welcome_cafe.png',
      'color': '#A368F0'
    })
  }

  if (banner) {
    msg_json.attachments.splice(0, 0,
      {
        'fallback': 'Kip Cafe',
        'title': '',
        'image_url': 'http://kipthis.com/kip_modes/mode_cafe.png'
      })
  }

  if (addressButtons.length > 1) {
    addressButtons.slice(1).map(group => {
      msg_json.attachments.push({
        'text': '',
        'fallback': 'Select address',
        'callback_id': 'address',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': group
      })
    })
  }

  //toggle floor buttons for onboarding
  var floorButtons = [{
    'name': 'passthrough',
    'text': 'New Location +',
    'type': 'button',
    'value': 'food.settings.address.new'
  }]

  if (foodSession.onboarding){
    floorButtons[0].style = 'primary'
    floorButtons.color = '#2ab27b'
  }

  // allow removal if more than one meta.locations thing
  // if (_.get(team, 'meta.locations').length > 1) {
  msg_json.attachments.push({
    'text': '',
    'fallback': 'Remove an address',
    'callback_id': 'remove_address',
    'attachment_type': 'default',
    'actions': floorButtons
  })

  if (foodSession.onboarding){
    //green New Location attachment
    msg_json.attachments[msg_json.attachments.length - 1].color = '#2ab27b'
  }

  if (_.get(team, 'meta.locations').length >= 1) {
    msg_json.attachments[msg_json.attachments.length - 1].actions.push({
      'name': 'passthrough',
      'text': 'Edit Locations',
      'type': 'button',
      'value': 'food.settings.address.remove_select'
    })
  }

  //add kip menu (should show options like Home screen view)
  msg_json.attachments[msg_json.attachments.length - 1].actions.push({
    'name': 'passthrough',
    'text': 'Home',
    'type': 'button',
    'value': 'food.exit.confirm'
  })

  msg.reply = msg_json;
  return [msg];

}

/**
 * S3
 */
handlers['bundle'] = function * (message, data) {
 var choice = data[0];
 var cart_id = message.cart_reference_id || message.source.team;
 yield utils.showLoading(message);
 yield bundles.addBundleToCart(choice, message.user_id,cart_id);

 // var cart_id = message.source.team
 var cart = yield kipcart.getCart(cart_id);
 // all the messages which compose the cart
 var attachments = [];

  attachments.push({
    text: 'Awesome! You added your first bundle.',
    fallback: 'Awesome! You added your first bundle.',
    color: '#45a5f4',
    // image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  });

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
      color: '#45a5f4'
    })
  attachments.push({
    text: '*Step 2:* Let your team add items to the cart?',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Onboard.helper',
    actions: cardTemplate.slack_onboard_basic,
    callback_id: 'none'
  });

   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home';
   msg.text = '';
   msg.source.team = message.source.team;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
  yield utils.hideLoading(message);
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
  var buttons = channels.map(channel => {
    var checkbox = cartChannels.find(id => { return (id == channel.id) }) ? '✓ ' : '☐ ';
      return {
        name: 'channel_btn',
        text: checkbox + channel.name,
        type: 'button',
        value: channel.id
      }
  });
  var chunkedButtons = _.chunk(buttons, 5);

  attachments.push({text: '*Step 3:* Choose the channels you want to include: ', mrkdwn_in: ['text'],
    color: '#A368F0', actions: chunkedButtons[0], fallback:'Step 3: Choose the channels you want to include' , callback_id: "none"});
  chunkedButtons.forEach((ele, i) => {
    if (i != 0) {
      attachments.push({text:'', actions: ele, callback_id: 'none'});
    }
  })
  attachments.push({
      text: '',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback:'Step 3: Choose the channels you want to include',
      actions: cardTemplate.slack_onboard_team,
      callback_id: 'none'
    });

  var msg = message;
  msg.mode = 'onboard';
  msg.action = 'home'
  msg.text = '';
  msg.source.team = team.team_id;
  msg.fallback = 'Step 3: Choose the channels you want to include'
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];

}

/**
 * S4A1
 */
handlers['reminder'] = function(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var attachments = [{
    text: 'Awesome! I\'ve let them know. ',
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    fallback: 'Step 4: Remind team members about shopping order collections'
  }];
  attachments.push({
    text: '*Step 4:* Remind team members about shopping order collections:',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    actions: cardTemplate.cart_reminder,
    callback_id: 'none'
  });
  attachments.push({
    text: '',
    mrkdwn_in: ['text'],
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none'
  });
  var msg = message;
  msg.mode = 'onboard'
  msg.action = 'home'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  msg.fallback = 'Step 4: Remind team members about shopping order collections'
  return [msg];
}

/**
 * S4A2
 */

handlers['confirm_cart_reminder'] = function*(message, data) {
  let team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  let team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();

  let dateDescrip,
    cronTime = {},
    alertTime = data[0],
    now = new Date(Date.now().toLocaleString('en-US', { timeZone: 'America/New_York' }));

  switch (alertTime) {
    case 'daily':
      cronTime = {
        day: '1-5',
        date: '*',
        hour: now.getHours(),
        minutes: now.getMinutes()
      }
      dateDescrip = `at *${now.getHours() < 13 ? now.getHours() : now.getHours() - 12}:${now.getMinutes() < 10? '0' + now.getMinutes(): now.getMinutes()} ${now.getHours() < 12 ? 'AM' : 'PM'}* every day`;
      break;
    case 'weekly':
      cronTime = {
        day: now.getDay(),
        hour: now.getHours(),
        minutes: now.getMinutes(),
        date: '*'
      }
      team.meta.weekly_status_day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      dateDescrip = `every *${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]}* at *${now.getHours() < 13 ? now.getHours() : now.getHours() - 12}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()} ${now.getHours() < 12 ? 'AM' : 'PM'}*`;
      break;
    case 'monthly':
      cronTime = {
        day: '*',
        date: now.getDate(),
        hour: now.getHours(),
        minutes: now.getMinutes()
      }
      team.meta.weekly_status_date = now.getDate();
      dateDescrip = `on day *${now.getDate()}* of every month at *${now.getHours() < 13 ? now.getHours() : now.getHours() - 12}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()} ${now.getHours() < 12 ? 'AM' : 'PM'}*`;
      break;
    case 'never':
    default:
      break;
  }

  team.meta.status_interval = alertTime;
  team.meta.weekly_status_timezone = 'America/New_York';
  team.meta.weekly_status_enabled = (dateDescrip) ? true : false;
  team.meta.weekly_status_time = `${now.getHours() < 13 ? now.getHours() : now.getHours() - 12}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()} ${now.getHours() < 12 ? 'AM' : 'PM'}`
  yield team.save();
  if (dateDescrip) {
    yield utils.setCron(message, {}, cronTime)
  }
  var messageText = (dateDescrip) ?
    `Ok, your team will get reminders ${dateDescrip}.\nAdmins can always edit reminders in Settings` :
    'Ok! I won\'t set any reminders. If you ever want them, you can turn them on in Settings';
  messageText += '\n Thanks and have a great day :)';
  var attachments = [{
    image_url: "http://tidepools.co/kip/kip_menu.png",
    text: 'Click a mode to start using Kip',
    color: '#3AA3E3',
    callback_id: 'wow such home',
    actions: [{
      name: 'passthrough',
      value: 'food',
      text: 'Kip Café',
      type: 'button'
    }, {
      name: 'passthrough',
      value: 'shopping',
      text: 'Kip Store',
      type: 'button'
    }]
  }];

  var msg = {
    text: messageText,
    action: 'home',
    mode: 'onboard',
    source: message.source,
    origin: message.origin,
    reply: attachments,
    fallback: messageText.replace('*', '')
  }
  return [msg];
}

var createCartMsg = function*(message) {
  var cart_id = message.source.team,
    cart = yield kipcart.getCart(cart_id),
    attachments = [{
      text: 'Ready to check out? Here\'s your team cart!',
      color: '#A368F0'
    }];
  attachments.push({
    text: '',
    color: '#45a5f4',
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
  });
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
  summaryText += `
   <${cart.link}|*➤ Click Here to Checkout*>`;
  attachments.push({
    text: summaryText,
    mrkdwn_in: ['text', 'pretext'],
    color: '#49d63a'
  })

  var msg = message;
  msg.mode = 'shopping'
  msg.action = 'switch.silent';
  msg.text = ''
  msg.source.team = message.source.team;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return msg;
}

/**
 * S5
 */
handlers['member'] = function*(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null)
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();
  var channelMembers = [];
  yield team.meta.cart_channels.map(function*(channel) {
    var members = yield utils.getChannelMembers(team, channel);
    channelMembers = channelMembers.concat(members);
  });
  channelMembers = _.uniqBy(channelMembers, a => a.id);

  var attachments = [{
    'image_url': 'http://kipthis.com/kip_modes/mode_howtousekip.png',
    'text': '',
    'mrkdwn_in': [
      'text',
      'pretext'
    ],
    'color': '#45a5f4'
  }, {
    text: `Make <@${message.source.user}>'s life easier! Let me show you how to add items to the team cart`,
    mrkdwn_in: ['text'],
    fallback: 'Welcome to Kip!',
    callback_id: 'none',
    actions: cardTemplate.slack_onboard_member,
    color: '#45a5f4'
  }];

  yield channelMembers.map(function * (a) {
    if (a.id == message.source.user) return;
    var newMessage = new db.Message({
      text: '',
      incoming: false,
      thread_id: a.dm,
      origin: 'slack',
      mode: 'member_onboard',
      fallback: `Make <@${message.source.user}>'s life easier! Let me show you how to add items to the team cart`,
      action: 'home',
      reply: attachments,
      source: {
        team: team.team_id,
        channel: a.dm,
        user: a.id,
        type: 'message',
        subtype: 'bot_message'
      },
      user: a,
      user_id: a.id
    });
    yield newMessage.save()
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  });
  return handlers['reminder'](message);
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
   msg.fallback = 'Here\'s your cart' 
   msg.source.team = message.source.team;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];
}


/**
 * Handle user input text
 */
handlers['text'] = function * (message) {
  var history = yield db.Messages.find({thread_id: message.source.channel}).sort('-ts').limit(10);
  var lastMessage = history[1];
  var choices = _.flatten(lastMessage.reply.map( m => { return m.actions }).filter(function(n){ return n != undefined }))
  if (!choices) { return kip.debug('error: lastMessage: ', choices); }
  var fuse = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.4,
    keys: ["text"]
  })
  var matches = yield fuse.search(message.text)
  var choice;
  if (matches.length > 0) {
    choice = matches[0].text == 'Help' ? 'help' : matches[0].value;
    if (choice.indexOf('.') > -1) {
      var handle = choice.split('.')[0];
      var data = [choice.split('.')[1]];
      return yield handlers[handle](message, data);
    } else {
      try {
        if (choice == 'more_info' || choice == 'help') {
          var data = { lastAction: choice == 'more_info' ? 'bundle.more' : 'team.help'};
          if (data.lastAction == 'team.help') message.text = '';
          // kip.debug(' \n\n\n\n\ onboard:788:textHandler: sending data: ', data  ,'\n\n\n\n');
          return yield handlers[choice](message, data);
        }
        return yield handlers[choice](message);
      } catch(err) {
        return yield handlers['sorry'](message);
      }
    }
  } else {
    return yield handlers['sorry'](message);
  }
}



/**
 * catcher
 */
handlers['sorry'] = function*(message) {
  if(message.text.includes('amazon.com')){
    return; //ignore times people paste stuff in
  }
  message.text = "Sorry, my brain froze!"
  message.mode = 'onboard';
  message.action = 'home';
  var attachments = [];
  attachments.push({
    text: 'Don’t have any changes? Type `exit` to quit settings',
    mrkdwn_in: ['text'],
    fallback: 'Sorry!',
    actions: cardTemplate.slack_onboard_default,
    callback_id: 'none',
    color: '#45a5f4'
  });
  message.reply = attachments;

  return [message];

}

/**
 * send_replace home button
 */
handlers['home_btn'] = function * (message) {
   var actions = cardTemplate.slack_onboard_home;
   var team = yield db.Slackbots.findOne({'team_id': message.source.team}).exec();
   var isAdmin = team.meta.office_assistants.find( u => { return u == message.source.user });
   if (!isAdmin) actions.splice(_.findIndex(actions, function(e) {return e.name == 'team'}),1);
    var json = message.source.original_message;
    json.attachments[json.attachments.length-1] = {
        fallback: 'onboard',
        callback_id: 'onboard',
        actions: actions
    }
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
    return
}

/**
 * send_replace back button
 */
handlers['back_btn'] = function * (message) {
   var actions = cardTemplate.slack_onboard_default;
   var team = yield db.Slackbots.findOne({'team_id': message.source.team}).exec();
   var isAdmin = team.meta.office_assistants.find( u => { return u == message.source.user });
   if (!isAdmin) actions.splice(_.findIndex(actions, function(e) {return e.name == 'team'}),1);
    var json = message.source.original_message;
    json.attachments[json.attachments.length-1] = {
        callback_id: 'onboard',
        actions: cardTemplate.slack_onboard_default
    }
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
    return
}

/**
 * more info / help handler
 */
handlers['more_info'] = function * (message, data) {
   var history = yield db.Messages.find({thread_id: message.source.channel}).sort('-ts').limit(10);
   var last_message = history[0];
   var lastAction = _.get(data,'lastAction') ? _.get(data,'lastAction') : _.get(last_message,'action') ?  _.get(last_message,'action') : 'team.help';
   var helpText;
   var helpOptions;
   switch(lastAction) {
    case 'bundle.more':
      helpText = `Selecting 'Yes' will allow you to choose which channels to add to this order.
  Or simply checkout your items by selecting 'No'`
      helpOptions = cardTemplate.slack_onboard_basic
      break
    case 'team.help':
      helpText = `Kip will direct message members in each selected channel to help them add items to the cart!`
      helpOptions = cardTemplate.slack_onboard_team
      break
   }

   message.text = "";
   message.fallback = 'More Info'
   message.mode = 'onboard';
   message.action = 'home';
   var attachments = [];
   attachments.push({
      text: helpText,
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback: helpText,
      actions: helpOptions,
      callback_id: 'none'
    });
   message.reply = attachments;
   return [message];

}
const createCronJob = function(people, msg, team, date, onRun) {
  kip.debug('\n\n\nsetting cron job: ', date.getSeconds() + ' ' + date.getMinutes() + ' ' + date.getHours() + ' ' + date.getDate() + ' ' + date.getMonth() + ' ' + date.getDay(), '\n\n\n');
  new cron.CronJob(date, function() {
    people.map(function(a) {
      var newMessage = new db.Message({
        incoming: false,
        thread_id: a.dm,
        resolved: true,
        user_id: a.id,
        origin: 'slack',
        text: '',
        source: {
          team: team.team_id,
          channel: a.dm,
          thread_id: a.dm,
          user: a.id,
          type: 'message',
        },
        reply: msg.reply,
        mode: msg.mode,
        action: msg.action,
        user: a.id
      })
      co(publish(newMessage));
    });
    this.stop();
    if (onRun) { // run another function
      onRun(new Date());
    }
  },
  function() {
    kip.debug('just finished the scheduled update thing for team ' + team.team_id + ' ' + team.team_name);
  }, true, team.meta.weekly_status_timezone);
};
// based on the current time, determine a later time
const determineLaterToday = function() {
  const ONE_HOUR = 60 * 60 * 1000;
  if (process.env.NODE_ENV.includes('development')) return 20 * 1000; //20 seconds for dev
  else return ONE_HOUR;
}

function * publish (message) {
  yield message.save();
  queue.publish('outgoing.' + message.origin, message, message._id + '.reply.update');
}
