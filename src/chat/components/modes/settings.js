var message_tools = require('../message_tools')
var handlers = module.exports = {};
var db = require('db');
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var momenttz = require('moment-timezone');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
// var team;
// var teamMembers;
// var admins;
// var currentUser;
// var isAdmin;
var cron = require('cron');
//maybe can make this persistent later?
var cronJobs = {};
function * handle(message) {
  var last_action = _.get(message, 'history[0].action');
  if (!last_action || last_action != 'home') {
    return yield handlers['start'](message)
  } else {
    var action = getAction(message.text);
    kip.debug('\n\n\n🤖 action : ',action,' 🤖\n\n\n');
    return yield handlers[action](message)
  }
}
 
module.exports.handle = handle;

/**
 * Show the user all the settings they have access to
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
  //adding settings mode sticker
  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: ''
  });
  //
  // Last call alerts personal settings
  //
  if (currentUser && currentUser.settings.last_call_alerts) {
    attachments.push({text: 'You are *receiving last-call alerts* for company orders.  Say `no last call` to stop this.'})
  } else {
    attachments.push({text: 'You are *not receiving last-call alerts* before the company order closes. Say `yes last call` to receive them.'})
  }
  //
  // Admins
  //
  var adminNames = team.meta.office_assistants.map(function(user_id) {
    return '<@' + user_id + '>';
  });
  if (adminNames.length > 1) {
    var last = adminNames.pop();
    adminNames[adminNames.length-1] += ' and ' + last;
  }

  if(adminNames.length < 1){
    var adminText = 'I\'m not managed by anyone right now.';
  } else {
    var adminText = 'I\'m managed by ' + adminNames.join(', ') + '.';
  }

  if (isAdmin && admins && admins.length >= 1) {
    adminText += '  You can *add and remove admins* with `add @user` and `remove @user`.'
  } else if (isAdmin) {
    adminText += '  You can *add admins* with `add @user`.'
  }

  attachments.push({text: adminText});

  //
  // Admin-only settings
  //
  if (admins && isAdmin) {
    if (team.meta.weekly_status_enabled) {
      // TODO convert time to the correct timezone for this user.
      // 1. Date.parse() returns something in eastern, not the job's timezone
      // 2. momenttz.tz('2016-04-01 HH:mm', meta.weekly_status_timezone) is the correct date for the job
      // 3. .tz(chatuser.tz) will convert the above to the user's timezone. whew
      var date = Date.parse(team.meta.weekly_status_day + ' ' + team.meta.weekly_status_time);
      var job_time_no_tz = momenttz.tz(date, 'America/New_York'); // because it's not really eastern, only the server is
      var job_time_bot_tz = momenttz.tz(job_time_no_tz.format('YYYY-MM-DD HH:mm'), team.meta.weekly_status_timezone);
      var job_time_user_tz = job_time_bot_tz.tz(currentUser.tz);
      console.log('job time in bot timezone', job_time_bot_tz.format());
      console.log('job time in user timzone', job_time_user_tz.format());
      attachments.push({text: 'You are receiving weekly cart status updates every *' + job_time_user_tz.format('dddd[ at] h:mm a') + '\nYou can turn this off by saying `no weekly status`'
        + '\nYou can change the day and time by saying `change weekly status to Monday 8:00 am`'});
    } 
    else {
      attachments.push({text: 'You are *not receiving weekly cart* updates.  Say `yes weekly status` to receive them.'});
    }
  };
  var original = cardTemplate.shopping_settings_default(message._id);
  var expandable = yield utils.generateMenuButtons(message)
  var text = 'Don’t have any changes? Type `exit` to quit settings';
  var color = '#45a5f4';
  attachments.push({
      text: text,
      color: color,
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: original,
      callback_id: 'none'
    })
    // console.log('SETTINGS ATTACHMENTS ',attachments);
    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
   var msg = message;
   kip.debug(`Searching for back button SETTINGS:BEFORE_CACHE ${JSON.stringify(expandable, null, 2)}`)
   yield utils.cacheMenu(msg, original, expandable,  {text: text, color: color})
   kip.debug(`Searching for back button SETTINGS:AFTER CACHE ${JSON.stringify(expandable, null, 2)}`)
   msg.mode = 'settings'
   msg.text = ''
   msg.source.team = team_id;
   msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
   msg.reply = attachments;
   return [msg];

}

handlers['status_on'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  team.meta.weekly_status_enabled = true;
  yield team.save();
  var msg = message;
  msg.mode = 'settings';
  msg.action = 'home';
  msg.text = 'Ok I turned on weekly status updates!';
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];

}

handlers['status_off'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  team.meta.weekly_status_enabled = false;
  yield team.save();
  var msg = message;
  msg.mode = 'settings';
  msg.action = 'home';
  msg.text = 'Ok I turned off weekly status updates!';
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}

handlers['change_status'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var text = message.text.replace(/^(change|update) weekly (status|update)/, '').trim();
  text = text.replace('days', 'day');
  text = text.replace(/(to|every|\bat\b)/g, '');
  text = text.toLowerCase().trim();
  // this date library cannot understand Tuesday at 2
  // but it does understand Tuesday at 2:00
  if (text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/)) {
    var dayOfWeek = _.get(text.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/),'[0]');
    // if (text.indexOf(':') < 0) {
      var rtext = text.replace(/(am|a.m.|a m)/i, '').replace(/(pm|p.m.|p m)/i, '').replace(dayOfWeek,'');
      var hour = _.get(rtext.match(/([\d]+)/), '[0]');
      var minutes = rtext.replace(hour, '')
      minutes = typeof minutes == 'string' ? minutes.trim() : '00';
      hour = typeof hour == 'string' ? hour.trim() : '8';
      hour = parseInt(hour);
    // }
  }
  var am_pm = _.get(text.match(/(am|a.m.|a m|pm|p.m.|p m)/i), '[0]');
  if (hour > 0 && hour < 7 && !am_pm) {
    am_pm = 'PM'
  } else if (hour > 12 && !am_pm) {
    hour = hour - 12;
    am_pm = 'PM';
  }
  am_pm = am_pm.toUpperCase().trim();
  team.meta.weekly_status_day = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
  team.meta.weekly_status_time = hour + ':' + ('00' + minutes).substr(-2) + ' ' + am_pm;
  team.meta.weekly_status_timezone = team.meta.weekly_status_timezone;
  yield team.save();
  var day = getDayNum(team.meta.weekly_status_day);
  kip.debug('hour is :', hour, 'minutes is: ', minutes, 'am_pm is: ', am_pm);
  var rhour = (am_pm == 'PM' && hour != 12) ? hour + 12 : hour;
  var dateObj = { day: day, hour: rhour, minutes: minutes};
  var moment_date = momenttz().day(day).toString().split(':')[0].slice(0, -2);
  var date = moment_date + ' '  + team.meta.weekly_status_time;
  yield updateCronJob(team, message, dateObj);
  var msg = message;
  msg.mode = 'settings'
  msg.action = 'home'
  msg.text = 'Ok I have updated your settings 😊';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ]; 
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}

handlers['add_or_remove'] = function * (message) {
 var replies = [];
 var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var tokens = message.original_text.toLowerCase().trim().split(' ');
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var isAdmin = team.meta.office_assistants.indexOf(currentUser.id) >= 0;
  if (isAdmin && ['add', 'remove'].indexOf(tokens[0]) >= 0) {
    // look for users mentioned with the @ symbol
    var userIds = tokens.filter((t) => {
      return t.indexOf('<@') === 0;
    }).map((u) => {
      return u.replace(/(\<\@|\>)/g, '').toUpperCase();
    });
    // also look for users mentioned by name without the @ symbol
    var users = yield db.Chatusers.find({
      team_id: team.team_id,
      is_bot: {
        $ne: true
      },
      deleted: {
        $ne: true
      }
    }).select('id name').exec();
    users.map((u) => {
      var re = new RegExp('\\b' + u.name + '\\b', 'i')
      if (message.text.match(re)) {
        userIds.push(u.id);
      }
    });
    if (userIds.length === 0) {
      // return yield handlers['home.sorry'][message]
      var attachments = [];
       attachments.push({
          text: 'Don’t have any changes? Type `exit` to quit settings',
          color: '#49d63a',
          mrkdwn_in: ['text'],
          fallback:'Settings',
          actions: [
              {
                "name": "exit",
                "text": "Exit Settings",
                "style": "primary",
                "type": "button",
                "value": "exit"
              },              
              // {
              //   "name": "help",
              //   "text": "Help",
              //   "style": "default",
              //   "type": "button",
              //   "value": "help"
              // },              
              {
                "name": "team",
                "text": "Team Members",
                "style": "default",
                "type": "button",
                "value": "team"
              },
              {
                "name": "viewcart",
                "text": "View Cart",
                "style": "default",
                "type": "button",
                "value": "viewcart"
              },
              // {
              //   "name": "home",
              //   "text": "🐧",
              //   "style": "default",
              //   "type": "button",
              //   "value": "home"
              // }
          ],
          callback_id: 'none'
        });
      attachments.map(function(a) {
        a.mrkdwn_in =  ['text'];
        a.color = '#45a5f4';
      })
      var msg = message;
      msg.mode = 'settings'
      msg.action = 'home'
      msg.text = "We couldn't find that user!";
      msg.reply = attachments;
      msg.source.team = team.team_id;
      msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      return [msg]
    }
    var shouldReturn = false;
    if (tokens[0] === 'add') {
      userIds.map((id) => {
        if (team.meta.office_assistants.indexOf(id) < 0) {
          team.meta.office_assistants.push(id);
        }
      })
    } else if (tokens[0] === 'remove') {
      userIds.map((id) => {
        if (team.meta.office_assistants.indexOf(id) >= 0) {
          var index = team.meta.office_assistants.indexOf(id);
          team.meta.office_assistants.splice(index, 1);
        }
      })
    }
    if (shouldReturn) {
      return;
    }
    team.markModified('meta.office_assistants');
    yield team.save();
    var msg = message;
    msg.mode = 'settings';
    msg.action = 'home';
    msg.text = 'Ok I have updated your settings 😊';
    msg.execute = [ { 
      "mode": "settings",
      "action": "home",
      "_id": message._id
    } ]; 
    msg.source.team = team.team_id;
    msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
    replies.push(msg)      
  }
 return replies;
}

handlers['last_call_off'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  currentUser.settings.last_call_alerts = false;
  yield currentUser.save();
  var msg = message;
  message.mode = 'settings';
  message.action = 'home';
  msg.text = 'Ok I turned off last call!';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ]; 
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}

handlers['last_call_on'] = function * (message) {
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  currentUser.settings.last_call_alerts = true;
  yield currentUser.save();
  var msg = message;
  message.mode = 'settings';
  message.action = 'home';
  msg.text = 'Ok I updated last call! 😊';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ]; 
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}

handlers['send_last_call'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var replies = []
  yield team.meta.cart_channels.map( function * (c) {
    var channelMembers = yield utils.getChannelMembers(team, c);
    yield channelMembers.map( (m) => {      
      var attachment = [{
            "fallback": "Last Call",
            "text":'',
            "image_url":"http://kipthis.com/kip_modes/mode_teamcart_collect.png",
            "color": "#45a5f4",
            "mrkdwn_in": ["text"]        
        },{
            "fallback": "Last Call",
            "text":'Hi! ' + currentUser.name + ' wanted to let you know that they will be placing their order soon.\n So if you’ve got some last minute shopping to do, it’s now or never! You have *60* minutes left',
            "color": "#45a5f4",
            "mrkdwn_in": ["text"]
        }];
        var msg = message;
        msg.mode = 'settings';
        msg.text = '';
        msg.action = 'home';
        // msg.text = 'Ok I updated last call! 😊';
        msg.execute = [ { 
          "mode": "settings",
          "action": "home",
          "_id": message._id
        }]; 
        msg.reply = attachment;
        msg.source.team = team.team_id;
        msg.source.channel = m.dm; //not sure if this will work
        replies.push(msg);
    })
  });
  // kip.debug('\n\n\n\n\n settings.js:448: ', replies,' \n\n\n\n\n')
  return replies;
}

handlers['sorry'] = function * (message) {
   // kip.debug('\n\n\n  settings.js : 453 : could not understand message : ', message ,'\n\n\n')
   message.text = "Sorry, my brain froze!"
   message.mode = 'settings';
   message.action = 'home';
   var attachments = [];
   attachments.push({
      text: 'Don’t have any changes? Type `exit` to quit settings',
      color: '#49d63a',
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: [
          {
            "name": "exit",
            "text": "Exit Settings",
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
            "name": "team",
            "text": "Team Members",
            "style": "default",
            "type": "button",
            "value": "team"
          },
          {
            "name": "",
            "text": "View Cart",
            "style": "default",
            "type": "button",
            "value": "team"
          },
          {
            "name": "home",
            "text": "🐧",
            "style": "default",
            "type": "button",
            "value": "home"
          }
      ],
      callback_id: 'none'
    });
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
   message.reply = attachments;
     return [message];

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

function isStatusChange(input) {
    var regex = /^(change|update) weekly (status|update)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isStatusOff(input) {
    var regex = /^(no weekly status)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isStatusOn(input) {
    var regex = /^(weekly status|yes weekly status)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isAddOrRemove(input) {
    var regex = /^(add|remove|add @|remove @)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isLastCallOff(input) {
    var regex = /^(no last call)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isLastCallOn(input) {
    var regex = /^(yes last call)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}

function isSendLastCall(input) {
    var regex = /^(send last call btn)/;
    if (input.toLowerCase().trim().match(regex)) {
      return true;
    } else {
      return false;
    }
}



function * updateCronJob(team, message, date) {
    if (cronJobs[team.team_id]) {
      cronJobs[team.team_id].stop();
    }
    kip.debug('\n\n\nsetting cron job day: ', '00 ' + date.minutes + ' ' + date.hour + ' * * ' + date.day,'\n\n\n')
    var teamMembers = yield utils.getTeamMembers(team);
    cronJobs[team.team_id] = new cron.CronJob('00 ' + date.minutes + ' ' + date.hour + ' * * ' + date.day, function  () {  
       team.meta.office_assistants.map(function  (a) {
       var assistant = teamMembers.find(function(m, i){ return m.id == a });

       var attachments = [
        {
          // "pretext": "Hi, this is your weekly reminder.  Would you like to send out a last call?",
          "image_url":"http://kipthis.com/kip_modes/mode_teamcart_collect.png",
          "text":"",
          "mrkdwn_in": [
              "text",
              "pretext"
          ],
          "color":"#45a5f4"
        }
       ];
      attachments.push({
        text: 'Hi, this is your weekly reminder.  Would you like to send out a last call?',
        color: '#49d63a',
        mrkdwn_in: ['text'],
        fallback:'Settings',
        actions: [
            {
              "name": "exit",
              "text": "Exit Settings",
              "style": "primary",
              "type": "button",
              "value": "exit"
            },              
            {
              "name": "send_last_call_btn",
              "text": "Yes",
              "style": "default",
              "type": "button",
              "value": "send_last_call_btn"
            }, 
            {
              "name": "no",
              "text": "No",
              "style": "default",
              "type": "button",
              "value": "no"
            },             
            {
              "name": "team",
              "text": "Team Members",
              "style": "default",
              "type": "button",
              "value": "team"
            }
        ],
        callback_id: 'none'
      });
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
     var newMessage = new db.Message({
        incoming: false,
        thread_id: message.thread_id,
        user_id: assistant.id,
        origin: 'slack',
        source: message.source,
        mode: 'settings',
        action: 'home',
        user: message.source.user,
        reply: attachments
      })
      kip.debug('\n\n\n Firing Cron Job: assistant: ', assistant, message, newMessage,'\n\n\n')

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
      console.log('just finished the weekly update thing for team ' + team.team_id + ' ' + team.team_name);
    },
    true,
    team.meta.weekly_status_timezone);
};

function getDayNum(string) {
  switch(string) {
    case 'Sunday':
     return 0
     break; 
    case 'Monday':
     return 1
     break; 
    case 'Tuesday':
     return 2
     break; 
    case 'Wednesday':
     return 3
     break; 
    case 'Thursday':
     return 4
     break; 
    case 'Friday':
     return 5
     break; 
    case 'Saturday':
     return 6
     break; 
  }
}
