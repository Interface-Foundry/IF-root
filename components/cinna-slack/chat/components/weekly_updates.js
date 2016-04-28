/*eslint-env es6*/
var db = require('db');
var Chatuser = db.Chatuser;
var co = require('co');
var cron = require('cron');
var datejs = require('./date');
var momenttz = require('moment-timezone');
var botkit = require('botkit');
var controller = botkit.slackbot();
var promisify = require('promisify-node');
var validator = require('validator');
var mailerTransport = require('../../../IF_mail/IF_mail.js');
var async = require('async');

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

module.exports.collect = function(team_id, person_id, emailUsers,callback) {
  co(function*() {
    // um let's refresh the slackbot just in case...
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();
    console.log('slackbot: ',slackbot);
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
          lastCall({text: ''}, convo, emailUsers);
        }, 5000)
      })
    })
  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}

// just regular collect except that it restricts the messages to a specific user list
module.exports.collectFromUsers = function(team_id, person_id, channel, users, emailUsers,callback) {
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
          lastCall({text: ''}, convo, emailUsers);
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
function lastCall(response, convo, emailUsers) {
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

  if (emailUsers && emailUsers.length > 0) {
    // async repeat
    async.eachSeries(emailUsers, function iterator(user, callback) {
       var mailOptions = {
            to: user.profile.email.split('mailto:')[1].split('|')[0],
            from: 'Kip Bot <hello@kip.ai>',
            subject: 'Reminder from Kip Bot!',
            text: 'Hi! ' + user.name + ' wanted to let you know that they will be placing the office supply order soon, so add something to the cart before it\'s too late! Simply respond to this email with your choice ( 1, 2, or 3).'
        };
        mailerTransport.sendMail(mailOptions, function(err) {
            if (err) {
              console.log('weekly_updates: ~234: err: ', err);
              callback();
            } else{ 
              user.settings.awaiting_email_response = true;
              user.save(function(err, saved) {
                if (err) console.log('weekly_updates: err: '. err)
                callback();
              })
            }
        });
    }, function finished(err, result){
      if (err) { 
          console.log('weekly_updates: ~239: err: ', err) 
      }
      else { 
          console.log('Finished sending collect emails!') 
      }
    }) 

  }

  co(function*() {
    // maybe i should update the team roster here???
    if (!convo.users) {
      // sent to the whole team
      convo.users = yield db.Chatusers.find({
        team_id: convo.slackbot.team_id,
        is_bot: false,
        deleted: {$ne: true},
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
        deleted: {$ne: true}
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

module.exports.addMembers = function(team_id, person_id, channel_id, cb) {
   // um let's refresh the slackbot just in case...
   co(function*() {
    console.log('team_id: ',team_id,'person_id: ',person_id, '')
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();
    console.log('slackbot: ',slackbot);
    if (slackbot.meta.office_assistants.indexOf(person_id) < 0) {
      // oh no the person is not an admin, whatever will we do???
      console.log('cannot do this b/c the person is def not an admin');
      return;
    }
    // Set up the bot
    var bot = controller.spawn({ token: slackbot.bot.bot_access_token });
    bot.startRTM(function(e, bot, payload) {
      bot.startPrivateConversation({user: person_id}, function(response, convo) {
        convo.slackbot = slackbot;
        convo.bot = bot;
        convo.user_id = person_id;
        convo.on('end', function() {
          console.log('ending addmember convo');
          bot.closeRTM();
        });
      startConvo();
      function startConvo() {
          convo.ask('Would you like to add members to this order?', function(response, convo) {
          if (response.text.match(convo.bot.utterances.yes)) {
              console.log('k lets add a member mkay');
              var newUser = {
                   id:'U0SM73E5R', //How to generate?
                   type: 'slack',
                   dm:'D0SM74ECT',
                   team_id: team_id,
                   is_admin:false,
                   is_owner:false,
                   is_primary_owner:false,
                   is_restricted:false,
                   is_ultra_restricted:false,
                   is_bot:false,
                   profile: {},
                   settings: { emailNotification: false}
               };
              convo.next();
              convo.ask('What is the name of this member? ', function(response, convo) {
                if (response.text) {
                  newUser.name = response.text;
                }
                convo.next();
                convo.ask('Should I contact this user via email?', function(response, convo) {
                  if (response.text.match(convo.bot.utterances.yes) || response.text.match(convo.bot.utterances.no)) {
                      if (response.text.match(convo.bot.utterances.yes)) {
                         newUser.settings.emailNotification = true;                    
                      } 
                      convo.next();
                      convo.ask('What is the users email address?', function(response, convo) {
                      if (response.text && validator.isEmail(response.text.split('mailto:')[1].split('|')[0])) {
                          newUser.profile.email = response.text;
                          var user = new db.Chatuser(newUser);
                          user.save(function(err, saved){
                            if (err) {
                               console.log('Could not save new user: ', err);
                               convo.bot.say({text: 'Oops! Something went wrong!', channel: channel_id});
                               convo.stop()
                               cb();
                            } 
                            else {
                                 console.log('Saved new user!',saved);
                                 convo.bot.say({
                                    text: 'Great! We added ' + newUser.name + ' to the list!',
                                    channel: channel_id
                                  });
                                 convo.next();
                                 convo.ask('Would you like to add another user?', function(response, convo) {
                                  if (response.text.match(convo.bot.utterances.yes)) {
                                    convo.next();
                                    startConvo();
                                  } 
                                  else if (response.text.match(convo.bot.utterances.no)) {
                                    convo.stop();
                                    cb();
                                  }
                                  else {
                                    convo.stop();
                                    cb();
                                  }
                                });
                            }
                          })//save 
                    } else {
                      convo.bot.say({text: 'That doesn\'t seem to be a valid email address. Please type again.',channel: channel_id});
                      console.log('email check', validator.isEmail(response.text));
                      convo.repeat();
                    }


                   })// email address?


                  } // user responded yes or no?
                  else {
                    convo.say({text: "I'm sorry I couldn't understand that.", channel: channel_id });
                    convo.repeat();
                    convo.next();
                  } 

                }) // slack or email?
              }) //name?
            }
            else if (response.text.match(convo.bot.utterances.no)) {
              console.log('no add member');
              convo.bot.say({text: 'OK, you can `checkout` whenever you\'re ready', channel: channel_id});
              convo.stop()
              cb();
            }
            else {
              convo.say({text: "I'm sorry I couldn't understand that.", channel: channel_id });
              convo.repeat();
              convo.next();
              }
        });// add members
      }//end of startConvo function
      }); // start private conversation
    }); //start RTM
   }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}
