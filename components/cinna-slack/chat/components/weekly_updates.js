/*eslint-env es6*/
var db = require('db');
var co = require('co');
var cron = require('cron');
var datejs = require('./date');
var momenttz = require('moment-timezone');
var botkit = require('botkit');
var controller = botkit.slackbot();

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

//
// Sends a "last call" message to everyone who has not shut Kip up about messages like this
//
function lastCall(response, convo) {
  if (response.text.match(convo.bot.utterances.yes)) {
    console.log('sending last call message to everybody woooo');

    co(function*() {
      // maybe i should update the team roster here???
      var users = yield db.Chatusers.find({
        team_id: convo.slackbot.team_id,
        is_bot: false,
        id: { '$ne': 'USLACKBOT' }, // because slackbot is not marked as a bot?
        'meta.last_call_alerts': { '$ne': false }
      }).exec();

      var admin = convo.user_id;

      yield users.map(function(u) {
        return new Promise(function(resolve, reject) {
          console.log('sending message to user ' + u.id);
          convo.bot.startPrivateConversation({user: u.id}, function(response, convo) {
            debugger;
            console.log('wow come on ' + u.id)
            convo.say('Hi!  <@' + admin + '> wanted to let you know that they will be placing the office supply order soon, so add something to the cart before it\'s too late!');
            convo.on('end', resolve);
          })
        })
      })

      // continue the admin's conversation if there's anything left to say.
      convo.next();
    }).catch((e) => {
      console.log(e);
    })
  } else if (response.text.match(convo.bot.utterances.no)) {
    console.log('no last call');
    convo.say('OK, you can `checkout` whenever you\'re ready');
    convo.next();
  } else {
    convo.say("I'm sorry I couldn't understand that.  Should I send out a last call message?", lastCall)
    convo.next();
  }
}
