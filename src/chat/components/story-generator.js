//This is a survey generator that modifies the survey template for each platform

var survey = require('./stories/survey_templates/survey1.js')
var db = require('../../db');
var Story = db.Story;

var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');

var slack = require('@slack/client');



// start server 🌏
var express = require('express');
var bodyParser = require('body-parser')
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
//* * * * * //


//incoming slack action
app.post('/slackaction', function(req, res) {

    co(function* () {

        // //advance the pointer
        if (req.body && req.body.payload){

            var processStory = yield process_story(req.body.payload) 

            console.log('PROCESS STORY ', processStory)

            var builtStory = yield buildStory('slack',processStory);

            console.log('BUILT STORY ', builtStory)

            res.json(builtStory);

            console.log('👑cool!👑 ',builtStory);
        }
       
    }).catch(function(err){
        console.log('👑👑')
        console.error('co err ',err);
    });

});

// //incoming slack action
// app.get('/slackauth', function(req, res) {

//     //https://slack.com/oauth/pick_reflow?scope=commands+bot+users%3Aread&client_id=2804113073.70750953120

//     // ioKip.newSlack();

//    // console.log('REQ ',req)

//     console.log('incoming Slack action BODY: ',req.body);

//     res.redirect('/thanks')

//     var clientID = '2804113073.70750953120';
//     var clientSecret = 'f551ddfc0e294e49a5ebacb8633bbd86';
//     var redirect_uri = 'https://39645f46.ngrok.io/slackauth';

//     var body = {
//       code: req.query.code,
//       redirect_uri: redirect_uri
//     }

//     //ㅔㅐㄴㅅ ㄱㄷ볃ㄴㅅ 랙 
//     //post request for auth token
//     request({
//       url: 'https://' + clientID + ':' + clientSecret + '@slack.com/api/oauth.access',
//       method: 'POST',
//       form: body
//     }, function(e, r, b) {
//         if (e) {
//           console.log('error connecting to slack api');
//           console.log(e);
//         }
//         if (typeof b === 'string') {
//             b = JSON.parse(b);
//         }
//         if (!b.ok) {
//             console.error('error connecting with slack, ok = false')
//             console.error('body was', body)
//             console.error('response was', b)
//             return;
//         } else if (!b.access_token || !b.scope) {
//             console.error('error connecting with slack, missing prop')
//             console.error('body was', body)
//             console.error('response was', b)
//             return;
//         }

//         console.log('got positive response from slack')
//         console.log('body was', body)
//         console.log('response was', b)

//     })
// });

// app.get('/thanks', function(req, res) {
//   //var thanks = fs.readFileSync(__dirname + '/thanks.html', 'utf8');
//   res.send('<html>ok</html>');
// })




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

        var rtm = new slack.RtmClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');
        var web = new slack.WebClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');

        rtm.start();

        rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
          console.log('loaded slack team');
        })

        //incoming slack messages
        rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {

            // // don't talk to yourself
            if (data.bot_id === 'B234K1NS3') {
                //console.log("don't talk to yourself");
                return; // drop the message before saving.
            }

            // other random things
            if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { //settings.name = kip's slack username
                console.log('will not handle this message');
                return;
            }

            //store incoming messages
            var message = new db.Message({
                incoming: true,
                thread_id: data.channel,
                original_text: data.text,
                user_id: data.user,
                origin: 'slack',
                source: data,
            });

            // clean up the text
            message.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
            if (message.text.charAt(0) == ':') {
                message.text = message.text.substr(1); //remove : from beginning of string
            }
            message.text = message.text.trim(); //remove extra spaces on edges of string

            co(function*() {
                var builtStory = yield buildStory('slack',survey.survey1[0]);
                web.chat.postMessage(message.source.channel, '', builtStory, function(err,res) {
                    console.log(err)
                });

            }).catch((e) => {
              kip.error(e, 'error loading slackbots');
            })

        })

    }).catch((e) => {
      kip.error(e, 'error loading slackbots');
    })

    //select a team from the array

    // async.eachSeries(teamList, function (team, callback) {
        
    //     async.eachSeries(team.admins, function (admin, callback2) {

    //         startSurvey(team.team_id,admin)

    //         //ping each admin every 5 minutes
    //         setTimeout(function() {
    //             callback2();
    //         }, 300000);

    //     }, function (err) {
    //       if (err) { throw err; }

    //       console.log('DONE SENDING TO TEAM: ',team.team_id);

    //       callback(); //dont progress to next team until done w this one thx
    //     });
      
    // }, function (err) {
    //   if (err) { throw err; }
    //   console.log('DONE SENDING TO ALL TEAMS!');
    // });
}


// function startSurvey(team,admin){

//     co(function* () {

//       var startQuestion = survey.survey1[0];

//       //build next question for correct platform
//       var builtStory = yield buildStory('slack',startQuestion);

//       //console.log('built for slack: ',JSON.stringify(builtStory))

//       //send built story back user (next question)
//       send_story(builtStory,team,admin)

//     }).catch(function(err){
//         //???
//         console.error('co err ',err);
//     });
// }
 

//expect entire response from user on button push
//response.origin = incoming origin
var process_story = function*(response,origin){


    //SAVING INCOMING ANSWER TO MONGO DB



    // id: {
    //   type: String,
    //   unique: true,
    //   index: true
    // },
    // answer: {
    //     selected: String, //user response
    //     handler: String, //how we're processing incoming button tap from user (i.e. story answer)
    //     story_pointer: Number, //position in story
    //     template_type: String, //button template i.e. survey1
    //     text: String, //prompt question
    //     type: String, //button probably
    //     name: String //button label
    // },
    // ts: {
    //   type: Date,
    //   default: Date.now
    // },
    // origin: String,
    // user: {
    //     team_id: String,
    //     user_id: String,
    //     name: String,
    //     channel_id: String
    // }
    var story_pointer;
    var story_answer;

    //MOCK ORIGIN
    origin = 'slack';

    response = JSON.parse(response)

    //construct mongo answer
    var cMongo = {
        answer: {},
        user: {},
        team: {},
        channel: {},
        origin: 'slack'
    }

    if(response && response.actions && response.actions[0] && response.actions[0].value){

        //save results to mongo
        cMongo.answer.name = response.actions[0].name;

        var parseVal = JSON.parse(response.actions[0].value);   
        cMongo.answer.selected = parseVal.selected;
        cMongo.answer.story_pointer = parseVal.story_pointer;
        cMongo.answer.handler = parseVal.handler;


        //// * * * * * * * these are used for processing story
        // story_pointer = parseVal.story_pointer;
        // story_answer = parseVal.selected;
    }

    //STORE PROMPT
    if(response && response.original_message && response.original_message.attachments && response.original_message.attachments[0]){
        cMongo.answer.text = response.original_message.attachments[0].text; //get original prompt 
    }

    //STORE SOURCE OF QUESTIONS
    if(response.user){
        cMongo.user.id = response.user.id;
        cMongo.user.name = response.user.name;
    }
    if(response.team){
        cMongo.team.id = response.team.id;
        cMongo.team.domain = response.team.domain;
    }
    if(response.channel){
        cMongo.channel.id = response.channel.id;
        cMongo.channel.name = response.channel.name;
    }


    console.log('???????????????? ',cMongo)
    //save answer
    var answer = new Story(cMongo);
    answer.save(function (err) {
      if (err) {
        console.log(JSON.stringify(err));
      } else {
        console.log('meow');
      }
    });

    //




    

    if(response && response.actions && response.actions[0] && response.actions[0].value){

        var parseVal = JSON.parse(response.actions[0].value);

        story_pointer = parseVal.story_pointer;
        story_answer = parseVal.selected;
        
    }else {
        console.error('missing response.actions.value from SLACK');
    }

    //check for pointer val
    if(!story_pointer && story_pointer !== 0){
        story_pointer= 0;
    }

  
    //SAVE THIS quiz response TO USERS PERSONA as a session



    // //change Chatuser to Storyuser and change var at head
    // Storyuser.insert(, function(err, user) {

    //     user.answers.push(JSON.stringify(obj))
    //     user.save(function (err) {
    //         if(err) {
    //             console.error('ERROR!');
    //         }
    //     });
    // });



    if (story_pointer == survey.survey1.length - 1){

        var sendText = {
            text: 'Thanks for taking our survey - happy shopping! :blush:'
        }

        return sendText;
        
        //stop running, send final message to user
    }else if(story_answer == 'no' && story_pointer == 0){

        var sendText= {
            text: 'Damn :('
        }

        return sendText; 

        //send other text back
    }   
    //advance to next question
    else {
        story_pointer++;
        var nextQuestion = survey.survey1[story_pointer];

        return nextQuestion;
        
    }
}


function buildStory(origin,incoming){

    var storyObj = {
        attachments:[]
    };

    switch(origin){
        //built object for slack
        case 'slack':
            //map buttons for slack

            if (incoming && incoming.actions){
                var buttonArray = incoming.actions.map(function(obj){ 
                    var rObj = {};
                    rObj.name = obj.name;
                    rObj.text = obj.text;
                    rObj.type = obj.type;

                    //stringify value object before sending to slack
                    rObj.value = JSON.stringify(obj.value);
                    return rObj;
                });

                console.log('BUTTON ARRAY ',buttonArray)

                var attachment = {
                    "text": incoming.text,
                    "fallback": incoming.text,
                    "callback_id": incoming.callback_id,
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": buttonArray
                }

                console.log('WE ATTACH THIS ',attachment)

                //add buttons to obj to push to attachements:
                storyObj.attachments.push(attachment)        
            }
            else if (incoming && incoming.text){

                var attachment = {
                    "text": incoming.text,
                    "fallback": incoming.text
                }
                storyObj.attachments.push(attachment)
            }
            else {
                var attachment = {
                    "text": 'error',
                    "fallback": 'error',
                    "color": "#3AA3E3"
                }
                storyObj.attachments.push(attachment)
            }
            //adding slack specific stuff to the object
        break;
    }
    return storyObj;
}

//ㅣㅐㅣ
var send_story = function (builtStory,channel,team){


    //send story back to user

    console.log("SENDING STORY")

    // console.log('hope this works ',builtStory)
    // console.log('hope this works ',team)
    // console.log('hope this works ',admin)

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