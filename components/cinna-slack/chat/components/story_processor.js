//This is a survey generator that modifies the survey template for each platform

var survey = require('./stories/survey_templates/survey1.js')
var db = require('../../db');
var Story = db.Story;

var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');




// FINISH WRITING FOR KIP PRODUCTION

// LOAD QUESTIONS
// //loader script 
// // read json, curl to python service
// (create question)


// QUERY (question)
// ---> pass in question ID
// ---> pass in answer ID
// ------> GET BACK: QUESTION ID 

// ---> with question ID, lookup question in JSON, send to user



//Incoming Question to load in neomodel
// {
//     id: String,
//     survey_id: String,
//     prompt: String,
//     answers: [{
//         id: String,
//         name: String,
//         value: String,
//         next_question_id: String
//     }],
//     skippable: Boolean
// }




// {
//     '1':{
//         id:'1',
//         prompt:'ss'
//     },
//     '2':{
//         id:'1',
//         prompt:'ss'
//     }
// }

//* * * * * 
//on incoming action, query dexter's external service for next question id to advance to user




// var slack = require('@slack/client');

var incomingAction = function(req,callback){
    co(function* () {

        // //advance the pointer
        if (req.body && req.body.payload){

            var processStory = yield process_story(req.body.payload) 

            //console.log('PROCESS STORY ', processStory)

            var builtStory = yield buildStory('slack',processStory);

            //console.log('BUILT STORY ', builtStory)

            //SEND BACK TO SERVER CINNA CHAT
           // res.json(builtStory);

            //console.log('👑cool!👑 ',builtStory);

            callback(builtStory)
        }
       
    }).catch(function(err){
        console.error('co err ',err);
    });
}

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


            //start survey on slack event
            co(function*() {

                var builtStory = yield buildStory('slack',survey.survey1['Q1'],'Q1');

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


//expect entire response from user on button push
//response.origin = incoming origin
var process_story = function*(response,origin){

    var story_pointer;
    var story_answer;

    //MOCK ORIGIN
    origin = 'slack';

    response = JSON.parse(response)

    //Construct mongo answer
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

    //save answer to DB
    var answer = new Story(cMongo);
    answer.save(function (err) {
      if (err) {
        console.log(JSON.stringify(err));
      } else {
        console.log('meow');
      }
    });

    
    //continue parsing story
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


    //SURVEY FINISHED!
    if (story_pointer == survey.survey1.length - 1){

        var sendText = {
            text: 'Thanks for taking our survey - happy shopping! :blush:'
        }

        return sendText;
        
    }
    
    //stop running, send final message to user
    else if(story_answer == 'no' && story_pointer == 0){

        var sendText= {
            text: 'Damn :('
        }

        return sendText; 
    }   

    //advance to next question
    else {


        //var nextQuestion = 

        // story_pointer++;
        // var nextQuestion = survey.survey1[story_pointer];

        return yield getNextQuestion('','')
        
    }
}


function getNextQuestion(){

    //add POST request here to Neomodel
    //service returns qId for next question

    var qId = 'Q2' //mock id

    return survey.survey1[qId]
}


function buildStory(origin,incoming,qId){

    var storyObj = {
        attachments:[]
    };

    switch(origin){
        //built object for slack
        case 'slack':
            //map buttons for slack

            if (incoming && incoming.actions){
                var buttonArray = incoming.answers.map(function(obj){ 
                    var rObj = {};
                    rObj.name = obj.value;
                    rObj.text = obj.label;
                    rObj.type = 'button';

                    //stringify value object before sending to slack
                    rObj.value = JSON.stringify({
                        q_id: qId, //question ID
                        a_id: obj.id//answer ID
                    });
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



//process_story()
gatherSurveyTeams()

module.exports.incomingAction = incomingAction