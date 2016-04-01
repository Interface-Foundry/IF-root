/*eslint-env es6*/
var botkit = require('botkit');
var controller = botkit.slackbot();
var db = require('db');
var co = require('co');
var datejs = require('./date');
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
      askWhoManagesPurchases(response, convo);
    });
  });
}

module.exports.settings = function(slackbot, user_id, done) {
  var bot = controller.spawn({
    token: slackbot.bot.bot_access_token
  });


  bot.startRTM(function(err, bot, payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }

    bot.startPrivateConversation({user: user_id}, function(response, convo) {
      // inject the slackbot into the convo so that we can save it in the db
      convo.slackbot = slackbot;
      convo.user_id = user_id;
      convo.on('end', function() {
        bot.closeRTM();
        done();
      })
      console.log('showing settings');
      showSettings(response, convo);
    });
  });

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
      convo.say("Great!  I'll keep you up-to-date on what your team members are adding to the office shopping cart.")
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
    var office_gremlins = response.text.match(/(\<\@[^\s]+\>|\bme\b)/ig);
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
function showSettings(response, convo) {
  console.log('showing settings');
  co(function*() {
    var chatuser = yield db.Chatusers.findOne({id: convo.user_id});
    convo.chatuser = chatuser;
    console.log(chatuser);
    console.log(convo.slackbot)

    var attachments = [];

    //
    // Last call alerts personal settings
    //
    if (chatuser.settings.last_call_alerts) {
      attachments.push({
        text: 'You are receiving last-call alerts for company orders.  Say `no last call` to stop this.'
      })
    } else {
      attachments.push({text: 'You are not receiving last-call alerts before the company order closes. Say `yes last call` to receive them.'})
    }

    //
    // Admins
    //
    var office_gremlins = convo.slackbot.meta.office_assistants.map(function(user_id) {
      return '<@' + user_id + '>';
    })
    if (office_gremlins.length >= 1) {
      var last = office_gremlins.pop();
      office_gremlins[office_gremlins.length-1] += ' and ' + last;
    }
    attachments.push({text: 'I am moderated by ' + office_gremlins.join(', ') + '.'})

    //
    // Admin-only settings
    //
    if (convo.slackbot.meta.office_assistants.indexOf(convo.user_id) < 0) {
      return convo.next();
    }
    if (convo.slackbot.meta.weekly_status_enabled) {
      attachments.push({text: 'You are receiving weekly cart status updates every ' + convo.slackbot.meta.weekly_status_day + ' at ' + convo.slackbot.meta.weekly_status_time
        + '\nYou can turn this off by saying `no weekly status`'
        + '\nYou can change the day and time by saying `change weekly status to Monday 8:00 AM`'})
    } else {
      attachments.push({text: 'You are not receiving weekly cart status updates.  Say `yes weekly status` to receive them.'})
    }

    console.log(attachments);

    // make all the attachments markdown
    attachments.map(function(a) {
      a.mrkdwn_in =  ['text'];
      a.color = '#45a5f4';
    })

    convo.say({
      username: 'Kip',
      text: 'Settings',
      attachments: attachments
    })

    convo.ask({
      username: 'Kip',
      text: 'Have any changes?'
    }, handleSettingsChange);

  }).catch(function(e) {
    console.log('error finding the user');
    console.log(e)
  })
}

function handleSettingsChange(response, convo) {

  console.log(response.text);
  co(function*() {
    //
    // Deal with the most complicated changes first, and finish up with the easy stuff
    //
    var change_weekly_regex = /^(change|update) weekly (status|update)/;
    if (response.text.toLowerCase().trim().match(change_weekly_regex)) {
      // make the text nice
      var text = response.text.replace(/^(change|update) weekly (status|update)/, '').trim();
      text = text.replace('days', 'day');
      text = text.replace(/(to|every|\bat\b)/g, '');
      text = text.trim();
      // text = text.replace(/ [\d]+/)
      console.log(text);
      var date = Date.parse(text);
      console.log(date);
      var dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
      console.log(dayOfWeek)
      var hour = date.getHours();

      // if they type Tuesdays at 4 they probably mean 4 pm
      if (hour < 7 && !text.match(/(\bam\b|\bpm\b)/i)) {
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
      console.log(convo.slackbot.meta)
      yield convo.slackbot.save();

      convo.say('Ok I have updated your settings.')
      showSettings(response, convo);
      return convo.next();
    }

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
          convo.ask('Go ahead, I\'m listening.', handleSettingsChange)
          return convo.next();
        } else if (response.text.match(convo.task.botkit.utterances.no)) {
          convo.say('Ok thanks.');
          return convo.next();
        }

        return convo.ask("I'm sorry, I couldn't understand that.  Do you have any settings changes?", handleSettingsChange);
    }

    convo.say('Ok I have updated your settings.')
    showSettings(response, convo);
    convo.next();

  }).catch(function(e) {
    console.log('error handling settings change')
    console.log(response)
    console.log(e)
    convo.ask("I'm sorry, I couldn't understand that.  Do you have any settings changes?", handleSettingsChange);
    convo.next();
  })
}


// TODO do these even matter?
function askLocation(response, convo) {
  convo.ask('What is your office address?', function(response, convo) {
    convo.say('Ok.')
    askBudget(response, convo)
    convo.next();
  })
}

function askBudget(response, convo) {
  convo.ask('What is your weekly budget?', function(response, convo) {
    convo.say('Great.')

  })
}
