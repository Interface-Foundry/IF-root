var message_tools = require('../message_tools');
var handlers = module.exports = {};
var _ = require('lodash');
var validator = require('validator');
var co = require('co');
var utils = require('../slack/utils');
var Fuse = require('fuse.js');
var momenttz = require('moment-timezone');
var queue = require('../queue-direct');
var cardTemplate = require('../slack/card_templates');
var request = require('request');

function * handle(message) {
  let action = message.action;
  if (!message.data && (message.text.trim() == 'team' || message.text.trim() == 'members')) {
    action = 'start';
  } else if (!message.data && message.text && message.text.trim != 'team') {
    action = 'text';
  } else {
    action = 'sorry';
  }
  kip.debug('\n\n\n🤖 action : ', action, ' 🤖\n\n\n');
  return yield handlers[action](message);
}

module.exports.handle = handle;

handlers['start'] = function * (message) {

  console.log("@@ @ @ @ @ @ @ @ @")
  //Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
  //Œ Œ Œ Œ Œ Œ Œ Œ > SLACK LAUNCH CODE < Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
  //Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ Œ 
  if(message.source.team == 'T02PN3B25'){

    console.log("$ $ $ $ $ $ $")
    var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
    if (team_id == null) {
      return kip.debug('incorrect team id : ', message);
    }
    var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();

    team.meta.collect_from = 'all'

    let attachments = [{
      text: 'Who do you want to be able to use Kip?',
      image_url: 'http://kipthis.com/kip_modes/mode_teamcart_members.png',
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
      }],
      // {
      //   name: 'collect_select',
      //   text: (team.meta.collect_from === 'channel' ? '◉' : '○') + ' By Channel',
      //   type: 'button',
      //   value: 'channel'
      // }],
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
          data_source: 'channels',
          selected_options:[{
            text: message.source.actions[0].selected_options[0].text,
            value: message.source.actions[0].selected_options[0].value 
          }]
        }]
      };
      attachments.push(channelSection);
    }

    attachments.push({
      text: '',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback: 'yolo',
      actions: cardTemplate.team_buttons,
      callback_id: 'none'
    });

    if (message.source.response_url) {
      let stringOrig = JSON.stringify({
        text: '',
        attachments: attachments
      });
      var map = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#039': "'"
      }
      stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
      request({
        method: 'POST',
        uri: message.source.response_url,
        body: stringOrig
      })
      var msg = message;
      msg.mode = 'team';
      msg.action = 'home';
      msg.text = '';
      msg.execute = [{
        "mode": "team",
        "action": "home",
        "_id": message._id
      }];
      msg.source.team = team.team_id;
      msg.source.channel = msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      msg.reply = attachments;
      yield msg.save();

    } else { // in case someone types team
      var msg = message;
      msg.mode = 'team';
      msg.action = 'home';
      msg.text = '';
      msg.execute = [{
        "mode": "team",
        "action": "home",
        "_id": message._id
      }];
      msg.source.team = team.team_id;
      msg.source.channel = msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      msg.reply = attachments;
      return [msg];
    }
  }

  //💀 KILL THIS CODE BEFORE LAUNCH 💀
  else {
    var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message, 'source.team.id') ? _.get(message, 'source.team.id') : null);
    if (team_id == null) {
      return kip.debug('incorrect team id : ', message);
    }
    var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
    let attachments = [{
      text: 'Who do you want to be able to use Kip?',
      image_url: 'http://kipthis.com/kip_modes/mode_teamcart_members.png',
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

    if (team.meta.collect_from === 'channel') {
      let cartChannels = team.meta.cart_channels;
      let channels = yield utils.getChannels(team);
      let selectedChannels = channels.reduce((arr, channel) => {
        if (cartChannels.includes(channel.id)) {
          arr.push({
            name: 'channel_btn',
            text: `✓ #${channel.name}`,
            type: 'button',
            value: channel.id
          });
        }
        return arr;
      }, []);
      let unselectedChannels = channels.reduce((arr, channel) => {
        if (!cartChannels.includes(channel.id)) {
          arr.push({
            name: 'channel_btn',
            text: `☐ #${channel.name}`,
            type: 'button',
            value: channel.id
          });
        }
        return arr;
      }, []);
      selectedChannels = _.uniq(selectedChannels);
      unselectedChannels = _.uniq(unselectedChannels);
      let buttons = (selectedChannels.length > 8) ? selectedChannels // always show all selected channels
        : selectedChannels.concat(unselectedChannels.splice(0, 9 - selectedChannels.length));
      let chunkedButtons = _.chunk(buttons, 5);
      let channelSection = chunkedButtons.map(buttonRow => {
        return {
          text: '',
          callback_id: 'channel_buttons_idk',
          actions: buttonRow
        };
      });
      channelSection.push({
        'text': '✎ Hint: You can also type the channels to add (Example: _#nyc-office #research_)',
        mrkdwn_in: ['text']
      });
      attachments = attachments.concat(channelSection);
    }

    attachments.push({
      text: '',
      color: '#45a5f4',
      mrkdwn_in: ['text'],
      fallback: 'yolo',
      actions: cardTemplate.team_buttons,
      callback_id: 'none'
    });

    if (message.source.response_url) {
      let stringOrig = JSON.stringify({
        text: '',
        attachments: attachments
      });
      var map = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        '#039': "'"
      }
      stringOrig = stringOrig.replace(/&([^;]+);/g, (m, c) => map[c])
      request({
        method: 'POST',
        uri: message.source.response_url,
        body: stringOrig
      })
      var msg = message;
      msg.mode = 'team';
      msg.action = 'home';
      msg.text = '';
      msg.execute = [{
        "mode": "team",
        "action": "home",
        "_id": message._id
      }];
      msg.source.team = team.team_id;
      msg.source.channel = msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      msg.reply = attachments;
      yield msg.save();

    } else { // in case someone types team
      var msg = message;
      msg.mode = 'team';
      msg.action = 'home';
      msg.text = '';
      msg.execute = [{
        "mode": "team",
        "action": "home",
        "_id": message._id
      }];
      msg.source.team = team.team_id;
      msg.source.channel = msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      msg.reply = attachments;
      return [msg];
    }

  }
}

/**
 * Handle user input text
 */
handlers['text'] = function * (message) {
  message.text = message.text.trim();
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
  if (_.get(choices,'[0].name') == 'collect_select') {
      channelSelection = true;
      team.meta.collect_from = 'channel';
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

  if (matches.length > 0 && channelSelection) {
    choice = matches[0].value;
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
      return yield handlers['start'](message);
  } else {
   return yield handlers['sorry'](message, [message.text]);
  }

}


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

