//This is a survey generator that modifies the survey template for each platform

var survey = require('./stories/survey_templates/survey1.js')
var db = require('../../db');
var storyAnswers = db.storyAnswers;
var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');


//connect slack here



//lol
// setTimeout(function() {
   
// }, 2000);


// website 🌏
var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/static'))
app.get('/healthcheck', function (req, res) {
  res.send('💬 🌏')
})

//parse incoming body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


server.listen(8000, function(e) {
  if (e) { console.error(e) }
  console.log('chat app listening on port 8000 🌏 💬')
})




function gatherSurveyTeams(){

    //select some entries from the slackbots collection
    //extract team ID and lsit of admin users from each slackbot document

    var teamList = [{
        'team_id':'T2234980',
        'admins':['U234233','U2342342','U24394834']
    },
    {
        'team_id':'T2234980',
        'admins':['U234233','U2342342','U24394834']
    }]

    //start sync operation
    co(function*() {

        var rtm = new slack.RtmClient('xoxb-70749650870-uMgtEUHaw6C6eQrzSdOspkpm');

        //
        rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
          kip.log('loaded slack team');
        })

        //incoming slack messages
        rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {


          // don't talk to yourself
          if (data.user === slackbot.bot.bot_user_id || data.username === 'Kip') {
            kip.debug("don't talk to yourself");
            return; // drop the message before saving.
          }

          // other random things
          if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { //settings.name = kip's slack username
            kip.debug('will not handle this message');
            return;
          }



          // clean up the text
          message.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
          if (message.text.charAt(0) == ':') {
            message.text = message.text.substr(1); //remove : from beginning of string
          }
          message.text = message.text.trim(); //remove extra spaces on edges of string



          // // queue it up for processing
          // message.save().then(() => {
          //   queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'))
          // });

        })



        //incoming slack action
        app.post('/slackaction', function(req, res) {
            // ioKip.newSlack();
            console.log('incoming Slack action BODY: ',req.body);

            if (req.body && req.body.payload){
              var parsedIn = JSON.parse(req.body.payload);

              //sends back original chat
              if (parsedIn.response_url && parsedIn.original_message){
                var stringOrig = JSON.stringify(parsedIn.original_message);
                request.post(
                    parsedIn.response_url,
                    { payload: stringOrig },
                    function (err, res, body) {
                      console.error('post err ',err);
                    }
                );
              }else {
                console.error('slack buttons broke, need a response_url');
                return;
              }
            }else {
              console.log('nah');
              res.sendStatus(200);
            }

        });


      // var slackbots = yield db.Slackbots.find({
      //   'meta.deleted': {
      //     $ne: true
      //   }
      // }).exec();

      // kip.log('found', slackbots.length, 'slackbots');

      // // Just need the RTM client to listen for messages
      // slackbots.map((slackbot) => {
      //   var rtm = new slack.RtmClient(slackbot.bot.bot_access_token || '');
      //   rtm.start();
      //   var web = new slack.WebClient(slackbot.bot.bot_access_token || '');

      //   slackConnections[slackbot.team_id] = {
      //     rtm: rtm,
      //     web: web,
      //     slackbot: slackbot
      //   };

      //   // TODO figure out how to tell when auth is invalid
      //   // right now the library just console.log's a message and I can't figure out
      //   // how to intercept that event.
      //   // rtm.on(slack.CLIENT_EVENTS.RTM.INVALID_AUTH, (err) => {
      //   //   kip.log('invalid auth', slackbot.team_id, slackbot.team_name);
      //   // })

      //   rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
      //     kip.log('loaded slack team', slackbot.team_id, slackbot.team_name);
      //   })

      //   rtm.on(slack.CLIENT_EVENTS.DISCONNECT, (reason) => {
      //     kip.log('slack client disconnected', slackbot.team_id);
      //     kip.log(reason); // is this even a thing?
      //   });


      //   //
      //   // Handle incoming slack messages.  Slack-specific pre-processing
      //   //
      //   rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {

      //     kip.debug('got slack message sent from user', data.user, 'on channel', data.channel);
      //     kip.debug(data);

      //     var message = new db.Message({
      //       incoming: true,
      //       thread_id: data.channel,
      //       original_text: data.text,
      //       user_id: data.user,
      //       origin: 'slack',
      //       source: data,
      //     });

      //     // don't talk to yourself
      //     if (data.user === slackbot.bot.bot_user_id || data.username === 'Kip') {
      //       kip.debug("don't talk to yourself");
      //       return; // drop the message before saving.
      //     }

      //     // other random things
      //     if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { //settings.name = kip's slack username
      //       kip.debug('will not handle this message');
      //       return;
      //     }

      //     //
      //     // 🖼 image search
      //     //
      //     if (data.subtype === 'file_share' && ['png', 'jpg', 'gif', 'jpeg', 'sgv'].indexOf(data.file.filetype.toLowerCase()) >= 0) {
      //       return image_search(data.file.url_private, slackbot.bot.bot_access_token, function(res) {
      //         message.text = res;
      //         message.save().then(() => {
      //           queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'));
      //         });
      //       });
      //     }

      //     // clean up the text
      //     message.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
      //     if (message.text.charAt(0) == ':') {
      //       message.text = message.text.substr(1); //remove : from beginning of string
      //     }
      //     message.text = message.text.trim(); //remove extra spaces on edges of string

      //     // queue it up for processing
      //     message.save().then(() => {
      //       queue.publish('incoming', message, ['slack', data.channel, data.ts].join('.'))
      //     });
      //   })
      // });


    }).catch((e) => {
      kip.error(e, 'error loading slackbots');
    })

    //select a team from the array

    async.eachSeries(teamList, function (team, callback) {
        
        async.eachSeries(team.admins, function (admin, callback2) {

            startSurvey(team.team_id,admin)

            //ping each admin every 5 minutes
            setTimeout(function() {
                callback2();
            }, 300000);

        }, function (err) {
          if (err) { throw err; }

          console.log('DONE SENDING TO TEAM: ',team.team_id);

          callback(); //dont progress to next team until done w this one thx
        });
      
    }, function (err) {
      if (err) { throw err; }
      console.log('DONE SENDING TO ALL TEAMS!');
    });
}


function startSurvey(team,admin){

    co(function* () {

      var startQuestion = survey.survey1[0];

      //build next question for correct platform
      var builtStory = yield buildStory('slack',startQuestion);

      console.log('built for slack: ',JSON.stringify(builtStory))
      //send built story back user (next question)
      send_story(builtStory,team,admin)

    }).catch(function(err){
        //???
        console.error('co err ',err);
    });
}
 

//expect entire response from user on button push
//response.origin = incoming origin
var process_story = function(response,origin){

    var story_pointer;
    var story_answer;

    //MOCK ORIGIN
    origin = 'slack';

    //prepocess slack button response (will happen outside of function )
    //MOCK RESPONSE
    response = {
      "actions": [
        {
          "name": "button 1",
          "value": {selected: "yes", story_pointer: 0, handler: "story.answer"}
        },
      ],
      "callback_id": "story_19238",

      "team": {
        "id": "T47563693",
        "domain": "watermelonsugar"
      },
      "channel": {
        "id": "C065W1189",
        "name": "forgotten-works"
      },
      "user": {
        "id": "U045VRZFT",
        "name": "brautigan"
      },
      "action_ts": "1458170917.164398",
      "message_ts": "1458170866.000004",
      "attachment_id": "1",
      "token": "xAB3yVzGS4BQ3O9FACTa8Ho4",
      "original_message": "{\"text\":\"New comic book alert!\",\"attachments\":[{\"title\":\"The Further Adventures of Slackbot\",\"fields\":[{\"title\":\"Volume\",\"value\":\"1\",\"short\":true},{\"title\":\"Issue\",\"value\":\"3\",\"short\":true}],\"author_name\":\"Stanford S. Strickland\",\"author_icon\":\"https://api.slack.com/img/api/homepage_custom_integrations-2x.png\",\"image_url\":\"http://i.imgur.com/OJkaVOI.jpg?1\"},{\"title\":\"Synopsis\",\"text\":\"After @episod pushed exciting changes to a devious new branch back in Issue 1, Slackbot notifies @don about an unexpected deploy...\"},{\"fallback\":\"Would you recommend it to customers?\",\"title\":\"Would you recommend it to customers?\",\"callback_id\":\"comic_1234_xyz\",\"color\":\"#3AA3E3\",\"attachment_type\":\"default\",\"actions\":[{\"name\":\"recommend\",\"text\":\"Recommend\",\"type\":\"button\",\"value\":\"recommend\"},{\"name\":\"no\",\"text\":\"No\",\"type\":\"button\",\"value\":\"bad\"}]}]}",
      "response_url": "https://hooks.slack.com/actions/T47563693/6204672533/x7ZLaiVMoECAW50Gw1ZYAXEM"
    }



    //get button response from incoming user button reply

    if(response && response.actions && response.actions.value){
        //turn stringified object into object
        story_pointer = response.actions.value.story_pointer;
        story_answer = response.actions.value.selected;
        
    }else {
        console.error('missing response.actions.value from SLACK');
    }

    //check for pointer val
    if(!story_pointer && story_pointer !== 0){
        story_pointer= 0;
    }

  
    //SAVE THIS quiz response TO USERS PERSONA as a session

    // var query = {id: 'slack_'+sender},
    //     update = { origin: sender.origin },
    //     options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // //change Chatuser to Storyuser and change var at head
    // Storyuser.insert(query, update, options, function(err, user) {
    //     var obj = {
    //         recipient: sender,
    //         sender: sender,
    //         ts: Date.now(),
    //         story: 'survey1',
    //         pointer: pointer - 1
    //     }
    //     user.answers.push(JSON.stringify(obj))
    //     user.save(function (err) {
    //         if(err) {
    //             console.error('ERROR!');
    //         }
    //     });
    // });

    if (story_pointer == survey.survey1.length - 1){
        console.log('FIRING??!?!')
        //stop running, send final message to user
    }else if(story_answer == 'no'){
        console.log('FIRING NO??!?!')
        //send other text back
    }   
    //advance to next question
    else {
        story_pointer++;

        co(function* () {

          var nextQuestion = survey.survey1[story_pointer];

          //build next question for correct platform
          var builtStory = yield buildStory(origin,nextQuestion);

          console.log('built for slack: ',JSON.stringify(builtStory))
          //send built story back user (next question)
          //send_story(builtStory)

        }).catch(function(err){
            //???
            console.error('co err ',err);
        });

        //build story     
        
    }
}


function buildStory(origin,incoming){

    var storyObj = {
        attachments:[]
    };

    // {
    //     "attachments": [
    //         {
    //             "text": "Choose a game to play",
    //             "fallback": "You are unable to choose a game",
    //             "callback_id": "wopr_game",
    //             "color": "#3AA3E3",
    //             "attachment_type": "default",
    //             "actions": [
    //                 {
    //                     "name": "chess",
    //                     "text": "Chess",
    //                     "type": "button",
    //                     "value": "chess"
    //                 },
    //                 {
    //                     "name": "maze",
    //                     "text": "Falken's Maze",
    //                     "type": "button",
    //                     "value": "maze"
    //                 },
    //                 {
    //                     "name": "war",
    //                     "text": "Thermonuclear War",
    //                     "style": "primary",
    //                     "type": "button",
    //                     "value": "war",
    //                     "confirm": {
    //                         "title": "Are you sure?",
    //                         "text": "Wouldn't you prefer a good game of chess?",
    //                         "ok_text": "Yes",
    //                         "dismiss_text": "No"
    //                     }
    //                 }
    //             ]
    //         }
    //     ]
    // }

    switch(origin){
        //built object for slack
        case 'slack':

            // "name": "button 1",
            // "text": "Button 1",
            // "type": "button",
            // "value": {
            //   selected: "yes",
            //   story_pointer: 0,
            //   handler: "story.answer"
            // }      


            //loop through incoming actions array
            //build array of buttons for slack


            // {
            //   "name": "button 1",
            //   "text": "Button 1",
            //   "type": "button",
            //   "value": {
            //       selected: "yes",
            //       story_pointer: 0,
            //       handler: "story.answer"
            //   } 
            // },

                    // {
                    //     "name": "chess",
                    //     "text": "Chess",
                    //     "type": "button",
                    //     "value": "chess"
                    // },

            //map buttons for slack
            var buttonArray = incoming.actions.map(function(obj){ 
                var rObj = {};
                rObj.name = obj.name;
                rObj.text = obj.text;
                rObj.type = obj.type;

                //stringify value object before sending to slack
                rObj.value = JSON.stringify(obj.value);
                return rObj;
            });

            var attachment = {
                "text": incoming.text,
                "fallback": incoming.text,
                "callback_id": incoming.callback_id,
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": buttonArray
            }

            //add buttons to obj to push to attachements:
            storyObj.attachments.push(attachment)

            //adding slack specific stuff to the object
        break;
    }
    
    return storyObj;
}


var send_story = function (builtStory,team,admin){

    console.log('hope this works ',builtStory)
    console.log('hope this works ',team)
    console.log('hope this works ',admin)

    //slack sender 

    // var storySender;
    //     //start from beginning of we dont have a pointer
    //     if(!pointer){
    //         pointer = 0;
    //     }
    //     //if(pointer || pointer == 0){
    //     var storySender = quiz[pointer];
    //     storySender.recipient = {
    //         id: sender
    //     };
    // //send res to user
    // request.post({
    //     url: 'http://slack.com/messages',
    //     method: "POST",
    //     json: true,
    //     headers: {
    //         "content-type": "application/json",
    //     },
    //     body: storySender
    // }, function(err, res, body) {
    //     if (err) console.error('post err ', err);
    // })
}

//process_story()
 gatherSurveyTeams()