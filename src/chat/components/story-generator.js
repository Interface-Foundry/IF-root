//This is a survey generator that modifies the survey template for each platform

var survey = require('./stories/survey_templates/survey1.js')
var db = require('../../db');
var storyAnswers = db.storyAnswers;
var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');

// var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

var slack = require('@slack/client');


//connect slack here



//lol
// setTimeout(function() {
   
// }, 2000);


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


    console.log('?????')

    //res.sendStatus(200);



    co(function* () {

        //save the incoming result to mongo

            // console.log('👑 ?',process_story())
            // console.log('👑 2 ?',req.body.payload)

        // //advance the pointer
        if (req.body && req.body.payload){
            //console.log('WORKING ?!?!?!?!?!?')
            //console.log(req.body.payload)

            // console.log('👑 ?',process_story())
            // console.log('👑 2 ?',req.body.payload)

            console.log('AAAAAAAAAA')

            var processStory = yield process_story(req.body.payload) 

            console.log(processStory)

            var builtStory = yield buildStory('slack',processStory);

            res.json(builtStory);

            console.log('👑cool!👑 ',builtStory);


        }
       

        //grab story, build for slack

        //send back to slack here


      // var nextQuestion = survey.survey1[story_pointer];

      // //build next question for correct platform
      // var builtStory = yield buildStory(origin,nextQuestion);

      // console.log('built for slack: ',JSON.stringify(builtStory))
      // //send built story back user (next question)
      // //send_story(builtStory)

    }).catch(function(err){
        //???
        console.log('👑👑')
        console.error('co err ',err);
    });

    //fire our process story, pass in the incoming params

    // ioKip.newSlack();

   // console.log('REQ ',req)

    //console.log('incoming Slack action BODY: ',req.body);





    // if (req.body && req.body.payload){
    //   var parsedIn = JSON.parse(req.body.payload);

    //   //sends back original chat
    //   if (parsedIn.response_url && parsedIn.original_message){
    //     var stringOrig = JSON.stringify(parsedIn.original_message);
    //     request.post(
    //         parsedIn.response_url,
    //         { payload: stringOrig },
    //         function (err, res, body) {
    //           console.error('post err ',err);
    //         }
    //     );
    //   }else {
    //     console.error('slack buttons broke, need a response_url');
    //     return;
    //   }
    // }else {
    //   console.log('nah');
    //   res.sendStatus(200);
    // }

});

//incoming slack action
app.get('/slackauth', function(req, res) {

    //https://slack.com/oauth/pick_reflow?scope=commands+bot+users%3Aread&client_id=2804113073.70750953120

    // ioKip.newSlack();

   // console.log('REQ ',req)

    console.log('incoming Slack action BODY: ',req.body);

    res.redirect('/thanks')

    var clientID = '2804113073.70750953120';
    var clientSecret = 'f551ddfc0e294e49a5ebacb8633bbd86';
    var redirect_uri = 'https://39645f46.ngrok.io/slackauth';

    var body = {
      code: req.query.code,
      redirect_uri: redirect_uri
    }

    //ㅔㅐㄴㅅ ㄱㄷ볃ㄴㅅ 랙 
    //post request for auth token
    request({
      url: 'https://' + clientID + ':' + clientSecret + '@slack.com/api/oauth.access',
      method: 'POST',
      form: body
    }, function(e, r, b) {
        if (e) {
          console.log('error connecting to slack api');
          console.log(e);
        }
        if (typeof b === 'string') {
            b = JSON.parse(b);
        }
        if (!b.ok) {
            console.error('error connecting with slack, ok = false')
            console.error('body was', body)
            console.error('response was', b)
            return;
        } else if (!b.access_token || !b.scope) {
            console.error('error connecting with slack, missing prop')
            console.error('body was', body)
            console.error('response was', b)
            return;
        }

        console.log('got positive response from slack')
        console.log('body was', body)
        console.log('response was', b)

    })

  //   response was { ok: true,
  // access_token: 'xoxp-2804113073-62926693712-71155053959-acfc5621fe',
  // scope: 'identify,bot,commands,users:read,tokens.basic',
  // user_id: 'U1UT8LDLY',
  // team_name: 'kip',
  // team_id: 'T02PN3B25',
  // bot:
  //  { bot_user_id: 'U234T34Q2',
  //    bot_access_token: 'xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s' } }




    // if (req.body && req.body.payload){
    //   var parsedIn = JSON.parse(req.body.payload);

    //   //sends back original chat
    //   if (parsedIn.response_url && parsedIn.original_message){
    //     var stringOrig = JSON.stringify(parsedIn.original_message);
    //     request.post(
    //         parsedIn.response_url,
    //         { payload: stringOrig },
    //         function (err, res, body) {
    //           console.error('post err ',err);
    //         }
    //     );
    //   }else {
    //     console.error('slack buttons broke, need a response_url');
    //     return;
    //   }
    // }else {
    //   console.log('nah');
    //   res.sendStatus(200);
    // }

});

app.get('/thanks', function(req, res) {
  //var thanks = fs.readFileSync(__dirname + '/thanks.html', 'utf8');
  res.send('<html>ok</html>');
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

        var rtm = new slack.RtmClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');
        var web = new slack.WebClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');

        rtm.start();

        //  
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



          console.log(message)


           // "value": {selected: "yes", story_pointer: 0, handler: "story.answer"}
            var array = []

            array.push(survey.survey1[0]);

            array = JSON.stringify(array);

            console.log('???? !??!!? !? ! ',array)

            var msgData = {
              // attachments: [...],
                icon_url:'http://kipthis.com/img/kip-icon.png',
                username:'Kip',
                attachments: array,
                // replace_original: false,
                // delete_original: false,
                response_type: "in_channel"
            };
            web.chat.postMessage(message.source.channel, '', msgData, function(err,res) {
                console.log(err)
            });

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

    var story_pointer;
    var story_answer;

    //MOCK ORIGIN
    origin = 'slack';

    response = JSON.parse(response)


    if(response && response.actions && response.actions[0]){

        //response.actions = response.actions
        //turn stringified object into object

        console.log(response.actions[0])

        story_pointer = response.actions[0].value.story_pointer;
        story_answer = response.actions[0].value.selected;
        
    }else {
        console.error('missing response.actions.value from SLACK');
    }

    //check for pointer val
    if(!story_pointer && story_pointer !== 0){
        story_pointer= 0;
    }

    console.log(story_pointer)
    console.log(story_answer)

  
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

         console.log('CCCCCCCC')

        story_pointer++;

        var nextQuestion = survey.survey1[story_pointer];

        return nextQuestion;

        // co(function* () {

          

        //   //build next question for correct platform

         

        //   console.log('built for slack: ',JSON.stringify(builtStory))
        //   //send built story back user (next question)
        //   //send_story(builtStory)

        //   return builtStory;

        // }).catch(function(err){
        //     //???
        //     console.log('😂😂')
        //     console.error('co err ',err);
        // });

        //build story     
        
    }
}


function buildStory(origin,incoming){

    console.log('DDDDDDDDDD')

    var storyObj = {
        attachments:[]
    };

    switch(origin){
        //built object for slack
        case 'slack':
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