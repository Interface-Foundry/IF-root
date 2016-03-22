var botkit = require('botkit')
var controller = botkit.slackbot();
var db = require('db')

/*
slackbot: slackbot_schema
message: slack message { type: 'message',
  channel: 'D0SALMKAB',
  user: 'U0R6NPHDM',
  text: 'bitch please',
  ts: '1458243631.000011',
  team: 'T0R6J00JW' }
*/
module.exports = {}
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
              done();
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
  convo.say('Check out this 🔥 vid the squad made')
  convo.next()
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
