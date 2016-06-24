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
var banter = require("./banter.js");
var processData = require("./process.js");
var validator = require('validator');
var mailerTransport = require('../../../IF_mail/IF_mail.js');
var async = require('async');
var _ = require('lodash');
var email = require('./email');
var request = require('request-promise');
var ioKip = require("./io.js");


//
// In-memory hash of jobs so we can stop and start them
// According to the internet, cron jobs are commonly referred to as "jerbs"
//
var jerbs = {};
var bots = {};

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

      // var bot = controller.spawn({
      //   token: slackbot.bot.bot_access_token
      // })

      // bot.startRTM(function(err, bot, payload) {
      //   if (err) {
      //     throw new Error('Could not connect to Slack');
      //   }

      //   slackbot.meta.office_assistants.map(function(assistant) {
      //     bot.startPrivateConversation({user: assistant}, function(response, convo) {
      //       // inject the slackbot into the convo so that we can save it in the db
      //       convo.slackbot = slackbot;
      //       convo.bot = bot;
      //       convo.user_id = assistant;
      //       convo.on('end', function() {
      //         bot.closeRTM();
      //       })
      //       convo.say('Hi, this is your weekly update');

      //       // SHOW CART STICKER

      //      //* * * * * * * * * * * * * * * * * //
      //      //CHECKING HERE IF NO EMAILS users or channels. If none, Show User Cart Members, prompt to add people, defaults to <#general>
      //      //* * * * * * * * * * * * * * * * * //

      //       //* * * *  SHOW TEAM CART USERS  ** * * * //

      //       convo.ask('Would you like me to send an last call message to *SHOW TEAM LIST*', lastCall)
      //       convo.next();
      //     });
      //   });
      // });

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
  console.log('* * * * * * * * * * * * * - - - COLLECT - - - -  ** * * * * * * * * * * * ')
  console.log('slack user', person_id, 'triggered collect');
  co(function*() {
    // um let's refresh the slackbot just in case...
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();

    if (slackbot.meta.office_assistants.indexOf(person_id) < 0) {
      // oh no the person is not an admin, whatever will we do???
      console.log('cannot do this b/c the person is def not an admin');
      // convo.say('Sorry, only team admins can start last call');
      // convo.next();
      callback();
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


        //convo.say('Sending last call to Team Cart Members');
        //convo.next();
        lastCall({text: ''}, convo);

      })
    })
  }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}

//
// returns the list of users to notify
//
function getTeam(slackbot) {
  return co(function*() {

    var channel_users = [];
    yield (slackbot.meta.cart_channels || []).map((c) => {
      return request('https://slack.com/api/channels.info?token=' + slackbot.bot.bot_access_token + '&channel=' + c)
        .then((r) => {
          var info = JSON.parse(r);
          channel_users = channel_users.concat(info.channel.members);
        }).catch((e) => {
          console.log(e.stack);
        })
    })

    console.log('CHANNEL USERS  ! ! ! ! ! ! ! !  ',channel_users)

    return db.Chatusers.find({
      team_id: slackbot.team_id,
      is_bot: {$ne: true},
      deleted: {$ne: true},
      id: {$ne: 'USLACKBOT'}, // because slackbot is not marked as a bot?
      'settings.last_call_alerts': { '$ne': false },
      $or: [
        {
          dm: {$exists: false},
          'profile.email': {$exists: true},
          'settings.emailNotification': true
        },
        {id: {$in: channel_users}}
      ]
    })
  })
}

//
// Sends a "last call" message to group cart members
//
function lastCall(response, convo) {
  console.log('last call');
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
    // get all the users.
    var team = yield getTeam(convo.slackbot);
    console.log(team);

    var admin = convo.user_id;

    team = _.uniq(team, 'id');

    console.log('sending last call to all ' + team.length + ' users');

    yield team.map(function(u) {
      if (u.dm) {
        // Send the user a slack message
        console.log('SLACK SEND', u.name);

        return new Promise(function(resolve, reject) {
          //send message back to ioKip
          var attachment = [{
              "fallback": "Last Call",
              "text":'',
              "image_url":"http://kipthis.com/kip_modes/mode_teamcart_collect.png",
              "color": "#45a5f4",
              "mrkdwn_in": ["text"]        
          },{
              "fallback": "Last Call",
              "text":'Hi!  <@' + admin + '> wanted to let you know that they will be placing their order soon.\n So if you’ve got some last minute shopping to do, it’s now or never! You have *60* minutes left',
              "color": "#45a5f4",
              "mrkdwn_in": ["text"]
          }]
          var obj = {
              msg: 'Last Call',
              source: {
                origin: 'slack',
                channel: u.dm,
                org: convo.slackbot.team_id,
                id: convo.slackbot.team_id + '_' + u.dm,
                user: u.id
              },
              action:'sendAttachment',
              client_res: attachment
          };
          //bye bye botkit ugh
          ioKip.sendResponse(obj); 

          resolve();
        })
      } else if (u.profile.email && u.settings.emailNotification) {
        console.log('EMAIL SEND', u.profile.email);
        return email.collect(u.profile.email, convo.slackbot.team_name, convo.slackbot.team_id);
      } else {
        console.log('not a dm or an email????');
        return Promise.resolve();
      }
    })

    // todo continue the conversation.  maybe say something like "you can extend the countdown by typing 'extend countdown'"
    console.log('done sending stuff');

    convo.stop();

  }).catch((e) => {
    console.log(e.stack);
    convo.next();
  });
}

module.exports.addMembers = function(team_id, person_id, channel_id, done, opt) {
   //var bot;

   // MAKE THIS BOT A GLOBAL KEY VAL :::::: team_id, person_id, channel_id
   

   var incomingId = team_id + '_' + person_id + '_' + channel_id;

   if (opt == 'CLOSE'){
      console.log('😅 CLOSE TIME MEMBERS')
      if(bots[incomingId]){ //is there a bot in global?
        console.log('CLOSNING TIME * * * * * ** * ')
        bots[incomingId].closeRTM();
        delete bots[incomingId];
        done();
      }
      return;
   }

   // um let's refresh the slackbot just in case...
   co(function*() {
    console.log('team_id: ',team_id,'person_id: ',person_id, '')
    var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec();


    console.log('slackbot: ',slackbot);
    console.log('PERSON ID!!!!!!: ',person_id);
    console.log('channel ID!!!!!!: ',channel_id);
    console.log('slackbot assistants!!!!: ',slackbot.meta.office_assistants);

    if (slackbot.meta.office_assistants.indexOf(person_id) < 0) {
      // oh no the person is not an admin, whatever will we do???
      console.log('cannot do this b/c the person is def not an admin');
      done();
      return;
    }
    // Set up the bot
    var bot = controller.spawn({ token: slackbot.bot.bot_access_token });
    bot.startRTM(function(e, bot, payload) {
      bot.startPrivateConversation({user: person_id}, function(response, convo) {
        bots[incomingId] = bot; //

        // adding this bot obj to global state so we can end bot outside of scope
        convo.slackbot = slackbot;
        convo.bot = bot;
        convo.user_id = person_id;
        convo.on('end', function() {
          // console.log('IS THIS FIRING?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!?!')
          // console.log('ending addmember convo');
          delete bots[incomingId];
          bot.closeRTM();
          done(convo.parsedKip);
        });
        listenForCart(response,convo);
      //}//end of startConvo function
      }); // start private conversation
    }); //start RTM
   }).catch((e) => {
    console.log(e);
    console.log(e.stack);
  })
}


function listenForCart(response,convo) {

    //DISPLAY TEAM USER VIEW HERE
    //AT FIRST, ONLY SHOWS #general view and # of users

    viewCartMembers(convo,function(res){
      convo.ask(res, handleChange);
    });

    //* * * * * ** * * * *
    //update list of users with team_cart boolean
    //* * * * * * * * * *


  //* * * * * * * * * * * * * //
  //      CHAT TO ADD FUNCTION FIRE ---->
  // * * * * * * * * * * * * *
  //
  //if user is confused (frustration triggers)



  //* * * * * * * * * * * * * //
  //SHOW HELP MODE ON ONBOARDING???
  //* * * * * * * * * * * * * //

  //this mode is triggered when we detect user is frustrated or confused
  function helpMode(){
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
            convo.ask('Is he/she a slack user?', function(response, convo) {
              if (response.text.match(convo.bot.utterances.yes)) {
                newUser.type = 'slack';
              }
              else {
                newUser.type = 'email';
                newUser.settings.emailNotification = true;
              }
              convo.next();
              convo.ask('What is this members email address?', function(response, convo) {
                if (response.text) {

                  //parsing email
                  if (response.text.indexOf('<mailto') >= 0) {
                    response.text = response.text.split('|');
                    response.text = response.text[1].replace('>','');
                  }
                  newUser.profile.email = response.text;
                }
                var user = new db.Chatuser(newUser);
                user.save(function(err, saved){
                  if (err) {
                    console.log('Could not save new user: ', err)
                       convo.bot.say({
                        text: 'Oops! Something went wrong!',
                        channel: channel_id
                      });
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
                          convo.stop()
                          cb();
                        }
                        else {
                          convo.stop()
                          cb();
                        }
                      })
                  }
                })//save
              })// email address?
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
          convo.say("I'm sorry I couldn't understand that.");
          convo.repeat();
          convo.next();
          }
    });// add members
  }

}


function handleChange(response, convo){

  console.log('RES ',response);

  var isAdmin = convo.slackbot.meta.office_assistants.indexOf(convo.user_id) >= 0;
  var tokens = response.text.toLowerCase().trim().replace(/[`~!$%^&*()\-=?;:'",\{\}\[\]\\\/]/gi, '').split(' ');
  var cleanTxt = response.text.toLowerCase().trim();

  if (isAdmin && ['add', 'remove', 'rm', 'rem'].indexOf(tokens[0]) >= 0) {

    var channelIds = [];
    var emails = [];

    // look for channels mentioned with # symbol
    channelIds = tokens.filter((t) => {
      return t.indexOf('<#') === 0;
    }).map((u) => {
      return u.replace(/(\<\#|\>)/g, '').toUpperCase();
    })
    channelIds = _.uniq(channelIds, false) //remove duplicates


    //get emails
    for (var i = 0; i < tokens.length; i++) {
      parseEmail(tokens[i],function(res){
        if(validator.isEmail(res)){
          emails.push(res);
        }
      })
    }
    emails = _.uniq(emails, false) //remove duplicate emails

    //* * * NOTHING FOUND * * * *//
    //CHECK IF CANT FIND CHANNELS OR EMAILS
    if (channelIds.length === 0 && emails.length === 0) {

      console.log('NOTHING FOUND');
      var attachments = [
        {
          image_url:'http://kipthis.com/kip_modes/mode_teamcart_members.png',
          text:''
        },
        {
          text: "I'm sorry, I couldn't understand that.  Do you have any cart member changes? Type `exit` to quit settings",
          "mrkdwn_in": [
              "text",
              "pretext"
          ]
        }
      ];
      var resStatus = {
        username: 'Kip',
        text: "",
        attachments: attachments,
        fallback: 'Settings'
      };
      // viewCartMembers(convo,function(res){
      // }
      return convo.say(resStatus);
       //convo.next();
    }

    //* * * * * * * * * * * * * * //
    //* * * * ADD / REMOVE * * * //
    //* * * * * * * * * * * * * * //

    var updateCount = channelIds.length + emails.length;
    var counter = 0;

    console.log(updateCount);

    //add stuff
    if (tokens[0] === 'add') {

      //add / update channels
      if (channelIds.length > 0){
        channelIds.map(function(channel) {

          if (!convo.slackbot.meta.cart_channels){
            convo.slackbot.meta.cart_channels = [];
          }

          //check if arr already contains channel id
          if (!_.includes(convo.slackbot.meta.cart_channels, channel)){
            convo.slackbot.meta.cart_channels.push(channel);
          }

          counter++;
        })
        //save updated channels
        convo.slackbot.save(function(err, saved){
          if (err) {
            console.log('err ',err);
            //- - - COUNTER - - - //

            if(updateCount == counter){
              membersUpdated(convo);
            }
            //- - - - - - - - - - //
          }
          else {
             console.log('updated channels to team!',saved);

             console.log(counter);
              //- - - COUNTER - - - //

              console.log(counter);
              console.log(updateCount);
              if(updateCount == counter){
                console.log('????????????????')
                membersUpdated(convo);
              }
              //- - - - - - - - - - //
          }
        })//save
      }

      //adding / updating email users
      if (emails.length > 0){

        emails.map(function(email) {

          console.log('ADDING INCOMING EMAIL ',email);

          co(function*() {

          var post_body = {
              "recipient_emails": [
                email
              ]
            }

            request({
            url: 'https://api.sendgrid.com/v3/asm/suppressions/global/' + email,
            headers: {
              'Authorization': 'Bearer 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'
            },
                method: 'DELETE'
            }, function(err, res, body) {
                if (err) console.error('post err ', err);
                console.log(2, body);
            });

            //update existing users in db
            var emailUser = yield Chatuser.findOne({
              'team_id': convo.slackbot.team_id,
              'type': 'email',
              'profile.email':email
            }).exec();

            console.log('emailUser ',emailUser)

            //does email user exist?
            if(emailUser && emailUser.id){
              emailUser.settings.emailNotification = true;
              emailUser.save(function(err, saved){
                if (err) {
                  console.log('err ',err);
                    //- - - COUNTER - - - //
                    counter++;
                    if(updateCount == counter){
                      membersUpdated(convo);
                    }
                    //- - - - - - - - - - //
                }
                else {
                   console.log('updated user',saved);

                    //- - - COUNTER - - - //
                    counter++;
                    if(updateCount == counter){
                      membersUpdated(convo);
                    }
                    //- - - - - - - - - - //

                }
              })//save
            }

            //CREATING NEW EMAIL USER
            else {
              var emailName;
              if(email.split("@")[0]){
                emailName = email.split("@")[0];
              }

              //didn't find user in DB so let's create new email user
              //new user here
              var newUser = {
                 id: Math.floor((Math.random() * 100) + 1) + '_' + emailName + '_' + convo.slackbot.team_id, //lol some id
                 type: 'email',
                 team_id: convo.slackbot.team_id,
                 name: emailName,
                 is_admin:false,
                 is_owner:false,
                 is_primary_owner:false,
                 is_restricted:false,
                 is_ultra_restricted:false,
                 is_bot:false,
                 profile: {
                  email: email
                 },
                 settings: { emailNotification: true}
              };

              console.log('NEWUSER ',newUser)

              var user = new Chatuser(newUser);
              user.save(function(err, saved){
                if (err) {
                  console.log('Could not save new user: ', err)
                  //- - - COUNTER - - - //
                  counter++;
                  if(updateCount == counter){
                    membersUpdated(convo);
                  }
                  //- - - - - - - - - - //
                }
                else {
                    console.log('SAVED USER TO DB ',emailName)
                    //- - - COUNTER - - - //
                    counter++;
                    if(updateCount == counter){
                      membersUpdated(convo);
                    }
                    //- - - - - - - - - - //
                }
              })//save
            }//creating new email user
          })
        }) //map emails
      }//we found emails
    }

    //remove things
    else if (tokens[0] === 'remove' || tokens[0] === 'rm' || tokens[0] === 'rem') {

      console.log('REMOVE CHANNEL or EMAIL');

      //remove channels
      if (channelIds.length > 0){
        // get list of users in all channels
        channelIds.map(function(channel) {
          if (!convo.slackbot.meta.cart_channels){
            convo.slackbot.meta.cart_channels = [];
          }
          convo.slackbot.meta.cart_channels = _.without(convo.slackbot.meta.cart_channels, channel); //remove channel from arr
          convo.slackbot.save(function(err, saved){
            if (err) {
              console.log('err ',err);
              //- - - COUNTER - - - //
              counter++;
              if(updateCount == counter){
                membersUpdated(convo);
              }
              //- - - - - - - - - - //
            }
            else {
               console.log('updated channels to team!',saved);
              //- - - COUNTER - - - //
              counter++;
              if(updateCount == counter){
                membersUpdated(convo);
              }
              //- - - - - - - - - - //
            }
          })//save
        })
      }

      //remove emails
      if (emails.length > 0){
        emails.map(function(email) {
          co(function*() {
            var emailUser = yield Chatuser.findOne({
              'team_id': convo.slackbot.team_id,
              'type': 'email',
              'profile.email':email
            }).exec();

            console.log('REMOVE EMAIL ',emailUser);

            if(emailUser && emailUser.id){
              console.log('update user ',emailUser);
              emailUser.settings.emailNotification = false;
              emailUser.save(function(err, saved){
                if (err) {
                  console.log('err ',err);
                    //- - - COUNTER - - - //
                    counter++;
                    if(updateCount == counter){
                      membersUpdated(convo);
                    }
                    //- - - - - - - - - - //
                }
                else {
                   console.log('updated user',saved);
                    //- - - COUNTER - - - //
                    counter++;
                    if(updateCount == counter){
                      membersUpdated(convo);
                    }
                    //- - - - - - - - - - //
                }
              })//save
            }else {
              //- - - COUNTER - - - //
              counter++;
              if(updateCount == counter){
                membersUpdated(convo);
              }
              //- - - - - - - - - - //
            }
          })
        })
      }//emails

    }//removing stuff

  }//parse tokens

  //LISTEN FOR EXIT MODES
  else if (response.text.match(convo.task.botkit.utterances.no) || banter.checkExitMode(cleanTxt)) {

      //FUNCTION CHECK FOR STOP WORDS, SEND BACK RESPONSE IN ATTACHMENT FORMAT

      //FUNCTION
      var attachments = [
          {
            "pretext": "Ok thanks! Done with Cart Members. Type `collect` to send a cart closing message to all Cart Members 😊",
            "image_url":"http://kipthis.com/kip_modes/mode_shopping.png",
            "text":"",
            "mrkdwn_in": [
                "text",
                "pretext"
            ],
            "color":"#45a5f4"
          },
          {
              "text": "Tell me what you're looking for, or use `help` for more options",
              "mrkdwn_in": [
                  "text",
                  "pretext"
              ],
              "color":"#49d63a"
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

  //we didn't understand the request, lets listen for mode switch or give error message
  else {

    var currentMode = 'addmember';
    //pass message to check for mode handling with mode 'settings'
    processData.modeHandle(response.text,currentMode,function(obj){
      //mode detected
      if(obj && obj.mode && obj.mode !== currentMode){
        convo.parsedKip = obj.res;
        convo.next();
      //response in context found
      }
      //continue same mode
      else if (obj && obj.mode && obj.mode == currentMode && obj.res){
        convo.say(obj.res);
        convo.next();
      }
      //no mode detected
      else {

        console.log('NO MODE DETECTED');

        viewCartMembers(convo,function(res){
          convo.say(res);

          var attachments = [
            {
              "text":"Sorry, I don't understand. Do you have any Cart Member changes? Or type `exit`",
              "mrkdwn_in": ["fields","text"],
              "color":"#fe9b00" //warning color
            }
          ];

          var rez = {
            username: 'Kip',
            text: "",
            attachments: attachments,
            fallback: 'Cart Members'
          };

          convo.ask(rez, handleChange)
          convo.next();
        },'noPrompt')
      }

    });
  }
}

function membersUpdated(convo){

  viewCartMembers(convo,function(res){

    convo.say(res);
    //convo.next();

    var attachments = [
      {
        "text":"Team Cart Members updated! Are you done with changes? Or type `exit`",
        "mrkdwn_in": ["fields","text"],
        "color":"#49d63a"
      }
    ];

    var rez = {
      username: 'Kip',
      text: "",
      attachments: attachments,
      fallback: 'Cart Members Updated'
    };

    convo.ask(rez, handleChange)
    convo.next();
  },'noPrompt')
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


function parseEmail(input,callback){
  if (input.indexOf('<mailto') >= 0) {
    input = input.split('|');
    input = input[1].replace('>','');
  }
  callback(input);
}
