/*eslint-env es6*/
var async = require('async');
var request = require('request');
var co = require('co')
var _ = require('lodash')
var fs = require('fs')
var Kik = require('@kikinteractive/kik');
//slack stuff
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var WEB_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.WEB;

var kipServer = require('../server_cinna_chat');
var banter = require("./banter.js");
var history = require("./history.js");
var search = require("./search.js");
var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");
var init_team = require("./init_team.js");
var conversation_botkit = require('./conversation_botkit');
var weekly_updates = require('./weekly_updates');
var kipcart = require('./cart');
var nlp = require('../../nlp/api');

//set env vars
var config = require('config');
var mailerTransport = require('../../../IF_mail/IF_mail.js');

//load mongoose models
var mongoose = require('mongoose');
var db = require('db');
var Message = db.Message;
var Chatuser = db.Chatuser;
var Slackbots = db.Slackbots;

var slackUsers = {};
var slackUsers_web = {};
var slackUsers_botkit = {};
var messageHistory = {}; //fake database, stores all users and their chat histories
var kipUser = {};
var io; //global socket.io var...probably a bad idea, idk lol
var supervisor = require('./supervisor');
var cinnaEnv;
// var BufferList = require('bufferlist').BufferList
var upload = require('../../../../IF_services/upload.js');
// var redisClient = require('../../../../redis.js');
// var redis = require('redis');
// var client = redis.createClient();
var email = require('./email');
var emojiText = require('emoji-text'); //convert emoji to text



/////////// LOAD INCOMING ////////////////


//- - - - - - - TELEGRAM - - - - - - //
var telegram = require('telegram-bot-api');

var telegramToken;
if (process.env.NODE_ENV == 'development_alyx'){
    telegramToken = '187934179:AAG7_UuhOETnyWEce3k24QCd2OhTBBQcYnk';
}else if (process.env.NODE_ENV == 'development_mitsu'){
    telegramToken = '187934179:AAG7_UuhOETnyWEce3k24QCd2OhTBBQcYnk';
}else{
    telegramToken = '144478430:AAG1k609USwh5iUORHLdNK-2YV6YWHQV4TQ';
}


if (process.env.NODE_ENV !== 'development') {
  var tg = new telegram({
          token: telegramToken,
          updates: {
              enabled: true
      }
  });

  tg.on('message', function(msg){

      //if user sends sticker msg.msg will be undefined
      if (msg.sticker) {
          console.log('Telegram message is a sticker: ',msg)
          return
      }

      var newTg = {
          source: {
              'origin':'telegram',
              'channel':msg.from.id.toString(),
              'org':'telegram',
              'id':'telegram' + "_" + msg.from.id, //for retrieving chat history in node memory,
          },
          'msg':msg.text
      }

      //console.log('asdf ',newTg);
      if (process.env.NODE_ENV !== 'development') {
        console.log("incoming telegram message");
        console.log(msg);
        console.log(newTg);
        preProcess(newTg);
      }
  });
}


//get stored slack users from mongo
var initSlackUsers = function(env){
    console.log('loading with env: ',env);
    cinnaEnv = env;
    //load kip-pepper for testing
    // if (env === 'development_alyx') {

    //     //KIP on Slack
    //     // var testUser = [{
    //     //     team_id:'T02PN3B25',
    //     //     dm:'D0H6X6TA8',
    //     //     bot: {
    //     //         bot_user_id: 'U0GRJ9BJS',
    //     //         bot_access_token:'xoxb-16868317638-4pB4v3sor5LNIu6jtIKsVLkB'
    //     //     },
    //     //     meta: {
    //     //         initialized: true
    //     //     }
    //     // }];

    //     //CINNA-PEPPER
    //     // var testUser = [{
    //     //     team_id:'T0H72FMNK',
    //     //     dm:'D0H6X6TA8',
    //     //     bot: {
    //     //         bot_user_id: 'U0H6YHBNZ',
    //     //         bot_access_token:'xoxb-17236589781-HWvs9k85wv3lbu7nGv0WqraG'
    //     //     },
    //     //     meta: {
    //     //         initialized: false
    //     //     }
    //     // }];

    //     //KIP-PAPRIKA
    //     var testUser = [{
    //         team_id:'T02PN3B25',
    //         dm:'D0H6X6TA8',
    //         bot: {
    //             bot_user_id: 'U0H6YHBNZ',
    //             bot_access_token:'xoxb-29684927943-TWPCjfJzcObYRrf5MpX5YJxv'
    //         },
    //         meta: {
    //             initialized: true
    //         }
    //     }];


    //     loadSlackUsers(testUser);
    // }
    if (env === 'development_mitsu'){
        var testUser = [{
            team_id:'T0HLZP09L',
            dm:'D0HLZLBDM',
            bot: {
                bot_user_id: 'cinnatest',
                bot_access_token:'xoxb-17713691239-K7W7AQNH6lheX2AktxSc6NQX'
            },
            meta: {
                initialized: false
            }
        }];
        loadSlackUsers(testUser);
    }else if (env === 'development_peter'){
        var testUser = [{
            team_id:'T0R6J00JW',
            access_token: 'xoxp-25222000642-25226799463-25867504995-3fe258a2aa',
            bot: {
                bot_user_id: 'U0R6H9BKN',
                bot_access_token:'xoxb-25221317668-Dxc6t3qZmLa73JuiuHGrb7iD'
            },
            meta: {
                initialized: false
            }
        }];
        loadSlackUsers(testUser);
    } else {
        console.log('retrieving slackbots from mongo database ' + config.mongodb.url);
        Slackbots.find({
          deleted: {$ne: true}
        }).exec(function(err, users) {
            if(err && process.env.NODE_ENV === 'production'){
                console.log('saved slack bot retrieval error');
                var mailOptions = {
                    to: 'Kip Server <hello@kipthis.com>',
                    from: 'Kip Server Status <server@kipthis.com>',
                    subject: 'mongo prob, restarting!',
                    text: 'Fix this ok thx'
                };
                mailerTransport.sendMail(mailOptions, function(err) {
                    if (err) console.log(err);
                    console.log('Server status email sent. Now restarting server.');
                    process.exit(1);
                });
            }
            else {
                console.log('found ' + users.length + ' slack teams in the db');
                loadSlackUsers(users);
            }
        });
    }
}

//fired when server gets /newslack route request
var newSlack = function() {
    //find all bots not added to our system yet
    Slackbots.find({'meta.initialized': false}).exec(function(err, users) {
        if(err){
            console.log('saved slack bot retrieval error');
        }
        else {
            loadSlackUsers(users);
            console.log('DEBUG: new slack team added with this data: ',users);
            res.send('slack user added');
        }
    });
}

//load slack users into memory, adds them as slack bots
function loadSlackUsers(users){
    console.log('loading '+users.length+' Slack users');

    async.eachSeries(users, function(user, callback) {


        var token = user.bot.bot_access_token || '';

        slackUsers[user.team_id] = new RtmClient(token);
        slackUsers_web[user.team_id] = new WebClient(token);

        slackUsers[user.team_id].start();


        //* * * Adding Botkit to Kip IO ~ ~ ~//
        //not reliable framework vs Slack SDK

        // var bot = controller.spawn({
        //     token: token
        // });
        // bot.startRTM(function(err, bot, payload) {
        //     console.log('ADDED BOTKIT ! ! ! ! ! ! !  ! ! ! ! ! ! ! ! ! ! !  ! ! ! ! ! ! ! ! !  ! ! ! !')
        //     // console.log('bot ',bot);
        //     // console.log('payload ',payload)
        //     slackUsers_botkit[user.team_id] = bot;
        // });

        // - - - - - - - - - - - - - - - - - //

        //on slack auth
        slackUsers[user.team_id].on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
            console.log('DEBUG: checking meta initialized: ', user.meta.initialized);
            //* * * * Welcome message * * * //
            //send welcome to new teams – dont spam all slack people on node reboot

            if (rtmStartData.self){
                slackUsers[user.team_id].botId = rtmStartData.self.id;
                slackUsers[user.team_id].botName = rtmStartData.self.name;
            }

            //this if here for dev testing
            if (cinnaEnv === 'development_alyx_NAH'){
                //
                // Onboarding conversation
                //

                // var hello = {
                //     msg: 'welcome',
                //     source: {
                //       origin: 'slack',
                //       channel: 'D0H6X6TA8',
                //       org: user.team_id,
                //       id: user.team_id + '_' + 'D0H6X6TA8'
                //     },
                //     action:'sendAttachment',
                //     client_res: [],
                //     botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                //     botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                // };

                // banter.welcomeMessage(hello, function(res) {
                //     hello.client_res.push(res);
                //     //send attachment!
                //     sendResponse(hello);
                // })
            }
            else if (cinnaEnv === 'development_mitsu'){
                //
                // Onboarding conversation
                //
                // var hello = {
                //     msg: 'welcome',
                //     source: {
                //       origin: 'slack',
                //       channel: 'D0HLZLBDM',
                //       org: user.team_id,
                //       id: user.team_id + '_' + 'D0HLZLBDM'
                //     },
                //     action:'sendAttachment',
                //     client_res: [],
                //     botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                //     botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                // };

                // banter.welcomeMessage(hello, function(res) {
                //     hello.client_res.push(res);
                //     //send attachment!
                //     sendResponse(hello);
                // })
            }
            else if (user.meta && user.meta.initialized == false){
                init_team(user, function(e, addedBy) {
                    if(cinnaEnv !== "development_alyx"){
                        user.meta.initialized = true;
                    }

                    if (typeof user.save === 'function') {
                      user.save();
                    }

                    //
                    // Onboarding conversation

                    if (cinnaEnv === 'development_alyx'){
                        var data = {
                            msg: 'welcome',
                            source: {
                              origin: 'slack',
                              channel: 'D0H6X6TA8',
                              org: 'T02PN3B25',
                              id: 'T02PN3B25' + '_' + 'U02PN3T5R',
                              user: 'U02PN3T5R'
                            },
                            //action:'sendAttachment',
                            client_res: [],
                            botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                            botName: slackUsers[user.team_id].botName, //this is the name of the bot on the channel so we can @ the bot,
                            mode: 'onboarding' //start onboarding mode
                        };
                    }else {
                        var data = {
                            msg: 'welcome',
                            source: {
                              origin: 'slack',
                              channel: addedBy.dm,
                              org: user.team_id,
                              id: user.team_id + '_' + addedBy.id,
                              user: addedBy.id
                            },
                            //action:'sendAttachment',
                            client_res: [],
                            botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                            botName: slackUsers[user.team_id].botName, //this is the name of the bot on the channel so we can @ the bot
                            mode: 'onboarding' //start onboarding mode
                        };
                    }

                    if(!kipUser[data.source.id]){
                       kipUser[data.source.id] = {}; //omg lol
                    }
                    kipUser[data.source.id].slack = user; //transfer conversation to global
                    updateMode(data);

                })
            }

        });

        //on socket disconnect, but it should handle reconnect properly
        slackUsers[user.team_id].on(CLIENT_EVENTS.DISCONNECT, function () {
            // var mailOptions = {
            //     to: 'Kip Server <hello@kipthis.com>',
            //     from: 'kip disconnected, but should be fine <server@kipthis.com>',
            //     subject: 'kip disconnected, but should be fine',
            //     text: 'kip disconnected, but should be fine'
            // };
            // mailerTransport.sendMail(mailOptions, function(err) {
            //     if (err) console.log(err);
            // });
        });

        //on messages sent to Slack
        slackUsers[user.team_id].on(RTM_EVENTS.MESSAGE, function (data) {
            console.log('🔥')


            //mitsu testing change user.bot.bot_user_id to 'U0HLZLB71'
            // don't talk to urself  TODO why does data sometimes have a bot_id instead of user id?
            if (data.user === user.bot.bot_user_id || data.username === 'Kip') {
              console.log("don't talk to urself")
              return;
            }

            // Less cyncical comment: might be useful to have history here,
            // but idk how and we'll probably rewrite this segment to handle
            // multiple chat platforms sooner rather than later anyway.

            data.source = {
                'origin':'slack',
                'channel':data.channel, //channel id on slack
                'org':data.team, //team id on slack
                'id':data.team + "_" + data.user, //for retrieving chat history in node memory, //this is a kip id for user across message platforms
                user: data.user //user id on slack
            }

            if(!kipUser[data.source.id]){
               kipUser[data.source.id] = {}; //omg lol
            }

            if (!kipUser[data.source.id].conversations){
                kipUser[data.source.id].conversations = 'shopping';
            }

           // user.conversations = user.conversations || 'shopping';

           // console.log('🔥🔥 ',user.conversations)

           // var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec()

            kipUser[data.source.id].slack = user; //transfer conversation to global

            console.log('🔥🔥🔥🔥 ',kipUser[data.source.id])

            if (data.type == 'message' && data.username !== 'Kip' && data.hidden !== true && data.subtype !== 'channel_join' && data.subtype !== 'channel_leave'){ //settings.name = kip's slack username

                //public channel
                if (data.channel && data.channel.charAt(0) == 'C' || data.channel.charAt(0) == 'G'){
                    //if contains bot user id, i.e. if bot is @ mentioned in channel (example user id: U0H6YHBNZ)

                    if (data.text && data.text.indexOf(slackUsers[user.team_id].botId) > -1){

                        //someone sent a file to Kip
                        if (data.subtype && data.subtype  == 'file_share'){

                            //get team id from private URL cause team id left out of API in file share (ugh wtf slack...)
                            if (data.file && data.file.url_private){
                                var teamParse = data.file.url_private.replace('https://files.slack.com/files-pri/','');
                                data.team = teamParse.substr(0, teamParse.indexOf('-'));
                            }

                            //it's an image, let's process it
                            if (data.file.filetype == 'png'||data.file.filetype == 'jpg'||data.file.filetype == 'jpeg'||data.file.filetype == 'gif'||data.file.filetype == 'svg'){
                                //send typing event
                                if (slackUsers[data.team]){
                                    slackUsers[data.team].sendTyping(data.channel);
                                }
                                processData.imageSearch(data,slackUsers[user.team_id]._token,function(res){
                                    data.text = res;
                                    data.imageTags = res;
                                    incomingSlack(data);
                                });
                            }

                            //not an image file, let's return canned response
                            else {
                                var newTxt = {
                                    source: {
                                        'origin':'slack',
                                        'channel':data.channel,
                                        'org':data.team,
                                        'id':data.team + "_" + data.user, //for retrieving chat history in node memory,
                                        user: data.user
                                    }
                                }
                                newTxt.client_res = [];
                                newTxt.client_res.push('Sorry, I\'m not very smart yet, I can only understand image files 👻');
                                cannedBanter(newTxt);
                            }
                        }
                        //not a file share, process normally
                        else {
                            console.log('\n\n EXANPLE DATA EWJTWREGSEW', data)
                            data.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
                            if (data.text.charAt(0) == ':'){
                                data.text = data.text.substr(1); //remove : from beginning of string
                            }
                            data.text = data.text.trim(); //remove extra spaces on edges of string
                            incomingSlack(data);
                        }

                    }
                }
                //direct message
                else if (data.channel && data.channel.charAt(0) == 'D'){

                    //someone sent a file to Kip
                    if (data.subtype && data.subtype  == 'file_share'){

                        //get team id from private URL cause team id left out of API in file share (ugh wtf slack...)
                        if (data.file && data.file.url_private){
                            var teamParse = data.file.url_private.replace('https://files.slack.com/files-pri/','');
                            data.team = teamParse.substr(0, teamParse.indexOf('-'));
                        }

                        //it's an image, let's process it
                        if (data.file.filetype == 'png'||data.file.filetype == 'jpg'||data.file.filetype == 'jpeg'||data.file.filetype == 'gif'||data.file.filetype == 'svg'){
                            //send typing event
                            if (slackUsers[data.team]){
                                slackUsers[data.team].sendTyping(data.channel);
                            }
                            processData.imageSearch(data,slackUsers[user.team_id]._token,function(res){
                                data.text = res;
                                data.imageTags = res;
                                incomingSlack(data);
                            });
                        }
                        //not an image file, let's return canned response
                        else {
                            var newTxt = {
                                source: {
                                    'origin':'slack',
                                    'channel':data.channel,
                                    'org':data.team,
                                    'id':data.team + "_" + data.user, //for retrieving chat history in node memory,
                                    user: data.user
                                }
                            }
                            newTxt.client_res = [];
                            newTxt.client_res.push('Sorry, I\'m not very smart yet, I can only understand image files 👻');
                            cannedBanter(newTxt);
                        }
                    }

                    //not a file share, process normally
                    else {
                        data.text = data.text.replace(/(<([^>]+)>)/ig, ''); //remove <user.id> tag
                        incomingSlack(data);
                    }
                }
                else {
                    console.log('error: not handling slack channel type ',data.channel);
                }
            }
            function incomingSlack(data){
                console.log('incoming slack 📬')
                if (data.type == 'message' && data.username !== 'Kip' && data.hidden !== true ){
                    var newSl = {
                        source: {
                            'origin':'slack',
                            'channel':data.channel,
                            'org':data.team,
                            'id':data.team + "_" + data.user, //for retrieving chat history in node memory,
                            user: data.user
                        },
                        'msg':data.text
                    }
                    //carry image tags over
                    if (data.imageTags){
                        newSl.imageTags = data.imageTags;
                    }
                    preProcess(newSl);
                }
            }
        });

        callback();
    }, function done(){
        console.log('done loading slack users');
    });
}


//- - - - Socket.io handling - - - -//

var loadSocketIO = function(server){
    io = require('socket.io').listen(server);
    io.sockets.on('connection', function(socket) {
        console.log("socket connected");

        //* * * * send welcome message
        var hello = {
            msg: 'welcome'
        }
        hello.source = {
            'origin':'socket.io',
            'channel':socket.id,
            'org':'kip',
            'id':'kip' + "_" + socket.id //for retrieving chat history in node memory
        }
        banter.welcomeMessage(hello,function(res){
            sendTxtResponse(hello,res);
        });
       // * * * * * * * * * * //

        socket.on("msgToClient", function(data) {
            data.source = {
                'origin':'socket.io',
                'channel':socket.id,
                'org':'kip',
                'id':'kip' + "_" + socket.id //for retrieving chat history in node memory
            }
            preProcess(data);
        });

        socket.on("msgFromSever", function(data) {
            // var items = {}
            // if (data.e&& data.amazon[0] && data.amazon[0].ItemAttributes) {
            //     items = JSON.stringify(data.amazon.slice(0,3))
            // }
            console.log('\n\n\nReceived message from supervisor: ',data.flags,'\n\n\n')
            incomingAction(data);
        })
    });
}

//- - - - - - //

/////////// PROCESSING INCOMING //////////

//pre process incoming messages for canned responses
var preProcess = function(data){

    //setting up all the data for this user / org
    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 1');
    }
    if (!messageHistory[data.source.id]){ //new user, set up chat states
        messageHistory[data.source.id] = {};
        messageHistory[data.source.id].search = []; //random chats
        messageHistory[data.source.id].banter = []; //search
        messageHistory[data.source.id].purchase = []; //finalizing search and purchase
        messageHistory[data.source.id].persona = []; //learn about our user
        messageHistory[data.source.id].cart = []; //user shopping cart
        messageHistory[data.source.id].allBuckets = []; //all buckets, chronological chat history
    }

    data.msg = data.msg.trim();
    data.client_res = [];

    // don't perform searches if ur having a convo with a bot
    // let botkit handle it

    //console.log('👻 👻 👻 👻  ',kipUser[data.source.id].conversations)

    if (kipUser[data.source.id] && kipUser[data.source.id].conversations && kipUser[data.source.id].conversations !== 'shopping') {  //shopping = main / default kip function (search)


        //PUT MODE LISTENER HERE TO SWITCH BETWEEN MODES

        // * * * * IF NOT EQUAL TO HELP OR .... other banter response

        //IF DETECT NLP, switch to shopping mode and process query!!!!!

        // PASS TO NLP, IF TEXT Breaks context, change mode to correct context!!!!
        // i.e. in settings mode, if user types '2 but cheaper'
        // run through NLP and check for buckets / actions

        //if input"settings", reshow settings menu

        //--->

      console.log('in a conversation: ' + kipUser[data.source.id].conversations)

      return;
    }

    //check for canned responses/actions before routing to NLP
    banter.checkForCanned(data.msg,function(res,flag,query){

        //found canned response
        if(flag){
            switch(flag){
                case 'basic': //just respond, no actions
                    //send message
                    data.client_res = [];
                    data.client_res.push(res);
                    cannedBanter(data);
                    break;
                case 'search.initial':
                    //send message
                    data.client_res = [];
                    data.client_res.push(res);
                    cannedBanter(data);

                    //now search for item
                    data.tokens = [];
                    data.tokens.push(query); //search for this item
                    data.bucket = 'search';
                    data.action = 'initial';
                    incomingAction(data);
                    break;
                case 'search.focus':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'search';
                    data.action = 'focus';
                    incomingAction(data);
                    break;
                case 'search.cheaper':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'search';
                    data.action = 'modify';
                    data.dataModify = { type: 'price', param: 'less' }
                    incomingAction(data);
                    break;
                case 'search.similar':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'search';
                    data.action = 'similar';
                    incomingAction(data);
                    break;
                case 'search.more':
                    data.bucket = 'search';
                    data.action = 'more';
                    incomingAction(data);
                    break;
                case 'purchase.save':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'purchase';
                    data.action = 'save';
                    incomingAction(data);
                    break;
                case 'purchase.remove':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'purchase';
                    data.action = 'remove';
                    incomingAction(data);
                    break;

                case 'search.random':
                    var arr = ['emoji clothes','japanese fashion','robot'];
                    data.tokens = [];
                    data.tokens.push(arr[Math.floor(Math.random()*arr.length)]); //search for this item
                    data.bucket = 'search';
                    data.action = 'initial';
                    incomingAction(data);
                    break;

                //shows last search results in kik
                case 'kik.back':
                    data.bucket = 'search';
                    history.recallHistory(data, function(res){
                        res.kikData = data.kikData;
                        outgoingResponse(res,'stitch','amazon');
                    });
                    break;

                //for testing in PAPRIKA
                case 'slack.search':
                    // data.searchSelect = [];
                    // data.bucket = 'search';

                    var slackTester;

                    if (res == 'cheaper'){
                        slackTester = { payload: '{"actions":[{"name":"cheaper","value":"1"}],"callback_id":"57081aeed625bc9f8a359926","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460148983.486353","message_ts":"1460148974.000406","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/ZM0ZP8V7RNXDY81DH4L1HQ7S.png","image_width":400,"image_height":175,"image_bytes":34155,"callback_id":"57081aeed625bc9f8a359926","title":":one: Women\'s Military Up Buckle Combat Boots Mid Knee High E...","id":1,"title_link":"http:\\/\\/goo.gl\\/VgkoLs","color":"45a5f4","actions":[{"id":"1","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"Similar","text":"\\u27b0 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/CPY561LDJDMINVXX6OI1ICNM.png","image_width":400,"image_height":175,"image_bytes":26562,"callback_id":"57081aeed625bc9f8a359926","title":":two: COCO 1 Womens Buckle Riding Knee High Boots,Coco-01v4.0...","id":2,"title_link":"http:\\/\\/goo.gl\\/u8EY7U","color":"45a5f4","actions":[{"id":"6","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"Similar","text":"\\u27b0 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WQSCP0BWTPXYHBTXR7E2PIPS.png","image_width":400,"image_height":175,"image_bytes":22442,"callback_id":"57081aeed625bc9f8a359926","title":":three: Forever Mango-21 Women\'s Winkle Back Shaft Side Zip Kne...","id":3,"title_link":"http:\\/\\/goo.gl\\/teZTD5","color":"45a5f4","actions":[{"id":"11","name":"AddCart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"Cheaper","text":"\\ud83d\\udcb8 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"Similar","text":"\\u27b0 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"Modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"Moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460148974.000406"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33282428390\\/2Sq4RdP8qAJKRp5JrXfNoGP1"}' };
                    }
                    else if (res == 'addcart'){
                        slackTester = { payload: '{"actions":[{"name":"addcart","value":"1"}],"callback_id":"570c721cd365f919d8e2d42d","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433491.790565","message_ts":"1460433437.000476","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Q3QUY8L4W7M800SX5VX0ZJPZ.png","image_width":400,"image_height":175,"image_bytes":44065,"callback_id":"570c721cd365f919d8e2d42d","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/JVK7D21JRMI3W166JGZY3E9E.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c721cd365f919d8e2d42d","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/QUKE3JMMCWAOFCVSTTFL8WYE.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c721cd365f919d8e2d42d","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460433437.000476"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33838187251\\/zVu3xcqUIvln4FbwLLC51zIR"}' };
                    }
                    else if (res == 'similar'){
                        slackTester = { payload: '{"actions":[{"name":"similar","value":"2"}],"callback_id":"570c6cef64513dd7d7b1fd24","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460433572.400826","message_ts":"1460432112.000473","attachment_id":"3","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K8JSSSW1PUVP4IZJLP4M2ZP1.png","image_width":400,"image_height":175,"image_bytes":42014,"callback_id":"570c6cef64513dd7d7b1fd24","title":":one: Poop Emoji Pillow Emoticon Stuffed Plush Toy Doll Smile...","id":1,"title_link":"http:\\/\\/goo.gl\\/tUkU8X","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/IS52N2SHFGP2RD9BDRKWWXBG.png","image_width":400,"image_height":175,"image_bytes":43405,"callback_id":"570c6cef64513dd7d7b1fd24","title":":two: ToLuLu\\u00ae Soft Emoji Bedding Pillow Cushion Car Sofa Pill...","id":2,"title_link":"http:\\/\\/goo.gl\\/slwuZ2","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/VTCYNQ0V06PZVODX85ORIE1C.png","image_width":400,"image_height":175,"image_bytes":25642,"callback_id":"570c6cef64513dd7d7b1fd24","title":":three: Emoji Shirt Smiley - Money Mouth Face - Doller Sign - F...","id":3,"title_link":"http:\\/\\/goo.gl\\/vCPV35","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":"\\ud83e\\udd11 cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460432112.000473"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33887511719\\/sh4EXEcx5h2HVAjz5dIIG50i"}' };
                    }
                    else if (res == 'modify'){
                        slackTester = { payload: '{"actions":[{"name":"modify","value":"1"}],"callback_id":"570c75d7d365f919d8e2d431","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434417.593489","message_ts":"1460434392.000484","attachment_id":"2","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/6BSZE72GXWKRR0Y79V72NBC7.png","image_width":400,"image_height":175,"image_bytes":39117,"callback_id":"570c75d7d365f919d8e2d431","title":":one: Youngin\' Blues: The Story of Reed and RaKeem","id":1,"title_link":"http:\\/\\/goo.gl\\/dG0mQm","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/UWF0QVNWH4I4LOA7V9PJX270.png","image_width":400,"image_height":175,"image_bytes":44919,"callback_id":"570c75d7d365f919d8e2d431","title":":two: 2015-16 Totally Certified Roll Call Mirror Camo RC Auto...","id":2,"title_link":"http:\\/\\/goo.gl\\/0UHjD5","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/K89N9L5QU3SVLH3T7QE4YRZN.png","image_width":400,"image_height":175,"image_bytes":48795,"callback_id":"570c75d7d365f919d8e2d431","title":":three: Rakeem Interlude (feat. Merc)","id":3,"title_link":"http:\\/\\/goo.gl\\/XWkxKp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434392.000484"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33879490084\\/KY3oPL33C2V4W9V7B45xWEMA"}' };
                    }
                    else if (res == 'moreinfo'){
                        slackTester = { payload: '{"actions":[{"name":"moreinfo","value":"0"}],"callback_id":"570c7611d365f919d8e2d433","team":{"id":"T02PN3B25","domain":"kipsearch"},"channel":{"id":"D0GRF5J4T","name":"directmessage"},"user":{"id":"U02PN3T5R","name":"alyx"},"action_ts":"1460434463.610937","message_ts":"1460434449.000488","attachment_id":"1","token":"obnfDfOpF3e4zKd24pSa9FHg","original_message":{"text":"Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now :blush:","username":"Kip","icons":{"image_48":"https:\\/\\/s3-us-west-2.amazonaws.com\\/slack-files2\\/bot_icons\\/2015-12-08\\/16204337716_48.png"},"bot_id":"B0GRE31MK","attachments":[{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/OBIAI1M7VY2U2BGWWAA3VIZB.png","image_width":400,"image_height":175,"image_bytes":52377,"callback_id":"570c7611d365f919d8e2d433","title":":one: Greatest Hits","id":1,"title_link":"http:\\/\\/goo.gl\\/vpf4iz","color":"45a5f4","actions":[{"id":"1","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"0","style":"primary"},{"id":"2","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"0","style":"default"},{"id":"3","name":"similar","text":"\\u26a1 similar","type":"button","value":"0","style":"default"},{"id":"4","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"0","style":"default"},{"id":"5","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"0","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/Z9RGCV9RBFGATNUWVSRUKT7X.png","image_width":400,"image_height":175,"image_bytes":35445,"callback_id":"570c7611d365f919d8e2d433","title":":two: ZZ Way - Spring ZigZag Craft Game","id":2,"title_link":"http:\\/\\/goo.gl\\/W9si1L","color":"45a5f4","actions":[{"id":"6","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"1","style":"primary"},{"id":"7","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"1","style":"default"},{"id":"8","name":"similar","text":"\\u26a1 similar","type":"button","value":"1","style":"default"},{"id":"9","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"1","style":"default"},{"id":"10","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"1","style":"default"}]},{"fallback":"Here are some options you might like","image_url":"https:\\/\\/s3.amazonaws.com\\/if-kip-chat-images\\/WOIKXKZKL7JO3J6IR9L8YFJ5.png","image_width":400,"image_height":175,"image_bytes":52322,"callback_id":"570c7611d365f919d8e2d433","title":":three: Til The Casket Drops [Explicit]","id":3,"title_link":"http:\\/\\/goo.gl\\/tDTjNp","color":"45a5f4","actions":[{"id":"11","name":"addcart","text":"\\u2b50 add to cart","type":"button","value":"2","style":"primary"},{"id":"12","name":"cheaper","text":":money_mouth_face: cheaper","type":"button","value":"2","style":"default"},{"id":"13","name":"similar","text":"\\u26a1 similar","type":"button","value":"2","style":"default"},{"id":"14","name":"modify","text":"\\ud83c\\udf00 modify","type":"button","value":"2","style":"default"},{"id":"15","name":"moreinfo","text":"\\ud83d\\udcac info","type":"button","value":"2","style":"default"}]}],"type":"message","subtype":"bot_message","ts":"1460434449.000488"},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33890435429\\/zRrVRvLmlnN8PEDyvMcQWNIx"}' };
                    }

                    incomingMsgAction(slackTester);
                    break;
                case 'cancel': //just respond, no actions
                    //send message
                    console.log('Kip response cancelled');
                    break;
                default:
                    console.log('error: canned action flag missing');
            }
        }
        //nothing found in cannedbanter, now check for mode strings
        else {

            //check for mode switch, coming from shopping (default) context
            banter.checkModes(data,'shopping',function(mode,res){
                if(mode){
                    switch(mode){
                        //* * MODES * *
                        case 'settings':
                            settingsMode(data);
                            break;

                        case 'collect':
                            collectMode(data);
                            break;

                        case 'onboarding':
                            onboardingMode(data);
                            break;

                        case 'shopping':
                            shoppingMode(data);
                            break;

                        case 'food_ordering':

                            break;

                        case 'report':
                            reportMode(data);
                            break;

                        case 'addmember':
                            addmemberMode(data);
                            break;

                        default:
                            shoppingMode(data);
                    }
                }else {
                    //proceed to NLP instead
                    if (data){
                        routeNLP(data);
                    }
                    else {
                        console.log('NOT PROCESSING, DATA NOT FOUND')
                    }

                }

            });
        }
    },data.source.origin,data.source);

}

//pushing incoming messages to python
function routeNLP(data){
        
    data.flags = data.flags ? data.flags : {};
    data.msg = emojiText.convert(data.msg,{delimiter: ' '}); //convert all emojis to text
    data.msg = data.msg.replace(/[^0-9a-zA-Z.]/g, ' '); //sanitize msg before sending to NLP

    console.log('❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️❄️ ',data.msg)

    if (data.msg){

        //passing a context (last 10 items in DB to NLP)
        history.recallContext(data,function(res){
            data.recallContext = res;
            continueNLP();
        });

        function continueNLP(){
           nlp.parse(data, function(e, res) {
               if (e){
                 console.log('NLP error ',e);
                 // Route to supervisor
                 data.flags.toSupervisor = true;
                 incomingAction(data);
               }
               else {
                   data = _.merge({}, data, res)
                   processData.buildKipObject(data,function(res){
                     incomingAction(_.merge({}, data, res));
                   });
               }
           })
        }
    }
    else {
        //we get this if we killed the whole user request (i.e. they sent a URL)
        sendTxtResponse(data,'Oops sorry, I didn\'t understand your request');
    }
}

//incoming action responses from Slack buttons
var incomingMsgAction = function(data,origin){

    console.log('incoming Slack action req.body ', data);


    //"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T02PN3B25\\/33282428390\\/2Sq4RdP8qAJKRp5JrXfNoGP1";

    if (!origin){
        origin = 'slack';
    }
    var parsedIn = JSON.parse(data.payload);

    if (!parsedIn.callback_id){
        console.error('Slack callback_id missing from Slack response');
        return;
    }
    console.log('PARSED INCOMONG ',parsedIn);

    //build new incoming Kip obj
    var kipObj = {
        client_res: [],
        slackData: {
            callback_id: parsedIn.callback_id
        },
        tokens: ['kipfix'] //bad code check later on, hot fix here for now
    };

    //let's try to build a universal action button i/o for all platforms
    //deal with first action in action arr...more will happen later?
    if (parsedIn.actions && parsedIn.actions[0] && parsedIn.actions[0].name && parsedIn.actions[0].value){

        //get bucket/action
        switch (parsedIn.actions[0].name){

            case 'cheaper':
                kipObj.bucket = 'search';
                kipObj.action = 'modify';
                kipObj.dataModify = { type: 'price', param: 'less' };
                break;

            case 'similar':
                kipObj.bucket = 'search';
                kipObj.action = 'similar';
                break;

            //uses default blue for now
            case 'modify':
                kipObj.bucket = 'search';
                kipObj.action = 'modify';
                kipObj.dataModify = { type: 'genericDetail', val: ['blue'] };
                break;

            case 'moreinfo':
                kipObj.bucket = 'search';
                kipObj.action = 'focus';
                break;

            case 'addcart':
                kipObj.bucket = 'purchase';
                kipObj.action = 'save';
                break;
        }

        //get searchSelect
        var parseVal = parseInt(parsedIn.actions[0].value); //parse
        if (!isNaN(parseVal) && parseVal > -1){ //check if real select number
            parseVal = parseVal + 1; //normalize to rest of Kip of system
            kipObj.searchSelect = [];
            kipObj.searchSelect.push(parseVal);
        }

        //build source
        kipObj.source = {
            origin: origin,
            channel: parsedIn.channel.id,
            org: parsedIn.team.id,
            id: parsedIn.team.id +'_'+ parsedIn.channel.id,
            user: parsedIn.user.id,
            flag: 'buttonAction'
        }

        //console.log('KIPOBJ ',kipObj);

        incomingAction(kipObj);

    }else {
        console.error('Incoming Slack ERROR: missing actions[0].name or actions[0].value ',parsedIn);
    }

    // var fakeAction = {
    //   "actions": [
    //     {
    //       "name": "approve",
    //       "value": "yes"
    //     }
    //   ],
    //   "callback_id": "approval_2715",
    //   "team": {
    //     "id": "2147563693",
    //     "domain": "igloohat"
    //   },
    //   "channel": {
    //     "id": "C065W1189",
    //     "name": "solipsistic-slide"
    //   },
    //   "user": {
    //     "id": "U045VRZFT",
    //     "name": "episod"
    //   },
    //   "action_ts": "1458170917.164398",
    //   "message_ts": "1458170866.000004",
    //   "attachment_id": "1",
    //   "token": "xAB3yVzGS4BQ3O9FACTa8Ho4",
    //   "response_url": "https://hooks.dev.slack.com/actions/T021BE7LD/6204672533/x7ZLaiVMoECAW50GwtZYAXEM"
    // }

}





//sentence breakdown incoming from python
function incomingAction(data){



    //console.log('DATA DATA DATA ',data)

//------------------------supervisor stuff-----------------------------------//
  if (data.bucket === 'response' || (data.flags && data.flags.toClient)) {

            if (data.bucket === 'response' || data.action === 'focus') {
                return sendResponse(data)
            } else {
                if (data.action === 'checkout') {
                    return outgoingResponse(data,'txt');
                } else {
                    return outgoingResponse(data,'txt','amazon');
                }
            }
   }
data.flags = data.flags ? data.flags : {};
//---------------------------------------------------------------------------//
    history.saveHistory(data,true,function(res){
        supervisor.emit(res, true)
    });
    delete data.flags.toSupervisor
    //sort context bucket (search vs. banter vs. purchase)
    switch (data.bucket) {
        case 'search':
            searchBucket(data);
            break;
        case 'banter':
            banterBucket(data);
            break;
        case 'purchase':

            if (data.source.origin == 'socket.io' || data.source.origin  == 'telegram'){
                sendTxtResponse(data,'Sorry, shopping cart features are only available with Kip for Slack and Email right now');
            }
            else if(data.source.origin == 'kik'){
                sendTxtResponse(data,'Sorry, shopping cart coming soon! 😊');
            }
            else {
                purchaseBucket(data);
            }

            break;
        case 'mode':
            modeBucket(data);
            break;
        case 'supervisor':
            //route to supervisor chat window
        default:
            searchBucket(data);
    }
}

//* * * * * ACTION CONTEXT BUCKETS * * * * * * *//

function modeBucket(data){


}


function searchBucket(data){

    //* * * * typing event
    if (data.action == 'initial' || data.action == 'similar' || data.action == 'modify' || data.action == 'more'){

        var searcher = {};
        searcher.source = data.source;
        if(data.kikData){
            searcher.kikData = data.kikData;
        }
        sendTxtResponse(searcher,'Searching...','typing');

        //sends typing even to Slack, killed for now cause no mobile support
        // if (data.source.origin == 'slack' && slackUsers[data.source.org]){
        //     slackUsers[data.source.org].sendTyping(data.source.channel);
        // }
    }

    console.log('* * * * * * * * * * * * ',data.bucket);

    if (data.bucket == 'purchase'){
        var searcher = {};
        searcher.source = data.source;
        sendTxtResponse(searcher,'Thinking...','typing');
    }

    //sort search action type
    switch (data.action) {
        case 'initial':
            search.searchInitial(data);
            break;
        case 'similar':
            //----supervisor: flag to skip history.recallHistory step below ---//
            if (data.flags && data.flags.recalled) {
                 // console.log('Flagged "recalled", skipping recallHistory...')
                 search.searchSimilar(data);
            }
            //-----------------------------------------------------------------//
            else {
                history.recallHistory(data, function(res){
                if (res){
                    data.recallHistory = res;
                }
                search.searchSimilar(data);
                });
            }

            break;
        case 'modify':
        case 'modified': //because the nlp json is wack

            //fix NLP bug
            if (data.dataModify && data.dataModify.val && Array.isArray(data.dataModify.val)){
                if (data.dataModify.val[0] == 'cheeper' || data.dataModify.val[0] == 'cheper' || data.dataModify.val[0] == 'chiper' || data.dataModify.val[0] == 'chaper' || data.dataModify.val[0] == 'chaeper'){
                    data.dataModify.type = 'price';
                    data.dataModify.param = 'less';
                }
            }

            //----supervisor: flag to skip history.recallHistory step below ---//
            if (data.flags && data.flags.recalled) {
                 // console.log('Flagged "recalled", skipping recallHistory...')
                 search.searchModify(data);
            }
            //-----------------------------------------------------------------//
            else {
                history.recallHistory(data, function(res){
                    if (res){
                        data.recallHistory = res;
                    }
                    search.searchModify(data);
                });
            }
            break;
        case 'focus':
          //----supervisor: flag to skip history.recallHistory step below ---//
            if (data.flags && data.flags.recalled) {
                    // console.log('Flagged "recalled", skipping recallHistory...')
                    search.searchFocus(data);
            }
            //-----------------------------------------------------------------//
            else {
            history.recallHistory(data, function(res){
                    if (res){
                        data.recallHistory = res;
                    }
                    search.searchFocus(data);
                });
            }
            break;
        case 'back':
            //search.searchBack(data);
            break;
        case 'more':
            //----supervisor: flag to skip history.recallHistory step below ---//
            if (data.flags && data.flags.recalled) {
                    // console.log('Flagged "recalled", skipping recallHistory...')
                    search.searchMore(data);
            }
            //-----------------------------------------------------------------//
            history.recallHistory(data, function(res){
                if (res){
                    data.recallHistory = res;
                }
                search.searchMore(data); //Search more from same query
            });
            break;
        default:
            search.searchInitial(data);
    }
}

function banterBucket(data){
    //sort search action type
    switch (data.action) {
        case 'question':
            break;
        case 'smalltalk':
            outgoingResponse(data,'txt');
            break;
        default:
    }
}

function purchaseBucket(data){
    //sort purchase action
    switch (data.action) {
        case 'save':
            saveToCart(data);
            break;
        case 'remove':
            removeCartItem(data);
            break;
        case 'removeAll':
            removeAllCart(data);
            break;
        case 'list':
            viewCart(data);
            break;
        case 'checkout':
            viewCart(data);
            break;
        default:
            console.log('error: no purchase bucket action selected');
    }
}


/////////// OUTGOING RESPONSES ////////////

//process canned message stuff
//data: kip data object
var cannedBanter = function(data){
    data.bucket = 'banter';
    data.action = 'smalltalk';
    incomingAction(data);
}

var sendTxtResponse = function(data,msg,flag){
    data.action = 'smallTalk';
    if (!msg){
        console.log('error: no message sent with sendTxtResponse(), using default');
        msg = 'Sorry, I didn\'t understand';
    }
    data.client_res = [];
    data.client_res.push(msg);
    sendResponse(data,flag);
}

//Constructing reply to user
var outgoingResponse = function(data,action,source) { //what we're replying to user with
// console.log('Mitsu: iojs668: OUTGOINGRESPONSE DATA ', data)
    //stitch images before send to user
    if (action == 'stitch'){
        picstitch.stitchResults(data,source,function(urlArr){
            //sending out stitched image response
            data.client_res = [];
            data.urlShorten = [];

            processData.urlShorten(data,function(res){
                var count = 0;

                //if (data.source.origin == 'slack'){
                    //store a new mongo ID to pass in Slack callback
                data.searchId = mongoose.Types.ObjectId();

                    // var moreObj = {};
                    // moreObj.actions = [{
                    //   "name": "more",
                    //   "text": "more",
                    //   "style": "default",
                    //   "type": "button",
                    //   "value": 'more'
                    // }];
                    // moreObj.callback_id = 'sdfasdfasdfasdf'; //pass mongo id as callback id so we can access reference later
                    // moreObj.image_url = urlArr[count];
                    // moreObj.title = 'See more';
                    // moreObj.title_link = res[count];
                    // moreObj.color = "#45a5f4";
                    // moreObj.fallback = 'Tap for more';

                    // client_res.push(moreObj);
                //}

                //put all result URLs into arr
                async.eachSeries(res, function(i, callback) {
                    data.urlShorten.push(i);//save shortened URLs

                    processData.getNumEmoji(data,count+1,function(emoji){
                        res[count] = res[count].trim();
                        if (data.source.origin == 'slack'){

                            var attachObj = {};

                            var actionObj = [
                                {
                                  "name": "addcart",
                                  "text": "⭐ add to cart",
                                  "style": "primary",
                                  "type": "button",
                                  "value": count
                                  // "confirm": {
                                  //   "title": "Are you sure?",
                                  //   "text": "This will approve the request.",
                                  //   "ok_text": "Yes",
                                  //   "dismiss_text": "No"
                                  // }
                                },
                                {
                                  "name": "cheaper",
                                  "text": "💎 cheaper",
                                  "style": "default",
                                  "type": "button",
                                  "value": count
                                },
                                {
                                  "name": "similar",
                                  "text": "⚡ similar",
                                  "style": "default",
                                  "type": "button",
                                  "value": count
                                },
                                {
                                  "name": "modify",
                                  "text": "🌀 modify",
                                  "style": "default",
                                  "type": "button",
                                  "value": count
                                },
                                {
                                  "name": "moreinfo",
                                  "text": "💬 info",
                                  "style": "default",
                                  "type": "button",
                                  "value": count
                                }
                            ];
                            //attachObj.actions = actionObj;
                            //attachObj.callback_id = data.searchId; //pass mongo id as callback id so we can access reference later

                            attachObj.image_url = urlArr[count];
                            attachObj.title = emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]);
                            attachObj.title_link = res[count];
                            attachObj.color = "#45a5f4";
                            attachObj.fallback = 'Here are some options you might like';

                            console.log('ATTACH OBJ: ',attachObj);

                            data.client_res.push(attachObj);
                            // '<'++' | ' + +'>';
                        }else if (data.source.origin == 'socket.io'){
                            data.client_res.push(emoji + '<a target="_blank" href="'+res[count]+'"> ' + truncate(data.amazon[count].ItemAttributes[0].Title[0])+'</a>');
                            data.client_res.push(urlArr[count]);
                        }
                        else if (data.source.origin == 'kik'){

                            //PUSH NEW EMOJI + TEXT
                            //PUSH NEW IMAGE


                            // attachObj.image_url = urlArr[count];
                            // attachObj.title = emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]);
                            // attachObj.title_link = res[count];
                            // attachObj.color = "#45a5f4";
                            // attachObj.fallback = 'Here are some options you might like';


                            //BUILD NEW MESSAGE ARRAY OBJ FOR 5+ messages
                            
                            // - - - - - //

                            // var item = response.amazon[count];

                            //console.log('ITEM ATTRIBS ',JSON.stringify(data.amazon[count].ItemAttributes[0]))


                            //collect info for keyboard buttons
                            //var collectInfo = emoji;

                            // if(data.amazon[count].ItemAttributes[0].Brand[0]){
                            //     collectInfo = collectInfo + ' ' + data.amazon[count].ItemAttributes[0].Brand[0];
                            // }
                            // if (data.amazon[count].ItemAttributes[0].Color[0]){
                            //     collectInfo = collectInfo + ' ' + data.amazon[count].ItemAttributes[0].Color[0];
                            // }
                            // if (data.amazon[count].ItemAttributes[0].ProductGroup[0]){
                            //     collectInfo = collectInfo + ' ' + data.amazon[count].ItemAttributes[0].ProductGroup[0];
                            // }

                            var kikMsg = Kik.Message
                              .link(res[count])
                              .setPicUrl(urlArr[count])
                              .setText(emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]))
                              // .setText(`${item.realPrice} - ${item.ItemAttributes[0].Title[0]}`)
                              .setTitle('')
                              .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                              .setAttributionName('Amazon')
                              .setKikJsData({"callback_id": data.searchId});

                            // kikMsg.kikJsData = {
                            //     "callback_id":data.searchId
                            // }
                            // kikMsg.attribution = {
                            //     name: 'Amazon',
                            //     iconUrl: 'http://i.stack.imgur.com/0Ck6a.png'
                            // }

                            //kikMsg.keyboardData = collectInfo;

                            //console.log('KIK MSG BUILT ',kikMsg)

                            data.client_res.push(kikMsg);
 
                        }
                        else if (data.source.origin == 'telegram'){
                            var attachObj = {};
                            attachObj.photo = urlArr[count];
                            attachObj.message =  emoji + '[' + truncate(data.amazon[count].ItemAttributes[0].Title[0]) + ']('+ res[count] +')';
                            data.client_res.push(attachObj);
                        }
                        count++;
                        callback();
                    });
                }, function done(){

                    if (data.source.origin == 'kik'){

                        var keyboardObj = [{
                            "type": "suggested",
                            "hidden":false,
                            "responses": []
                        }];
                        var counter = 1;


                        async.eachSeries(data.client_res, function(m, callback) {

                            keyboardObj[0].responses.push(
                                {
                                  "type": "text",
                                  "body": truncate(m._state.text,17)
                                }
                            )
                            counter++;
                            callback()

                        }, function done(){
                        
                            if(data.client_res[0]){

                                keyboardObj[0].responses.push(
                                    {
                                      "type": "text",
                                      "body": "⏩ MORE"
                                    }
                                )

                                //dumb temp stuff here for assigning keyboards to items because what Kik documentation
                                data.client_res[0]._state.keyboards = keyboardObj;
                                if(data.client_res[1]){
                                    data.client_res[1]._state.keyboards = keyboardObj;
                                }
                                if(data.client_res[2]){
                                    data.client_res[2]._state.keyboards = keyboardObj;
                                }
                                if(data.client_res[3]){
                                    data.client_res[3]._state.keyboards = keyboardObj;
                                }

                            }else {
                                console.error('some error go away')
                            }
                            checkOutgoingBanter(data);
                        })                     
                    }
                    else {
                        checkOutgoingBanter(data);
                    }   
                });
            });
            // function compileResults(){
            // }
            // data.client_res.push(url); //add image results to response
            // //send extra item URLs with image responses
            // if (data.action == 'initial' || data.action == 'similar' || data.action == 'modify' || data.action == 'more'){
            //     processData.urlShorten(data,function(res){
            //         var count = 0;
            //         //put all result URLs into arr
            //         async.eachSeries(res, function(i, callback) {
            //             data.urlShorten.push(i);//save shortened URLs
            //             processData.getNumEmoji(data,count+1,function(emoji){
            //                 res[count] = res[count].trim();
            //                 if (data.source.origin == 'slack'){
            //                     data.client_res.push('<'+res[count]+' | ' + emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0])+'>');
            //                 }else if (data.source.origin == 'socket.io'){
            //                     data.client_res.push(emoji + '<a target="_blank" href="'+res[count]+'"> ' + truncate(data.amazon[count].ItemAttributes[0].Title[0])+'</a>');
            //                 }

            //                 count++;
            //                 callback();
            //             });
            //         }, function done(){
            //             checkOutgoingBanter(data);
            //         });
            //     });
            // }
            // else {
            //     checkOutgoingBanter(data);
            // }
        });
    }
    else if (action == 'txt'){

        banter.getCinnaResponse(data,function(res){
            if(res && res !== 'null'){
                // data.client_res = [];
                // data.client_res.push(res);
                data.client_res.unshift(res);
            }
            sendResponse(data);
        });
    }
    //no cinna response check
    else if (action == 'final'){
        sendResponse(data);
    }
}

//check for extra banter to send with message.
var checkOutgoingBanter = function(data){
    banter.getCinnaResponse(data,function(res){
        if(res && res !== 'null'){

            data.client_res.unshift(res); // add to beginning of message
             // console.log('mitsu6')

            sendResponse(data);
        }
        else {
             // console.log('mitsu7', res)
            sendResponse(data);
        }
    });
}

//send back msg to user, based on source.origin
var sendResponse = function(data,flag){



    //SAVE OUTGOING MESSAGES TO MONGO
    if (data.bucket && data.action && !(data.flags && data.flags.searchResults)){
        console.log('SAVING OUTGOING RESPONSE');
        history.saveHistory(data,false,function(res){
            //whatever
        }); //saving outgoing message
        //});
    }
    else {
        console.log('error: cant save outgoing response, missing bucket or action');
    }
    /// / / / / / / / / / /

    //* * * * * * * *
    // Socket.io Outgoing
    //* * * * * * * *
    if (data.source && data.source.channel && data.source.origin == 'socket.io'){
        //check if socket user exists
        if (io.sockets.connected[data.source.channel]){

            //loop through responses in order
            for (var i = 0; i < data.client_res.length; i++) {

                    if (typeof data.client_res[i] === 'string'){
                        io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res[i]});
                    }
                    //item is an attachment object, send attachment
                    else if (data.client_res[i] instanceof Array){

                        for (var z = 0; z < data.client_res[i].length; z++) {
                            io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res[i][z].thumb_url});
                            io.sockets.connected[data.source.channel].emit("msgFromSever", {message: '<b>Please use Slack for "view cart"</b>: '+ data.client_res[i][z].text});
                        }

                    }else {
                        io.sockets.connected[data.source.channel].emit("msgFromSever", {message: data.client_res[i]});
                    }
            }
        }
        //---supervisor: relay search result previews back to supervisor---//
        else if (data.source.channel && data.source.origin == 'supervisor') {
               data.flags = {searchResults: true}
               var proxy = data
               delete proxy.amazon
               supervisor.emit(data)
        }
        //----------------------------------------------------------------//
        else {
            console.log('error: socket io channel missing', data);
        }
    }

    //* * * * * * * *
    // Kik Outgoing
    //* * * * * * * *
    else if (data.source && data.source.channel && data.source.origin == 'kik'){


        if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more'){

            var okThis = [];

            var message = data.client_res[0]; //use first item in client_res array as text message

            message = Kik.Message.text(message);

            //dumb way to add keyboard to cinna response message so kik doesn't kill itself
            if(!message._state.keyboards && data.client_res[1] && data.client_res[1]._state && data.client_res[1]._state.keyboards){

                message._state.keyboards = data.client_res[1]._state.keyboards;
            }


            okThis.push(message)

            // var kikMsg = Kik.Message
            //   .text(message)
            //   .setPicUrl(urlArr[count])
            //   .setText(emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]))
            //   // .setText(`${item.realPrice} - ${item.ItemAttributes[0].Title[0]}`)
            //   .setTitle('')
            //   .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
            //   .setAttributionName('Amazon')
            //   .setKikJsData({"callback_id": data.searchId});


            // data.client_res[0] = 

            //kipServer.sendToKik(data,message,'text')

            //remove first message from res arr
            var attachThis = data.client_res;
            attachThis.shift();



            //FLIP ARRAYS HERE!
            if(attachThis.length == 3){
                var first = attachThis[0];
                var last = attachThis[2];
                var middle = attachThis[1];
                okThis.push(last,middle,first);
            }
            else if(attachThis.length == 2){
                var first = attachThis[0];
                var last = attachThis[1];
                okThis.push(last,first);
            }else {
                okThis.push(attachThis[0])
            }

            //console.log('ATTACH THESE ',attachThis);

            kipServer.sendToKik(data,okThis,'search');



            // attachThis.map(function(attach){ 
            //     console.log('ATTACH ', attach)

            //    // console.log('kikMsg !_!_!_!_!_!_! ', kikMsg)

            //     kipServer.sendToKik(data,,'search');
            // });

            // async.eachSeries(attachThis, function(attach, callback) {
            //     // console.log('photo ',attach.photo);
            //     // console.log('message ',attach.message);

            //     //kipServer.sendToKik(data,message,'text')

            //      // upload.uploadPicture('telegram', attach.photo, 100, true).then(function(uploaded) {
            //      //     tg.sendMessage({
            //      //        chat_id: data.source.channel,
            //      //        text: attach.message,
            //      //        parse_mode: 'Markdown',
            //      //        disable_web_page_preview: 'true'
            //      //     }).then(function(datum){
            //      //          tg.sendPhoto({
            //      //            chat_id: encode_utf8(data.source.channel),
            //      //            photo: encode_utf8(uploaded.outputPath)
            //      //            }).then(function(datum){
            //      //                if (uploaded.outputPath) {
            //      //                    fs.unlink(uploaded.outputPath, function(err, res) {
            //      //                        // if (err) console.log('fs error: ', err)
            //      //                    })
            //      //                }
            //      //                if (uploaded.inputPath) {
            //      //                    fs.unlink(uploaded.inputPath, function(err, res) {
            //      //                            // if (err) console.log('fs error: ', err)
            //      //                    })
            //      //                }
            //      //                callback();
            //      //            }).catch(function(err){
            //      //                if (err) { console.log('ios.js1259: err',err) }
            //      //                if (uploaded.outputPath) {
            //      //                    fs.unlink(outputPath, function(err, res) {
            //      //                        if (err) console.log('fs error: ', err)
            //      //                    })
            //      //                }
            //      //                if (uploaded.inputPath) {
            //      //                    fs.unlink(inputPath, function(err, res) {
            //      //                            if (err) console.log('fs error: ', err)
            //      //                    })
            //      //                }
            //      //                callback();
            //      //            })
            //      //        }).catch(function(err){
            //      //            if (err) {
            //      //                console.log('ios.js1264: err',err)
            //      //            }
            //      //            callback();
            //      //        })
            //      //    }).catch(function(err) {
            //      //        if (err)  console.log('\n\n\niojs image upload error: ',err,'\n\n\n')
            //      //        callback();
            //      //    })
            // }, function done(){


            // });

            // var msgData = {
            //   // attachments: [...],
            //     icon_url:'http://kipthis.com/img/kip-icon.png',
            //     username:'Kip',
            //     attachments: attachThis
            // };
            // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        }

        ///FOR FOCUS HERE----> 
        //ALL FOCUS QUERIES WILL SHOW FOCUS KEYBOARD FOR THAT ITEM 

        else if (data.action == 'focus'){


                console.log('KIK FOCUS ',data)

                //send pic

                var kikRes = [];

                var link = data.client_res[1];
                var pic = data.client_res[0];
                var picText = data.client_res.pop();
                var endKik = data.client_res.pop();
                console.log('/!/!/!/!/!/!/!/!/!/!/!/!/!NEW MESSAGE ',data.client_res)

                var kikEdit = data.client_res;
                kikEdit.shift();
                kikEdit.shift();
                var itemTitle = kikEdit[0];
                kikEdit.shift();
                kikEdit = kikEdit.join(' ');
                
                processData.getNumEmoji(data,data.searchSelect[0],function(emoji){

                    var kikMsg;

                    //link

                   kikMsg = Kik.Message
                      .text(itemTitle + '\n\n' +kikEdit.trim());
                      //.setKikJsData({"callback_select": data.searchSelect[0]});
                      // .setTitle(emoji)
                      // .setText(.replace(emoji,''))
                      //.setPicUrl(pic)
                      // .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                      // .setAttributionName('Amazon');
                    kikRes.push(kikMsg)

                    
                    // kikMsg = Kik.Message.text(emoji + ' ' + );
                    // kikRes.push(kikMsg)


                   //add pic
                    kikMsg = Kik.Message
                      .picture(pic)
                      //.setUrl(link)
                      .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                      .setAttributionName('View pic');
                      // .setTitle(picText)
                      // .setText(itemTitle)
                      //.setPicUrl(pic)
                      // .setAttributionIcon('http://www.transparenttextures.com/patterns/ag-square.png')
                      // .setAttributionName(emoji);
                    kikRes.push(kikMsg)

                    // kikMsg = Kik.Message.text();
                    // kikRes.push(kikMsg)


                   // kikMsg = Kik.Message
                   //    .link(link)
                   //    .setTitle(emoji + ' ' + picText)
                   //    .setText(endKik)
                   //    //.setPicUrl(pic)
                   //    .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                   //    .setAttributionName('Amazon');
                   //  kikRes.push(kikMsg)

                   if(!endKik){
                    endKik = '';
                   }

                   kikMsg = Kik.Message
                      .link(link)
                      .setTitle(emoji + ' ' + picText)
                      .setText(endKik + '\n✅ View on Amazon')
                      //.setText(endKik)
                      //.setPicUrl(pic)
                      .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                      .setAttributionName('Amazon');
                    kikRes.push(kikMsg)

                    // kikMsg = Kik.Message
                    //   .link(link);
                    //   // .setTitle(emoji + ' ' + picText)
                    //   // .setText(endKik)
                    //   //.setPicUrl(pic)
                    //   // .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                    //   // .setAttributionName('Amazon');
                    // kikRes.push(kikMsg)

                    //add amazon link message
                    // kikMsg = Kik.Message
                    //   .link(link)
                    //   .setText(kikEdit + ' ' +  endKik)
                    //   .setAttributionIcon()
                    //   .setAttributionName('Amazon');
                    // kikRes.push(kikMsg)

                    // var spacer;
                    // switch(data.searchSelect[0]){
                    //     case 1:
                    //         spacer = ' ';
                    //     case 2:
                    //         spacer = '  ';
                    //     case 3:
                    //         spacer = '   ';
                    //     default:
                    //         spacer = ' ';
                    // }
                    
                    var keyboardObj = [{
                        "type": "suggested",
                        "hidden":false,
                        "responses": [
                            {
                                "type":"text",
                                "body":"⏪ BACK" //BACK BUTTON REDISPLAYS PREVIOUS SEARCH RESULTS
                            },
                            {
                                "type":"text",
                                "body":"Cheaper than "+emoji
                            },
                            {
                                "type":"text",
                                "body":"Similar to "+emoji
                            },
                            {
                                "type":"text",
                                "body":"Add "+emoji+" to Cart"
                            }
                        ]
                    }];   

                    //kikRes[0]._state.keyboards = keyboardObj;

                    kikRes[0]._state.keyboards = keyboardObj;
                    if(kikRes[1]){
                        kikRes[1]._state.keyboards = keyboardObj;
                    }
                    if(kikRes[2]){
                        kikRes[2]._state.keyboards = keyboardObj;
                    }
                    if(kikRes[3]){
                        kikRes[3]._state.keyboards = keyboardObj;
                    }

                    kipServer.sendToKik(data,kikRes,'search');

                })


                // var counter = 1;

                // console.log('HAMCLINE_RES ',data.client_res);

                // async.eachSeries(data.client_res, function(m, callback) {

                //     console.log('AMAZON RESULTS ',JSON.stringify(m));

                //     keyboardObj[0].responses.push(
                //         {
                //           "type": "text",
                //           "body": truncate(m._state.text,17)
                //         }
                //     )

                // var kikMsg = Kik.Message
                //   .picture()
                //   .setPicUrl(data.client_res[0])
                //   //.setText(emoji + ' ' + truncate(data.amazon[count].ItemAttributes[0].Title[0]))
                //   // .setText(`${item.realPrice} - ${item.ItemAttributes[0].Title[0]}`)
                //   .setTitle('')
                //   .setAttributionIcon('http://i.stack.imgur.com/0Ck6a.png')
                //   .setAttributionName('Amazon');

                



                  //.setKikJsData({"callback_id": data.searchId});

                //send text link


            // try {
            //  var formatted = '[' + data.client_res[1].split('|')[1].split('>')[0] + '](' + data.client_res[1].split('|')[0].split('<')[1]
            //  formatted = formatted.slice(0,-1)
            //  formatted = formatted + ')'
            // } catch(err) {
            //  console.log('io.js 1269 err: ',err)
            //  return
            // }
              //data.client_res[1] = formatted ? formatted : data.client_res[1]
              //var toSend = data.client_res[1] + '\n' + data.client_res[2] + '\n' + truncate(data.client_res[3]) + '\n' + (data.client_res[4] ? data.client_res[4] : '')
                //console.log('formatted : ',toSend)


                //SEND PICTURE



                //SEND TEXT








               // upload.uploadPicture('telegram', data.client_res[0],100, true).then(function(uploaded) {
               //   tg.sendPhoto({
               //      chat_id: encode_utf8(data.source.channel),
               //      photo: encode_utf8(uploaded.outputPath)
               //    }).then(function(datum){
               //      tg.sendMessage({
               //          chat_id: data.source.channel,
               //          text: toSend,
               //          parse_mode: 'Markdown',
               //          disable_web_page_preview: 'true'
               //      })
               //      if (uploaded.outputPath) {
               //          fs.unlink(uploaded.outputPath, function(err, res) {
               //              // if (err) console.log('fs error: ', err)
               //          })
               //      }
               //      if (uploaded.inputPath) {
               //          fs.unlink(uploaded.inputPath, function(err, res) {
               //                  // if (err) console.log('fs error: ', err)
               //          })
               //      }
               //    })
               //  }).catch(function(err){
               //      if (err) { console.log('ios.js1285: err',err) }

               //  })

        }
        //  else if (data.action == 'save') {
        //     console.log('\n\n\nSAVE: ',data.client_res)
        //   try {
        //      var formatted = '[View Cart](' + data.client_res[1][data.client_res[1].length-1].text.split('|')[0].split('<')[1] + ')'
        //       // + data.client_res[0].text.split('>>')[1].split('>')[0]
        //      // formatted = formatted.slice(0,-1)
        //      // formatted = formatted + ')'
        //    } catch(err) {
        //      console.log('\n\n\nio.js 1316-err: ',err,'\n\n\n')
        //      return
        //    }
        //   // console.log('toSend:', toSend,'formatted: ',formatted)
        //   tg.sendMessage({
        //         chat_id: data.source.channel,
        //         text: 'Awesome! I\'ve saved your item for you 😊 Use `checkout` anytime to checkout or `help` for more options.',
        //         parse_mode: 'Markdown',
        //         disable_web_page_preview: 'true'
        //     })
        //     .then(function() {
        //       if (formatted) {
        //         console.log('\n\n\nFORMATTED: ', formatted)
        //         tg.sendMessage({
        //             chat_id: data.source.channel,
        //             text: formatted,
        //             parse_mode: 'Markdown',
        //             disable_web_page_preview: 'true'
        //         })
        //       }
        //     })
        //     .catch(function(err) {
        //         console.log('io.js 1307 err',err)
        //     })
        // }
        // else if (data.action == 'checkout') {
        //   console.log('\n\n\nCHECKOUT: ', data.client_res)
        //      async.eachSeries(data.client_res[1], function iterator(item, callback) {
        //         console.log('ITEM LEL: ',item)
        //         if (item.text.indexOf('_Summary') > -1) {
        //             return callback(item)
        //         }
        //          var itemLink = ''
        //           try {
        //             itemLink = '[' + item.text.split('|')[1].split('>')[0] + '](' + item.text.split('|')[0].split('<')[1] + ')'
        //             itemLink = encode_utf8(itemLink)
        //            } catch(err) {
        //              console.log('io.js 1296 err:',err)
        //              return callback(null)
        //            }
        //            tg.sendMessage({
        //                 chat_id: data.source.channel,
        //                 text: itemLink,
        //                 parse_mode: 'Markdown',
        //                 disable_web_page_preview: 'true'
        //             }).then(function(){
        //                  var extraInfo = item.text.split('$')[1]
        //                  extraInfo = '\n $' + extraInfo
        //                  extraInfo = extraInfo.replace('*','').replace('@','').replace('<','').replace('>','')
        //                  tg.sendMessage({
        //                     chat_id: data.source.channel,
        //                     text: encode_utf8(extraInfo),
        //                     parse_mode: 'Markdown',
        //                         disable_web_page_preview: 'true'
        //                     })
        //                     .then(function(){
        //                         callback(null)
        //                     })
        //                     .catch(function(err) {
        //                         console.log('io.js 1354 err: ',err)
        //                         callback(null)
        //                     })
        //             })
        //       }, function done(thing) {
        //         if (thing.text) {
        //             // console.log('\n\n DONESKI!', thing)
        //             var itemLink = ''
        //               try {
        //                 itemLink = '[Purchase Items](' + thing.text.split('|')[0].split('<')[1] + ')'
        //                 itemLink = encode_utf8(itemLink)
        //                 tg.sendMessage({
        //                     chat_id: data.source.channel,
        //                     text: '_Summary: Team Cart_ \n Total: *$691.37* \n' + itemLink,
        //                     parse_mode: 'Markdown',
        //                     disable_web_page_preview: 'true'
        //                 }).catch(function(err) {
        //                  console.log('io.js 1353 err:',err)
        //                })
        //                } catch(err) {
        //                  console.log('io.js 1356 err:',err)
        //                }
        //         } else {
        //             // console.log('wtf is thing: ',thing)
        //         }
        //       })


           // // var extraInfo = data.client_res[1][0].text.split('$')[1]
           // // extraInfo = '\n $' + extraInfo
           // // var finalSend = itemLink + extraInfo
           // //      tg.sendMessage({
           // //          chat_id: data.source.channel,
           // //          text: data.client_res[0],
           // //          parse_mode: 'Markdown',
           // //          disable_web_page_preview: 'true'
           // //      }).then(function(){
           //         console.log('finalSend: ', itemLink)
           //          tg.sendMessage({
           //              chat_id: data.source.channel,
           //              text: itemLink,
           //              parse_mode: 'Markdown',
           //              disable_web_page_preview: 'true'
           //          }).then(function(){

           //          // })
           //      }).catch(function(err) {
           //          console.log('io.js 1338 err',err)
           //      })
        //}
        // else if (data.action == 'sendAttachment'){
        //   console.log('\n\n\nTelegram sendAttachment data: ', data,'\n\n\n')
        //     // //remove first message from res arr
        //     // var attachThis = data.client_res;
        //     // attachThis = JSON.stringify(attachThis);

        //     // var msgData = {
        //     //   // attachments: [...],
        //     //     icon_url:'http://kipthis.com/img/kip-icon.png',
        //     //     username:'Kip',
        //     //     attachments: attachThis
        //     // };
        //     // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        // }
        else {
              console.log('\n\n\nKik ELSE : ', data,'\n\n\n')
            //loop through responses in order
            async.eachSeries(data.client_res, function(message, callback) {

                // tg.sendMessage({
                //     chat_id: data.source.channel,
                //     text: message
                // })

                // message = Kik.Message.text(message);

                // //dumb way to add keyboard to cinna response message so kik doesn't kill itself
                // if(!message._state.keyboards && data.client_res[1] && data.client_res[1]._state && data.client_res[1]._state.keyboards){

                //     message._state.keyboards = data.client_res[1]._state.keyboards;
                // }


                // okThis.push(message)


                // console.log('\n\n\nKik  : ', message,'\n\n\n')

                kipServer.sendToKik(data,Kik.Message.text(message),'banter')

                callback();
            }, function done(){
            });
        }

    }


    //* * * * * * * *
    // Telegram Outgoing
    //* * * * * * * *
    else if (data.source && data.source.channel && data.source.origin == 'telegram'){

        if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more'){

            var message = data.client_res[0]; //use first item in client_res array as text message
            console.log('attachthis ',message);


            //remove first message from res arr
            var attachThis = data.client_res;
            attachThis.shift();

            //attachThis = JSON.stringify(attachThis);

            // console.log('attachthis ',attachThis);



            async.eachSeries(attachThis, function(attach, callback) {
                // console.log('photo ',attach.photo);
                // console.log('message ',attach.message);
                // console.log('client_res', data.client_res)
                 upload.uploadPicture('telegram', attach.photo, 100, true).then(function(uploaded) {
                     tg.sendMessage({
                        chat_id: data.source.channel,
                        text: attach.message,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: 'true'
                     }).then(function(datum){
                          tg.sendPhoto({
                            chat_id: encode_utf8(data.source.channel),
                            photo: encode_utf8(uploaded.outputPath)
                            }).then(function(datum){
                                if (uploaded.outputPath) {
                                    fs.unlink(uploaded.outputPath, function(err, res) {
                                        // if (err) console.log('fs error: ', err)
                                    })
                                }
                                if (uploaded.inputPath) {
                                    fs.unlink(uploaded.inputPath, function(err, res) {
                                            // if (err) console.log('fs error: ', err)
                                    })
                                }
                                callback();
                            }).catch(function(err){
                                if (err) { console.log('ios.js1259: err',err) }
                                if (uploaded.outputPath) {
                                    fs.unlink(outputPath, function(err, res) {
                                        if (err) console.log('fs error: ', err)
                                    })
                                }
                                if (uploaded.inputPath) {
                                    fs.unlink(inputPath, function(err, res) {
                                            if (err) console.log('fs error: ', err)
                                    })
                                }
                                callback();
                            })
                        }).catch(function(err){
                            if (err) {
                                console.log('ios.js1264: err',err)
                            }
                            callback();
                        })
                    }).catch(function(err) {
                        if (err)  console.log('\n\n\niojs image upload error: ',err,'\n\n\n')
                        callback();
                    })
            }, function done(){


            });

            // var msgData = {
            //   // attachments: [...],
            //     icon_url:'http://kipthis.com/img/kip-icon.png',
            //     username:'Kip',
            //     attachments: attachThis
            // };
            // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        }
        else if (data.action == 'focus'){

               // console.log('client_res', data.client_res)

           try {
             var formatted = '[' + data.client_res[1].split('|')[1].split('>')[0] + '](' + data.client_res[1].split('|')[0].split('<')[1]
             formatted = formatted.slice(0,-1)
             formatted = formatted + ')'
           } catch(err) {
             console.log('io.js 1269 err: ',err)
             return
           }
              data.client_res[1] = formatted ? formatted : data.client_res[1]
              var toSend = data.client_res[1] + '\n' + data.client_res[2] + '\n' + truncate(data.client_res[3]) + '\n' + (data.client_res[4] ? data.client_res[4] : '')
               // console.log('formatted : ',formatted)
               upload.uploadPicture('telegram', data.client_res[0],100, true).then(function(uploaded) {
                 tg.sendPhoto({
                    chat_id: encode_utf8(data.source.channel),
                    photo: encode_utf8(uploaded.outputPath)
                  }).then(function(datum){
                    tg.sendMessage({
                        chat_id: data.source.channel,
                        text: toSend,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: 'true'
                    })
                    if (uploaded.outputPath) {
                        fs.unlink(uploaded.outputPath, function(err, res) {
                            // if (err) console.log('fs error: ', err)
                        })
                    }
                    if (uploaded.inputPath) {
                        fs.unlink(uploaded.inputPath, function(err, res) {
                                // if (err) console.log('fs error: ', err)
                        })
                    }
                  })
                }).catch(function(err){
                    if (err) { console.log('ios.js1285: err',err) }

                })
        }
         else if (data.action == 'save') {
            console.log('\n\n\nSAVE: ',data.client_res)
          try {
             var formatted = '[View Cart](' + data.client_res[1][data.client_res[1].length-1].text.split('|')[0].split('<')[1] + ')'
              // + data.client_res[0].text.split('>>')[1].split('>')[0]
             // formatted = formatted.slice(0,-1)
             // formatted = formatted + ')'
           } catch(err) {
             console.log('\n\n\nio.js 1316-err: ',err,'\n\n\n')
             return
           }
          // console.log('toSend:', toSend,'formatted: ',formatted)
          tg.sendMessage({
                chat_id: data.source.channel,
                text: 'Awesome! I\'ve saved your item for you 😊 Use `checkout` anytime to checkout or `help` for more options.',
                parse_mode: 'Markdown',
                disable_web_page_preview: 'true'
            })
            .then(function() {
              if (formatted) {
                console.log('\n\n\nFORMATTED: ', formatted)
                tg.sendMessage({
                    chat_id: data.source.channel,
                    text: formatted,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: 'true'
                })
              }
            })
            .catch(function(err) {
                console.log('io.js 1307 err',err)
            })
        }
        else if (data.action == 'checkout') {
          console.log('\n\n\nCHECKOUT: ', data.client_res)
             async.eachSeries(data.client_res[1], function iterator(item, callback) {
                console.log('ITEM LEL: ',item)
                if (item.text.indexOf('_Summary') > -1) {
                    return callback(item)
                }
                 var itemLink = ''
                  try {
                    itemLink = '[' + item.text.split('|')[1].split('>')[0] + '](' + item.text.split('|')[0].split('<')[1] + ')'
                    itemLink = encode_utf8(itemLink)
                   } catch(err) {
                     console.log('io.js 1296 err:',err)
                     return callback(null)
                   }
                   tg.sendMessage({
                        chat_id: data.source.channel,
                        text: itemLink,
                        parse_mode: 'Markdown',
                        disable_web_page_preview: 'true'
                    }).then(function(){
                         var extraInfo = item.text.split('$')[1]
                         extraInfo = '\n $' + extraInfo
                         extraInfo = extraInfo.replace('*','').replace('@','').replace('<','').replace('>','')
                         tg.sendMessage({
                            chat_id: data.source.channel,
                            text: encode_utf8(extraInfo),
                            parse_mode: 'Markdown',
                                disable_web_page_preview: 'true'
                            })
                            .then(function(){
                                callback(null)
                            })
                            .catch(function(err) {
                                console.log('io.js 1354 err: ',err)
                                callback(null)
                            })
                    })
              }, function done(thing) {
                if (thing.text) {
                    // console.log('\n\n DONESKI!', thing)
                    var itemLink = ''
                      try {
                        itemLink = '[Purchase Items](' + thing.text.split('|')[0].split('<')[1] + ')'
                        itemLink = encode_utf8(itemLink)
                        tg.sendMessage({
                            chat_id: data.source.channel,
                            text: '_Summary: Team Cart_ \n Total: *$691.37* \n' + itemLink,
                            parse_mode: 'Markdown',
                            disable_web_page_preview: 'true'
                        }).catch(function(err) {
                         console.log('io.js 1353 err:',err)
                       })
                       } catch(err) {
                         console.log('io.js 1356 err:',err)
                       }
                } else {
                    // console.log('wtf is thing: ',thing)
                }
              })


           // // var extraInfo = data.client_res[1][0].text.split('$')[1]
           // // extraInfo = '\n $' + extraInfo
           // // var finalSend = itemLink + extraInfo
           // //      tg.sendMessage({
           // //          chat_id: data.source.channel,
           // //          text: data.client_res[0],
           // //          parse_mode: 'Markdown',
           // //          disable_web_page_preview: 'true'
           // //      }).then(function(){
           //         console.log('finalSend: ', itemLink)
           //          tg.sendMessage({
           //              chat_id: data.source.channel,
           //              text: itemLink,
           //              parse_mode: 'Markdown',
           //              disable_web_page_preview: 'true'
           //          }).then(function(){

           //          // })
           //      }).catch(function(err) {
           //          console.log('io.js 1338 err',err)
           //      })
        }
        else if (data.action == 'sendAttachment'){
          console.log('\n\n\nTelegram sendAttachment data: ', data,'\n\n\n')
            // //remove first message from res arr
            // var attachThis = data.client_res;
            // attachThis = JSON.stringify(attachThis);

            // var msgData = {
            //   // attachments: [...],
            //     icon_url:'http://kipthis.com/img/kip-icon.png',
            //     username:'Kip',
            //     attachments: attachThis
            // };
            // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        }
        else {
              console.log('\n\n\nTelegram ELSE : ', data,'\n\n\n')
            //loop through responses in order
            async.eachSeries(data.client_res, function(message, callback) {
                tg.sendMessage({
                    chat_id: data.source.channel,
                    text: message
                })
                callback();
            }, function done(){
            });
        }

    }
    //* * * * * * * *
    // Email Outgoing
    //* * * * * * * *
    else if (data.source && data.source.channel && data.source.origin == 'slack' && data.flags && data.flags.email) {

        if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more'){

            var messages = [data.client_res[0]];
            data.client_res.shift();
            var photos = [];
            data.client_res.forEach(function(el, index) {
                messages.push(el.title + '\n\n' + el.title_link);
                photos.push({filename: index.toString() + '.png',path: el.image_url});
            })
            messages.push('Simply reply with your choice (buy 1, buy 2 or buy 3) to add it to cart.  To find out more information about a product reply with the number you wish to get details for. To search again, simply reply with the name of the product you are looking for :)')

            email.results(data).catch((e) => {
              console.log(e.stack);
            });

            // email.reply({
            //   to: data.emailInfo.to,
            //   text: messages.join('\n\n'),
            //   attachments: photos
            // }, data).catch((e) => {
            //   console.log(e.stack);
            // })

        }
        else if (data.action == 'focus') {
           console.log('EMAIL OUTGOING FOCUS client_res', data.client_res);

           try {
             var formatted = data.client_res[1].split('|')[1].split('>')[0] + '\n\n' + data.client_res[1].split('|')[0].split('<')[1];
             formatted = formatted.slice(0,-1);
           } catch(err) {
             console.log('io.js 1269 err: ',err);
             return;
           }
          data.client_res[1] = formatted ? formatted : data.client_res[1];
          var toSend = data.client_res[1] + '\n\n' + (data.client_res[2] ? data.client_res[2] : '')  + '\n\n' + (data.client_res[3] ? data.client_res[3] : '') + '\n\n' + (data.client_res[4] ? data.client_res[4] : '');
          console.log('data.client_res[0] : ', decodeURIComponent(data.client_res[0]))

          email.reply({
            to: data.emailInfo.to,
            text: toSend + '\n\nSimply reply with your choice (buy 1, buy 2 or buy 3) to add it to cart.  To find out more information about a product reply with the number you wish to get details for. To search again, simply reply with the name of the product you are looking for :)',
            attachments: [{filename: 'productr32r23r3.jpg', path: data.client_res[0]}]
          }, data).catch((e) => {
            console.log(e.stack);
          })

        }
         else if (data.action == 'save') {
              var messages = ['Awesome! I\'ve saved your item for you 😊'];
            data.client_res.shift();
              console.log('\n\n\nEMAIL SAVE: ',data.client_res);
            // data.client_res = JSON.stringify(data.client_res);
            var photos = [];
            data.client_res[0].forEach(function(el, index) {
                // console.log('\n\n\n', el)
                messages.push(el.text + '\n\n' );
               if (el.thumb_url) {
                photos.push({filename: index.toString() + '.jpg', path: el.thumb_url});
               }
            })
            console.log('messages ', messages.join('\n\n'), 'photos: ', photos);


            email.reply({
                to: data.emailInfo.to,
                text: messages.join('\n\n'),
                attachments: photos
            }, data);
        }
        else if (data.action == 'checkout') {
            var messages = ['Awesome! I\'ve saved your item for you 😊'];
            data.client_res.shift();
            console.log('\n\n\nEMAIL SAVE: ',data.client_res);
            // data.client_res = JSON.stringify(data.client_res);
            var photos = [];
            data.client_res[0].forEach(function(el, index) {
                console.log('\n\n\n', el)
                messages.push( el.text + '\n\n' );
               if (el.thumb_url) {
                photos.push({filename: index.toString() + '.jpg', path: el.thumb_url});
               }
            })
            console.log('messages ', messages.join('\n\n'), 'photos: ', photos);
            email.reply({
                to: data.emailInfo.to,
                text: messages.join('\n\n'),
                attachments: photos
            }, data);
        }
        else if (data.action == 'sendAttachment'){
          // console.log('\n\n\nTelegram sendAttachment data: ', data,'\n\n\n')
            // //remove first message from res arr
            // var attachThis = data.client_res;
            // attachThis = JSON.stringify(attachThis);

            // var msgData = {
            //   // attachments: [...],
            //     icon_url:'http://kipthis.com/img/kip-icon.png',
            //     username:'Kip',
            //     attachments: attachThis
            // };
            // slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

        }
        else {
            //   console.log('\n\n\nTelegram ELSE : ', data,'\n\n\n')
            // //loop through responses in order
            // async.eachSeries(data.client_res, function(message, callback) {
            //     tg.sendMessage({
            //         chat_id: data.source.channel,
            //         text: message
            //     })
            //     callback();
            // }, function done(){
            // });
        }
    }
    //* * * * * * * *
    // Slack Outgoing
    //* * * * * * * *
    else if (!(data.flags && data.flags.email) && data.source && data.source.channel && data.source.origin == 'slack' || (data.flags && data.flags.toClient)){

        //eventually cinna can change emotions in this pic based on response type
        var params = {
            icon_url: 'http://kipthis.com/img/kip-icon.png'
        }
        //check if slackuser exists
        if (slackUsers[data.source.org]){

            if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more'){

                var message;
                //checking for search msg and updating it
                if(messageHistory[data.source.id] && messageHistory[data.source.id].typing){
                    var msgData = {};
                    slackUsers_web[data.source.org].chat.update(messageHistory[data.source.id].typing.ts, messageHistory[data.source.id].typing.channel, data.client_res[0], {}, function(err,res) {
                    });

                }else{
                    var message = data.client_res[0]; //use first item in client_res array as text message
                }

                //remove first message from res arr
                var attachThis = data.client_res;
                attachThis.shift();

                attachThis = JSON.stringify(attachThis);

                var msgData = {
                  // attachments: [...],
                    icon_url:'http://kipthis.com/img/kip-icon.png',
                    username:'Kip',
                    attachments: attachThis
                };
                slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});
            }
            else if (data.action == 'focus'){
                var attachments = [
                    {
                        "color": "#45a5f4"
                    },
                    {
                        "color": "#45a5f4",
                        "fields":[]
                    }
                ];

                //remove first message from res arr
                var attachThis = data.client_res;

                attachments[0].image_url = attachThis[0]; //add image search results to attachment
                attachments[0].fallback = 'More information'; //fallback for search result

                var actionObj = [
                    {
                      "name": "AddCart",
                      "text": ":thumbsup: Add to Cart",
                      "style": "primary",
                      "type": "button",
                      "value": "yes",
                      "confirm": {
                        "title": "Are you sure?",
                        "text": "This will approve the request.",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                      }
                    }
                ];
                //attachments[0].actions = actionObj;

                attachThis.shift(); //remove image from array

                attachments[1].fallback = 'More information';
                //put in attachment fields
                async.eachSeries(attachThis, function(attach, callback) {
                    //attach = attach.replace('\\n','');
                    var field = {
                        "value": attach,
                        "short":false
                    }
                    attachments[1].fields.push(field);
                    callback();

                }, function done(){

                    attachments = JSON.stringify(attachments);

                    var msgData = {
                      // attachments: [...],
                        icon_url:'http://kipthis.com/img/kip-icon.png',
                        username:'Kip',
                        attachments: attachments
                    };
                    slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

                });
            }else if (data.action == 'sendAttachment'){

                //remove first message from res arr
                var attachThis = data.client_res;
                attachThis = JSON.stringify(attachThis);

                var msgData = {
                  // attachments: [...],
                    icon_url:'http://kipthis.com/img/kip-icon.png',
                    username:'Kip',
                    attachments: attachThis
                };
                slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {});

            }
            else {
                //loop through responses in order
                async.eachSeries(data.client_res, function(message, callback) {



                    //item is a string, send message
                    if (typeof message === 'string'){
                        var msgData = {
                          // attachments: [...],
                            icon_url:'http://kipthis.com/img/kip-icon.png',
                            username:'Kip'
                        };
                        slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function(err,res) {

                            //store typing message for later to remove it
                            if (res.ok && flag == 'typing'){

                                messageHistory[data.source.id].typing = {
                                    ts: res.ts,
                                    channel: res.channel
                                }

                                console.log('👹👹👹 ',messageHistory[data.source.id]);

                            }else {
                                if (err){
                                   console.log('👹👹👹 delete typing event err ',err);
                                }
                            }

                            callback();
                        });
                    }
                    //item is an attachment object, send attachment
                    else if (message !== null && typeof message === 'object' || message instanceof Array){

                        console.log('ATTACH ',message);
                        var attachThis = message;
                        attachThis = JSON.stringify(attachThis);

                        var msgData = {
                            icon_url:'http://kipthis.com/img/kip-icon.png',
                            username:'Kip',
                            attachments: attachThis
                        };
                        slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', msgData, function() {
                            callback();
                        });
                    }

                }, function done(){

                    var msgData = {
                        icon_url:'http://kipthis.com/img/kip-icon.png',
                        username:'Kip',
                        attachments: attachThis
                    };
                    slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', msgData, function() {});
                });
            }
        }else {
            console.log('error: slackUsers channel missing', slackUsers);
        }
    }
     //---supervisor: relay search result previews back to supervisor---//
    else if (data.source && data.source.channel && data.source.origin == 'supervisor'){
        console.log('Sending results back to supervisor..')
       data.flags = {searchResults: true}
        // console.log('Supervisor: 728 emitting', data)
        supervisor.emit(data)
    }
    //----------------------------------------------------------------//
    else {
        console.log('error: data.source.channel or source.origin missing')
    }


}



/////////// tools /////////////


//* * * * * * ORDER ACTIONS TEMP!!!!! * * * * * * * * //

//save amazon item to cart
var saveToCart = function(data){

       //----supervisor: flag to skip history.recallHistory step below ---//
        if (data.flags && data.flags.recalled) {
            // console.log('\n\n\nDATA.FLAGS RECALLED!!!', data.flags)
            var cartHistory = { cart: [] }
              //async push items to cart
            // async.eachSeries(data.searchSelect, function(searchSelect, callback) {
                // if (item.recallHistory && item.recallHistory.amazon){
                    // proxy.cart.push(data.amazon[data.searchSelect - 1]); //add selected items to cart
                // }else {
                   cartHistory.cart.push(data.amazon[data.searchSelect[0] - 1]); //add selected items to cart
                // }
                // callback();
            // }, function done(){
            console.log('\n\n\nio930: SUPERVISOR cartHistory: ', cartHistory,'\n\n\n')
              if (cartHistory.cart.length == 0) {
                console.log('No items in proxy cart: io.js : Line 933', cartHistory)
                return
            } else {
                 // console.log('\n\n\n\n\n I mean brah it shouldnt be coming here....',data.source.id,messageHistory,'\n\n\n\n\n\n')
                  purchase.outputCart(data, cartHistory,function(res){
                    // processData.urlShorten(res, function(res2){
                        res.client_res = [res.client_res];
                        // res.client_res.push(res2);
                        // console.log('Mitsu937ios: res2 = :',res2)
                        // var proxy = res
                        // delete proxy.amazon
                        // console.log('Mitsu iojs935: ', JSON.stringify(res.client_res))

                        outgoingResponse(res,'txt');
                    });
                // });
            // });
            return
            }
        }
        //-----------------------------------------------------------------//

    data.bucket = 'search'; //modifying bucket to recall search history. a hack for now

    history.recallHistory(data, function(item){
        data.bucket = 'purchase'; //modifying bucket. a hack for now
        // console.log('\n\n\nio1288 ok for real doe whats item: ',item)
        //no saved history search object
        if (!item){
            console.log('\n\n\n\nwarning: NO ITEMS TO SAVE TO CART from data.amazon\n\n\n');
            //cannedBanter(data,'Oops sorry, I\'m not sure which item you\'re referring to');
            sendTxtResponse(data,'Oops sorry, I\'m not sure which item you\'re referring to');
        }
        else {

            // co lets us use "yield" to with promises to untangle async shit
            co(function*() {
              var cart;
              for (var index = 0; index < data.searchSelect.length; index++) {
                  var searchSelect = data.searchSelect[index];
                  console.log('adding searchSelect ' + searchSelect);

                  // i am not sure what this does
                  if (item.recallHistory && item.recallHistory.amazon){
                      var itemToAdd = item.recallHistory.amazon[searchSelect - 1];
                  } else {
                      itemToAdd = item.amazon[searchSelect - 1];
                  }

                  // Check for that pesky situation where we can't add to cart
                  // because the user needs to choose size or color options
                  if (itemToAdd.mustSelectSize) {
                    return processData.getItemLink(_.get(itemToAdd, 'DetailPageURL[0]'), data.source.user, 'ASIN-' + _.get(itemToAdd, 'ASIN[0]')).then(function(url) {
                      sendTxtResponse(data, 'Please click on this <'+url+'|Amazon link> to choose your size and style, thanks! 😊');
                    }).catch(function(e) {
                      console.log('could not get link for item')
                      console.log(e.stack)
                      sendTxtResponse(data, 'Sorry, it looks like you have to order this particular item directly from Amazon, not me! D:');
                    })
                  }

                  messageHistory[data.source.id].cart.push(itemToAdd); //add selected items to cart
                  cart = yield kipcart.addToCart(data.source.org, data.source.user, itemToAdd)
                      .catch(function(reason) {
                        // could not add item to cart, make kip say something nice
                        console.log(reason);
                        sendTxtResponse(data, 'Sorry, it\'s my fault – I can\'t add this item to cart. Please click on item link above to add to cart, thanks! 😊');
                      })
              }
              // data.client_res = ['<' + cart.link + '|» View Cart>']
              // outgoingResponse(data, 'txt');
              // View cart after adding item TODO doesn't display for some reason
              // Even after adding in 500 ms which solves any amazon rate limiting problems
              if (cart) {
                setTimeout(function() {
                  viewCart(data, true);
                }, 500)
              }
            }).then(function(){}).catch(function(err) {
                console.log(err);
                console.log(err.stack)
                sendTxtResponse(data, err);
                //send email about this issue
                var mailOptions = {
                    to: 'Kip Server <hello@kipthis.com>',
                    from: 'Kip save tp cart broke <server@kipthis.com>',
                    subject: 'Kip save tp cart broke',
                    text: 'Fix this ok thx'
                };
                mailerTransport.sendMail(mailOptions, function(err) {
                    if (err) console.log(err);
                });
            })
        }
    });
}

function removeCartItem(data){

    // co lets us use "yield" to with promises to untangle async shit
    co(function*() {
      for (var index = 0; index < data.searchSelect.length; index++) {
          var searchSelect = data.searchSelect[index];
          console.log('removing searchSelect ' + searchSelect);

          yield kipcart.removeFromCart(data.source.org, data.source.user, searchSelect);
      }

      data.client_res = ['Item '+searchSelect.toString()+'⃣ removed from your cart']
      outgoingResponse(data, 'txt');
      viewCart(data);

    }).then(function(){}).catch(function(err) {
        console.log(err);
        console.log(err.stack)
        return;
        sendTxtResponse(data, err);
    })
}

function viewCart(data, show_added_item){

    if (data.source.origin == 'socket.io' || data.source.origin == 'telegram'){
        return;
    }

    console.log('view cart')
    db.Metrics.log('cart.view', data);

    console.log(data.source)

    var cartDelay = 2000;

    co(function*() {
      var cart = yield kipcart.getCart(data.source.org);

      if (cart.items.length < 1) {
        return sendTxtResponse(data, 'Looks like you have not added anything to the Team Cart yet. Type `save 1` to add item :one:');
      }

      var slackbot = yield db.Slackbots.findOne({
        team_id: data.source.org
      }).exec();

      if (!slackbot){
        return sendTxtResponse(data, 'My brain broke, sorry about that :( What did you say?');;
      }

      // admins have special rights
      var isAdmin = slackbot.meta.office_assistants.indexOf(data.source.user) >= 0;
      var isP2P = slackbot.meta.office_assistants.length === 0;

      // get the latest added item if we need to highlight it
      if (show_added_item) {
        var added_item = cart.items[cart.items.length - 1];
        var added_asin = added_item.ASIN;
      }

      var cartObj = [];

        //add mode sticker
        cartObj.push({
            text: '',
            color:'#45a5f4',
            image_url: 'http://kipthis.com/kip_modes/mode_teamcart_view.png'
        })

      for (var i = 0; i < cart.aggregate_items.length; i++) {
        var item = cart.aggregate_items[i];
        var userString = item.added_by.map(function(u) {
          return '<@' + u + '>';
        }).join(', ');

        if (isAdmin || isP2P) {
          var link = yield processData.getItemLink(item.link, data.source.user, item._id.toString());
          console.log(link);
        }

        var actionObj = [
            {
              "name": "RemoveItem",
              "text": "➖",
              "style": "danger",
              "type": "button",
              "value": "no",
              "confirm": {
                "title": "Are you sure?",
                "text": "This will approve the request.",
                "ok_text": "Yes",
                "dismiss_text": "No"
              }
            },
            {
              "name": "AddItem",
              "text": "➕",
              "style": "primary",
              "type": "button",
              "value": "yes"
            }
        ];

        // add title, which is a link for admins/p2p and text otherwise
        var emojiType = (data.flags && data.flags.email) ? 'email' : 'slack';
        if (isAdmin || isP2P) {
          var text = [
            `${processData.emoji[i+1][emojiType]} <${link}|${item.title}>`,
            `*${item.price}* each`,
            `Quantity: ${item.quantity}`,
            `_Added by: ${userString}_`
          ].join('\n');
        } else {
          var text = [
            `${processData.emoji[i+1][emojiType]} *${item.title}*`,
            `Quantity: ${item.quantity}`,
            `_Added by: ${userString}_`
          ].join('\n');
        }

        cartObj.push({
          text: text,
          mrkdwn_in: ['text', 'pretext'],
          color: item.ASIN === added_asin ? '#7bd3b6' : '#45a5f4',
          thumb_url: item.image
         // actions: actionObj
        })
      }

      // Only show the purchase link in the summary for office admins.
      if (isAdmin || isP2P) {
        var summaryText = `_Summary: Team Cart_ \n Total: *${cart.total}*`;
        summaryText += ` \n <${cart.link}|» Purchase Items >`;
        cartObj.push({
            text: summaryText,
            mrkdwn_in: ['text', 'pretext'],
            color: '#49d63a'
        })
      }else {
        //var officeAdmins = slackbot.meta.office_assistants.join(' ')

        if(slackbot.meta.office_assistants && slackbot.meta.office_assistants[0]){
             var officeAdmins = '<@'+slackbot.meta.office_assistants[0]+'>';
        }else {
            var officeAdmins = '';
        }

        cartObj.push({
            text: '_Office admins '+officeAdmins+' can checkout the Team Cart_',
            mrkdwn_in: ['text', 'pretext'],
            color: '#49d63a'
        })
      }

      data.client_res = [];
      data.client_res.push(cartObj);
      console.log('done with cartObj');

      //reset cart delay 
      cartDelay = 2000;

      banter.getCinnaResponse(data,function(res){

          if(res[0] && res[0].text && data.client_res[0]){


                //console.log('RES TEXT ',res[0].text);
                data.client_res[0].unshift(res[0]);
             // }
             // if (res.length == 1){
             //    console.log('RES TEXT ',res[0].text);
             //    data.client_res[0].unshift(res[0].text);
             // }else {
             //    for (var x = 0; x < res.length; x++) {
             //        data.client_res[0].unshift(res[x].text);
             //    }
             // }
          }

          console.log('CINNARES ',res);

          console.log('CLIENT_RES ',data.client_res);
          sendResponse(data);
      });
      // sendResponse(data);

    }).catch(function(e) {

      //incrementally trying to cart with longer query time
      if (cartDelay < 16000){
            cartDelay = cartDelay + 2000;
            console.log('slowing view cart down ',cartDelay)
          setTimeout(function() {
            viewCart(data);
          }, cartDelay);           
      }else {
            console.log('error retriving cart for view cart')
            console.log(e.stack);
      }


    })
}

//get user history
function recallHistory(data,callback,steps){

    // console.log(steps);
    if (!data.source.org || !data.source.channel){
        console.log('missing channel or org Id 3');
    }

    if(!messageHistory[data.source.id]){
        callback();
    }
    else {

        //if # of steps to recall
        if (!steps){
            var steps = 1;
        }
        //get by bucket type
        switch (data.bucket) {
            case 'search':
                //console.log(data);

                switch(data.action){
                    //if action is focus, find lastest 'initial' item
                    case 'focus':
                        var result = messageHistory[data.source.id].search.filter(function( obj ) {
                          return obj.action == 'initial';
                        });
                        var arrLength = result.length - steps;
                        callback(result[arrLength]);
                        break;

                    default:
                        var arrLength = messageHistory[data.source.id].search.length - steps; //# of steps to reverse. default is 1
                        callback(messageHistory[data.source.id].search[arrLength]); //get last item in arr
                        break;
                }

                break;
            case 'banter':
                var arrLength = messageHistory[data.source.id].banter.length - steps; //# of steps to reverse. default is 1
                callback(messageHistory[data.source.id].banter[arrLength]); //get last item in arr
                break;
            case 'purchase':
                var arrLength = messageHistory[data.source.id].purchase.length - steps; //# of steps to reverse. default is 1
                callback(messageHistory[data.source.id].purchase[arrLength]); //get last item in arr
            default:
        }

    }

}



//MODE UPDATE HANDLING
var updateMode = function(data){

    console.log('UPDATE MODE DATA ',data);

    if(!kipUser[data.source.id]){
        kipUser[data.source.id] = {};
    }

    switch(data.mode){
        case 'shopping':
            console.log('SHOPPING MODE ON ',data);

            kipUser[data.source.id].conversations = 'shopping';
            //show shopping sticker message

            if (data.action && data.action !== 'initial' ){
                incomingAction(data);
            }else {
                shoppingMode(data);
            }
        break;

        case 'settings':
            kipUser[data.source.id].conversations = 'settings';
            //fire show settings
            settingsMode(data);
            console.log('SETTINGS MODE ON')
        break;

        // case 'viewcart':
        //     kipUser[data.source.id].conversations = 'shopping';
        //     incomingAction(data);
        //     //switch to shopping mode and fire view cart
        //     console.log('VIEW CART MODE ON')
        // break;

        case 'collect':
            kipUser[data.source.id].conversations = 'collect';
            collectMode(data);
            // fire collect function
            console.log('COLLECT MODE ON')
        break;

        case 'onboarding':
            kipUser[data.source.id].conversations = 'onboarding';
            // fire collect function
            onboardingMode(data);
            console.log('onboard MODE ON')
        break;

        case 'addmember':
            kipUser[data.source.id].conversations = 'addmember';
            // fire collect function
            addmemberMode(data);
            console.log('onboard MODE ON')
        break;

        case 'report':
            kipUser[data.source.id].conversations = 'shopping';
            // fire collect function
            reportMode(data);
            console.log('report MODE ON')
        break;

        default:
            kipUser[data.source.id].conversations = 'shopping';
            if (data.action && data.action !== 'initial' ){
                incomingAction(data);
            }else {
                shoppingMode(data);
            }
            console.log('DEFAULT SHOPPING MODE ON');
        break;

    }

}

//* * * * MODE FUNCTIONS * * * * //
function settingsMode(data){
    data.bucket = 'mode';
    data.action = 'settings';
    history.saveHistory(data,true,function(res){});

    kipUser[data.source.id].conversations = 'settings';

    co(function*() {
        // um let's refresh the slackbot just in case...
        var slackbot = yield db.Slackbots.findOne({team_id: data.source.org}).exec();

        return conversation_botkit.settings(slackbot, data.source.user, function(msg) {
            data.bucket;
            data.action;

            if(typeof msg === 'object'){
                var obj = _.extend(data, msg); //merge data obj from kip with botkit
            }else {
                var obj = data;
                obj.mode = msg;
            }

            console.log('💎incoming💎 💎 ',obj);
            updateMode(obj);
        })

    }).catch((e) => {
        console.log(e);
        console.log(e.stack);
    })

}


function addmemberMode(data){
    data.bucket = 'mode';
    data.action = 'addmember';
    history.saveHistory(data,true,function(res){});

    kipUser[data.source.id].conversations = 'addmember';

    co(function*() {

        //var slackbot = yield db.Slackbots.findOne({team_id: team_id}).exec()
        return weekly_updates.addMembers(data.source.org, data.source.user, data.source.channel, function(msg) {

            console.log('done adding members');

            data.bucket;
            data.action;

            if(typeof msg === 'object'){
                var obj = _.extend(data, msg); //merge data obj from kip with botkit
            }else {
                var obj = data;
                obj.mode = msg;
            }

            console.log('💎incoming💎 💎 ',obj);
            updateMode(obj);
        })
    }).catch((e) => {
        console.log(e);
        console.log(e.stack);
    })

}

function collectMode(data){

    data.bucket = 'mode';
    data.action = 'collect';
    history.saveHistory(data,true,function(res){});

    kipUser[data.source.id].conversations = "collect";

    data.text = data.msg; //converting

    if (data.text.indexOf('<#C') >= 0) {
        throw new Error('cannot do "collect #channel" right now')
        console.log('attempting to collect for one or more channels');
        var channels = data.text.match(/<#C[0-9A-Z]+>/g).map(function(markdown) {
          return markdown.replace('<#', '').replace('>', '');
        })
        console.log('channels: ' + channels.join(', '));

        // get list of users in all channels
        return channels.map(function(channel) {

          request('https://slack.com/api/channels.info?token=' + kipUser[data.source.id].slack.bot.bot_access_token + '&channel=' + channel, function(e, r, b) {
            if (e) {
              console.log(e);
            }

            var channelInfo = JSON.parse(r.body)
            debugger;
            if (channelInfo.channel && channelInfo.channel.members) {
              // um okay now what?

              return weekly_updates.collectFromUsers(data.source.org, data.source.user, channel, channelInfo.channel.members, function() {
                console.log('um done collecting orders for channel ' + channel)

                kipUser[data.source.id].conversations = 'shopping';

                //fire same here as exit settings mode!!!!

                // data.bucket;
                // data.action;

                // if(typeof msg === 'object'){
                //     var obj = _.extend(data, msg); //merge data obj from kip with botkit
                // }else {
                //     var obj = data;
                //     obj.mode = msg;
                // }

              })
            }
          });

        })
    } else {
        console.log('triggering kip collect, maybe if the person is an admin?')
        return weekly_updates.collect(data.source.org, data.source.user, function() {
          console.log('done collecting orders');
          kipUser[data.source.id].conversations = 'shopping';

          sendTxtResponse(data,'Done sending last call to all Team Cart Members 😊 Type `settings` for last call options');
          // updateMode();
        })
    }
}

function onboardingMode(data){

    console.log('ONBOARDING FIRED 💎 💎 💎 💎')

    data.bucket = 'mode';
    data.action = 'onboarding';
    history.saveHistory(data,true,function(res){});

    kipUser[data.source.id].conversations = 'onboarding';

    // "user" is actually the slackbot here
    // "data.user" is the user having the convo
    return conversation_botkit.onboard(kipUser[data.source.id].slack, data.source.user, function() {
        console.log('done with onboarding conversation')
        kipUser[data.source.id].conversations = 'shopping';
    });
}

function shoppingMode(data){

    console.log('SHOPPING MODE FIRED 💎 💎 💎 💎');

    data.bucket = 'mode';
    data.action = 'shopping';
    history.saveHistory(data,true,function(res){});

    kipUser[data.source.id].conversations = 'shopping';

    // data.action = 'sendAttachment';

    // data.client_res = [
    //   {
    //     "image_url":"http://i.imgur.com/PqrtJmD.png",
    //     "text":"",
    //     "color":"#45a5f4"
    //   },
    //   {
    //       "text": "Tell me what you're looking for, or use `help` for more options",
    //       "mrkdwn_in": [
    //           "text",
    //           "pretext"
    //       ],
    //       "color":"#49d63a"
    //   }
    // ];
    // sendResponse(data);
}

function reportMode(data){
    data.bucket = 'mode';
    data.action = 'report';
    history.saveHistory(data,true,function(res){});

    console.log('report generation');

    var isAdmin = kipUser[data.source.id].slack.meta.office_assistants.indexOf(data.source.user) >= 0;
    var isP2P = kipUser[data.source.id].slack.meta.office_assistants.length === 0;
    var num_days = 7;

    console.log('isAdmin:', isAdmin, ' isP2P:', isP2P);
    console.log(JSON.stringify(kipUser, null, 2));
    console.log(data.user);
    console.log(data.source);

    return kipcart.report(kipUser[data.source.id].slack.team_id, num_days).then(function(report) {
    console.log('found ' + report.items.length + ' items');

    var fun_stats = [
      isAdmin || isP2P ? `You added *${report.items.length}* to your cart totalling *${report.total}*` : `You added *${report.items.length}* to your cart`,
      `The most items came from the *${report.top_category}* category`,
      `You searched for *${report.most_searched}* the most`,
      `Most other teams didnt search for *${report.unique_search}* as much as you did!`
    ].join('\n');

    if (report.items.length === 0) {
      fun_stats = 'You have not added anything to your cart.';
    }

    // make a nice slacky item report
    var m = {
      user: kipUser[data.source.id].slack.bot.bot_user_id,
      username: "Kip",
      "text": `*Cart Overview for the last ${num_days} days*`,
      "attachments": [
        {
          "title": "Summary",
          "text": fun_stats,
          "mrkdwn_in": [
            "text",
            "pretext"
          ]
        }
      ]
    };

    m.attachments = m.attachments.concat(report.items
      .sort((a, b) => {
        if (a.purchased != b.purchased) {
          return a.purchased ? 1 : -1;
        }
        return a.added_date - b.added_date;
      })
      .map((item) => {
      var userString = item.added_by.map(function(u) {
        return '<@' + u + '>';
      }).join(', ');

      var text = [
        `${item.title}`,
        isAdmin || isP2P ? `*${item.price}* each` : '',
        `Quantity: ${item.quantity}`,
        isAdmin || isP2P ? `_Added by: ${userString}_` : '',
        item.purchased ? 'Not currently in cart' : '*Currently in cart*',
      ].join('\n').replace(/\n+/g, '\n')

      return {
          "text": text,
          "thumb_url": item.image,
          "mrkdwn_in": [
              "text"
          ],
          "color": item.purchased ? "#45a5f4" : "#7bd3b6"
      };
    }))

    console.log(m);
    slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', m, function() {
        console.log('um okay posted a message i think?');
    });

    }).catch(function(e) {
        console.log('error generating report');
        console.log(e);
        console.log(e.stack);
    })
}




/////TOOLS

//trim a string to char #
function truncate(string,l) {
    if (l){
        return string.substring(0,l);
    }else {
       if (string.length > 80)
          return string.substring(0,80)+'...';
       else
          return string;        
    }

};

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}


// client.on("connect", function(err) {
//     console.log("Connected to email redis queue...");
// });

// var timer = new InvervalTimer(function() {
//     client.lrange('chat_email', 0, -1, function(err, emails) {
//             // console.log('Email Queue: ' + emails.length)
//             if (emails.length > 0) {
//                 console.log('Pausing timer')
//                 timer.pause();
//                 console.log(emails.length + ' email(s) for processing.')
//                 async.eachSeries(emails, function iterator(email_str, callback) {
//                     var envelope = JSON.parse(email_str);
//                     console.log('Incoming email: ', JSON.stringify(envelope));
//                     Chatuser.find({'profile.email':{$regex: envelope.from_address.toString().trim(), $options:'i'}}).exec(function(err, users) {
//                         console.log(0);
//                         if(err){
//                             console.log('saved chat user retrieval error');
//                         } else {
//                             if (!users || users.length == 0) {
//                                 console.log(1);
//                                 var mailOptions = {
//                                     to: envelope.from_address,
//                                     from: 'Kip Bot <hello@kip.ai>',
//                                     subject: 'You are not currently in a chat!',
//                                     text: 'You are currently not taking part in any Kip Bot chats...'
//                                 };
//                                 mailerTransport.sendMail(mailOptions, function(err) {
//                                     if (err) console.log(err);
//                                     console.log('User was not found in Chatusers db. Sent notification to user.');
//                                 });
//                             }
//                             else if (users[0] && users[0].team_id ) {
//                                 console.log(2);
//                                var emailCommand = {
//                                     source: {
//                                         'origin':'slack',
//                                         'channel':users[0].dm,
//                                         'org':slackUsers[users[0].team_id].activeTeamId,
//                                         'id':users[0].team_id + "_" + users[0].dm,
//                                         'user': slackUsers[users[0].team_id].activeUserId
//                                     },
//                                     'msg': envelope.text.toString().trim(),
//                                     'flags': {'email': true},
//                                     'emailInfo': {
//                                         to: envelope.from_address,
//                                         from: 'Kip Bot <hello@kip.ai>',
//                                         subject: 'Reply from Kip Bot!',
//                                         text: ''
//                                     }
//                                 };
//                                 preProcess(emailCommand);
//                                 client.lrem('chat_email', 1, email_str);
//                                 timer.resume()
//                             } else {
//                                 console.log(3);
//                                 console.log('wtf mate: slackUsers: ', slackUsers, ' users: ', users);
//                                 client.lrem('chat_email', 1, email_str);
//                                 timer.resume()
//                             }
//                         }
//                     });
//                 }, function complete(err, results) {
//                     console.log('Resuming timer!')
//                     timer.resume()
//                 });
//             }
//         }) // end of client lrange, callback)
// }, 5000);


function InvervalTimer(callback, interval) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function() {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        clearInterval(timerId);
        state = 2;
    };

    this.resume = function() {
        if (state != 2) return;

        state = 3;
        setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function() {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = setInterval(callback, interval);
        state = 1;
    };

    startTime = new Date();
    timerId = setInterval(callback, interval);
    state = 1;
}

/// exports
module.exports.initSlackUsers = initSlackUsers;
module.exports.updateMode = updateMode;
module.exports.newSlack = newSlack;
module.exports.preProcess = preProcess;
module.exports.slackUsers = slackUsers;
module.exports.sendResponse = sendResponse;

module.exports.incomingMsgAction = incomingMsgAction;
module.exports.loadSocketIO = loadSocketIO;

module.exports.sendTxtResponse = sendTxtResponse;
module.exports.cannedBanter = cannedBanter;
module.exports.outgoingResponse = outgoingResponse;
module.exports.checkOutgoingBanter = checkOutgoingBanter;
module.exports.saveToCart = saveToCart;
