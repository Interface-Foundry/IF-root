/*eslint-env es6*/
var db = require('db');
var co = require('co');
var cron = require('cron');
var datejs = require('./date');
var momenttz = require('moment-timezone');
var botkit = require('botkit');
var controller = botkit.slackbot();
var promisify = require('promisify-node');

//
// In-memory hash of jobs so we can stop and start them
// According to the internet, cron jobs are commonly referred to as "jerbs"
//
var jerbs = {};

//
// Initialize the jobs for each team on server startup
//
co(function*() {
  var slackbots = yield db.Slackbots.find({
    'meta.weekly_status_enabled': true
  }).select('team_id').exec();

  yield slackbots.map(function(bot) {
    return updateJob(bot.team_id)
  })

}).catch(function(e) {
  console.log('error setting up jobs');
  console.log(e);
})

//
// Function to set up a job (jerb?) for a particular team_id using whatever is in the DB right now
//
var updateJob = module.exports.updateJob = function(team_id) {
  return co(function*() {

    console.log('updating weekly job for team ' + team_id);
    var slackbot = yield db.Slackbots.findOne({
      team_id: team_id
    }).exec();

    var date = Date.parse(slackbot.meta.weekly_status_day + ' ' + slackbot.meta.weekly_status_time);
    var job_time_no_tz = momenttz.tz(date, 'America/New_York'); // because it's not really eastern, only the server is
    var job_time_bot_tz = momenttz.tz(job_time_no_tz.format('YYYY-MM-DD HH:mm'), slackbot.meta.weekly_status_timezone);

    console.log('setting weekly job for team ' + team_id + ' ' + slackbot.team_name + ' at ' + job_time_bot_tz.format('00 mm HH * * d') + ' ' + slackbot.meta.weekly_status_timezone);

    //
    // Stop the old jerb if it exists
    //
    if (jerbs[team_id]) {
      jerbs[team_id].stop();
    }

    //
    // Start the new jerb!
    //
    jerbs[team_id] = new cron.CronJob(job_time_bot_tz.format('00 mm HH * * d'), function() {
      console.log('starting weekly update for team ' + team_id + ' ' + slackbot.team_name);

      //
      // Set up the bot
      //
      var bot = controller.spawn({
        token: slackbot.bot.bot_access_token
      })

      promisify


      bot.startRTM(function(err, bot, payload) {
        if (err) {
          throw new Error('Could not connect to Slack');
        }

        slackbot.meta.office_assistants.map(function(assistant) {
          bot.startPrivateConversation({user: assistant}, function(response, convo) {
            // inject the slackbot into the convo so that we can save it in the db
            convo.slackbot = slackbot;
            convo.bot = bot;
            convo.user_id = assistant;
            convo.on('end', function() {
              bot.closeRTM();
            })
            convo.say('Hi, this is your weekly update');
            convo.ask('Would you like me to send an last call message to all your employees?', lastCall)
            convo.next();
          });
        });
      });
    }, function() {
      console.log('just finished the weekly update thing for team ' + team_id + ' ' + slackbot.team_name);
    },
    true,
    slackbot.meta.weekly_status_timezone);


  }).catch(function(e) {
    console.log('error settings up job for team ' + team_id);
    console.log(e);
  })
}

module.exports.collect = function(team_id, person_id, callback) {
  co(function*() {
    // um let's refresh the slackbot just in case...
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();

    console.log(slackbot.meta.office_assistants);
    console.log(person_id);
    if (slackbot.meta.office_assistants.indexOf(person_id) < 0) {
      // oh no the person is not an admin, whatever will we do???
      console.log('cannot do this b/c the person is def not an admin');

      return;
    }

    //
    // Set up the bot
    //
    var bot = controller.spawn({
      token: slackbot.bot.bot_access_token
    });

    // whee!  cannot promisify botkit, soooooo here we go!
    bot.startRTM(function(e, bot, payload) {
      bot.startPrivateConversation({user: person_id}, function(response, convo) {
        convo.slackbot = slackbot;
        convo.bot = bot;
        convo.user_id = person_id;
        convo.on('end', function() {
          console.log('ending collection convo');
          bot.closeRTM();
          callback();
        })
        convo.interrupted = false;
        convo.ask('Okay, in 5 seconds I\'ll send the last call message to all users.  Say `wait` or `stop` to prevent this.', lastCall);
        setTimeout(function() {
          lastCall({text: ''}, convo);
        }, 5000)
      })
    })
  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}

// just regular collect except that it restricts the messages to a specific user list
module.exports.collectFromUsers = function(team_id, person_id, channel, users, callback) {
  co(function*() {
    // um let's refresh the slackbot just in case...
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();

    console.log(slackbot.meta.office_assistants);
    console.log(person_id);
    if (slackbot.meta.office_assistants.indexOf(person_id) < 0) {
      // oh no the person is not an admin, whatever will we do???
      console.log('cannot do this b/c the person is def not an admin');
      return;
    }

    //
    // Set up the bot
    //
    var bot = controller.spawn({
      token: slackbot.bot.bot_access_token
    });

    // whee!  cannot promisify botkit, soooooo here we go!
    bot.startRTM(function(e, bot, payload) {
      bot.startPrivateConversation({user: person_id}, function(response, convo) {
        convo.slackbot = slackbot;
        convo.bot = bot;
        convo.user_id = person_id;
        convo.users = users;
        convo.on('end', function() {
          console.log('ending collection convo');
          bot.closeRTM();
          callback();
        })
        convo.interrupted = false;
        convo.ask('Okay, in 5 seconds I\'ll send a last call message to all ' + convo.users.length + ' users in <#' + channel + '> for 60 minutes from now. Say `wait` or `stop` to prevent this.', lastCall);
        setTimeout(function() {
          lastCall({text: ''}, convo);
        }, 5000)
      })
    })
  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}

//
// Sends a "last call" message to everyone who has not shut Kip up about messages like this
//
function lastCall(response, convo) {
  // Catch message interrupts
  if (response.text.toLowerCase().match(/(wait|stop)/)) {
    convo.say('Ok, stopping the message.'); // What\'s up?  You can say something like `change time limit 30 minutes`', lastCall);
    convo.interrupted = true;
    return convo.next();
  }

  // first check for a specific time change
  if (response.text.toLowerCase().match(/(minute|hour)/)) {
    //
    console.log('um attempting to change the length of the last call thingy');

  } else if (response.text !== '') {
    convo.say("I'm sorry I couldn't understand that.  Sending the last call message.  Say `wait` or `stop` to prevent this.", lastCall)
    convo.next();
  }

  co(function*() {
    // maybe i should update the team roster here???
    if (!convo.users) {
      // sent to the whole team
      convo.users = yield db.Chatusers.find({
        team_id: convo.slackbot.team_id,
        is_bot: false,
        id: { '$ne': 'USLACKBOT' }, // because slackbot is not marked as a bot?
        'meta.last_call_alerts': { '$ne': false }
      }).exec();
    } else {
      // sent to a particular channel
      // remove all users which have disabled last call alerts
      convo.users = yield db.Chatusers.find({
        'id': {$in: convo.users},
        'meta.last_call_alerts': { '$ne': false },
        is_bot: false,
      }).exec();
    }

    var admin = convo.user_id;

    console.log('sending last call to all ' + convo.users.length + ' users');
    yield convo.users.map(function(u) {
      return new Promise(function(resolve, reject) {
        convo.bot.startPrivateConversation({user: u.id}, function(response, convo) {
          convo.on('end', function() {
            resolve();
          });
          convo.say('Hi!  <@' + admin + '> wanted to let you know that they will be placing the office supply order soon, so add something to the cart before it\'s too late!')
          convo.say('The clock\'s ticking! You have *60* minutes.');
          convo.next();
        });
      })
    })

    // continue the admin's conversation if there's anything left to say.

    // todo continue the conversation.  maybe say something like "you can extend the countdown by typing 'extend countdown'"
    console.log('calling next');
    convo.next();

  }).catch((e) => {
    console.log('error');
    console.log(e);
    convo.next();
  });
}
