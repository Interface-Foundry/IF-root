var handlers = module.exports = {};
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var dutils = require('../delivery.com/utils');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var kipcart = require('../cart');
var bundles = require('../bundles');
var processData = require('../process');
var request = require('request');
var rp = require('request-promise');
var Fuse = require('fuse.js');
var agenda = require('../agendas');

function * handle(message) {
  var last_action = _.get(message, 'history[0].action');
  let action = _.get(message,'action');
  let data;
  if ((!last_action || last_action.indexOf('home') == -1) && (action != 'start.supplies' && !action.includes('handoff') && !action.includes('remind_later'))) {
    kip.debug('\n\n\n🤖 action : ', 'start');
    return yield handlers['start'](message);
  } else {
    if (!message.data){
      action = 'text';
    } else {
      data = _.split(message.data.value, '.');
      action = data[0];
      data.splice(0,1);
    }
    kip.debug('\n\n\n🤖 action : ', action, 'data: ', data, ' 🤖\n\n\n');
    return yield handlers[action](message, data);
  }
}

module.exports.handle = handle;

/**
 * S1
 */
handlers['start'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  cancelReminder(message.source.user);
  var msg = message;
  msg.mode = 'onboard';
  msg.action = 'home';
  msg.reply = cardTemplate.onboard_home_attachments('tomorrow');
  msg.origin = message.origin;
  msg.source = message.source;
  msg.text = 'Ok, let\'s get started!';
  msg.fallback = 'Ok, let\'s get started!';
  return [msg];
};

handlers['remind_later'] = function*(message, data) {
  const ONE_DAY = 24 * 60 * 60 * 1000; // hours in a day * mins in hour * seconds in min * milliseconds in second
  let nextDate,
    msInFuture = -1,
    alertTime = data[0],
    now = new Date();
  switch (alertTime) {
    case 'tomorrow':
      msInFuture = ONE_DAY;
      nextDate = 'one_week';
      break;
    case 'one_week':
      msInFuture = ONE_DAY * 7;
      nextDate = 'two_week';
      break;
    case 'two_week':
      msInFuture = ONE_DAY * 14; // 3 days for now
      nextDate = 'tomorrow';
      break;
    default:
      break;
  }
  if (process.env.NODE_ENV.includes('development')) msInFuture = 20 * 1000; // 20 seconds for dev
  if (msInFuture > 0) {
    let cronMsg = {
      mode: 'onboard',
      action: 'home',
      reply: cardTemplate.onboard_home_attachments(nextDate),
      origin: message.origin,
      source: message.source,
      text: 'Hey, it\'s me again! Ready to get started?',
      fallback: 'Hey, it\'s me again! Ready to get started?'
    };
    scheduleReminder(cronMsg, message.source.user, new Date(msInFuture + now.getTime()));
  }

  let laterMsg = {
    text: 'Ok, I\'ll talk to you soon!',
    fallback: 'Ok, I\'ll talk to you soon!',
    history: message.history,
    attachments: [{
      text: '',
      callback_id: 'kip!',
      actions: [{
        'name': 'onboard.start.start_now',
        'text': '▶︎ Start Now',
        'style': 'primary',
        'type': 'button',
        'value': 'start_now.now'
      }]
    }]
  };
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(laterMsg)
  });
  return [];
};

handlers['start_now'] = function (message) {
  cancelReminder(message.source.user);
  let msg = {
    text: 'Ok, let\'s get started!',
    fallback: 'Ok, let\'s get started!',
    attachments: cardTemplate.onboard_home_attachments('tomorrow'),
    origin: message.origin,
    source: message.source,
    mode: 'onboard',
    action: 'home',
    history: message.history
  };
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify(msg)
  });
  return [];
};

/**
 * S2
 */
handlers['supplies'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var attachments = [];
  attachments.push({
      text: '*Step 1/3:* Choose a bundle:',
      mrkdwn_in: ['text'],
      color: '#A368F0',
      fallback:'Step 1/3: Choose a bundle',
      actions: cardTemplate.slack_onboard_bundles,
      callback_id: 'none'
    })
   var msg = message;
   msg.mode = 'onboard'
   msg.action = 'home'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   msg.fallback = 'Step 1/3: Choose a bundle'
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
    text: '*Step 2/3:* Let your team add items to the cart?',
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
    text: '',
    fallback:'Step 3/3: Choose the channels you want to include'
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

  attachments.push({text: '*Step 3/3:* Choose the channels you want to include: ', mrkdwn_in: ['text'],
    color: '#A368F0', actions: chunkedButtons[0], fallback:'Step 3/3: Choose the channels you want to include' , callback_id: "none"});
  chunkedButtons.forEach((ele, i) => {
    if (i != 0) {
      attachments.push({text:'', actions: ele, callback_id: 'none'});
    }
  })
  attachments.push({
      text: '',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback:'Step 3/3: Choose the channels you want to include',
      actions: cardTemplate.slack_onboard_team,
      callback_id: 'none'
    });

  var msg = message;
  msg.mode = 'onboard';
  msg.action = 'home'
  msg.text = '';
  msg.source.team = team.team_id;
  msg.fallback = 'Step 3/3: Choose the channels you want to include'
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];

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
      reply: cardTemplate.member_onboard_attachments(message.source.user, 'tomorrow'),
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
    yield newMessage.save();
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  });
  return handlers['handoff'](message);
};

handlers['handoff'] = function (message) {
  var slackreply = cardTemplate.home_screen(true);
  slackreply.text = 'That\'s it!\nHi! Thanks for using Kip :blush:';
  var msg = {
    action: 'simplehome',
    mode: 'food',
    source: message.source,
    origin: message.origin,
    reply: {
      data: slackreply
    }
  };
  return [msg];
};

/**
 * S6
 */
handlers['checkout'] = function * (message) {
 var cart_id = message.source.team;
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
          data = { lastAction: choice == 'more_info' ? 'bundle.more' : 'team.help'};
          if (data.lastAction == 'team.help') message.text = '';
          // kip.debug(' \n\n\n\n\ onboard:788:textHandler: sending data: ', data  ,'\n\n\n\n');
          return yield handlers[choice](message, data);
        }
        return yield handlers[choice](message);
      } catch (err) {
        return yield handlers['sorry'](message);
      }
    }
  } else {
    return yield handlers['sorry'](message);
  }
};

/**
 * catcher
 */
handlers['sorry'] = function*(message) {
  if (message.text.includes('amazon.com')) {
    return; // ignore times people paste stuff in
  }
  message.text = 'Sorry, my brain froze!';
  message.mode = 'onboard';
  message.action = 'home';
  return [message];
};

const scheduleReminder = function(msg, userId, date) {
  kip.debug('\n\n\nsetting reminder for ', date.toLocaleString(), '\n\n\n');
  agenda.schedule(date, 'onboarding reminder', {
    msg: JSON.stringify(msg),
    user: userId
  });
};

const cancelReminder = function(userId) {
  kip.debug(`canceling 'onboarding reminder' for ${userId}`)
  agenda.cancel({
    'name': 'onboarding reminder',
    'data.user': userId
  }, function(err, numRemoved) {
    if (!err) {
      kip.debug(`Canceled ${numRemoved} tasks`);
    } else {
      kip.debug(`Could not cancel task bc ${JSON.stringify(err, null, 2)}`);
    }
  });
};
