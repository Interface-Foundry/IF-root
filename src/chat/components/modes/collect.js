// Introduces non-admins to the process of adding items to the cart
var handlers = module.exports = {};
var _ = require('lodash');
var cardTemplate = require('../slack/card_templates');
var winston = require('winston');
var utils = require('../slack/utils.js');
var Fuse = require('fuse.js');
var queue = require('../queue-mongo');

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
  var cartChannels = team.meta.cart_channels;
  var channels = yield utils.getChannels(team);
  var buttons = channels.map(channel => {
    var checkbox = cartChannels.find(id => {
      return (id === channel.id);
    }) ? '✓ ' : '☐ ';
    return {
      name: 'channel_btn',
      text: checkbox + channel.name,
      type: 'button',
      value: channel.id
    };
  });
  buttons = _.uniq(buttons);

  function sortF(a, b) {
    return ((a.text.indexOf('☐ ') > -1) - (b.text.indexOf('☐ ') > -1));
  }
  buttons = buttons.sort(sortF);

  if (buttons.length > 9) {
    buttons = buttons.slice(0, 9);
  }

  var chunkedButtons = _.chunk(buttons, 5);
  let attachments = [{
    text: 'Which channels would you like to send a reminder to?',
    mrkdwn_in: ['text'],
    color: '#45a5f4',
    actions: chunkedButtons[0],
    fallback: 'Which channels would you like to send a reminder to?',
    callback_id: 'none'
  }];
  chunkedButtons.forEach((ele, i) => {
    if (i !== 0) {
      attachments.push({
        text: '',
        actions: ele,
        color: '#45a5f4',
        callback_id: 'none'
      });
    }
  });

  attachments.push({
    'text': '✎ Hint: You can also type the channels to add (Example: _#nyc-office #research_)',
    mrkdwn_in: ['text']
  });

  attachments.push({
    text: '',
    color: '#45a5f4',
    mrkdwn_in: ['text'],
    fallback: 'Which channels would you like to send a reminder to?',
    actions: [{
      name: 'collect.home.reminder',
      text: 'Notify Members',
      style: 'primary',
      type: 'button',
      value: 'reminder'
    }, {
      name: 'settings',
      text: '⚙️',
      style: 'default',
      type: 'button',
      value: 'start'
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
  var channelMembers = [];
  yield team.meta.cart_channels.map(function*(channel) {
    var members = yield utils.getChannelMembers(team, channel);
    channelMembers = channelMembers.concat(members);
  });
  channelMembers = _.uniqBy(channelMembers, a => a.id);
  yield channelMembers.map(function*(a) {
    if (a.id === message.source.user) return;
    let attachments = [{
      text: '',
      actions: cardTemplate.slack_shopping_buttons
    }, {
      'text': utils.randomStoreHint(),
      mrkdwn_in: ['text']
    }];
    var newMessage = new db.Message({
      text: `Hey <@${message.source.user}> is collecting orders! Let me know what you need`,
      incoming: false,
      thread_id: a.dm,
      origin: 'slack',
      mode: 'shopping',
      fallback: `Hey <@${message.source.user}> is collecting orders! Let me know what you need`,
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
    yield newMessage.save();
    queue.publish('outgoing.' + newMessage.origin, newMessage, newMessage._id + '.reply.update');
  });
  return handlers['handoff'](message);
};

handlers['handoff'] = function(message) {
  let attachments = cardTemplate.home_screen(true);
  attachments.text = 'Ok, I\'ve sent them a reminder  :tada:\nWhat\'s next?';
  let msg = {
    action: 'simplehome',
    mode: 'food',
    source: message.source,
    origin: message.origin,
    reply: {
      data: attachments
    }
  };
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
  let choices;
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
  if (_.get(choices, '[0].name') === 'channel_btn') {
    channelSelection = true;

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
  message.text = 'Sorry, my brain froze!'
  message.mode = 'collect';
  message.action = 'home';
  var attachments = [];
  attachments.push({
    text: 'Don’t have any changes? Type `exit` to quit collect',
    color: '#49d63a',
    mrkdwn_in: ['text'],
    fallback: 'Sorry!',
    actions: [{
      'style': 'primary',
      'name': 'settings.back',
      'text': 'Home',
      'type': 'button'
    }, {
      'name': 'team',
      'text': 'Team Members',
      'style': 'default',
      'type': 'button',
      'value': 'team'
    }, {
      'name': '',
      'text': 'View Cart',
      'style': 'default',
      'type': 'button',
      'value': 'team'
    }],
    callback_id: 'none'
  });
  attachments.map(function(a) {
    a.mrkdwn_in = ['text'];
    a.color = '#45a5f4';
  });
  message.reply = attachments;
  return [message];
};