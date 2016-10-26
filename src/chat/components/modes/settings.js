var message_tools = require('../message_tools')
var handlers = module.exports = {}
var _ = require('lodash');

function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action || last_action.indexOf('home') == -1) {
    return yield handlers['start'](message)
  } else if (last_action === 'home.set_last_call') {
    return yield handlers['set_last_call'](message)
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
  var slackbots = yield db.Slackbots.find({
    'team_id': team_id
  }).exec();
  var slackbot = slackbots[0];
  console.log('slackbot: ', slackbot);

  var isAdmin = slackbot.meta.office_assistants.indexOf(message.user) >= 0;
  var chatuser = yield db.Chatusers.findOne({id: message.user});
  console.log('chatuser: ', chatuser, message.user);
  // kip.debug('\n\ninside settings.js handler view GOT correct team..', slackbot,'\n\n')

  var attachments = [];

  //adding settings mode sticker
  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: ''
  })

    //
    //http://i.imgur.com/wxoZYmI.png

    //
    // Last call alerts personal settings
    //
    if (chatuser && chatuser.settings.last_call_alerts) {
      attachments.push({ text: 'You are *receiving last-call alerts* for company orders.  Say `no last call` to stop this.'})
    } else {
      attachments.push({text: 'You are *not receiving last-call alerts* before the company order closes. Say `yes last call` to receive them.'})
    }

    //
    // Admins
    //
    var office_admins = slackbot.meta.office_assistants.map(function(user_id) {
      return '<@' + user_id + '>';
    })
    if (office_admins.length > 1) {
      var last = office_admins.pop();
      office_admins[office_admins.length-1] += ' and ' + last;
    }
    console.log(office_admins);

    //no gremlins found! p2p mode
    if(office_admins.length < 1){
      var adminText = 'I\'m not managed by anyone right now.';
    }else {
      var adminText = 'I\'m managed by ' + office_admins.join(', ') + '.';
    }

    if (isAdmin) {
      adminText += '  You can *add and remove admins* with `add @user` and `remove @user`.'
    }else if (slackbot.meta.office_assistants.length < 1){
      adminText += '  You can *add admins* with `add @user`.'
    }
    attachments.push({text: adminText})

    //
    // Admin-only settings
    //
    if (isAdmin) {
      if (slackbot.meta.weekly_status_enabled) {
        // TODO convert time to the correct timezone for this user.
        // 1. Date.parse() returns something in eastern, not the job's timezone
        // 2. momenttz.tz('2016-04-01 HH:mm', meta.weekly_status_timezone) is the correct date for the job
        // 3. .tz(chatuser.tz) will convert the above to the user's timezone. whew
        var date = Date.parse(slackbot.meta.weekly_status_day + ' ' + slackbot.meta.weekly_status_time);
        var job_time_no_tz = momenttz.tz(date, 'America/New_York'); // because it's not really eastern, only the server is
        var job_time_bot_tz = momenttz.tz(job_time_no_tz.format('YYYY-MM-DD HH:mm'), slackbot.meta.weekly_status_timezone);
        // var job_time_user_tz = job_time_bot_tz.tz(chatuser.tz);
        console.log('job time in bot timezone', job_time_bot_tz.format())
        console.log('job time in user timzone', job_time_user_tz.format())
        attachments.push({text: 'You are receiving weekly cart status updates every *' + job_time_user_tz.format('dddd[ at] h:mm a') + ' (' + '*'
          + ')\nYou can turn this off by saying `no weekly status`'
          + '\nYou can change the day and time by saying `change weekly status to Monday 8:00 am`'})
      } else {
        attachments.push({text: 'You are *not receiving weekly cart* updates.  Say `yes weekly status` to receive them.'})
      }
    }

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
        })

    // console.log('SETTINGS ATTACHMENTS ',attachments);

    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })

     var msg = message_tools.text_reply(message, '');
     msg.mode = 'home'
     msg.action = 'view'
     msg.execute = [ {
      "mode": "home",
      "action": "view",
      "_id": message._id
      }]
     msg.source.team = team_id;
     msg.source.channel = typeof msg.source.channel == 'string' ? msg.source.channel : message.thread_id;
     msg.client_res.push(attachments)
     msg.reply = attachments;
     return [msg];
    // return [json]
    // if(flag !== 'noAsk'){
    //   convo.ask({
    //     username: 'Kip',
    //     attachments: [{
    //       text: 'Have any changes? Type `exit` to quit settings',
    //       color:'#49d63a',
    //       mrkdwn_in: ['text'],
    //       fallback:'Settings'
    //     }],
    //     text:'',
    //     fallback:'Settings'
    //   }, handleSettingsChange);
    // }
    // if(flag == 'noAsk'){

    //   console.log('NO ASK ASK ASK ASK ASK ')
    //   done();
    // }

}


handlers['set_last_call'] = function * (message) {

}
