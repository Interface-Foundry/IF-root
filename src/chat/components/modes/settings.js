var message_tools = require('../message_tools')
var handlers = module.exports = {}

/**
 * Show the user all the settings they have access to
 */
handlers['view'] = function * (message) {
  var isAdmin = convo.slackbot.meta.office_assistants.indexOf(convo.user_id) >= 0;
    var chatuser = yield db.Chatusers.findOne({id: convo.user_id});
    convo.chatuser = chatuser;
    // console.log(chatuser);
    // console.log(convo.slackbot)

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
    if (chatuser.settings.last_call_alerts) {
      attachments.push({
        text: 'You are *receiving last-call alerts* for company orders.  Say `no last call` to stop this.'
      })
    } else {
      attachments.push({text: 'You are *not receiving last-call alerts* before the company order closes. Say `yes last call` to receive them.'})
    }

    //
    // Admins
    //
    var office_gremlins = convo.slackbot.meta.office_assistants.map(function(user_id) {
      return '<@' + user_id + '>';
    })
    if (office_gremlins.length > 1) {
      var last = office_gremlins.pop();
      office_gremlins[office_gremlins.length-1] += ' and ' + last;
    }
    console.log(office_gremlins);

    //no gremlins found! p2p mode
    if(office_gremlins.length < 1){
      var adminText = 'I\'m not managed by anyone right now.';
    }else {
      var adminText = 'I\'m managed by ' + office_gremlins.join(', ') + '.';
    }

    if (isAdmin) {
      adminText += '  You can *add and remove admins* with `add @user` and `remove @user`.'
    }else if (convo.slackbot.meta.office_assistants.length < 1){
      adminText += '  You can *add admins* with `add @user`.'
    }
    attachments.push({text: adminText})

    //
    // Admin-only settings
    //
    if (isAdmin) {
      if (convo.slackbot.meta.weekly_status_enabled) {
        // TODO convert time to the correct timezone for this user.
        // 1. Date.parse() returns something in eastern, not the job's timezone
        // 2. momenttz.tz('2016-04-01 HH:mm', meta.weekly_status_timezone) is the correct date for the job
        // 3. .tz(chatuser.tz) will convert the above to the user's timezone. whew
        var date = Date.parse(convo.slackbot.meta.weekly_status_day + ' ' + convo.slackbot.meta.weekly_status_time);
        var job_time_no_tz = momenttz.tz(date, 'America/New_York'); // because it's not really eastern, only the server is
        var job_time_bot_tz = momenttz.tz(job_time_no_tz.format('YYYY-MM-DD HH:mm'), convo.slackbot.meta.weekly_status_timezone);
        var job_time_user_tz = job_time_bot_tz.tz(convo.chatuser.tz);
        console.log('job time in bot timezone', job_time_bot_tz.format())
        console.log('job time in user timzone', job_time_user_tz.format())
        attachments.push({text: 'You are receiving weekly cart status updates every *' + job_time_user_tz.format('dddd[ at] h:mm a') + ' (' + convo.chatuser.tz.replace(/_/g, ' ') + '*'
          + ')\nYou can turn this off by saying `no weekly status`'
          + '\nYou can change the day and time by saying `change weekly status to Monday 8:00 am`'})
      } else {
        attachments.push({text: 'You are *not receiving weekly cart* updates.  Say `yes weekly status` to receive them.'})
      }
    }

    console.log('SETTINGS ATTACHMENTS ',attachments);

    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })

    convo.say({
      username: 'Kip',
      text: '',
      attachments: attachments,
      fallback: 'Settings'
    })

    if(flag !== 'noAsk'){
      convo.ask({
        username: 'Kip',
        attachments: [{
          text: 'Have any changes? Type `exit` to quit settings',
          color:'#49d63a',
          mrkdwn_in: ['text'],
          fallback:'Settings'
        }],
        text:'',
        fallback:'Settings'
      }, handleSettingsChange);
    }
    if(flag == 'noAsk'){

      console.log('NO ASK ASK ASK ASK ASK ')
      done();
    }

}


handlers['update'] = function * (message) {

}
