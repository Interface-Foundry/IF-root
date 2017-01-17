// bundle mode for admins
var handlers = module.exports = {};
var _ = require('lodash');
var utils = require('../slack/utils');
var cardTemplate = require('../slack/card_templates');
var kipcart = require('../cart');
var bundles = require('../bundles');
var shopping = require('./shopping')

function* handle(message) {
  let action;
  if (!message.data) {
    action = 'text';
  } else {
    var data = _.split(message.data.value, '.');
    action = data[0];
    data.splice(0, 1);
  }
  kip.debug('\n\n\n🤖 action : ', action, 'data: ', data, ' 🤖\n\n\n');
  return yield handlers[action](message, data);
}

handlers['home'] = function(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var attachments = [];
  attachments.push({
    text: 'Looking for some supplies? Pick a bundle below',
    mrkdwn_in: ['text'],
    color: '#A368F0',
    fallback: 'Looking for some supplies? Pick a bundle below',
    actions: cardTemplate.slack_bundles,
    callback_id: 'none'
  });
  attachments.push({
    'text': utils.randomStoreHint(),
    mrkdwn_in: ['text']
  });
  var msg = message;
  msg.mode = 'shopping';
  msg.action = 'switch.silent';
  msg.text = '';
  msg.source.team = team_id;
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  msg.fallback = 'Looking for some supplies? Pick a bundle below';
  return [msg];
};

handlers['bundle'] = function * (message, data) {
  let choice = data[0];
  let cart_id = message.cart_reference_id || message.source.team;
  yield utils.showLoading(message);
  yield bundles.addBundleToCart(choice, message.user_id, cart_id);
  let msg = message;
  msg.mode = 'cart';
  msg.action = 'view';
  msg.text = 'Ok, I added that to your cart!';
  msg.source.team = message.source.team;
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.data = yield kipcart.getCart(cart_id);
  msg.data = msg.data.toObject();
  yield utils.hideLoading(message);
  return [msg];
};

handlers['shopping_search'] = function*(message, data){
  let search = data[0];
  message.text = search;
  return yield shopping[_.get(message,'action')](message);
};

handlers['text'] = function*(message) {
  if (message.text.includes('bundle')) {
    return yield handlers['home'](message);
  } else {
    return yield handlers['shopping_search'](message, [message.text]);
  }
};

module.exports.handle = handle;