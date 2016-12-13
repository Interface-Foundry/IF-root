var message_tools = require('../message_tools')
var handlers = module.exports = {};
var _ = require('lodash');
var co = require('co');
var utils = require('../slack/utils');
var momenttz = require('moment-timezone');
var queue = require('../queue-mongo');
var cardTemplate = require('../slack/card_templates');
var request = require('request');
var requestP = require('request-promise');
var date_lib = require('date-fns');
var cron = require('cron');
//maybe can make this persistent later?
var cronJobs = {};
function* handle(message) {
  var last_action = _.get(message, 'history[0].action');
  let action;
  if ((_.get(message,'action') && (_.get(message,'action').indexOf('set_day') > -1 || _.get(message,'action').indexOf('set_date') > -1 || _.get(message,'action').indexOf('weekly') > -1 || _.get(message,'action').indexOf('monthly') > -1) )) {
       var data = _.split(message.action, '.');
      action = data[0].trim();
      var choice = data[1]; 
      var datum = _.get(message,'data.value');
      kip.debug('\n\n\n🤖🤖🤖 action : ', action, ' choice: ', choice, 'datum: ', datum,' 🤖\n\n\n');
      return yield handlers[action](message, choice, datum);
  } else if (!last_action || last_action != 'home') {
    action = 'start';
  } else if (message.text) {
    action = getAction(message.text);
  } else {
      var data = _.split(message.data.action, '.');
      action = data[0];
      var choice = _.get(message,'data.value');
      kip.debug('\n\n\n🤖 message.data: ',message.data,' action : ', action, ' choice: ', choice,' 🤖\n\n\n');
      return yield handlers[action](message, choice);
  }

  return yield handlers[action](message)
}

module.exports.handle = handle;

/*
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
  if (!isAdmin) {
    //
    // Last call alerts personal settings
    //
    if (currentUser && currentUser.settings.last_call_alerts) {
      attachments.push({text: 'You are *receiving last-call alerts* for company orders.  Say `no last call` to stop this.'})
    } else {
      attachments.push({text: 'You are *not receiving last-call alerts* before the company order closes. Say `yes last call` to receive them.'})
    }
  }
 
  //
  // Admin-only settings
  //
  if (admins && isAdmin) {
    if (team.meta.status_interval != 'never' && team.meta.status_interval != 'monthly') {
       attachments.push({text: 'Your team is set to receive last calls at *' + (team.meta.status_interval != 'daily' ? team.meta.weekly_status_day : '') + ' ' + team.meta.weekly_status_time + '*  on a ' + team.meta.status_interval + ' basis.'
        + '\nYou can specify the time by saying something like: `8:00 am`'});
    } else if (team.meta.status_interval == 'monthly') {
       attachments.push({text: 'Your team is set to receive last calls on day *' + team.meta.weekly_status_date + '* of every month at *' + team.meta.weekly_status_time + '*  '
        + '\nYou can specify the time by saying something like: `8:00 am`'});
    } else if (team.meta.status_interval == 'never')    {
       attachments.push({text: 'Your team is currently not receive last call notifications.'});
    }
    attachments.push({
      text: 'When do you want last calls to go out?',
      color: color,
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: cardTemplate.settings_intervals,
      callback_id: 'none'
    })
  };
  
  var buttons = cardTemplate.settings_menu;
  if(!isAdmin && admins.length > 0){
  	buttons = cardTemplate.settings_menu.slice(0, 1);
  }
  var color = '#45a5f4';
  attachments.push({
      text: '',
      color: color,
      mrkdwn_in: ['text'],
      fallback:'Settings',
      actions: buttons,
      callback_id: 'none'
    })
    // console.log('SETTINGS ATTACHMENTS ',attachments);
    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })
  if (message.source.response_url) {
    request({
      method: 'POST',
      uri: message.source.response_url,
      body: JSON.stringify({
        text: '',
        attachments: attachments
      })
    })
  }
  else { 
    // for case when settings is typed
    var msg = message;
    msg.mode = 'settings'
    msg.text = ''
    msg.source.team = team_id;
    msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
    msg.reply = attachments;
    return [msg];
  }
}

handlers['back'] = function * (message) {
  var attachments = [{
    image_url: "http://tidepools.co/kip/kip_menu.png",
    text: 'Click a mode to start using Kip',
    color: '#3AA3E3',
    callback_id: 'wow such home',
    actions: cardTemplate.simple_home
  }];
  request({
    method: 'POST',
    uri: message.source.response_url,
    body: JSON.stringify({text: '', attachments: attachments})
  })
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

handlers['change_time'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var currentUser = yield db.Chatusers.findOne({id: message.source.user});
  var text = message.text.toLowerCase().trim();
  var rtext = text.replace(/(am|a.m.|a m)/i, '').replace(/(pm|p.m.|p m)/i, '');
  var hour = _.get(rtext.match(/([\d]+)/), '[0]');
  var minutes = rtext.replace(hour, '')
  minutes = typeof minutes == 'string' ? minutes.trim() : '00';
  hour = typeof hour == 'string' ? hour.trim() : '8';
  hour = parseInt(hour);
  var am_pm = _.get(text.match(/(am|a.m.|a m|pm|p.m.|p m)/i), '[0]');
  if (hour > 0 && hour < 7 && !am_pm) {
    am_pm = 'PM'
  } else if (hour > 12 && !am_pm) {
    hour = hour - 12;
    am_pm = 'PM';
  }
  if (hour.toString().indexOf(':') > -1) hour = parseInt(hour.replace(':',''));
  if (minutes.toString().indexOf(':') > -1) minutes = parseInt(minutes.replace(':',''));
  am_pm = am_pm.toUpperCase().trim();
  team.meta.weekly_status_time = hour + ':' + ('00' + minutes).substr(-2) + ' ' + am_pm;
  team.meta.weekly_status_timezone = team.meta.weekly_status_timezone;
  yield team.save();
  var day = team.meta.weekly_status_day ? utils.getDayNum(team.meta.weekly_status_day) :  date_lib.getDay(new Date());
  var rhour = (am_pm == 'PM' && hour != 12) ? hour + 12 : hour;
  var dateObj = { day: day, hour: rhour, minutes: minutes};
  // kip.debug('dateObj is: is : ', dateObj, ' day is : ',day,'hour is :', hour, 'minutes is: ', minutes, 'am_pm is: ', am_pm);
  var moment_date = momenttz().day(day).toString().split(':')[0].slice(0, -2);
  var date = moment_date + ' '  + team.meta.weekly_status_time;
  yield utils.updateCron(message, cronJobs, dateObj, 'time');
  var msg = message;
  msg.mode = 'settings'
  msg.action = 'home'
  msg.text = 'Ok, I have updated your settings!';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ];
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}


handlers['cron'] = function * (message, interval) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var rhour = date_lib.getHours(new Date());
  var rminutes = date_lib.getMinutes(new Date());
  var day = date_lib.getDay(new Date());
  var never = false;
  team.meta.status_interval = interval;
  yield team.save();
  switch(interval) {
    case 'daily':
      var dateObj = { day: '*', hour: rhour, minutes: rminutes};
      break;
    case 'weekly':
      var history = yield db.Messages.find({'thread_id': message.source.channel}).sort({'_id':-1}).limit(2).exec();
      var relevantMessage = history[0];
      var json = message.source.original_message;
      if (!json) {
        kip.debug(' \n\n\n\n\n\n settings.js:285:message.source.original_message missing: ', message, ' \n\n\n\n\n\n ')
      }
      var options = {
        text: 'Which day of the week?',
        color: '#49d63a',
        mrkdwn_in: ['text'],
        fallback:'Settings',
        actions: cardTemplate.settings_days,
        callback_id: 'none'
      }
      json.attachments.splice(json.attachments.length-1, 0, options)
      request({
        method: 'POST',
        uri: message.source.response_url,
        body: JSON.stringify(json)
      });
      return
      break;
    case 'monthly':
     var msg = message;
      msg.mode = 'settings';
      msg.action = 'set_date';
      msg.text = 'Which day of the month? Say a number from 1 - 31: ';
      msg.source.team = team.team_id;
      msg.reply = [{
        color: '#49d63a',
        mrkdwn_in: ['text'],
        fallback:'Settings',
        callback_id: 'none'
      }];
      msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      yield msg.save();
      return [msg];
      break;
    case 'never':
      team.meta.weekly_status_enabled = false;
      team.meta.status_interval = 'never';
      yield team.save();
      yield utils.updateCron(message, cronJobs, null, 'never');
      break;
    default:
      var dateObj = { day: '*', hour: rhour, minutes: rminutes};
      break;
  }
  var msg = message;
  msg.mode = 'settings'
  msg.action = 'home'
  msg.text = 'Ok, I have updated your settings!';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ];
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
}

handlers['set_day'] = function * (message, day) {
  var history = yield db.Messages.find({'thread_id': message.source.channel}).sort({'_id':-1}).limit(2).exec();
  var relevantMessage = history[0];
  var dayString =day.charAt(0).toUpperCase() + day.slice(1);
  var day = utils.getDayNum(day);
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  team.meta.weekly_status_day = dayString;
  yield team.save();
  if (team.meta.weekly_status_time){
    var am_pm = _.get(team.meta.weekly_status_time.match(/(am|a.m.|a m|pm|p.m.|p m)/i), '[0]');
    var hour = team.meta.weekly_status_time.split(':')[0];
    var rhour = (am_pm == 'PM' && hour != 12) ? hour + 12 : hour;
  } else {
    var rhour = date_lib.getHours(new Date());
  }
  var rminutes = team.meta.weekly_status_time ?  team.meta.weekly_status_time.split(':')[1].replace(/(am|a.m.|a m)/i, '').replace(/(pm|p.m.|p m)/i, '') : date_lib.getMinutes(new Date());
  var dateObj = { day: day,hour: rhour, minutes: rminutes};
  yield utils.updateCron(message, cronJobs, dateObj, 'day');
  var msg = message;
  msg.mode = 'settings'
  msg.action = 'home'
  msg.text = 'Ok, I have updated your settings!';
  msg.execute = [ { 
    "mode": "settings",
    "action": "home",
    "_id": message._id
  } ];
  msg.source.team = team.team_id;
  msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
  return [msg];
  
}

handlers['set_date'] = function * (message) {
  var team_id = typeof message.source.team === 'string' ? message.source.team : (_.get(message,'source.team.id') ? _.get(message,'source.team.id') : null )
  var team = yield db.Slackbots.findOne({'team_id': team_id}).exec();
  var num = parseInt(message.text.trim())

   if (!(/^\d+$/.test(message.text)) ||  0 > num > 31) { 
      // var history = yield db.Messages.find({'thread_id': message.source.channel}).sort({'_id':-1}).limit(2).exec();
      // var relevantMessage = history[1];
      // var json = relevantMessage.source.original_message;
      // var warning = {
      //   text: 'The date you entered is incorrect!',
      //   color: '#ff0000',
      //   mrkdwn_in: ['text'],
      //   fallback:'Settings',
      //   callback_id: 'none'
      // }
      // json.attachments.push(warning)
      // request({
      //   method: 'POST',
      //   uri: relevantMessage.source.response_url,
      //   body: JSON.stringify(json)
      // }); 
      // return
      var msg = message;
      msg.mode = 'settings';
      msg.action = 'set_date';
      msg.text = 'Which day of the month? Say a number from 1 - 31: ';
      msg.source.team = team.team_id;
      msg.reply = [{
        color: '#49d63a',
        mrkdwn_in: ['text'],
        fallback:'Settings',
        callback_id: 'none'
      }];
      msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
      yield msg.save();
      return [msg];
   }

  //TODO: Fix this allow crons to run correctly if date is > 28 in feb
  if (num > 28) {
    num = 28;
  };
 
  team.meta.weekly_status_date = num;
  team.meta.status_interval = 'monthly';
  yield team.save();
  if (team.meta.weekly_status_time){
    var am_pm = _.get(team.meta.weekly_status_time.match(/(am|a.m.|a m|pm|p.m.|p m)/i), '[0]');
    var hour = team.meta.weekly_status_time.split(':')[0];
    var rhour = (am_pm == 'PM' && hour != 12) ? hour + 12 : hour;
  } else {
    var rhour = date_lib.getHours(new Date());
  }
  var rminutes = team.meta.weekly_status_time ?  team.meta.weekly_status_time.split(':')[1].replace(/(am|a.m.|a m)/i, '').replace(/(pm|p.m.|p m)/i, '') : date_lib.getMinutes(new Date());
  var dateObj = { date: num.toString(), hour: rhour, minutes: rminutes};
  yield utils.updateCron(message, cronJobs, dateObj, 'date');
   var msg = message;
    msg.mode = 'settings'
    msg.action = 'home'
    msg.text = 'Ok, I have updated your settings!';
    msg.execute = [ { 
      "mode": "settings",
      "action": "home",
      "_id": message._id
    } ];
    delete msg.reply;
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
              }
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
      if(team.meta.p2p) {
         team.meta.p2p = false;
         kip.debug('P2P mode OFF');
         team.meta.office_assistants = [];
      }
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
    msg.text = 'Ok, I have updated your settings!';
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
  return replies;
}

handlers['sorry'] = function * (message) {
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



function getAction(text) {
  var action;
  kip.debug(`\n🥝  ${text}\n`)
  if (isStatusOff(text)) {
    action = 'status_off';
  } else if (isStatusOn(text)) {
    action = 'status_on';
  } else if (isTimeChange(text)) {
    action = 'change_time';
  } else if (isAddOrRemove(text)) {
    action = 'add_or_remove';
  } else if (isLastCallOff(text)) {
    action = 'last_call_off';
  } else if (isLastCallOn(text)) {
    action = 'last_call_on';
  } else if (isSendLastCall(text)) {
    action = 'send_last_call';
  } else if (isCronChange(text)) {
    action = isCronChange(text)[0]
  } else if (text.includes('settings')) {
    kip.debug(`\n🥝  ${text}\n`)
    action = 'start'
  } else {
    action = 'sorry'
  }
  return action;
}

function isTimeChange(input) {
    var regex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/;
    if (input.match(regex) && input.match(regex).length > 0) {
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

function isCronChange(input) {
   var regex = /^(weekly|monthly)/;
    if (input.toLowerCase().trim().match(regex)) {
      return input.split('.');
    } else {
      return false;
    }
}
