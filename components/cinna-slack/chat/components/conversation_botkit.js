/*eslint-env es6*/
var botkit = require('botkit');
var controller = botkit.slackbot();
var db = require('db');
var co = require('co');
var datejs = require('./date');
var momenttz = require('moment-timezone');
var weeklyUpdate = require('./weekly_updates');
var history = require("./history.js");
var refreshTeam = require('./refresh_team');

/*
slackbot: slackbot_schema
message: slack message { type: 'message',
  channel: 'D0SALMKAB',
  user: 'U0R6NPHDM',
  text: 'bitch please',
  ts: '1458243631.000011',
  team: 'T0R6J00JW' }
*/
module.exports = {};
module.exports.onboard = function(slackbot, user_id, done) {
  var bot = controller.spawn({
    token: slackbot.bot.bot_access_token
  })

  // probably time to refresh the team while messages fly back and forth
  refreshTeam(slackbot.team_id);

  bot.startRTM(function(err, bot, payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }

    bot.startPrivateConversation({user: user_id}, function(response, convo) {
      // inject the slackbot into the convo so that we can save it in the db
      convo.slackbot = slackbot;
      convo.on('end', function() {
        bot.closeRTM();
        done();
      })

      if (slackbot.meta.office_assistants.indexOf(user_id) < 0 && process.env.NODE_ENV === 'production') {
        convo.say('Only the office admin can perform the onboarding process');
        return convo.next();
      } else {
        askWhoManagesPurchases(response, convo);
      }
    });
  });
}

var settingsConvos = {};

module.exports.settings = function(slackbot, user_id, done, data) {
  console.log('passing in data 😅😅 ',data);
  var bot = controller.spawn({
    token: slackbot.bot.bot_access_token
  });

  // probably time to refresh the team while the messages go back and forth
  refreshTeam(slackbot.team_id);


  bot.startRTM(function(err, bot, payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }
    console.log('started RTM')

    // um i think we're getting double callbacks here for some reason?
    // only do the settings thing once!
    var started = false;
    bot.startPrivateConversation({user: user_id}, function(response, convo) {
      if (!started) {
        started = true;
      } else {
        return; // escape if already started.
      }
      // inject the slackbot into the convo so that we can save it in the db
      convo.slackbot = slackbot;
      convo.user_id = user_id;
      settingsConvos[user_id] = convo;
      convo.on('end', function() {
        bot.closeRTM();
        done();
      })
      console.log('showing settings');
      showSettings(response, convo);
    });
  });

}


module.exports.settings_stop = function(user_id) {

  console.log('stopping settings convo for user ' + user_id);

  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ')
  if (settingsConvos[user_id]) {

    settingsConvos[user_id].say('Ok thanks, done with settings.');
    settingsConvos[user_id].next();
  }

}

/*

office location, budget, how often order from amazon. do you already have a slack channel for purchases? we will post weekly reports there?

the admin then should be able to add, remove, modify executive assistants
*/


// Apparently we are plunging headlong into the dark black void of enterprise
// organizational structure and authorization. welp, gotta make money somehow.
function askWhoManagesPurchases(response, convo) {
  convo.ask('Who manages the office purchases? You can say something like "me" or "me and @jane".', function(response, convo) {
    console.log(response);

    var user_is_admin = false;
    var user_id = response.user;

    // check for "skip"
    if (response.text.toLowerCase().trim() === 'skip') {
      // by default put the user in charge of everything
      user_is_admin = true;
      convo.slackbot.meta.office_assistants = [response.user];
    }

    // check for "me" or "i do"
    if (response.text.toLowerCase().match(/(\bme\b|\bi do\b)/) && response.text.toLowerCase().indexOf('and') < 0) {
      convo.slackbot.meta.office_assistants = [response.user];
      user_is_admin = true;


          var attachments = [
              {
                "pretext": "Great!  I'll keep you up-to-date on what your team members are adding to the office shopping cart 😊",
                "image_url":"http://i.imgur.com/PqrtJmD.png",
                "text":"",
                "color":"#45a5f4"
              },
              {
                  "text": "Tell me what you're looking for. Or type `settings` for more options",
                  "mrkdwn_in": [
                      "text",
                      "pretext"
                  ],
                  "color":"#45a5f4"
              }
          ];

          var resStatus = {
            username: 'Kip',
            text: "",
            attachments: attachments,
            fallback: 'Shopping'
          };

          convo.say(resStatus);



      convo.say("")
    }

    // check for something like "nobody"
    if (response.text.toLowerCase().match(/^(no one|nobody|noone)/)) {
      convo.slackbot.meta.office_assistants = [response.user];
      user_is_admin = true;
      convo.say("Well, I'll put you in charge of me, then!")
    }

    // check for mentioned users
    // for a typed message like "that would be @dan"
    // the response.text would be like  "that would be <@U0R6H9BKN>"
    var office_gremlins = response.text.match(/(\<\@[^\s]+\>|\bme\b)/ig) || [];
    response.text = response.text.replace(/(\<\@[^\s]+\>|\bme\b)/ig, '');

    // also look for users mentioned by name without the @ symbol
    db.Chatusers.find({
      team_id: convo.slackbot.team_id,
      is_bot: {$ne: true}
    }).select('id name').exec(function(e, users) {

      users.map((u) => {
        var re = new RegExp('\\b' + u.name + '\\b', 'i')
        if (response.text.match(re)) {
          office_gremlins.push('<@' + u.id + '>');
        }
      })

      if (office_gremlins && office_gremlins.length > 0 && !user_is_admin) {
        convo.slackbot.meta.office_assistants = office_gremlins.map(function(handle) {
          if (handle.toLowerCase() === 'me') {
            user_is_admin = true;
            return response.user;
          } else {
            return handle.replace(/(\<\@|\>)/g, '');
          }
        })

        console.log(office_gremlins)
        office_gremlins = office_gremlins.map(function(handle) {
          if (handle.toLowerCase() === 'me') {
            return 'you';
          } else {
            return handle;
          }
        });
        console.log(office_gremlins)

        if (office_gremlins.length > 1) {
          var last = office_gremlins.pop();
          office_gremlins[office_gremlins.length-1] += ' and ' + last;
        }

        convo.say('Great.  I have added ' + office_gremlins.join(', ') + ' to the list of office admins.  I keep all the office admins up-to-date on what team members are adding to the office shopping cart.')
      }

      // check if we didn't get it
      if (!convo.slackbot.meta.office_assistants || convo.slackbot.meta.office_assistants.length === 0) {
        // we didn't get it... ask again.
        convo.say('I didn\'t quite understand that.  Type "skip" to skip')
        askWhoManagesPurchases(response, convo);
        return convo.next();
      }

      db.Slackbots.update({_id: convo.slackbot._id}, {$set: {'meta.office_assistants': convo.slackbot.meta.office_assistants}}, function(e) {
        if (e) { console.error(e) }

        // send the office admins welcome messages and show them all the welcome video
        convo.slackbot.meta.office_assistants.map(function(id) {
          if (id === response.user) { return; }
          console.log('starting admin welcome conversation with ' + id)
          var slackbot = convo.slackbot;

          var bot = controller.spawn({
            token: slackbot.bot.bot_access_token
          })

          bot.startRTM(function(err, bot, payload) {
            if (err) {
              throw new Error('Could not connect to Slack');
            }

            bot.startPrivateConversation({user: id}, function(response, convo) {
              // inject the slackbot into the convo so that we can save it in the db
              if (!convo) {
                return; // i guess this user doesn't exist anymore?
              }
              convo.slackbot = slackbot;
              convo.on('end', function() {
                bot.closeRTM();
              })
              convo.say("Hi! I'm Kip, your office shopping helper bot! <@$user> told me to make you an admin for the team, so I'll keep you up-to-date on what team members are adding to the office shopping cart.".replace('$user', user_id))
              welcomeVid(response, convo);
            });
          });

        })

        // show this user the welcome video
        welcomeVid(response, convo);
      });
    })
  })
}

// welcome video
function welcomeVid(response, convo) {
  // TODO
  // convo.say('Check out this 🔥 vid the squad made')
  convo.next()
}

// Show the user their settings
function showSettings(response, convo, flag, done) {
  console.log('showing settings');
  var isAdmin = convo.slackbot.meta.office_assistants.indexOf(convo.user_id) >= 0;
  co(function*() {
    var chatuser = yield db.Chatusers.findOne({id: convo.user_id});
    convo.chatuser = chatuser;
    // console.log(chatuser);
    // console.log(convo.slackbot)

    var attachments = [];

    //adding settings mode sticker
    attachments.push({
      image_url: 'http://i.imgur.com/Z1Cgl7X.png',
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
    var adminText = 'I am moderated by ' + office_gremlins.join(', ') + '.';
    if (isAdmin) {
      adminText += '  You can *add and remove admins* with `add @user` and `remove @user`.'
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

    console.log(attachments);

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
        text: 'Have any changes? Type `exit` to quit settings.'
      }, handleSettingsChange);
    }
    if(flag == 'noAsk'){
      done();
    }


  }).catch(function(e) {
    console.log('error finding the user');
    console.log(e)
  })
}

function handleSettingsChange(response, convo) {

  // we'll need to know if the user is an admin or not.
  var isAdmin = convo.slackbot.meta.office_assistants.indexOf(convo.user_id) >= 0;

  co(function*() {
    //
    // Deal with the most complicated changes first, and finish up with the easy stuff
    // Start with the date changes, yikes
    //
    var change_weekly_regex = /^(change|update) weekly (status|update)/;
    if (response.text.toLowerCase().trim().match(change_weekly_regex)) {
      // make the text nice
      var text = response.text.replace(/^(change|update) weekly (status|update)/, '').trim();
      text = text.replace('days', 'day');
      text = text.replace(/(to|every|\bat\b)/g, '');
      text = text.trim();

      // this date library cannot understand Tuesday at 2
      // but it does understand Tuesday at 2:00
      if (text.indexOf(':') < 0) {
        text = text.replace(/([\d]+)/, '$1:00')
      }
      // for some reason, Date.js cannot parse 12:30 pm, but can parse 12:30
      if (text.indexOf('12:') >= 0) {
        console.log('text'. text )
        if (text.match(/(am|a.m.|a m)/i)) {
          text = text.replace(/(am|a.m.|a m)/i, '')
          text = text.replace('12:', '00:');
        } else {
          text = text.replace(/(pm|p.m.|p m)/i, '')
        }
      }
      console.log(text);
      var date = Date.parse(text);
      console.log(date);
      var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      console.log(dayOfWeek)
      var hour = date.getHours();

      // if they type Tuesdays at 4 they probably mean 4 pm
      if (hour > 0 && hour < 7 && !text.match(/(\bam\b|\bpm\b)/i)) {
        hour = hour + 12;
      } else if (hour > 18 && !text.match(/(\bam\b|\bpm\b)/i)) {
        hour = hour - 12;
      }
      var minute = date.getMinutes();
      var am_pm = 'AM';
      if (hour > 12) {
        hour = hour - 12; // bc americans don't do 24 hour times.
        am_pm = 'PM';
      }

      convo.slackbot.meta.weekly_status_day = dayOfWeek;
      convo.slackbot.meta.weekly_status_time = hour + ':' + ('00' + minute).substr(-2) + ' ' + am_pm;
      convo.slackbot.meta.weekly_status_timezone = convo.chatuser.tz;
      console.log(convo.slackbot.meta);
      yield convo.slackbot.save();
      yield weeklyUpdate.updateJob(convo.slackbot.team_id);

      convo.say('Ok I have updated your settings 😊')
      showSettings(response, convo);
      return convo.next();
    }

    //
    // Add/remove admins (only admins can do this)
    //
    var tokens = response.text.toLowerCase().trim().split(' ');
    if (isAdmin && ['add', 'remove'].indexOf(tokens[0]) >= 0) {

      // look for users mentioned with the @ symbol
      var userIds = tokens.filter((t) => {
        return t.indexOf('<@') === 0;
      }).map((u) => {
        return u.replace(/(\<\@|\>)/g, '').toUpperCase();
      })

      // also look for users mentioned by name without the @ symbol
      var users = yield db.Chatusers.find({
        team_id: convo.slackbot.team_id,
        is_bot: {$ne: true}
      }).select('id name').exec();

      users.map((u) => {
        var re = new RegExp('\\b' + u.name + '\\b', 'i')
        if (response.text.match(re)) {
          userIds.push(u.id);
        }
      });

      console.log(userIds);
      if (userIds.length === 0) {
        var attachments = [
          {
            text: "I'm sorry, I couldn't understand that.  Do you have any settings changes?"
          }
        ];

        var resStatus = {
          username: 'Kip',
          text: "",
          attachments: attachments,
          fallback: 'Settings'
        };

        showSettings(response, convo, 'noAsk', function(){});

        convo.ask(resStatus, handleSettingsChange);
        return convo.next();
      }


      var shouldReturn = false;
      if (tokens[0] === 'add') {
        userIds.map((id) => {
          if (convo.slackbot.meta.office_assistants.indexOf(id) < 0) {
            convo.slackbot.meta.office_assistants.push(id);
          }
        })
      } else if (tokens[0] === 'remove') {
        userIds.map((id) => {
          if (id == convo.user_id) {
            var attachments = [
              {
                text: "I'm sorry, but you can't remove yourself as an admin.  Do you have any settings changes?"
              }
            ];

            var resStatus = {
              username: 'Kip',
              text: "",
              attachments: attachments,
              fallback: 'Settings'
            };

            // showSettings(response, convo, 'noAsk', function(){});

            convo.ask(resStatus, handleSettingsChange);
            shouldReturn = true;
            return convo.next();
          }

          if (convo.slackbot.meta.office_assistants.indexOf(id) >= 0) {
            var index = convo.slackbot.meta.office_assistants.indexOf(id);
            convo.slackbot.meta.office_assistants.splice(index, 1);
          } else {
            var attachments = [
              {
                text: 'Looks like <@' + id + '> was not an admin.  Do you have any settings changes?'
              }
            ];

            var resStatus = {
              username: 'Kip',
              text: "",
              attachments: attachments,
              fallback: 'Settings'
            };

            // showSettings(response, convo, 'noAsk', function(){});

            convo.ask(resStatus, handleSettingsChange);
            convo.next();
            shouldReturn = true;
          }
        })
      }

      if (shouldReturn) {
        return;
      }

      yield convo.slackbot.save();
      convo.say('Ok, I have updated your settings 😊');
      showSettings(response, convo);
      return convo.next();
    }

    //
    // Simple commands to change settings
    //
    switch (response.text.toLowerCase().trim()) {
      case 'yes weekly status':
      case 'yes weekly update':
        convo.slackbot.meta.weekly_status_enabled = true;
        yield convo.slackbot.save();
        break;

      case 'yes weekly status':
      case 'yes weekly update':
        convo.slackbot.meta.weekly_status_enabled = true;
        yield convo.slackbot.save();
        break;

      case 'yes last call':
        convo.chatuser.settings.last_call_alerts = true;
        yield convo.chatuser.save();
        break;

      case 'no last call':
        convo.chatuser.settings.last_call_alerts = false;
        yield convo.chatuser.save();
        break;

      default:

        // the question was something like "Do you have any settings changes?"
        // so we need to allow the user to say "yes" or "no"
        if (response.text.match(convo.task.botkit.utterances.yes)) {
          convo.ask('Yes? I\'m listening', handleSettingsChange)
          return convo.next();

        //EXITING SETTINGS MODE
        } else if (response.text.match(convo.task.botkit.utterances.no)
            || response.text.match(/^(end|exit|finish|done|quit|settings exit|stop|quit|search|shopping|shop|buy)/)
            || response.text === 'stop') {


          //FUNCTION CHECK FOR STOP WORDS, SEND BACK RESPONSE IN ATTACHMENT FORMAT

          var attachments = [
              {
                "pretext": "Ok thanks! Done with settings 😊",
                "image_url":"http://i.imgur.com/PqrtJmD.png",
                "text":"",
                "color":"#45a5f4"
              },
              {
                  "text": "Tell me what you're looking for, or use `help` for more options",
                  "mrkdwn_in": [
                      "text",
                      "pretext"
                  ],
                  "color":"#45a5f4"
              }
          ];

          var resStatus = {
            username: 'Kip',
            text: "",
            attachments: attachments,
            fallback: 'Shopping'
          };

          convo.say(resStatus);

          //FUNCTION IO.JS UPDATE MODE

          return convo.next();
        }


        var attachments = [
          {
            text: "I'm sorry, I couldn't understand that.  Do you have any settings changes?"
          }
        ];

        var resStatus = {
          username: 'Kip',
          text: "",
          attachments: attachments,
          fallback: 'Settings'
        };

        showSettings(response, convo, 'noAsk', function(){});

        convo.ask(resStatus, handleSettingsChange);

        return convo.next();


    }

    convo.say('Ok I have updated your settings.')
    showSettings(response, convo);
    convo.next();

  }).catch(function(e) {
    console.log('error handling settings change')
    console.log(response)
    console.log(e)


    // switch(user.conversations[data.channel]){
    //       case 'settings':

    //           var attachments = [];

    //           //adding settings mode sticker
    //           attachments.push({
    //               image_url: 'http://i.imgur.com/wxoZYmI.png',
    //               text: ''
    //           })

    //           user.conversations[data.channel]
    //       break;
    // }

        //IF CANT UNDERSTAND...

        // var attachments = [
        //   {
        //     image_url: 'http://i.imgur.com/Z1Cgl7X.png',
        //     text: ""
        //   },
        //   {
        //     text: "I'm sorry, I couldn't understand that.  Do you have any settings changes?"
        //   }
        // ];

        // var resStatus = {
        //   username: 'Kip',
        //   text: "",
        //   attachments: attachments,
        //   fallback: 'Settings'
        // };

        // return convo.ask(resStatus, handleSettingsChange);


        var attachments = [
          {
            text: "I'm sorry, I couldn't understand that.  Do you have any settings changes?"
          }
        ];

        var resStatus = {
          username: 'Kip',
          text: "",
          attachments: attachments,
          fallback: 'Settings'
        };

        showSettings(response, convo, 'noAsk', function(){});

        convo.ask(resStatus, handleSettingsChange);

        return convo.next();



    //convo.ask("I'm sorry, I couldn't understand that.  Do you have any settings changes?", handleSettingsChange);

    convo.next();
  })
}


// TODO do these even matter?
function askLocation(response, convo) {
  convo.ask('What is your office address?', function(response, convo) {
    convo.say('Ok')
    askBudget(response, convo)
    convo.next();
  })
}

function askBudget(response, convo) {
  convo.ask('What is your weekly budget?', function(response, convo) {
    convo.say('Great')

  })
}
