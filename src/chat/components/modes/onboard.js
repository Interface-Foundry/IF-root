var handlers = module.exports = {};
var _ = require('lodash');
var utils = require('../slack/utils');
var dutils = require('../delivery.com/utils');
var queue = require('../queue-direct');
var cardTemplate = require('../slack/card_templates');
var kipcart = require('../cart');
var bundles = require('../bundles');
var processData = require('../process');
var request = require('request');
var Fuse = require('fuse.js');
var agenda = require('../agendas');
var amazon = require('../amazon_search.js');

function * handle(message) {
  let action = message.action;
  if (!message.data && message.text && message.text !== 'onboard') {
    action = 'text';
  } else if (!message.data) {
    action = 'start';
  } else {
    var data = _.split(message.data.value, '.');
    action = data[0];
    data.splice(0, 1);
  }
  kip.debug('\n\n\n🤖 action : ', action, 'data: ', data, ' 🤖\n\n\n');
  return yield handlers[action](message, data);
}

module.exports.handle = handle;

/**
 * S1
 */
handlers['start'] = function * (message) {
  var user = yield db.Chatusers.findOne({
    id: message.source.user
  }).exec();
  let msg = message;
  if (!user.admin_shop_onboarded) {
    let couponText = yield utils.couponText(message.source.team);
    msg.mode = 'onboard';
    msg.action = 'home';
    msg.reply = cardTemplate.onboard_home_attachments('initial', couponText);
    msg.origin = message.origin;
    msg.source = message.source;
    msg.text = 'Ok, let\'s get started!';
    msg.fallback = 'Ok, let\'s get started!';
    var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
    if (team_id == null) {
      return kip.debug('incorrect team id : ', message);
    }
    var team = yield db.Slackbots.findOne({
      team_id: team_id
    }).exec();
    let msInFuture =60 * 60 * 1000; // if in dev, 20 seconds
    let now = new Date();
    let cronMsg = {
      mode: 'onboard',
      action: 'home',
      reply: cardTemplate.onboard_home_attachments('tomorrow', couponText),
      origin: message.origin,
      source: message.source,
      text: 'Hey, it\'s me again! Ready to get started?',
      fallback: 'Hey, it\'s me again! Ready to get started?'
    };
    scheduleReminder(
      'initial reminder',
      new Date(msInFuture + now.getTime()), {
        msg: JSON.stringify(cronMsg),
        user: message.source.user,
        token: team.bot.bot_access_token,
        channel: message.source.channel
      });
  } else {
    let attachments = [{
      text: 'Looks like you\'ve done this before! :blush:\nIf you need a refresher, I can give you some help though',
      mrkdwn_in: ['text'],
      color: '#A368F0',
      callback_id: 'take me home pls',
      actions: [{
        'name': 'onboard.restart',
        'text': 'Refresh Me',
        'style': 'primary',
        'type': 'button',
        'value': 'restart'
      }, {
        name: 'passthrough',
        text: 'Home',
        style: 'default',
        type: 'button',
        value: 'home'
      }]
    }];
    msg = message;
    msg.mode = 'onboard';
    msg.action = 'home';
    msg.text = '';
    msg.fallback = 'Looks like you\'ve done this before!';
    msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
    msg.reply = attachments;
  }
  return [msg];
};

handlers['restart'] = function * (message) {
  var user = yield db.Chatusers.findOne({
    id: message.source.user
  }).exec();
  user.admin_shop_onboarded = false;
  yield user.save();
  return yield handlers['start'](message);
};

handlers['remind_later'] = function * (message, data) {
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
  // if (process.env.NODE_ENV.includes('development')) msInFuture = 20 * 1000; // 20 seconds for dev
  let couponText = yield utils.couponText(message.source.team);
  if (msInFuture > 0) {
    let cronMsg = {
      mode: 'onboard',
      action: 'home',
      reply: cardTemplate.onboard_home_attachments(nextDate, couponText),
      origin: message.origin,
      source: message.source,
      text: 'Almost there...! :)',
      fallback: 'Almost there...! :)'
    };
    scheduleReminder(
    'onboarding reminder',
    new Date(msInFuture + now.getTime()), {
      msg: JSON.stringify(cronMsg),
      user: message.source.user
    });
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

handlers['start_now'] = function * (message) {
  cancelReminder('onboarding reminder', message.source.user);
  let couponText = yield utils.couponText(message.source.team);
  let msg = {
    text: 'Ok, let\'s get started!',
    fallback: 'Ok, let\'s get started!',
    attachments: cardTemplate.onboard_home_attachments('tomorrow', couponText),
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
  cancelReminder('initial reminder', message.source.user);
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var user = yield db.Chatusers.findOne({
    id: message.source.user
  }).exec();
  user.admin_shop_onboarded = true;
  user.markModified('admin_shop_onboarded');
  yield user.save();
  var attachments = [];
  attachments.push({
    text: '*Step 1/3:* Choose a pre-packaged bundle:',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Step 1/3: Choose a pre-packaged bundle',
    callback_id: 'none'
  });
  attachments = attachments.concat(cardTemplate.slack_bundles(true));
  attachments.push({
    'text': '✎ Hint: You can also search what you want below (Example: _MacBook Pro Power Cord_)',
    mrkdwn_in: ['text']
  });
  var msg = message;
  msg.mode = 'onboard'
  msg.action = 'home'
  msg.text = ''
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  msg.fallback = 'Step 1/3: Choose a bundle'
  return [msg];
};

handlers['shopping_search'] = function*(message, data) {
  let team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null),
    query = data[0],
    json = message.source.original_message ? message.source.original_message : {
      attachments: []
    };
  let searchMsg = utils.randomSearching();
  json.attachments = [...json.attachments, {
    'text': searchMsg,
    mrkdwn_in: ['text']
  }];
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(json)
    });
  } else {
    var newMessage = new db.Message({
      text: searchMsg,
      incoming: false,
      thread_id: message.thread_id,
      origin: 'slack',
      mode: 'member_onboard',
      fallback: searchMsg,
      action: 'home',
      source: message.source
    });
    yield newMessage.save();
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  }
  var results = yield amazon.search({
    query: query
  }, message.origin);

  if (results == null || !results) {
    kip.debug('-1');
    return new db.Message({
      incoming: false,
      thread_id: message.thread_id,
      resolved: true,
      user_id: 'kip',
      origin: message.origin,
      source: message.source,
      text: 'Oops! Sorry my brain froze!'
    });
  }

  message._timer.tic('done with amazon_search');

  var msg = message;
  msg.resolved = true;
  msg.incoming = false;
  msg.mode = 'onboard';
  msg.action = 'results';
  msg.exec = {
    mode: 'onboard',
    action: 'shopping_search',
    params: {
      query: query
    }
  };
  msg.text = '';
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.amazon = JSON.stringify(results);
  msg.original_query = results.original_query;
  msg.reply = [{
    text: 'Here are some results, try adding one to your cart!',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Here are some results, try adding one to your cart!'
  }];
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify(message.source.original_message)
    });
  }
  return [msg];
};

handlers['lunch'] = function * (message) {
  cancelReminder('initial reminder', message.source.user);
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

  addressButtons = _.chunk(addressButtons, 5);
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
 yield bundles.addBundleToCart(choice, message.user_id, cart_id);

 // var cart_id = message.source.team
 var cart = yield kipcart.getCart(cart_id);
 // all the messages which compose the cart
 var attachments = [];
  for (var i = 0; i < cart.aggregate_items.length; i++) {
    var item = cart.aggregate_items[i];
    // the slack message for just this item in the cart list
    var item_message = {
      mrkdwn_in: ['text', 'pretext'],
      color: '#45a5f4',
      thumb_url: item.image,
      fallback: 'Thanks for adding your first items to the cart!'
    }
    // multiple people could have added an item to the cart, so construct a string appropriately
    var userString = item.added_by.map(function(u) {
      return '<@' + u + '>';
    }).join(', ');
    var link = yield processData.getItemLink(item.link, message.source.user, item._id.toString());
    // make the text for this item's message
    item_message.text = [
      `<${link}|${item.title}>`,
      `*Price:* ${item.price} each`,
      `*Added by:* ${userString}`,
      `*Quantity:* ${item.quantity}`,

    ].filter(Boolean).join('\n');
    // add the item actions if needed
    item_message.callback_id = item._id.toString();
    attachments.push(item_message);
   }
  var summaryText = `*Total:* ${cart.total}`;
  attachments.push({
    text: summaryText,
    mrkdwn_in: ['text', 'pretext'],
    color: '#45a5f4',
    fallback: 'Thanks for adding your first items to the cart!'
  });
  attachments.push({
    text: '*Step 2/3* Thanks for adding your first items to the cart!',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Thanks for adding your first items to the cart!',
    actions: cardTemplate.slack_onboard_basic,
    callback_id: 'cart_onboard_head'
  });

  var msg = message;
  msg.mode = 'onboard'
  msg.action = 'home';
  msg.text = '';
  msg.fallback = 'Thanks for adding your first items to the cart!';
  msg.source.team = message.source.team;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  yield utils.hideLoading(message);
  return [msg];
}

handlers['addcart'] = function*(message, data) {
  // taken from modes/shopping.js
  var raw_results = (message.flags && message.flags.old_search) ? JSON.parse(message.amazon) : yield getLatestAmazonResults(message);
  var results = (typeof raw_results == 'array' || typeof raw_results == 'object') ? raw_results : JSON.parse(raw_results);

  var cart_id = (message.source.origin == 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO make this available for other platforms
  // Diverting team vs. personal cart based on source origin for now
  var cart_type = message.source.origin == 'slack' ? 'team' : 'personal';
  try {
    yield kipcart.addToCart(cart_id, message.user_id, results[data[0] - 1], cart_type)
  } catch (e) {
    kip.err(e);
    return text_reply(message, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊')
  }

  // view the cart
  return yield handlers['cart'](message);
};

// modified version of modes/shopping.js
handlers['cart'] = function * (message) {
  let attachments = [{
    text: '*Step 2/3* Thanks for adding your first items to the cart!',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Thanks for adding your first items to the cart!',
    actions: cardTemplate.slack_onboard_basic,
    callback_id: 'cart_onboard_head'
  }];
  let msg = message;
  msg.mode = 'shopping';
  msg.action = 'onboard_cart';
  msg.text = '';
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;

  var cart_reference_id = (message.source.origin === 'facebook') ? message.source.org : message.cart_reference_id || message.source.team; // TODO
  msg.data = yield kipcart.getCart(cart_reference_id);
  msg.data = msg.data.toObject();
  return [msg];
};


/**
 * S4
 */
handlers['team'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message, 'source.team.id') : null )
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  team.meta.collect_from = 'channel';
  team.markModified('meta.collect_from');
  yield team.save();
  let attachments = [{
    text: '*Step 3/3:* Pass the word! I’ll show your team how to add items to the cart\nChoose the groups you would like to include:',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    actions: [{
      name: 'collect_select',
      text: (team.meta.collect_from === 'all' ? '◉' : '○') + ' Everyone',
      type: 'button',
      value: 'everyone'
    }, {
      name: 'collect_select',
      text: (team.meta.collect_from === 'me' ? '◉' : '○') + ' Just Me',
      type: 'button',
      value: 'justme'
    }, {
      name: 'collect_select',
      text: (team.meta.collect_from === 'channel' ? '◉' : '○') + ' By Channel',
      type: 'button',
      value: 'channel'
    }],
    fallback: 'Which group members would you like to collect orders from?',
    callback_id: 'none'
  }];

  if (team.meta.collect_from === 'channel') {
    let channelSection = {
      text: '',
      callback_id: 'channel_buttons_idk',
      actions: [{
        name: 'channel_btn',
        text: 'Pick Channel',
        type: 'select',
        data_source: 'channels'
      }]
    };
    attachments.push(channelSection);
  }

  attachments.push({
    text: '',
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    fallback: 'yolo',
    actions: cardTemplate.slack_onboard_team,
    callback_id: 'onboard_team'
  });

  var msg = message;
  msg.mode = 'onboard';
  msg.action = 'home';
  msg.text = '';
  msg.source.team = team.team_id;
  msg.fallback = 'Step 3/3: Pass the word! I’ll show your team how to add items to the cart\nChoose the groups you would like to include';
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
  let channelMembers = [];
  switch (team.meta.collect_from) {
    case 'channel':
      yield team.meta.cart_channels.map(function*(channel) {
        var members = yield utils.getChannelMembers(team, channel);
        channelMembers = channelMembers.concat(members);
      });
      break;
    case 'me':
      break;
    case 'all':
      channelMembers = yield utils.getTeamMembers(team);
      break;
  }
  channelMembers = _.uniqBy(channelMembers, a => a.id);
  yield channelMembers.map(function * (a) {
    let isAdmin = yield utils.isAdmin(a.id, team);
    let isMemberOnboarded = a.member_shop_onboarded;
    if (isAdmin || isMemberOnboarded) return; // don't send this to admins
    a.member_shop_onboarded = true;
    a.markModified('member_shop_onboarded');
    yield a.save();
    var newMessage = new db.Message({
      text: '',
      incoming: false,
      thread_id: a.dm,
      origin: 'slack',
      mode: 'member_onboard',
      fallback: `Make <@${message.source.user}>'s life easier! Let me show you how to add items to the team cart`,
      action: 'home',
      reply: cardTemplate.member_onboard_attachments(message.source.user, a.id, 'initial'),
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
    // let msInFuture = (process.env.NODE_ENV.includes('development') ? 20 : 60 * 60) * 1000; // if in dev, 20 seconds
    let now = new Date();
    let cronMsg = {
      text: 'Hey, it\'s me again! Ready to get started?',
      incoming: false,
      thread_id: a.dm,
      origin: 'slack',
      mode: 'member_onboard',
      fallback: 'Hey, it\'s me again! Ready to get started?',
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
    }
    scheduleReminder(
      'initial reminder',
      new Date(msInFuture + now.getTime()), {
        msg: JSON.stringify(cronMsg),
        user: cronMsg.source.user,
        token: team.bot.bot_access_token,
        channel: cronMsg.source.channel
      });
  });
  return handlers['handoff'](message);
};

handlers['handoff'] = function(message) {
  let attachments = [{
    text: 'We did it!\nI think I\'m getting the hang of this :blush:',
    mrkdwn_in: ['text'],
    image_url: 'http://tidepools.co/kip/oregano/success.gif',
    color: '#A368F0',
    fallback: 'We did it!\nI think I\'m getting the hang of this :blush:',
    callback_id: 'take me home pls',
    actions: [{
      'name': 'passthrough',
      'text': ':tada:\u00A0 Finish',
      'style': 'primary',
      'type': 'button',
      'value': 'home'
    }, {
      name: 'view_cart_btn',
      text: '⁂ View Cart',
      style: 'default',
      type: 'button',
      value: 'view_cart_btn'
    }]
  }];
  let msg = message;
  msg.mode = 'onboard';
  msg.action = 'home';
  msg.text = '';
  msg.fallback = 'We did it!\nI think I\'m getting the hang of this :blush:';
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
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
  var history = yield db.Messages.find({
    thread_id: message.source.channel
  }).sort('-ts').limit(10);
  var lastMessage = history[1];
  var choices = _.flatten(lastMessage.reply.map( m => { return m.actions }).filter(function(n){ return n != undefined }))
  if (!choices) { return kip.debug('error: lastMessage: ', choices); }
  var team_id = message.source.team;
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var channelSelection = false;
  var channelsToAdd = [];
  message.text = message.text.trim();
  if (message.text.toLowerCase() === 'me' || message.text.includes('@')) {
    return yield handlers['start'](message, [message.text]);
  }
  if (_.get(choices,'[0].name') == 'collect_select') {
      team.meta.collect_from = 'channel';
      channelSelection = true;
      if (message.text.indexOf(' ') > -1) {
        var segments = message.text.split(/[\s ]+/);
          segments.forEach( (m) => {
            if (m.indexOf('|') > -1) m = m.split('|')[1];
            m = m.replaceAll('#','');
            m = m.replaceAll('<','');
            m = m.replaceAll('|','');
            m = m.replaceAll('>','');
            channelsToAdd.push(m);
          })
        } else {
          if (message.text.indexOf('|') > -1) message.text = message.text.split('|')[1];
          message.text = message.text.replaceAll('#','');
          message.text = message.text.replaceAll('<','');
          message.text = message.text.replaceAll('|','');
          message.text = message.text.replaceAll('>','');
        }
    }
  var channels = yield utils.getChannels(team);
  channels = channels.map(channel => {
    return  {
      "value": channel.id,
      "type": "button",
      "text": channel.name,
      "name": "channel_btn"
    }
  });
  choices = choices.concat(channels);
  choices = _.uniq(choices);
  choices = choices.map( (choice) => {
    if (choice.text && (choice.text.indexOf('☐') > -1 || choice.text.indexOf('✓') > -1)) {
        choice.text = choice.text.replace('☐','');
        choice.text = choice.text.replace('✓','');
        choice.text = choice.text.trim();
     }
    return choice;
  })
  choices = choices.filter((c) => {
    return c.name == 'channel_btn'
  });
  var fuse = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.6,
    keys: ["text"]
  });
  var matches = [];
  if(channelsToAdd.length > 0) {
    yield channelsToAdd.map( function * (text) {
      var m = yield fuse.search(text);
      if (_.get(m,'[0].value')) { matches.push(_.get(m,'[0].value')); } 
    })
  } else {
    matches = yield fuse.search(message.text);
  }

  if (matches.length > 0) {
    choice = matches[0].value;
    if (channelSelection) {
      if (channelsToAdd.length > 0) {
          matches.map( (selectedChannel) => {
            if (team.meta.cart_channels.find(id => { return (id == selectedChannel) })) {
              _.remove(team.meta.cart_channels, function(c) { return c.trim() == selectedChannel.trim() });
            } else {
              team.meta.cart_channels.push(selectedChannel);
            }
            return 
         })
      } else {
         if (team.meta.cart_channels.find(id => { return (id == matches[0].value) })) {
            _.remove(team.meta.cart_channels, function(c) { return c == matches[0].value });
          } else {
            team.meta.cart_channels.push(matches[0].value);
        }
      }
      team.markModified('meta.cart_channels');
      yield team.save();
      return yield handlers['team'](message);
    }
    else if (matches[0].value.indexOf('.') > -1) {
      var handle = matches[0].value.split('.')[0];
      var data = [matches[0].value.split('.')[1]];
      return yield handlers[handle](message, data);
    } 
    else {
      try {
        kip.debug(`Trying handlers[${matches[0].value}](${message})`);
        return yield handlers[matches[0].value](message);
      } catch (err) {
        return yield handlers['shopping_search'](message, [message.text]);
      }
    }
  }  else {
    return yield handlers['shopping_search'](message, [message.text]);
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

const scheduleReminder = function(type, time, data) {
  kip.debug('\n\n\nsetting reminder for ', time.toLocaleString(), '\n\n\n');
  agenda.schedule(time, type, data);
};

const cancelReminder = function(type, userId) {
  kip.debug(`canceling ${type} for ${userId}`);
  agenda.cancel({
    'name': type,
    'data.user': userId
  }, function(err, numRemoved) {
    if (!err) {
      kip.debug(`Canceled ${numRemoved} tasks`);
    } else {
      kip.debug(`Could not cancel task bc ${JSON.stringify(err, null, 2)}`);
    }
  });
};

// stolen from modes/shopping.js
//
// Returns the amazon results as it is stored in the db (json string)
// Recalls more history from the db if it needs to, and the history is just appended
// to the existing history so you don't need to worry about stuff getting too messed up.
//
function * getLatestAmazonResults(message) {
  var results, i = 0;
  while (!results) {
    if (!message.history[i]) {
      var more_history = yield db.Messages.find({
        thread_id: message.thread_id,
        ts: {
          $lte: message.ts
        }
      }).sort('-ts').skip(i).limit(20);

      if (more_history.length === 0) {
        throw new Error('Could not find amazon results in message history for message ' + message._id)
      }

      message.history = message.history.concat(more_history);
    }

    try {
      results = JSON.parse(message.history[i].amazon);
      results[0].ASIN[0]; // check to make sure there is an actual result
    } catch (e) {
      results = false;
      // welp no results here.
    }

    i++;
  }
  return results;
}

// from modes/shopping.js
// get a simple text message
function text_reply(message, text) {
  var msg = default_reply(message);
  msg.text = text;
  msg.execute = msg.execute ? msg.execute : [];
  msg.execute.push({
    mode: 'banter',
    action: 'reply',
  });
  return msg
}

// from modes/shopping.js
// I'm sorry i couldn't understand that
function default_reply(message) {
  return new db.Message({
    incoming: false,
    thread_id: message.thread_id,
    resolved: true,
    user_id: 'kip',
    origin: message.origin,
    text: "I'm sorry I couldn't quite understand that",
    source: message.source
  });
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
