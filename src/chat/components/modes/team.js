var message_tools = require('../message_tools');
var handlers = module.exports = {};
var _ = require('lodash');
var validator = require('validator');


function * handle(message) {
  var last_action = _.get(message, 'history[0].action')
  if (!last_action || last_action.indexOf('team') == -1) {
    kip.debug('\n\ninside /modes/team.js firing handle..\n\n')
    return yield handlers['start'](message)
  } else if (last_action === 'team.set_last_call') {
    return yield handlers[''](message)
  }
}

module.exports.handle = handle;


/**
 * Show the user all the settings they have access to
 */
handlers['start'] = function * (message) {
  kip.debug('\n\ninside team.js handler view..\n\n', message)
  var team_id = message.source.team;
  if (team_id == null) {
    return kip.debug('incorrect team id : ', message);
  }
  var slackbot = yield db.Slackbots.findOne({
    'team_id': team_id
  }).exec();

  if (!slackbot.meta.cart_channels){
      slackbot.meta.cart_channels = [];
  }
  var cartChannels = slackbot.meta.cart_channels;
  console.log('slackbot: ', slackbot);
  var isAdmin = slackbot.meta.office_assistants.indexOf(message.user) >= 0;
  kip.debug('\n\ninside team.js handler view GOT correct team..', slackbot,'\n\n')
  var attachments = [];
  //adding settings mode sticker
  attachments.push({
    image_url: 'http://kipthis.com/kip_modes/mode_settings.png',
    text: ''
  })
  var chatuser = yield db.Chatusers.findOne({id: message.user});
  //
  // Last call alerts personal settings
  //
  if (chatuser && chatuser.settings.last_call_alerts) {
    attachments.push({
      text: 'You are *receiving last-call alerts* for company orders.  Say `no last call` to stop this.'
    })
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

    //no admin found! p2p mode
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
                "name": "home",
                "text": "🐧",
                "style": "default",
                "type": "button",
                "value": "home"
              }
          ],
          callback_id: 'none'
        })

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

