// Introduces non-admins to the process of adding items to the cart
var handlers = module.exports = {};
var _ = require('lodash');
var cardTemplate = require('../slack/card_templates');
var winston = require('winston');
var utils = require('../slack/utils.js');
var Fuse = require('fuse.js');
var queue = require('../queue-direct');
var agenda = require('../agendas');

winston.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/**
 * Handles requests send to collect
 * @param {Message} message       the message that led to this being shown
 * @yield {[Message]} an array of messages
 */
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

module.exports.handle = handle;

/**
 * Shows the main collection page to admins
 * @param {Message} message       the message that led to this being shown
 * @yield {[Message]} an array of messages
 */
handlers['initial'] = function*(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();
  yield utils.getTeamMembers(team);

  let attachments = [{
    text: '*Collect Supply Orders from Team* \n I\'ll send Direct Messages to each user in the selected channel:',
    mrkdwn_in: ['text'],
    color: '#45a5f4',
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
  let okButtonText = '';
  if (team.meta.collect_from === 'me') {
    okButtonText = '✔ Start Shopping';
  } else {
    okButtonText = '✔ Collect Orders';
  }

  if (team.meta.collect_from === 'channel') {
    let channelSection = {
      text: '',
      callback_id: 'channel_buttons_idk',
      actions: [{
        name: 'channel_btn',
        text: 'Pick a Channel',
        type: 'select',
        data_source: 'channels'
      }]
    };
    attachments.push(channelSection);
  }

  attachments.push({
    text: '',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'I\'ll send Direct Messages to each user in the selected channel:',
    actions: [{
      name: 'collect.home.reminder',
      text: okButtonText,
      style: 'primary',
      type: 'button',
      value: 'reminder'
    }, {
      name: 'settings',
      text: '⚙️',
      style: 'default',
      type: 'button',
      value: 'start'
    }, {
      'name': 'passthrough',
      'text': '< Home',
      'type': 'button',
      'value': 'home'
    }],
    callback_id: 'none'
  });

  let msg = message;
  msg.mode = 'collect';
  msg.action = 'home';
  msg.text = '';
  msg.fallback = 'That\'s it!\nThanks for adding Kip to your team';
  msg.source.channel = typeof msg.source.channel === 'string' ? msg.source.channel : message.thread_id;
  msg.reply = attachments;
  return [msg];
};

/**
 * Sends a reminder to members in selected channels
 * @param {Message} message       the message that led to this being shown
 * @yield {[Message]} an array of messages
 */
handlers['reminder'] = function*(message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
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
  yield channelMembers.map(function*(a) {
    if (a.id === message.source.user) return;
    let attachments = [],
      newMessage;
    if (a.member_shop_onboarded) {
      attachments = [{
        text: '',
        image_url: 'http://tidepools.co/kip/oregano/store.png',
        callback_id: 'shopping_btns',
        actions: cardTemplate.slack_shopping_buttons(),
        color: '#45a5f4'
      }, {
        'text': utils.randomStoreHint(),
        mrkdwn_in: ['text']
      }];
      newMessage = new db.Message({
        text: `Hey <@${message.source.user}> is collecting shopping orders! Let me know what you need`,
        incoming: false,
        thread_id: a.dm,
        origin: 'slack',
        mode: 'shopping',
        fallback: `Hey <@${message.source.user}> is collecting shopping orders! Let me know what you need`,
        action: 'switch.silent',
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
    } else {
      a.member_shop_onboarded = true;
      a.markModified('member_shop_onboarded');
      yield a.save();
      newMessage = new db.Message({
        text: `Hey <@${message.source.user}> is collecting shopping orders!`,
        incoming: false,
        thread_id: a.dm,
        origin: 'slack',
        mode: 'member_onboard',
        fallback: `Hey <@${message.source.user}> is collecting shopping orders!\nIt looks like this is your first time ordering, let me show you how I can make your life a bit easier`,
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
      newMessage.reply[1].text = 'It looks like this is your first time ordering, let me show you how I can make your life a bit easier';
      let msInFuture = 60 * 60 * 1000; // if in dev, 20 seconds
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
      };
      scheduleReminder(
        'initial reminder',
        new Date(msInFuture + now.getTime()), {
          msg: JSON.stringify(cronMsg),
          user: cronMsg.source.user,
          token: team.bot.bot_access_token,
          channel: cronMsg.source.channel
        });
    }
    yield newMessage.save();
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  });
  return handlers['handoff'](message, channelMembers.length > 0);
};

handlers['handoff'] = function(message, askedMembers) {

  let attachments = [{
    text: 'Looking for something?',
    color: '#45a5f4',
    image_url: 'http://tidepools.co/kip/oregano/store.png',
    callback_id: 'oops',
    actions: cardTemplate.slack_shopping_buttons()
  }, {
    'text': utils.randomStoreHint(),
    mrkdwn_in: ['text']
  }];
  let msg = message;
  msg.reply = [{
    text: '',
    callback_id: 'appendedHome'
    // actions: [{
    //   name: 'passthrough',
    //   text: 'Home',
    //   style: 'default',
    //   type: 'button',
    //   value: 'home'
    // }]
  }];
  msg.text = askedMembers ? 'Ok, I\'ve let them know  :tada:' : '';
  msg.action = 'switch.silent';
  msg.mode = 'shopping';
  let cartMsg = msg;
  setTimeout(function() {
    cartMsg.text = '';
    cartMsg.reply = attachments;
    cartMsg.image_url = 'http://tidepools.co/kip/oregano/store.png';
    cartMsg = new db.Message(cartMsg);
    cartMsg.save();
    queue.publish('outgoing.' + cartMsg.origin, cartMsg, cartMsg._id + '.reply.update');
  }, 1996);
  return [msg];
};

/**
 * Handle user input text
 * stolen from ./team.js
 */
handlers['text'] = function*(message) {
  message.text = message.text.trim();
  var history = yield db.Messages.find({
    thread_id: message.source.channel
  }).sort('-ts').limit(10);
  var lastMessage = history[1];
  let choices = [];
  if (lastMessage.reply) {
    choices = _.flatten(lastMessage.reply.map(m => {
      return m.actions;
    }).filter(function(n) {
      return n !== undefined;
    }));
  }
  if ((!choices || choices.length === 0) && message.text === 'collect') {
    return yield handlers['initial'](message);
  }
  var team_id = message.source.team;
  var team = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();
  var channelSelection = false;
  var channelsToAdd = [];
  if (_.get(choices, '[0].name') === 'collect_select') {
    channelSelection = true;
    team.meta.collect_from = 'channel';
    if (message.text.indexOf(' ') > -1) {
      var segments = message.text.split(/[\s ]+/);
      segments.forEach((m) => {
        if (m.indexOf('|') > -1) m = m.split('|')[1];
        m = m.replaceAll('#', '');
        m = m.replaceAll('<', '');
        m = m.replaceAll('|', '');
        m = m.replaceAll('>', '');
        channelsToAdd.push(m);
      });
    } else {
      if (message.text.indexOf('|') > -1) message.text = message.text.split('|')[1];
      message.text = message.text.replaceAll('#', '');
      message.text = message.text.replaceAll('<', '');
      message.text = message.text.replaceAll('|', '');
      message.text = message.text.replaceAll('>', '');
    }
  }
  var channels = yield utils.getChannels(team);
  channels = channels.map(channel => {
    return {
      'value': channel.id,
      'type': 'button',
      'text': channel.name,
      'name': 'channel_btn'
    };
  });
  choices = choices.concat(channels);
  choices = _.uniq(choices);
  choices = choices.map((choice) => {
    if (choice.text && (choice.text.indexOf('☐') > -1 || choice.text.indexOf('✓') > -1)) {
      choice.text = choice.text.replace('☐', '');
      choice.text = choice.text.replace('✓', '');
      choice.text = choice.text.trim();
    }
    return choice;
  });
  choices = choices.filter((c) => {
    return c.name === 'channel_btn';
  });
  var fuse = new Fuse(choices, {
    shouldSort: true,
    threshold: 0.6,
    keys: ['text']
  });
  var matches = [];
  if (channelsToAdd.length > 0) {
    yield channelsToAdd.map(function*(text) {
      var m = yield fuse.search(text);
      if (_.get(m, '[0].value')) {
        matches.push(_.get(m, '[0].value'));
      }
    });
  } else {
    matches = yield fuse.search(message.text);
  }

  if (matches.length > 0 && channelSelection) {
    if (channelsToAdd.length > 0) {
      matches.map((selectedChannel) => {
        if (team.meta.cart_channels.find(id => {
            return (id === selectedChannel);
          })) {
          _.remove(team.meta.cart_channels, function(c) {
            return c.trim() === selectedChannel.trim();
          });
        } else {
          team.meta.cart_channels.push(selectedChannel);
        }
        return;
      });
    } else {
      if (team.meta.cart_channels.find(id => {
          return (id === matches[0].value);
        })) {
        _.remove(team.meta.cart_channels, function(c) {
          return c === matches[0].value;
        });
      } else {
        team.meta.cart_channels.push(matches[0].value);
      }
    }
    team.markModified('meta.cart_channels');
    yield team.save();
    return yield handlers['initial'](message);
  } else {
    return yield handlers['sorry'](message, [message.text]);
  }
};

/**
 * an error handler
 * @param {Message} message       the message that led to this being shown
 * @yield {[Message]} an array of messages
 */
handlers['sorry'] = function*(message) {
  message.text = 'Sorry, my brain froze! Type `home` to go home'
  message.mode = 'collect';
  message.action = 'home';
  message.mrkdwn_in = ['text'];
  return [message];
};

const scheduleReminder = function(type, time, data) {
  kip.debug('\n\n\nsetting reminder for ', time.toLocaleString(), '\n\n\n');
  agenda.schedule(time, type, data);
};