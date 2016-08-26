//This is a survey generator that modifies the survey template for each platform

var db = require('db');
var Story = db.Story;

var http = require('http');
var request = require('request');
var async = require('async');
var co = require('co');

var survey = require( __dirname +'/stories/survey_templates/survey1.js')
var story_saver = require( __dirname +'/story_saver.js')



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


var startSurvey = function(kipUser,callback){



    //GET TEAMS TO QUERY HERE
    //& &* &* &* &* NOTE: /!\ : add message to user ping: "only admins see this message"
    // ----------------------->> add mode sticker to message

    //start sync operation
    co(function*() {

        console.log('_Z_Z_Z_Z_Z ',survey.survey1['Q1'])
            


        var builtStory = yield buildStory('slack',survey.survey1['Q1'],'Q1');

        //getSurveyTeams

        sendFirstQuestion(builtStory,kipUser,survey.teamList)

        console.log('BUILT FIRST STORY!!!! ',builtStory)

        callback('👹🍀')

    }).catch((e) => {
      kip.error(e, 'error loading slackbots');
    })
}



function sendFirstQuestion(question,kipUser,teamList){

    async.eachSeries(teamList, function (team, callback) {
        
        async.eachSeries(team.admins, function (admin, callback2) {

            //startSurvey(team.team_id,admin)


            msgData.attachments = question;

            console.log('QUESTION ???? ',question)
            console.log('ADMIN ???? ',admin)
            console.log('TEAM ???? ',team)

            //console.log('SEND DATA NOW _ NORMAL ',msgData);
            slackUsers_web[team].chat.postMessage(admin, '', question, function(err,res) {


                // if(data.action == 'list'){

                //     data.source.ts = res.ts;

                //     console.log('🍀👹6',data.source.ts);
                //     history.saveHistory(data,false,function(res){
                //         //whatever
                //     });
                // }


                //callback();
            });

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


// var slack = require('@slack/client');


/**
 * This function processes incoming story answers
 * @param {Object} req incoming user auth object from Slack
 * @returns {Object} res redirect authed user to Success page
 */
var incomingAnswer = function(processAnswer,callback){

    co(function* () {

        //SAVE ANSWER TO MONGO HERE

        // //advance the pointer
        //if (req.body && req.body.payload){

        //var processAnswer = yield process_answer(req.body.payload) 

        console.log('____PROCESS STORY: ', processAnswer)

        processAnswer = yield story_saver.loadIds(processAnswer)

        console.log('____PROCESS ANSWER: ', processStory)

        var builtStory = yield buildStory('slack',processAnswer,'Q1')


        //YIELD get teams

        //YIELD send to team


        //console.log('BUILT STORY ', builtStory)

        //SEND BACK TO SERVER CINNA CHAT
       // res.json(builtStory);

        //console.log('👑cool!👑 ',builtStory);

        callback('👑cool!👑')
        //}
       
    }).catch(function(err){
        console.error('co err ',err);
    });
}

function getSurveyTeams(){

    //select some entries from the slackbots collection
    //extract team ID and lsit of admin users from each slackbot document



        // web.chat.postMessage(message.source.channel, '', builtStory, function(err,res) {
        //     console.log(err)
        // });


        // var rtm = new slack.RtmClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');
        // var web = new slack.WebClient('xoxb-71163106818-IVHA9vHytuV2OIl3YuT1TW3s');

        //rtm.start();

    //     rtm.on(slack.CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
    //       console.log('loaded slack team');
    //     })

    //     //incoming slack messages
    //     rtm.on(slack.RTM_EVENTS.MESSAGE, (data) => {

    //         // // don't talk to yourself
    //         if (data.bot_id === 'B234K1NS3') {
    //             //console.log("don't talk to yourself");
    //             return; // drop the message before saving.
    //         }

    //         // other random things
    //         if (data.type !== 'message' || data.hidden === true || data.subtype === 'channel_join' || data.subtype === 'channel_leave') { //settings.name = kip's slack username
    //             console.log('will not handle this message');
    //             return;
    //         }

    //         //store incoming messages
    //         var message = new db.Message({
    //             incoming: true,
    //             thread_id: data.channel,
    //             original_text: data.text,
    //             user_id: data.user,
    //             origin: 'slack',
    //             source: data,
    //         });

    //         // clean up the text
    //         message.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
    //         if (message.text.charAt(0) == ':') {
    //             message.text = message.text.substr(1); //remove : from beginning of string
    //         }
    //         message.text = message.text.trim(); //remove extra spaces on edges of string

    //     })



    //select a team from the array


}


//expect entire response from user on button push
//response.origin = incoming origin
var process_answer = function*(response,origin){

    var qId, aId, story_end, answer_val

    //MOCK ORIGIN
    origin = 'slack'

    //response = JSON.parse(response)

    saveAnswer(response) //save to mongo

    
    //continue parsing story
    if(response && response.actions && response.actions[0] && response.actions[0].value){

        var parseVal = JSON.parse(response.actions[0].value);
        console.log('EXTRACT ',parseVal)

        story_end = parseVal.story_end //get story end value, we'll use later to end story

        console.log('EXTRACT QUESTION ID & ANSWER ID here')

        qId = parseVal.qId

        
    }else {
        console.error('missing response.actions.value from SLACK')
    }

    //check for question id
    if(!qId){
        story_pointer = 'Q1'
    }


    //CHECK HERE FOR FINISHED

    //SURVEY FINISHED!
    if (story_end){

        var sendText = {
            text: 'Thanks for taking our survey - happy shopping! :blush:'
        }

        return sendText
        
    }
    
    //stop running, send final message to user
    else if(answer_val == 'no' && qId == 'Q1'){

        var sendText= {
            text: 'Damn :('
        }

        return sendText
    }   

    //advance to next question
    else {


        //var nextQuestion = 

        // story_pointer++;
        // var nextQuestion = survey.survey1[story_pointer];


        return yield getNextQuestion(qId,aId)
        
    }
}


function getNextQuestion(qId,aId){

    //add POST request here to Neomodel
    //service returns qId for next question

    qId = 'Q2' //mock id

    return survey.survey1[qId]
}


//build story to send to slack
function buildStory(origin,incoming,qId){

    var storyObj = {
        attachments:[]
    };

    
    switch(origin){
        //built object for slack
        case 'slack':
            //map buttons for slack

            if (incoming && incoming.answers){
                var buttonArray = incoming.answers.map(function(obj){ 
                    var rObj = {}
                    var story_end = false;

                    rObj.name = obj.value;
                    rObj.text = obj.label;
                    rObj.type = 'button';

                    //should we end story after this last user action
                    if(obj.target_q_id == 'false'){
                        story_end = true
                    }

                    //stringify value object before sending to slack
                    rObj.value = JSON.stringify({
                        q_id: qId, //question ID
                        a_id: obj.id,//answer ID
                        story_end: story_end //should we end story after this question is answered?
                    });
                    return rObj;
                });

                console.log('BUTTON ARRAY ',buttonArray)

                var attachment = {
                    "text": incoming.prompt,
                    "fallback": incoming.prompt,
                    "callback_id": 'survey_55',
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


function saveAnswer(response){
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

    //save answer to DB
    var answer = new Story(cMongo);
    answer.save(function (err) {
      if (err) {
        console.log(JSON.stringify(err));
      } else {
        console.log('meow');
      }
    });
}


//process_story()
//gatherSurveyTeams()

module.exports.incomingAnswer = incomingAnswer
module.exports.startSurvey = startSurvey