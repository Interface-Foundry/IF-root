var message_tools = require('../message_tools');
var handlers = module.exports = {};
var _ = require('lodash');
var validator = require('validator');
var db = require('db');
var co = require('co');
var utils = require('../slack/utils');
var momenttz = require('moment-timezone');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var team;
var teamMembers;
var admins;
var currentUser;
var isAdmin;

function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action || last_action.indexOf('team') == -1) {
    kip.debug('\n\ninside /modes/team.js firing handle..\n\n')
    return yield handlers['start'](message)
  } else {
    var action = getAction(message.text);
    kip.debug('\n\n\n🤖 action : ',action,' 🤖\n\n\n');
    return yield handlers[action](message)
  }
}

module.exports.handle = handle;


handlers['start'] = function * (message) {
  // kip.debug('\n\ninside team.js handler view..\n\n', message)
  var team_id = message.source.team;
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  teamMembers = yield yield utils.getTeamMembers(team);
  admins = yield utils.findAdmins(team);
  currentUser = yield db.Chatusers.findOne({id: message.source.user});
  isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  if (!team.meta.cart_channels) {
      team.meta.cart_channels = [];
  }
  var cartChannels = team.meta.cart_channels;
  //adding settings mode sticker
  var attachments = [];
  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_teamcart_members.png',
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
  attachments.push({text: 'Channels: ', actions: buttons, callback_id: "none"});
    var endpart = {
      "text":"Update cart members? Or type `exit`",
      "actions": cardTemplate.slack_team_default,
      "callback_id": 'none',
      // "mrkdwn_in": ["fields","text"],
      // "color":"#49d63a"
    };
    attachments.push(endpart);
    // }
    var resList = {
      username: 'Kip',
      text: "",
      attachments: attachments,
      fallback: 'Team Cart Members'
    };
    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text', 'fields'];
      a.color = '#45a5f4';
    })
    var msg = message;
    msg.mode = 'team';
    msg.text = '';
    msg.execute = [ { 
      "mode": "team",
      "action": "home",
      "_id": message._id
    } ]; 
    msg.source.team = team.team_id;
    msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
    msg.reply = attachments;
    return [msg];

}

function viewCartMembers(convo,callback,flag){

  co(function*() {

    //get slack team
    var slackbot = yield db.Slackbots.findOne({team_id: convo.slackbot.team_id}).exec();

    if (!slackbot.meta.cart_channels){
      slackbot.meta.cart_channels = [];
    }

    var cartChannels = slackbot.meta.cart_channels;

    //get email users on team
    var emailUsers = yield Chatuser.find({
      'team_id': convo.slackbot.team_id,
      'type': 'email',
      'settings.emailNotification': true
    }).exec();
    //how many rows do we need for attachment?
    var emails = _.map(emailUsers, _.property('profile.email')); //extract emails
    //* * * Building column slug to fill unequal columns * * * //
    //add to cartChannels
    if(cartChannels.length < emails.length){
      if(cartChannels.length < 1){
        var calc = 0;
      }else {
        var calc = cartChannels.length;
      }
      var addNum = emails.length - calc;
      var slugArr = new Array(addNum).fill('');
      cartChannels = cartChannels.concat(slugArr);
    }
    //add to emails
    else if (cartChannels.length > emails.length){
      if(emails.length < 1){
        var calc = 0;
      }else {
        var calc = emails.length;
      }
      var addNum = cartChannels.length - calc;
      console.log('emails ',emails.length)
      console.log('channels ',cartChannels.length)
      console.log('addNum ',addNum)
      var slugArr = new Array(addNum).fill('');
      emails = emails.concat(slugArr);
    }
    //* * * * * * *//
    //this merges both arrays and alternates between them
    var comboArr = _.flatten(_.zip(cartChannels, emails));
    var comboObj = comboArr.map(function(res) {
        //not email, add slack channel syntax
        if(!validator.isEmail(res) && res !== '' && res !== undefined && res !== null){
          res = "<#"+res+">";
        }
        var obj = {
          "value": res,
          "short": true
        }
        return obj;
    });
    var userList = {
      "color":"#45a5f4",
      "mrkdwn_in": ["fields"],
      "fields": comboObj
    };
    //ensure column titles
    if(userList.fields[0]){
      userList.fields[0].title = 'Slack Channel Members';
    }else {
      userList.fields[0] = {
        "title": "Slack Channels",
        "short": true,
        "value":"_No Channels_"
      }
    }
    if(userList.fields[1]){
      userList.fields[1].title = 'Emails';
    }else {
      userList.fields[1] = {
        "title": "Emails",
        "short": true,
        "value":"_No Emails_"
      }
    }
    //- - - - - - //
    var attachments = [
      {
        "image_url":"http://kipthis.com/kip_modes/mode_teamcart_members.png",
        "text":"",
        "color":"#45a5f4"
      }
    ]
    attachments.push(userList);
    var commands = {
      "text":"",
      "pretext":"*Options*",
      "mrkdwn_in": ["fields","pretext"],
      "color":"#45a5f4",
      "fields": [
        {
          "value": "_Add channel_ `add #channel`",
          "short": true
        },
        {
          "value": "_Add email_ `add name@email.com`",
          "short": true
        },
        {
          "value": "_Remove channel_ `rm #channel`",
          "short": true
        },
        {
          "value": "_Remove email_ `rm name@email.com`",
          "short": true
        }
      ]
    };
    attachments.push(commands);
    if (flag !== 'noPrompt'){
      var endpart = {
        "text":"Update group cart members? Or type `exit`",
        "actions": [
            {
              "name": "exit",
              "text": "Exit Members",
              "style": "primary",
              "type": "button",
              "value": "exit"
            },              
            {
              "name": "help",
              "text": "Help",
              "style": "default",
              "type": "button",
              "value": "help"
            },
            {
              "name": "home",
              "text": "🐧",
              "style": "default",
              "type": "button",
              "value": "home"
            }
        ],
        "callback_id": 'none',
        "mrkdwn_in": ["fields","text"],
        "color":"#49d63a"
      };
      attachments.push(endpart);
    }
    var resList = {
      username: 'Kip',
      text: "",
      attachments: attachments,
      fallback: 'Team Cart Members'
    };
    callback(resList);
   }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}


function getAction (text) {
  var action;
  if (isStatusOff(text)) {
      action = 'status_off';
    } else if (isStatusOn(text)){
      action = 'status_on';
    } else if (isStatusChange(text)){
      action = 'change_status';
    } else if (isAddOrRemove(text)) {
      action = 'add_or_remove';
    } else if (isLastCallOff(text)){
      action = 'last_call_off';
    } else if (isLastCallOn(text)){
      action = 'last_call_on';
    } else if (isSendLastCall(text)){
      action = 'send_last_call';
    } else {
      action = 'sorry'
    }
    return action;
}

