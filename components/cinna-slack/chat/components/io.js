/*eslint-env es6*/
var async = require('async');
var request = require('request');
var co = require('co')
var _ = require('lodash')
var fs = require('fs')
//slack stuff
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
var WEB_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.WEB;
//* * * * * //

var banter = require("./banter.js");
var history = require("./history.js");
var search = require("./search.js");
var picstitch = require("./picstitch.js");
var processData = require("./process.js");
var purchase = require("./purchase.js");
var init_team = require("./init_team.js");
var conversation_botkit = require('./conversation_botkit');
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
var messageHistory = {}; //fake database, stores all users and their chat histories
var io; //global socket.io var...probably a bad idea, idk lol
var supervisor = require('./supervisor');
var cinnaEnv;
// var BufferList = require('bufferlist').BufferList
var upload = require('../../../../IF_services/upload.js');
/////////// LOAD INCOMING ////////////////


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
    if (env === 'development_alyx') {

        //KIP on Slack
        // var testUser = [{
        //     team_id:'T02PN3B25',
        //     dm:'D0H6X6TA8',
        //     bot: {
        //         bot_user_id: 'U0GRJ9BJS',
        //         bot_access_token:'xoxb-16868317638-4pB4v3sor5LNIu6jtIKsVLkB'
        //     },
        //     meta: {
        //         initialized: true
        //     }
        // }];

        //CINNA-PEPPER
        // var testUser = [{
        //     team_id:'T0H72FMNK',
        //     dm:'D0H6X6TA8',
        //     bot: {
        //         bot_user_id: 'U0H6YHBNZ',
        //         bot_access_token:'xoxb-17236589781-HWvs9k85wv3lbu7nGv0WqraG'
        //     },
        //     meta: {
        //         initialized: false
        //     }
        // }];

        //KIP-PAPRIKA
        var testUser = [{
            team_id:'T02PN3B25',
            dm:'D0H6X6TA8',
            bot: {
                bot_user_id: 'U0H6YHBNZ',
                bot_access_token:'xoxb-29684927943-TWPCjfJzcObYRrf5MpX5YJxv'
            },
            meta: {
                initialized: true
            }
        }];


        loadSlackUsers(testUser);
    }else if (env === 'development_mitsu'){
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
    }else{
        console.log('retrieving slackbots from mongo database ' + config.mongodb.url);
        Slackbots.find().exec(function(err, users) {
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
var newSlack = function(){
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

        //on slack auth
        slackUsers[user.team_id].on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
            console.log('DEBUG: checking meta initialized: ', user.meta);
            //* * * * Welcome message * * * //
            //send welcome to new teams – dont spam all slack people on node reboot

            if (rtmStartData.self){
                slackUsers[user.team_id].botId = rtmStartData.self.id;
                slackUsers[user.team_id].botName = rtmStartData.self.name;
            }

            //this if here for dev testing
            if (cinnaEnv === 'development_alyx'){
                //
                // Onboarding conversation
                //
                var hello = {
                    msg: 'welcome',
                    source: {
                      origin: 'slack',
                      channel: 'D0H6X6TA8',
                      org: user.team_id,
                      id: user.team_id + '_' + 'D0H6X6TA8'
                    },
                    action:'sendAttachment',
                    client_res: [],
                    botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                    botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                };

                banter.welcomeMessage(hello, function(res) {
                    hello.client_res.push(res);
                    //send attachment!
                    sendResponse(hello);
                })
            } else if (cinnaEnv === 'development_mitsu'){
                //
                // Onboarding conversation
                //
                var hello = {
                    msg: 'welcome',
                    source: {
                      origin: 'slack',
                      channel: 'D0HLZLBDM',
                      org: user.team_id,
                      id: user.team_id + '_' + 'D0HLZLBDM'
                    },
                    action:'sendAttachment',
                    client_res: [],
                    botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                    botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                };

                banter.welcomeMessage(hello, function(res) {
                    hello.client_res.push(res);
                    //send attachment!
                    sendResponse(hello);
                })
            }
            else if (user.meta && user.meta.initialized == false){
                init_team(user, function(e, addedBy) {
                    user.meta.initialized = true;
                    if (typeof user.save === 'function') {
                      user.save();
                    }

                    //
                    // Onboarding conversation
                    //
                    var hello = {
                        msg: 'welcome',
                        source: {
                          origin: 'slack',
                          channel: addedBy.dm,
                          org: user.team_id,
                          id: user.team_id + '_' + addedBy.dm
                        },
                        action:'sendAttachment',
                        client_res: [],
                        botId: slackUsers[user.team_id].botId, //this is the name of the bot on the channel so we can @ the bot
                        botName: slackUsers[user.team_id].botName //this is the name of the bot on the channel so we can @ the bot
                    };

                    banter.welcomeMessage(hello, function(res) {
                        hello.client_res.push(res);
                        //send attachment!
                        sendResponse(hello, res);

                        user.conversations = user.conversations || {};
                        // user.conversations[addedBy.dm] = 'onboard';
                        // return conversation_botkit.onboard(user, addedBy.id, function() {
                        //   console.log('done with onboarding conversation')
                        //   user.conversations[addedBy.dm] = false;
                        // });
                    })

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
            console.log(data);

            // don't talk to urself
            if (data.user === user.bot.bot_user_id) {
              console.log("don't talk to urself")
              return;
            }


            // welp it would be nice to get the history in context here but fuck it
            // idk how and i don't care this ship gonna burn before we scale out anyway
            user.conversations = user.conversations || {};


            // don't perform searches if ur having a convo with a bot
            // let botkit handle it
            if (user.conversations[data.channel]) {
              console.log('in a conversation: ' + user.conversations[data.channel])
              return;
            }


            // TESTING PURPOSES, here is how you would trigger a conversation
            if (data.text === 'onboard') {
              user.conversations[data.channel] = 'onboard';
              // "user" is actually the slackbot here
              // "data.user" is the user having the convo
              return conversation_botkit.onboard(user, data.user, function() {
                console.log('done with onboarding conversation')
                user.conversations[data.channel] = false;
              });
            }

            if (data.text === 'settings') {
              user.conversations[data.channel] = 'settings';
              return conversation_botkit.settings(user, data.user, function() {
                console.log('done with settings conversation')
                user.conversations[data.channel] = false;
              })
            }

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
                                        'id':data.team + "_" + data.channel, //for retrieving chat history in node memory,
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
                                    'id':data.team + "_" + data.channel, //for retrieving chat history in node memory,
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
                            'id':data.team + "_" + data.channel, //for retrieving chat history in node memory,
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
            // if (data.amazon && data.amazon[0] && data.amazon[0].ItemAttributes) {
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
function preProcess(data){

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

    //check for canned responses/actions before routing to NLP
    banter.checkForCanned(data.msg,function(res,flag,query){

        //found canned response
        if(flag){
            data.client_res = [];
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
                case 'search.more':
                    data.bucket = 'search';
                    data.action = 'more';
                    incomingAction(data);
                    break;
                case 'purchase.remove':
                    data.searchSelect = [];
                    data.searchSelect.push(query);
                    data.bucket = 'purchase';
                    data.action = 'remove';
                    incomingAction(data);
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
        //proceed to NLP instead
        else {
            routeNLP(data);
        }
    },data.source.origin,data.source);

  //  });

}

//pushing incoming messages to python
function routeNLP(data){

    //sanitize msg before sending to NLP
    data.msg = data.msg.replace(/[^0-9a-zA-Z.]/g, ' ');
    data.flags = data.flags ? data.flags : {};

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
                    console.log('NLP RES ',res);

                    if (res.supervisor) {
                      data.flags.toSupervisor = true;
                    }

                    if(res.execute && res.execute.length > 0){

                        if(!res.execute[0].bucket){
                            res.execute[0].bucket = 'search';
                        }
                        if(!res.execute[0].action){
                            res.execute[0].execute[0].action = 'initial';
                        }

                        //- - - temp stuff to transfer nlp results to data object - - - //
                        if (res.execute[0].bucket){
                            data.bucket = res.execute[0].bucket;
                        }
                        if (res.execute[0].action){
                            data.action = res.execute[0].action;
                        }
                        if (res.tokens){
                            data.tokens = res.tokens;
                        }
                        if (res.searchSelect){
                            data.searchSelect = res.searchSelect;
                        }
                        if (res.execute[0].dataModify){
                            data.dataModify = res.execute[0].dataModify;
                        }
                        //- - - - end temp - - - - //

                        incomingAction(data);

                    }
                    else if (!res.bucket && !res.action && res.searchSelect && res.searchSelect.length > 0){
                        //IF got NLP that looks like { tokens: [ '1 but xo' ], execute: [], searchSelect: [ 1 ] }

                        //looking for modifier search
                        if (res.tokens && res.tokens[0].indexOf('but') > -1){
                            var modDetail = res.tokens[0].replace(res.searchSelect[0],''); //remove select num from string
                            modDetail = modDetail.replace('but','').trim();
                            console.log('mod string ',modDetail);

                            data.tokens = res.tokens;
                            data.searchSelect = res.searchSelect;
                            data.bucket = 'search';
                            data.action = 'modify';
                            data.dataModify = {
                                type:'genericDetail',
                                val:[modDetail]
                            };

                            console.log('constructor ',data);

                            incomingAction(data);
                        }
                        else {
                            data.tokens = res.tokens;
                            data.searchSelect = res.searchSelect;
                            data.bucket = 'search';
                            data.action = 'initial';

                            console.log('un struct ',data);

                            incomingAction(data);
                        }

                    }
                    else {

                        if(!res.bucket){
                            res.bucket = 'search';
                        }
                        if(!res.action){
                            res.action = 'initial';
                        }

                        //- - - temp stuff to transfer nlp results to data object - - - //
                        if (res.bucket){
                            data.bucket = res.bucket;
                        }
                        if (res.action){
                            data.action = res.action;
                        }
                        if (res.tokens){
                            data.tokens = res.tokens;
                        }
                        if (res.searchSelect){
                            data.searchSelect = res.searchSelect;
                        }
                        if (res.dataModify){
                            data.dataModify = res.dataModify;
                        }
                        //- - - - end temp - - - - //

                        incomingAction(data);

                    }
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

        console.log('KIPOBJ ',kipObj);

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
            purchaseBucket(data);
            break;
        case 'supervisor':
            //route to supervisor chat window
        default:
            searchBucket(data);
    }
}

//* * * * * ACTION CONTEXT BUCKETS * * * * * * *//

function searchBucket(data){

    //* * * * typing event
    if (data.action == 'initial' || data.action == 'similar' || data.action == 'modify' || data.action == 'more'){
        if (data.source.origin == 'slack' && slackUsers[data.source.org]){
            slackUsers[data.source.org].sendTyping(data.source.channel);
        }else if (data.source.origin == 'socket.io'){
            var searcher = {};
            searcher.source = data.source;
            sendTxtResponse(searcher,'Searching...');
        }
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

var sendTxtResponse = function(data,msg){
    data.action = 'smallTalk';
    if (!msg){
        console.log('error: no message sent with sendTxtResponse(), using default');
        msg = 'Sorry, I didn\'t understand';
    }
    data.client_res = [];
    data.client_res.push(msg);
    sendResponse(data);
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

                if (data.source.origin == 'slack'){
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
                }

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
                            attachObj.actions = actionObj;
                            attachObj.callback_id = data.searchId; //pass mongo id as callback id so we can access reference later

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
                    checkOutgoingBanter(data);
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
var sendResponse = function(data){

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
    // Slack Outgoing
    //* * * * * * * *
    else if (data.source && data.source.channel && data.source.origin == 'slack' || (data.flags && data.flags.toClient)){

        //eventually cinna can change emotions in this pic based on response type
        var params = {
            icon_url: 'http://kipthis.com/img/kip-icon.png'
        }
        //check if slackuser exists
        if (slackUsers[data.source.org]){

            if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more'){

                var message = data.client_res[0]; //use first item in client_res array as text message

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
                attachments[0].actions = actionObj;

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
                        slackUsers_web[data.source.org].chat.postMessage(data.source.channel, message, msgData, function() {
                            callback();
                        });
                    }
                    //item is an attachment object, send attachment
                    else if (message !== null && typeof message === 'object' || message instanceof Array){

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
                    slackUsers_web[data.source.org].chat.postMessage(data.source.channel, '', msgData, function() {

                    });

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
                    return processData.getItemLink(_.get(itemToAdd, 'DetailPageURL[0]'), data.source.user, 'ASIN-' + _get(itemToAdd, 'ASIN[0]')).then(function(url) {
                      sendTxtResponse(data, 'Hi, please goto Amazon so you can choose your size and style: ' + url);
                    }).catch(function(e) {
                      console.log('could not get link for item')
                      console.log(e.stack)
                      sendTxtResponse(data, 'Hi, it looks like you have to order this particular item directly from Amazon, not me. ');
                    })
                  }

                  messageHistory[data.source.id].cart.push(itemToAdd); //add selected items to cart
                  cart = yield kipcart.addToCart(data.source.org, data.source.user, itemToAdd)
                      .catch(function(reason) {
                        // could not add item to cart, make kip say something nice
                        console.log(reason);
                        sendTxtResponse(data, 'Oops sorry, it looks like that item is not currently available from any sellers.');
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

      data.client_res = ['Item '+searchSelect.toString()+'⃣ removed from your cart. Type `view cart` to see your updated cart']
      outgoingResponse(data, 'txt');

    }).then(function(){}).catch(function(err) {
        console.log(err);
        console.log(err.stack)
        return;
        sendTxtResponse(data, err);
    })
}

function viewCart(data, show_added_item){

    console.log('view cart')
    db.Metrics.log('cart.view', data);

    console.log(data.source)

    co(function*() {
      var cart = yield kipcart.getCart(data.source.org);

      if (cart.items.length < 1) {
        return sendTxtResponse(data, 'Looks like you have not added anything to your cart yet.');
      }

      var slackbot = yield db.Slackbots.findOne({
        team_id: data.source.org
      }).exec();

      // get the latest added item if we need to highlight it
      if (show_added_item) {
        var added_item = cart.items[cart.items.length - 1];
        var added_asin = added_item.ASIN;
      }

      var cartObj = [];
      for (var i = 0; i < cart.aggregate_items.length; i++) {
        var item = cart.aggregate_items[i];
        var userString = item.added_by.map(function(u) {
          return '<@' + u + '>';
        }).join(', ');

        var link = yield processData.getItemLink(item.link, data.source.user, item._id.toString());
        console.log(link);

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

        if (item.ASIN === added_asin) {
          cartObj.push({
            text: `${processData.emoji[i+1].slack} <${link}|${item.title}> \n *${item.price}* each \n Quantity: ${item.quantity} \n _Added by: ${userString}_`,
            mrkdwn_in: ['text', 'pretext'],
            color: '#7bd3b6',
            thumb_url: item.image,
            actions: actionObj
          })
        } else {
          cartObj.push({
            text: `${processData.emoji[i+1].slack} <${link}|${item.title}> \n *${item.price}* each \n Quantity: ${item.quantity} \n _Added by: ${userString}_`,
            mrkdwn_in: ['text', 'pretext'],
            color: '#45a5f4',
            thumb_url: item.image,
            actions: actionObj
          })
        }
      }

      // Only show the purchase link in the summary for office admins.
      var summaryText = `_Summary: Team Cart_ \n Total: *${cart.total}*`;
      if (slackbot.meta.office_assistants.indexOf(data.source.user) >= 0) {
        summaryText += ` \n <${cart.link}|» Purchase Items >`;
      } else {
        summaryText += '>';
      }

      cartObj.push({
        text: summaryText,
        mrkdwn_in: ['text', 'pretext'],
        color: '#45a5f4'
      })

      data.client_res = [];
      data.client_res.push(cartObj);
      console.log('done with cartObj');

      banter.getCinnaResponse(data,function(res){
          if(res && res !== 'null'){
              data.client_res.unshift(res);
          }
          sendResponse(data);
      });
      // sendResponse(data);

    }).catch(function(e) {
      console.log('error retriving cart for view cart')
      console.log(e.stack);
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

/////TOOLS

//trim a string to char #
function truncate(string){
   if (string.length > 80)
      return string.substring(0,80)+'...';
   else
      return string;
};

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

/// exports
module.exports.initSlackUsers = initSlackUsers;
module.exports.newSlack = newSlack;
module.exports.incomingMsgAction = incomingMsgAction;
module.exports.loadSocketIO = loadSocketIO;

module.exports.sendTxtResponse = sendTxtResponse;
module.exports.cannedBanter = cannedBanter;
module.exports.outgoingResponse = outgoingResponse;
module.exports.checkOutgoingBanter = checkOutgoingBanter;
module.exports.saveToCart = saveToCart;
