
// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████████████████████┼┼
// ██████████████████████
// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼████
// ┼┼┼┼┼┼┼┼┼┼┼████┼┼┼┼███
// ┼███████┼┼┼┼┼┼┼┼┼┼┼███
// ████████┼┼┼████┼┼┼┼┼┼┼
// ███┼┼┼██┼┼┼┼███┼┼┼┼┼┼┼
// ┼██┼┼┼██┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ██████████████┼┼┼┼┼┼┼┼
// ███┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼██████████┼┼┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼┼┼┼┼██████┼┼┼┼┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ████┼┼┼██┼┼┼███┼┼┼┼┼┼┼
// ███┼┼┼┼██┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼████████┼┼┼┼┼┼┼
// ████┼┼████████┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// █████████████████████┼
// ██████████████████████
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ███┼┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ┼┼████████████┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼████████████┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// █████┼┼┼┼┼█████┼┼┼┼┼┼┼
// ┼█████████████┼┼┼┼┼┼┼┼
// ┼┼┼┼████████┼┼┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼██████████┼┼┼┼┼┼┼┼┼
// █████████████┼┼┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼┼███┼┼┼┼┼┼┼
// ████┼┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// ┼┼███████████┼┼┼┼┼┼┼┼┼
// ┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼█┼
// █████████████████████┼
// ██████████████████████
// ┼┼┼┼┼┼┼██┼┼┼┼┼┼┼┼┼┼┼┼┼
// ┼┼┼┼████████┼┼┼┼┼┼┼┼┼┼
// ┼██████████████┼┼┼┼┼┼┼
// █████┼┼┼┼┼┼████┼┼┼┼┼┼┼
// ██┼┼┼┼┼┼┼┼┼┼┼██┼┼┼┼┼┼┼


var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db');
var _ = require('lodash');
var http = require('http');
var request = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var fs = require('fs');
//set env vars
var config = require('../../../config');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var keyfile = process.env.NODE_ENV === 'production' ? __dirname + '/facebook-prod.pfx' : __dirname + '/facebook-dev.pfx';
var httpsServer = require('https').createServer({
  pfx: fs.readFileSync(keyfile)
}, app);
var search_results = require('./search_results');
var focus = require('./focus');
fbtoken = process.env.NODE_ENV === 'production' ? 'EAAT6cw81jgoBAEtZABCicbZCmjleToZBnaJtCN07SZCcFQF3nRVGzZB0NOGNPwZCVfwgsAE7ntZA2DRr2oAP2V8r2g4KMWUM5nWQQ4T7wFUZB60caIRedKhuDX4b81BP5RQZBL7JDHZBLENPk6ZCRlNQsas4R3ZAwm5H4ZAwNMWzs5vCTUwZDZD'  : 'EAAPkuxFNp9UBAL6JrXOwHVdji0mjpqsKqrWBlhJyVpNdh0mE2C4ZClfmvZCyTXPgEjGESnjeS3PXs5oFcl1qWlJipqAFluTUuFZBpQzbBb9Oa9TMP6WD7d8wro6IgGueCpQk18isez7wRYlUto4KXKZCSbFagFAZD'
var emojiText = require('emoji-text'); //convert emoji to text
var kipcart = require('../cart');
var process_image = require('../process');
var process_emoji = require('../process_emoji').search;
var Chatuser = db.Chatuser;

if (process.env.NODE_ENV === 'development_alyx'){
    fbtoken = 'EAANOJsoiIyUBACfPbJ2SgpeukLwzDWAiB30gcwfkpZAcw5L2y6CrDkdQzQLvEO3aKF4WyH2oQHPIqbUZA4aajFU2x3AHZAhrjr6KZAZBKVyEqZBmgpGDgZB6AIsAHgbPpCH3zMMoYl7ByX3pspg8mKmKr1NNZBLtJxprmDA5uIrD8gZDZD';
}
else if (process.env.NODE_ENV === 'development_mitsu') {
    fbtoken = 'EAAas9IZAQHr8BAOncFcion0kvJebZA7ETxdhZByQR3uI71V3rFN0PmsnnJBez3AF37B21OfF3ZBx5OAoAPMCOvJm3bOSZBl6uZAadgQZBU2LuYenUBnMih0vHxwUiA5JYNLCucp8TZCYBBr2IkA134VkdsLhHw1A5LkZD'
}
else if (process.env.NODE_ENV === 'development') {
    fbtoken = 'EAAYxvFCWrC8BAGWxNWMD1YPi3e3Ps4ZCUOukkcFcbTBEfUwiciklUbfRZCsUPJFZCxnTHTQJZC9WrYQVAZCAJPrg0miP62NDOAImBpOLyr7gpw6EspvKfo0iVJuhwZBdxevA6VQBK2X1HfQemCLGyC4hMbrF4tmRvrluSApFuZAnwZDZD';
}
//temp. needs to be story in DB
var fb_memory = {}

app.use(express.static(__dirname + '/static'))
app.get('/healthcheck', function(req, res) {
    res.send('💬 🌏')
})
//parse incoming body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
server.listen(8000, function(e) {
    if (e) {
        console.error(e)
    }
    console.log('chat app listening on port 8000 🌏 💬')
});

httpsServer.listen(4343, function(e) {
  if (kip.err(e)) return;
  console.log('chat app listening on https port 4343')
});

app.get('/facebook', function(req, res) {

    if (req.query['hub.verify_token'] === fbtoken) {
        res.send(req.query['hub.challenge']);
    } else {
        console.log('Error, wrong validation token');
        res.send('Error, wrong validation token');
    }
})

//
//   -Back button state cache-
//   What is this you ask? Basically an index to keep track of how many 'backs' you clicked
//   May refactor in future..
//
backCache = 0;


app.post('/facebook', function (req, res) {


    //kip.debug(req.body);

    ///console.log('ZZZZZ ',req.body);

    // filter out the shit we don't want to process.
    if (_.get(req, 'body.entry[0].messaging[0].message.is_echo')) {
        kip.debug('not processing echo message');
        return res.sendStatus(200);
    }

    // need to send this right away, then process the rest
    res.sendStatus(200);

    //
    //
    //--  Initial API calls to FB to set up  greeting and welcome screen.
    //--  *THIS MAY BE MOVED ELSEWHERE, currently it will make redundant calls but just playing it on the safe side for now
    //
    //

    var set_greeting = {
      "setting_type" : "greeting",
      "greeting": {
            "text":"I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options."
        }
     };

    request({
        url: "https://graph.facebook.com/v2.6/me/thread_settings",
        qs: {
            access_token: fbtoken
        },
        method: 'POST',
        json: set_greeting
    }, function(err, body) {
       if (err) console.log('\n\n\n\nWARNING: FB SET WELCOME ERROR: ', err)
    })

    messaging_events = req.body.entry[0].messaging;

    if (!messaging_events) {
        return console.log('facebook.js messaging events missing:  ', JSON.stringify(req.body.entry[0]));
    }



    //CHECK HERE FOR ONBOARDING!!!!! click through

    //IF user input: then respond with "skip" button functionality. Will show Kip (help) message

    //else, SHOPPING MODE
    for (i = 0; i < messaging_events.length; i++) {


        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;


        //////////

        //@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @
        //@ @ @ @ @ shitty code @ @ @ @ @ @
        //@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @


        var zzz = req.body.entry[0].messaging[i];

        var userid_z = zzz.recipient.id.toString();

        //console.log('@ @ @ GETTING ME @ @ @ ',userid_z)
        //console.log('@ @ @ SENDER ID @ @ @ ',sender)

        //gross, in-memory modes and story tracker
        if(!fb_memory[sender]){
            //console.log('@ @ @ @ @  @ @@ @ @ ',fb_memory[sender])
            fb_memory[sender] = {
                mode: 'shopping',
                story_pointer: 0
            };
        }

        //console.log('@ @ @ IN MEMORY @ @ @ ',fb_memory[sender])


        //that string check is at end to prevent a dumb thing from happening where it tries to process the receiver id wtf
       if(event.message && event.message.text){
            Chatuser.count({id: 'facebook_'+sender}, function (err, count){
                if(count>0){
                    //document exists });
                    processMessage();
                }else {
                    fb_memory[sender].mode = 'onboarding';
                    send_image('cart.png',sender,function(){
                        var  x = {text: "Thanks for adding Kip! Take an adventure with us by answering this short quiz, and see what Kip finds for you :)"}
                        //send image here
                        send_universal_message(x,sender);
                        setTimeout(function() {
                            send_story(userid_z,sender);
                        }, 1500);
                    });
                }
            });
        }else {
            processMessage();
        }


        //shitty (temp) shit code ok bye
        function processMessage(){

        //non-shopping mode checker
        //also only capturing text, images, stickers from user to check for current mode to block stuff
        //if(event.message && event.message.text || !_.get(req.body.entry[0].messaging[i], 'message.sticker_id') && _.get(req.body.entry[0].messaging[i], 'message.attachments[0].type') == 'image' || _.get(req.body.entry[0].messaging[i], 'message.sticker_id') || _.get(req.body.entry[0].messaging[i], 'message.attachments')){
        if(event.message && event.message.text){


           // console.log('@ @ @ @ @ E33333333EEEE3333 @ @ @ @ @ ^ ^ ^')
            switch(fb_memory[sender].mode){
                case 'onboarding':
                    console.log('ONBOARDING MODE STOPPING everything else')

                    //@ @ @ eventually move this to the onboarding callback function
                    //FIRE STORY!!
                    //AND same handler ges into button callbacks from story questions


                    //Let's keep track of number of times user does something not within onboarding mode, if more than twice
                    //just revert to shopping mode and send the help_card
                    fb_memory[sender].exit_count = (fb_memory[sender].exit_count < 2) ?  ++fb_memory[sender].exit_count : 0;
                    console.log('incremented exit_count: ', fb_memory[sender].exit_count )
                    if(fb_memory[sender].exit_count >= 1 ) {
                            fb_memory[sender] = {
                                mode: 'shopping',
                                story_pointer: 0
                            };

                            var help_card = {
                                "recipient": {
                                    "id": sender.toString()
                                },
                                "message": {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "button",
                                            "buttons": [
                                               {
                                                    "type": "postback",
                                                    "title": "Headphones",
                                                    "payload": JSON.stringify({
                                                        dataId: "facebook_" + sender.toString(),
                                                        action: "button_search",
                                                        text: 'headphones',
                                                        ts: Date.now()
                                                    })
                                                },
                                                {
                                                   "type": "postback",
                                                    "title": "🐔 🍜",
                                                    "payload": JSON.stringify({
                                                        dataId: "facebook_" + sender.toString(),
                                                        action: "button_search",
                                                        text: '🐔🍜',
                                                        ts: Date.now()
                                                    })
                                                },
                                                {
                                                    "type": "postback",
                                                    "title": "Books",
                                                    "payload": JSON.stringify({
                                                        dataId: "facebook_" + sender.toString(),
                                                        action: "button_search",
                                                        text: 'books',
                                                        ts: Date.now()
                                                    })
                                                }
                                           ],
                                            "text": "I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options. Change your results by tapping Cheaper or Similar buttons. Discover new and weird things by mixing emojis and photos. Try now:"
                                        }
                                    }
                                },
                                "notification_type": "NO_PUSH"
                            };

                            console.log('HELP CARD OUTPUT ',JSON.stringify(help_card))

                            request.post({
                                url: 'https://graph.facebook.com/v2.6/me/messages',
                                qs: {
                                    access_token: fbtoken
                                },
                               method: "POST",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                },
                                body: help_card
                            }, function(err, res, body) {
                                if (err) console.error('post err ', err);
                            })
                            return

                    } else {
                    var x = {text: "Please answer the question above this message, thanks 😊"}
                    send_universal_message(x,sender);

                    return;
                    }

                    res.sendStatus(200);

                break;
            }
        }else {
            //console.log('ping but nah')
        }

        //@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @
        //@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @



         var set_menu = {
          "setting_type" : "call_to_actions",
          "thread_state" : "existing_thread",
          "call_to_actions":[
            {
              "type":"postback",
              "title":"Help",
              "payload":JSON.stringify({
                    dataId: "facebook_" + sender.toString(),
                    action: "help"
                })
            },
            {
              "type":"postback",
              "title":"View Cart",
              "payload":JSON.stringify({
                    dataId: "facebook_" + sender.toString(),
                    action: "list"
                })
            }
          ]
        };
        request({
            url: "https://graph.facebook.com/v2.6/me/thread_settings",
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: set_menu
        }, function(err, body) {
           if (err) console.log('\n\n\n\nWARNING: FB SET MENU ERROR: ', err)
        })
        var set_get_started = {
              "setting_type":"call_to_actions",
              "thread_state":"new_thread",
              "call_to_actions":[
                {
                  "payload": JSON.stringify({
                       "type": "GET_STARTED",
                       "dataId":"facebook_" + sender.toString()
                     })
                }
              ]
           }

        request({
            url: "https://graph.facebook.com/v2.6/me/thread_settings",
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: set_get_started
        }, function(err, body) {
           if (err) console.log('\n\n\n\nWARNING: FB SET GET STARTED ERROR: ', err);
        })

        if (event.message) {
            var typing_indicator = {
              "recipient":{
                "id": sender.toString()
              },
              "sender_action": "typing_on"
            };

            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: fbtoken
                },
                method: 'POST',
                json: typing_indicator
            }, function() { })
        }

        //
        //
        //  QUICK REPLY BUTTON PROCESSING
        //
        //
        if (event.message && event.message.quick_reply && event.message.quick_reply.payload) {

            //pre-parse emoji to prevent quickreply emoji  to go to nlp
            // if (event.message.text) {
            //     process_emoji( event.message.text, function(res) {
            //          event.message.text = res;
            //     })
            //      event.message.text = emojiText.convert(text,{delimiter: ' '});
            // }

            var sub_menu = event.message.quick_reply.payload;

            try {
                sub_menu = JSON.parse(sub_menu);
            } catch(err) {
                console.log(err)
            }
            //sub-menu actions
            if (sub_menu.action && sub_menu.action == 'button_search') {
                console.log(event.message)
                db.Messages.find({
                    thread_id: 'facebook_' + sender.toString()
                }).sort('-ts').exec(function(err, messages) {
                        if (err) return console.error(err);
                        if (messages.length == 0) {
                            console.log('No message found');
                            var message = new db.Message({
                                incoming: true,
                                thread_id: 'facebook_' + sender.toString(),
                                resolved: false,
                                user_id: "facebook_" + sender.toString(),
                                origin: 'facebook',
                                text: sub_menu.text,
                                source: {
                                    'origin': 'facebook',
                                    'channel': sender.toString(),
                                    'org': "facebook_" + sender.toString(),
                                    'id': "facebook_" + sender.toString(),
                                    'user': sender.toString()
                                },
                                // amazon: msg.amazon
                            });
                        // queue it up for processing
                         if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                                fb_memory[sender].mode = 'shopping';
                          }
                        message.save().then(() => {
                            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))

                        });

                    } else if (messages[0]) {
                        var msg = messages[0];
                        var message = new db.Message({
                            incoming: true,
                            thread_id: 'facebook_' + sender.toString(),
                            resolved: false,
                            user_id: msg.user_id,
                            origin: 'facebook',
                            text: sub_menu.text,
                            source: msg.source,
                            amazon: msg.amazon });
                    // queue it up for processing
                     if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                            fb_memory[sender].mode = 'shopping';
                      }
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))

                    });



                }
              })
            }
            else if (sub_menu.action && sub_menu.action == 'take_quiz'){
                send_story(userid_z,sender);
                fb_memory[sender].mode = 'onboarding';
            }
            else if (sub_menu.action && sub_menu.action == 'cheaper') {
                console.log(event.message)
                db.Messages.find({
                    thread_id: 'facebook_' + sender.toString()
                }).sort('-ts').exec(function(err, messages) {
                    if (err) return console.error(err);
                    if (messages.length == 0) {
                        return console.log('No message found');
                    } else if (messages[0]) {
                        var msg = messages[0];
                        var message = new db.Message({
                            incoming: true,
                            thread_id: 'facebook_' + sender.toString(),
                            resolved: false,
                            user_id: msg.user_id,
                            origin: 'facebook',
                            text: sub_menu.selected + ' but cheaper',
                            source: msg.source,
                            amazon: msg.amazon
                          });
                    // queue it up for processing
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                    });
                }
              })
            } else if (sub_menu.action && sub_menu.action == 'similar') {
                // console.log(event.message)
                db.Messages.find({
                    thread_id: 'facebook_' + sender.toString()
                }).sort('-ts').exec(function(err, messages) {
                    if (err) return console.error(err);
                    if (messages.length == 0) {
                        return console.log('No message found');
                    } else if (messages[0]) {
                        var msg = messages[0];
                        var message = new db.Message({
                            incoming: true,
                            thread_id: 'facebook_' + sender.toString(),
                            resolved: false,
                            user_id: msg.user_id,
                            origin: 'facebook',
                            text: 'more like ' + sub_menu.selected,
                            source: msg.source,
                            amazon: msg.amazon
                          });
                    // queue it up for processing
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                    });
                }
              })
            }
            //
            //  --If user hits back button..--
            //
            else if (sub_menu.action && sub_menu.action == 'back') {
                console.log('\n\n\n\n\n\BackCache: ', backCache,'\n\n\n\n\n')
                db.Messages.find({
                    thread_id: 'facebook_' + sender.toString()
                }).sort('-ts').exec(function(err, messages) {
                    if (err) return console.error(err);
                    //*This var will retrieve the correct message for back button depending on whether you are going back from a sub-menu or from a newer search.
                    var message_to_retrieve = sub_menu.type === 'last_search' ? (messages[3] ? 3 : 2) : (messages[2] ? 2 : (messages[1] ? 1 : 0));
                    if (messages.length == 0) {
                        return console.log('No message found');
                    }
                         if (messages[message_to_retrieve] && _.get(messages[message_to_retrieve], 'execute[0].params.query')) {
                             backCache = backCache + 1;
                            message_to_retrieve = message_to_retrieve + backCache;
                            //This will loop through older messages until it finds a query.
                            var i = message_to_retrieve;
                            var found_query = false;
                            while (i >= 0 && !found_query) {
                                  if (_.get(messages[i], 'execute[0].params.query')) {
                                    found_query = true;
                                    message_to_retrieve = i;
                                    var msg = messages[message_to_retrieve];
                                    var message = new db.Message({
                                        incoming: true,
                                        thread_id: 'facebook_' + sender.toString(),
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: 'facebook',
                                        text:  _.get(messages[i], 'execute[0].params.query'),
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                }
                                i--;
                            }

                            if (!found_query) {
                                 var main_sub_menu = {
                                    "quick_replies":[
                                          {
                                            "content_type":"text",
                                            "title":"Cheaper",
                                            "payload": JSON.stringify({
                                                    action: "cheaper",
                                                    selected: '1'
                                                })
                                          },
                                          {
                                            "content_type":"text",
                                            "title":"Similar",
                                            "payload": JSON.stringify({
                                                    action: "similar",
                                                    selected: "1"
                                                })
                                          },
                                          {
                                            "content_type":"text",
                                            "title":"Color",
                                            "payload":   JSON.stringify({
                                                    action: "sub_menu_color",
                                                    selected: "1"
                                                })
                                          },
                                          {
                                            "content_type":"text",
                                            "title":"Emoji",
                                            "payload": JSON.stringify({
                                                dataId: outgoing.data.thread_id,
                                                action: "sub_menu_emoji",
                                                selected: "1"
                                            })
                                          },
                                          {
                                            "content_type":"text",
                                            "title":" < Back",
                                            "payload": JSON.stringify({
                                                    action: "back",
                                                    type:"last_search"
                                                })
                                          }
                                        ],
                                        "text": "Going back..."
                                    };
                                    request({
                                        url: 'https://graph.facebook.com/v2.6/me/messages',
                                        qs: {
                                            access_token: fbtoken
                                        },
                                        method: 'POST',
                                        json: {
                                            recipient: {
                                                id: sender.toString()
                                            },
                                            message: main_sub_menu,
                                        }
                                    }, function(err, res, body) {
                                        if (err) console.error('post err ', err);
                                        console.log(body);
                                    });
                            }
                        }
                      })
                } else if (sub_menu.action === 'emoji_modify') {


                    // var results = yield getLatestAmazonResults(message)
                    db.Messages.find({
                        thread_id: 'facebook_' + sender.toString()
                    }).sort('-ts').exec(function(err, messages) {
                        if (err) return console.error(err);
                        if (messages.length == 0) {
                            return console.log('No message found');
                        } else if (messages[0]) {
                            console.log(messages[0])
                            var msg = messages[0];
                            // var emoji_query = (_.get(JSON.parse(msg.amazon)[0], 'ItemAttributes[0].ProductGroup[0]') && sub_menu.text) ?  (_.get(JSON.parse(msg.amazon)[0], 'ItemAttributes[0].ProductGroup[0]').toLowerCase()  + ' ' + sub_menu.text) : sub_menu.text;
                            // console.log('emoji_query: ', emoji_query)
                            var message = new db.Message({
                                incoming: true,
                                thread_id: 'facebook_' + sender.toString(),
                                resolved: false,
                                user_id: msg.user_id,
                                origin: 'facebook',
                                text: sub_menu.text,
                                source: msg.source,
                                amazon: msg.amazon
                            });
                         if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                            fb_memory[sender].mode = 'shopping';
                         }
                        // queue it up for processing
                        message.save().then(() => {
                            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))

                        });
                    }
                })

                } else if (sub_menu.action === 'teenage_wasteland') {
                    process.exit(1);
                } else {
                    //Resetting back button count
                    backCache = 0;
                }

                //
                //   --  Sub-menu switching --
                // currently either Color or Emoji
                //

                // black, white, blue, red, brown, pink

                switch(sub_menu.action) {
                case "sub_menu_color":

                    //Switching mode to modify
                    fb_memory[sender] = {
                        mode: 'modify',
                        select: 1
                    };

                     var modify_sub_menu = {
                        "recipient": {
                            "id": sender.toString()
                        },
                        "message": {
                          "quick_replies":[
                             {
                                "content_type":"text",
                                "title":"Black",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but black'
                                    })
                              },
                               {
                                "content_type":"text",
                                "title":"White",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but white'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Blue",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but blue'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Red",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but red'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Brown",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but brown'
                                    })
                              },
                               {
                                "content_type":"text",
                                "title":"Pink",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "button_search",
                                        text: '1 but pink'
                                    })
                              },
                               {
                                "content_type":"text",
                                "title":" < Back",
                                "payload": JSON.stringify({
                                        action: "back",
                                        type: "last_menu"
                                    })
                              }
                            ],
                            "text": "What color do you want this in?"
                        },
                        "notification_type": "NO_PUSH"
                    };

                    request.post({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: modify_sub_menu
                    }, function(err, res, body) {
                        if (err) console.error('post err ', err);
                    })
                    break;

                case "sub_menu_emoji":

                       //Switching mode to modify
                        fb_memory[sender] = {
                            mode: 'modify',
                            select: 1
                        };

                      var modify_sub_menu = {
                        "recipient": {
                            "id": sender.toString()
                        },
                        "message": {
                          "quick_replies":[
                             {
                                "content_type":"text",
                                "title":"🍪",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but cookie'
                                    })
                              },
                               {
                                "content_type":"text",
                                "title":"👖",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but blue jean'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"🌹",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but floral'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"☕",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but coffee'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"🔨",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but tool'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"👻",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but ghost'
                                    })
                               },
                               {
                                "content_type":"text",
                                "title":"💯",
                                "payload": JSON.stringify({
                                        dataId: "facebook_" + sender.toString(),
                                        action: "emoji_modify",
                                        text: '1 but best'
                                    })
                              },
                               {
                                "content_type":"text",
                                "title":" < Back",
                                "payload": JSON.stringify({
                                        action: "back",
                                        type: "last_menu"
                                    })
                              }
                            ],
                            "text": "Choose one :)"
                        },
                        "notification_type": "NO_PUSH"
                    };

                    request.post({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: modify_sub_menu
                    }, function(err, res, body) {
                        if (err) console.error('post err ', err);
                    })
                    break;
               }

        }


        //REGULAR INCOMING TEXT MESSAGES
        else if (event.message && event.message.text) {

                text = event.message.text;





                //@ @ @ @ @ @ TEMPORARRY TURN OFF LATER
                // if (text == 'hi'){
                //     fb_memory[userid_z].mode = 'onboarding';

                //     // curl  \
                //     //   -F recipient='{"id":"USER_ID"}' \
                //     //   -F message='{"attachment":{"type":"image", "payload":{}}}' \
                //     //   -F filedata=@/tmp/shirt.png \
                //     //   "https://graph.facebook.com/v2.6/me/messages?access_token=PAGE_ACCESS_TOKEN"

                //     console.log('TRYING THIS STUFF NO@QQQWWWWWW')
                //     //res.send(200);
                //     send_image('cart.png',sender,function(){
                //         send_story(userid_z,sender);
                //     });


                //     //   //TURN THIS INTO AN IMAGE SENDER!!!
                //     //  request({
                //     //     url: 'https://graph.facebook.com/v2.6/me/messages',
                //     //     qs: {
                //     //         access_token: fbtoken
                //     //     },
                //     //     method: 'POST',
                //     //     json: {
                //     //         recipient: {
                //     //             id: sender.toString()
                //     //         },
                //     //         message: '{"attachment":{"type":"image", "payload":{}}}',
                //     //         filedata:
                //     //     }
                //     // }, function(err, res, body) {
                //     //     if (err) console.error('post err ', err);
                //     //     console.log(body);
                //     // });

                // }
                //@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @

                //converting some emojis into more "product-y" results
                process_emoji(text, function(res) {
                    text = res;
                })
                //converting other emojis into text
                text = emojiText.convert(text,{delimiter: ' '});
                //emoji parser doesnt recognize robot emoji wtf
                if (text.indexOf('🤖') > -1) text = text.replace('🤖','robot')


                 //Check if user is still in modify mode
                if(fb_memory[sender].mode == 'modify') {
                     fb_memory[sender].mode = 'shopping';

                    //Send modify query instead of the usual
                     var message = new db.Message({
                        incoming: true,
                        thread_id: "facebook_" + sender.toString(),
                        original_text: '1 but ' + text,
                        user_id: "facebook_" + sender.toString(),
                        origin: 'facebook',
                        source: {
                            'origin': 'facebook',
                            'channel': sender.toString(),
                            'org': "facebook_" + sender.toString(),
                            'id': "facebook_" + sender.toString(),
                            'user': sender.toString()
                        },
                        // selected: [1],
                        ts: Date.now()
                    });
                    // clean up the text
                    message.text = message.original_text.trim(); //remove extra spaces on edges of string
                    // queue it up for processing
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                         //Reset mode back to shopping
                    });

                } else {
                     console.log(JSON.stringify(req.body));
                    var message = new db.Message({
                        incoming: true,
                        thread_id: "facebook_" + sender.toString(),
                        original_text: text,
                        user_id: "facebook_" + sender.toString(),
                        origin: 'facebook',
                        source: {
                            'origin': 'facebook',
                            'channel': sender.toString(),
                            'org': "facebook_" + sender.toString(),
                            'id': "facebook_" + sender.toString(),
                            'user': sender.toString()
                        },
                        ts: Date.now()
                    });
                    // clean up the text
                    message.text = message.original_text.trim(); //remove extra spaces on edges of string
                    // queue it up for processing
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                    });
                }
        }
        //user sent image
        else if (!_.get(req.body.entry[0].messaging[i], 'message.sticker_id') && _.get(req.body.entry[0].messaging[i], 'message.attachments[0].type') == 'image') {
            var data = { file: {url_private: req.body.entry[0].messaging[i].message.attachments[0].payload.url}};
             process_image.imageSearch(data,'',function(res){
                if (res && res.length > 0) {
                    var message = new db.Message({
                        incoming: true,
                        thread_id: "facebook_" + sender.toString(),
                        original_text: res,
                        user_id: "facebook_" + sender.toString(),
                        origin: 'facebook',
                        source: {
                            'origin': 'facebook',
                            'channel': sender.toString(),
                            'org': "facebook_" + sender.toString(),
                            'id': "facebook_" + sender.toString(),
                            'user': sender.toString()
                        },
                        ts: Date.now()
                    });
                    // clean up the text
                    if (!message.original_text) return;
                    message.text = message.original_text.trim(); //remove extra spaces on edges of string
                    // queue it up for processing
                    message.save().then(() => {
                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                    });
                }
            });
        }
        //user sent sticker
        else if (_.get(req.body.entry[0].messaging[i], 'message.sticker_id') || _.get(req.body.entry[0].messaging[i], 'message.attachments')) {
            var img_array = [
            'http://kipthis.com/kip_stickers/kip1.png',
            'http://kipthis.com/kip_stickers/kip2.png',
            'http://kipthis.com/kip_stickers/kip3.png',
            'http://kipthis.com/kip_stickers/kip4.png',
            'http://kipthis.com/kip_stickers/kip5.png',
            'http://kipthis.com/kip_stickers/kip6.png',
            'http://kipthis.com/kip_stickers/kip7.png',
            'http://kipthis.com/kip_stickers/kip8.png',
            'http://kipthis.com/kip_stickers/kip9.png'
            ];

            var img_card = {
                "attachment":{
                  "type":"image",
                  "payload":{
                    "url": img_array[Math.floor(Math.random()*img_array.length)]
                  }
                }
              }

             request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: fbtoken
                },
                method: 'POST',
                json: {
                    recipient: {
                        id: sender.toString()
                    },
                    message: img_card,
                }
            }, function(err, res, body) {
                if (err) console.error('post err ', err);
                console.log(body);
            });
        }


        else if (event.postback) {
            try {
                var postback = JSON.parse(event.postback.payload);
            } catch(err) {
                console.log('POSTBACK PARSE ERR: ',err)
                var postback = event.postback.payload;
            }
            console.log('\n\n\npostback: ', postback,'\n\n\n');

            //@ @ @ @ @ @ @ @ @ @ @ @
            //@ @ @ @ @ ONBOARDING!!!!!!
            //@ @ @ @ @ @ @ @ @ @ @ @ @
            if ((postback.type && postback.type == 'GET_STARTED') || postback == 'GET_STARTED') {


                //send welcome image here

                //then one more text message intro
                //then send story
                fb_memory[sender].mode = 'onboarding';
                //res.send(200);
                send_image('cart.png',sender,function(){
                    var x = {text: "Thanks for adding Kip! Take an adventure with us by answering this short quiz, and see what Kip finds for you :)"}
                    //send image here
                    send_universal_message(x,sender);
                    setTimeout(function() {
                        send_story(userid_z,sender);
                    }, 1500);

                });


                 // var get_started = {
                 //        "recipient": {
                 //            "id": sender.toString()
                 //        },
                 //        "message": {
                 //                  "quick_replies":[
                 //                      {
                 //                        "content_type":"text",
                 //                        "title":"Headphones",
                 //                        "payload": JSON.stringify({
                 //                                dataId: postback.dataId,
                 //                                action: "button_search",
                 //                                text: 'headphones'
                 //                            })
                 //                      },
                 //                      {
                 //                        "content_type":"text",
                 //                        "title":"🐔 🍜",
                 //                        "payload": JSON.stringify({
                 //                                dataId: postback.dataId,
                 //                                action: "button_search",
                 //                                text: '🐔 🍜'
                 //                            })
                 //                      },
                 //                      {
                 //                        "content_type":"text",
                 //                        "title":"Books",
                 //                        "payload": JSON.stringify({
                 //                                dataId: postback.dataId,
                 //                                action: "button_search",
                 //                                text: 'books'})
                 //                      }
                 //                    ],
                 //                    "text": "I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options. Change your results by tapping Cheaper or Similar buttons. Discover new and weird things by mixing emojis and photos. Try now:"
                 //        },
                 //        "notification_type": "NO_PUSH"
                 //    };

                 //    request.post({
                 //        url: 'https://graph.facebook.com/v2.6/me/messages',
                 //        qs: {
                 //            access_token: fbtoken
                 //        },
                 //        method: "POST",
                 //        json: true,
                 //        headers: {
                 //            "content-type": "application/json",
                 //        },
                 //        body: get_started
                 //    }, function(err, res, body) {
                 //        if (err) console.error('post err ', err);
                 //    })
            }
            //@ @ @ @ @ @ @ @ hiiiiiiiiiii @@ @ @ @ @ @ @ //
            else if (postback.action === 'story.answer') {
                console.log('OK OK OKO @ @ @ @ @ @ @ @ @ @ @ @ OKKK@@K@K@K@K@K@K ',postback)
                process_story(userid_z,sender,postback.story_pointer,postback.selected);
                return;
            }
            //@ @ @ @ @ @ @ @ byeeeeeee @ @ @ @ @ @ //
            console.log('NOOOOOOOOOOOOOO@ @ @ @ @ @ @ @ @ @ @ @ OKKK@@K@K@K@K@K@K');

            db.Messages.find({
                thread_id: postback.dataId
            }).sort('-ts').exec(function(err, messages) {
                if (err) return console.error(err);
                   if (messages.length == 0) {
                        console.log('No message found');
                        var msg = new db.Message({
                            incoming: true,
                            thread_id: 'facebook_' + sender.toString(),
                            resolved: false,
                            user_id: "facebook_" + sender.toString(),
                            origin: 'facebook',
                            source: {
                                'origin': 'facebook',
                                'channel': sender.toString(),
                                'org': "facebook_" + sender.toString(),
                                'id': "facebook_" + sender.toString(),
                                'user': sender.toString()
                            },
                            // amazon: msg.amazon
                        });
                    }  else {
                       var msg = messages[0];

                    }


                    co(function*() {


                        console.log('POSTBACK OKOKOKOK @ @ @ @ @ @  ',postback)
                         if (postback.action == 'help') {
                            var help_card = {
                                "recipient": {
                                    "id": sender.toString()
                                },
                                "message": {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "button",
                                            "buttons": [
                                               {
                                                    "type": "postback",
                                                    "title": "Headphones",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "button_search",
                                                        text: 'headphones',
                                                        ts: msg.ts
                                                    })
                                                },
                                                {
                                                   "type": "postback",
                                                    "title": "🐔 🍜",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "button_search",
                                                        text: '🐔🍜',
                                                        ts: msg.ts
                                                    })
                                                },
                                                {
                                                    "type": "postback",
                                                    "title": "Books",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "button_search",
                                                        text: 'books',
                                                        ts: msg.ts
                                                    })
                                                }
                                           ],
                                            "text": "I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options. Change your results by tapping Cheaper or Similar buttons. Discover new and weird things by mixing emojis and photos. Try now:"
                                        }
                                    }
                                },
                                "notification_type": "NO_PUSH"
                            };

                            console.log('HELP CARD OUTPUT ',JSON.stringify(help_card))

                            request.post({
                                url: 'https://graph.facebook.com/v2.6/me/messages',
                                qs: {
                                    access_token: fbtoken
                                },
                                method: "POST",
                                json: true,
                                headers: {
                                    "content-type": "application/json",
                                },
                                body: help_card
                            }, function(err, res, body) {
                                if (err) console.error('post err ', err);
                            })
                        }

                        else if (postback.action == 'button_search') {
                            var text = postback.text;
                            text = emojiText.convert(text,{delimiter: ' '});
                             //emoji parser doesnt recognize robot emoji wtf
                if (text.indexOf('🤖') > -1) text = text.replace('🤖','robot')
                            // console.log('\n\n\n\nwe got to go: ', text, '\n\n\n\n')
                            var new_message = new db.Message({
                                    incoming: true,
                                    thread_id: msg.thread_id,
                                    resolved: false,
                                    user_id: msg.user_id,
                                    origin: msg.origin,
                                    text: text,
                                    source: msg.source,
                                    amazon: msg.amazon                                      });
                            // queue it up for processing
                            var message = new db.Message(new_message);
                            // queue it up for processing
                             if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                                    fb_memory[sender].mode = 'shopping';
                              }

                            message.save().then(() => {
                                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                            });
                        }

                        function* getLatestAmazonResults(message) {
                            message.history = [];
                            var results,
                                i = 0;
                            while (!results) {
                                if (!message.history[i]) {
                                    var more_history = yield db.Messages.find({
                                        thread_id: message.thread_id,
                                        ts: {
                                            $lte: message.ts
                                        }
                                    }).sort('-ts').skip(i).limit(20);

                                    if (more_history.length === 0) {
                                        // console.log(message);
                                        throw new Error('Could not find amazon results in message history for message ' + message._id);
                                    }
                                    message.history = message.history.concat(more_history);
                                }

                                if (message.history[i].amazon) {
                                    results = message.history[i].amazon;
                                }
                                i++;
                            }
                            return results;
                        }
                        var amazon = yield getLatestAmazonResults(msg);
                        msg.amazon = amazon;
                        if (msg && msg.amazon) {
                                if (postback.action == 'add' && postback.initial) {
                                    // console.log('add postback: ', postback);

                                    //Send a typing indicator to user
                                    var typing_indicator = {
                                      "recipient":{
                                        "id": sender.toString()
                                      },
                                      "sender_action": "typing_on"
                                    };

                                    request({
                                        url: 'https://graph.facebook.com/v2.6/me/messages',
                                        qs: {
                                            access_token: fbtoken
                                        },
                                        method: 'POST',
                                        json: typing_indicator
                                    }, function() {})

                                    //Check if user scrolled up and this item is not from the previous search...
                                    var old_search = yield db.Messages.find({
                                            thread_id: 'facebook_' + sender.toString()
                                    }).sort('-ts').exec(function(err, messages) {
                                        if (err) return console.error(err);
                                        if (messages.length == 0) {
                                            console.log('No message found');
                                        }
                                        else if (messages[0]._id == postback.object_id) {
                                            // console.log('THIS IS AN ITEM FROM THE LATEST SEARCH');
                                            return 'false'
                                        }
                                        else if (messages[0]._id !== postback.object_id) {
                                            // console.log('THIS IS AN NOOOOT ITEM FROM THE LATEST SEARCH', postback)
                                            return postback.object_id;
                                        }
                                    })


                                    if (old_search == 'false') {
                                        //This is the latest search so just pass it through Kip like normal
                                           var new_message = new db.Message({
                                            incoming: true,
                                            thread_id: msg.thread_id,
                                            resolved: false,
                                            user_id: msg.user_id,
                                            origin: msg.origin,
                                            text: 'save ' + postback.selected,
                                            source: msg.source,
                                            amazon: msg.amazon,
                                            searchSelect: [postback.selected]
                                              });
                                            // queue it up for processing
                                            var message = new db.Message(new_message);
                                            message.save().then(() => {
                                                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                            });
                                    }

                                    else if (old_search && postback.object_id){
                                        // console.log('Mmkay this is an old search: ', postback);

                                       //Check if user scrolled up and this item is not from the previous search...
                                        var old_message = yield db.Messages.findById(postback.object_id).exec();
                                        if (old_message && old_message.amazon && old_message.amazon.length > 0) {
                                            var new_message = new db.Message({
                                                incoming: true,
                                                thread_id: old_message.thread_id,
                                                resolved: false,
                                                user_id: old_message.user_id,
                                                origin: old_message.origin,
                                                text: 'save ' + postback.selected,
                                                source: old_message.source,
                                                amazon: old_message.amazon,
                                                searchSelect: [postback.selected],
                                                flags: { old_search: true}
                                                });
                                            }
                                            // queue it up for processing
                                            var message = new db.Message(new_message);
                                            message.save().then(() => {
                                                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                            });
                                        }
                                }
                                else if (postback.action == 'add' && !postback.initial) {

                                        var typing_indicator = {
                                          "recipient":{
                                            "id": sender.toString()
                                          },
                                          "sender_action": "typing_on"
                                        };

                                        request({
                                            url: 'https://graph.facebook.com/v2.6/me/messages',
                                            qs: {
                                                access_token: fbtoken
                                            },
                                            method: 'POST',
                                            json: typing_indicator
                                        });

                                        co(function*() {
                                          // console.log('addExtra --> postback: ', postback);
                                          var cart_id = (msg.source.origin === 'facebook') ? msg.source.org : msg.cart_reference_id || msg.source.team;
                                          var cart = yield kipcart.getCart(cart_id);
                                          var unique_items = _.uniqBy( cart.aggregate_items, 'ASIN');
                                          var item = unique_items[parseInt(postback.selected-1)];
                                          yield kipcart.addExtraToCart(cart, cart_id, cart_id, item);
                                          var new_message = new db.Message({
                                            incoming: true,
                                            thread_id: msg.thread_id,
                                            resolved: false,
                                            user_id: msg.user_id,
                                            origin: msg.origin,
                                            text: 'view cart',
                                            source: msg.source,
                                            amazon: msg.amazon
                                          });

                                          // queue it up for processing
                                          var message = new db.Message(new_message);
                                          message.save().then(() => {
                                            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                          });
                                        });

                                }
                                else if (postback.action === 'remove') {
                                        var typing_indicator = {
                                          "recipient":{
                                            "id": sender.toString()
                                          },
                                          "sender_action": "typing_on"
                                        };

                                        request({
                                            url: 'https://graph.facebook.com/v2.6/me/messages',
                                            qs: {
                                                access_token: fbtoken
                                            },
                                            method: 'POST',
                                            json: typing_indicator
                                        }, function() {})
                                    var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: 'remove ' + postback.selected,
                                        source: msg.source,
                                        amazon: msg.amazon,
                                        searchSelect: [postback.selected]
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });

                                }

                                else if (postback.action === 'list') {
                                     var typing_indicator = {
                                          "recipient":{
                                            "id": sender.toString()
                                          },
                                          "sender_action": "typing_on"
                                        };

                                        request({
                                            url: 'https://graph.facebook.com/v2.6/me/messages',
                                            qs: {
                                                access_token: fbtoken
                                            },
                                            method: 'POST',
                                            json: typing_indicator
                                        }, function() {})

                                      var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: 'view cart',
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                }
                                else if (postback.action === 'focus') {
                                      var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: postback.selected,
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                }
                                else if (postback.action === 'similar') {
                                       var typing_indicator = {
                                          "recipient":{
                                            "id": sender.toString()
                                          },
                                          "sender_action": "typing_on"
                                        };

                                        request({
                                            url: 'https://graph.facebook.com/v2.6/me/messages',
                                            qs: {
                                                access_token: fbtoken
                                            },
                                            method: 'POST',
                                            json: typing_indicator
                                        }, function() { })


                                    var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: 'more like ' + postback.selected,
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                }
                                 else if (postback.action === 'cheaper') {
                                       var typing_indicator = {
                                          "recipient":{
                                            "id": sender.toString()
                                          },
                                          "sender_action": "typing_on"
                                        };

                                        request({
                                            url: 'https://graph.facebook.com/v2.6/me/messages',
                                            qs: {
                                                access_token: fbtoken
                                            },
                                            method: 'POST',
                                            json: typing_indicator
                                        }, function() {})


                                      var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: postback.selected + ' but cheaper',
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                }
                                else if (postback.action === 'empty') {
                                    co(function*(){
                                        var cart_id = (msg.source.origin === 'facebook') ? msg.source.org : msg.cart_reference_id || msg.source.team;
                                          //Diverting team vs. personal cart based on source origin for now
                                          var cart_type= msg.source.origin == 'slack' ? 'team' : 'personal';
                                          yield kipcart.removeAllOfItem(cart_id, postback.selected);
                                        var new_message = new db.Message({
                                            incoming: true,
                                            thread_id: msg.thread_id,
                                            resolved: false,
                                            user_id: msg.user_id,
                                            origin: msg.origin,
                                            text: 'view cart',
                                            source: msg.source,
                                            amazon: msg.amazon
                                          });
                                        // queue it up for processing
                                        var message = new db.Message(new_message);
                                        message.save().then(() => {
                                            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                        });
                                    })
                                }
                               else if (postback.action === 'more') {
                                  var new_message = new db.Message({
                                    incoming: true,
                                    thread_id: msg.thread_id,
                                    resolved: false,
                                    user_id: msg.user_id,
                                    origin: msg.origin,
                                    text: 'more',
                                    source: msg.source,
                                    amazon: msg.amazon
                                  });
                                // queue it up for processing
                                var message = new db.Message(new_message);
                                message.save().then(() => {
                                    queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                });
                            }
                            else if (postback.action === 'home') {
                                 var home_card = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": [{
                                                "title": "Home Screen",
                                                "image_url": "http://kipthis.com/kip_modes/mode_shopping.png",
                                                 "buttons": [{
                                                    "type": "postback",
                                                    "title": "View Cart",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "list",
                                                        ts: msg.ts
                                                    })
                                                },
                                                {
                                                    "type": "postback",
                                                    "title": "Settings",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "settings",
                                                        ts: msg.ts
                                                    })
                                                }
                                                ]
                                            }]
                                        }
                                    }
                                };

                              request({
                                    url: 'https://graph.facebook.com/v2.6/me/messages',
                                    qs: {
                                        access_token: fbtoken
                                    },
                                    method: 'POST',
                                    json: {
                                        recipient: {
                                            id: msg.source.channel
                                        },
                                        message: home_card,
                                    }
                                }, function(err, res, body) {
                                    if (err) console.error('post err ', err);
                                    console.log(body);
                                });
                            }
                        }
                    }) // end of co

            }); // end of db.find
        } //end of for loop
        } //end of shitty (temp) function wrapper
    }
});



//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.facebook');
queue.topic('outgoing.facebook').subscribe(outgoing => {
    try {
        var message = outgoing.data;

        var return_data = {};

        co(function*() {

            if (message.mode === 'shopping' && message.action === 'results' && message.amazon.length > 0) {
                return_data = yield search_results(message);
                return send_results(message.source.channel, message.text, return_data, outgoing);
            }

            else if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
                console.log('focus message :', message);
                return_data = yield focus(message);
                return send_focus(message.source.channel, message.text, return_data, outgoing);
            }

            else if (message.mode === 'cart' && message.action === 'view') {
                return send_cart(message.source.channel, message.text, outgoing);
            }

            else if (message.text && message.text.indexOf('_debug nlp_') == -1) {
                return send_text(message.source.channel, message.text, outgoing)
            }
            else {
            }

            outgoing.ack();

        }).then(() => {
            outgoing.ack();
        }).catch(e => {
            console.log(e);
            outgoing.ack();
        // })
        })
    } catch ( e ) {
        kip.err(e);
    }


    function send_text(channel, text, outgoing) {
        console.log('send_text: ', fbtoken, channel, text);


                //intercept of vanilla help message when user types 'help' instead of clicking help button lel
            if (text.indexOf("I'm Kip, your penguin shopper.") > -1)
            {
                // console.log('YOU SHALL NOT PASS')
                 var help_card = {
                    "recipient": {
                        "id": sender.toString()
                    },
                    "message": {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "button",
                                "buttons": [
                                   {
                                        "type": "postback",
                                        "title": "Headphones",
                                        "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'headphones',
                                            ts: Date.now()
                                        })
                                    },
                                    {
                                       "type": "postback",
                                        "title": "🐔 🍜",
                                        "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: '🐔🍜',
                                            ts: Date.now()
                                        })
                                    },
                                    {
                                        "type": "postback",
                                        "title": "Books",
                                        "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'books',
                                            ts: Date.now()
                                        })
                                    }
                               ],
                                "text": "I'm Kip, your penguin shopper! Tell me what you're looking for and I'll show you 3 options. Change your results by tapping Cheaper or Similar buttons. Discover new and weird things by mixing emojis and photos. Try now:"
                            }
                        }
                    },
                    "notification_type": "NO_PUSH"
                };

                // console.log('HELP CARD OUTPUT ',JSON.stringify(help_card))

                request.post({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: fbtoken
                    },
                   method: "POST",
                    json: true,
                    headers: {
                        "content-type": "application/json",
                    },
                    body: help_card
                }, function(err, res, body) {
                    if (err) console.error('post err ', err);
                })
                return
            }







        function chunkString(str, length) {
          return str.match(new RegExp('.{1,' + length + '}', 'g'));
        }

        if (text.length >= 200) {
            var text_array = chunkString(text, 250)
            console.log('text_array: ', text_array);
            var el_count = 0;
            var char_count = 0;
            var current_chunk = ''
            async.eachSeries(text_array, function iterator(chunk, cb){
                char_count = char_count + chunk.length;
                if (el_count == text_array.length-1) {
                     request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: 'POST',
                        json: {
                            recipient: {
                                id: channel
                            },
                            message: {text: current_chunk},
                            notification_type: "NO_PUSH"
                        }
                    }, function(err, res, body) {
                        if (err) console.error('post err ', err);
                        console.log(body);
                        char_count = 0;
                        current_chunk = '';
                        el_count++;
                        cb();
                    });
                }
                else if (char_count > 125) {
                     request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: 'POST',
                        json: {
                            recipient: {
                                id: channel
                            },
                            message: {text: current_chunk},
                            notification_type: "NO_PUSH"
                        }
                    }, function(err, res, body) {
                        if (err) console.error('post err ', err);
                        console.log(body);
                        char_count = 0;
                        current_chunk = '';
                        el_count++;
                        cb();
                    });
                }
                else {
                    current_chunk = current_chunk + ' ' + chunk;
                    el_count++;
                    cb()
                }
            }, function done() {
              outgoing.ack();

            })
          }
        else {
           request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: fbtoken
                },
                method: 'POST',
                json: {
                    recipient: {
                        id: channel
                    },
                    message: {text: text},
                    notification_type: "NO_PUSH"
                }
            }, function(err, res, body) {
                if (err) console.error('post err ', err);
                console.log(body);
                outgoing.ack();
            });
        }

    }

    function send_results(channel, text, results, outgoing) {

          var giphy_gif = ''

        request('http://api.giphy.com/v1/gifs/search?q=' + outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
            if (err) console.log(err);

            // console.log('GIFY RETURN DATA: ', JSON.parse(body).data[0])
            giphy_gif = JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_width_small.url :  'http://kipthis.com/images/header_partners.png';

            var cards = results.map((result, i) => {
                var n = i + 1 + '';

                //get picstitch image
                if (result && result.image_url){
                    var image = ((result.image_url.indexOf('http') > -1) ? result.image_url : 'http://kipthis.com/images/header_partners.png')
                } else {
                    kip.debug('error: no result.image_url (picstitch) found');
                    var image = 'http://kipthis.com/images/header_partners.png';
                }
                return {
                        "title": result.title,
                        "image_url": (result.image_url && result.image_url.indexOf('http') > -1 ? result.image_url : 'http://kipthis.com/images/header_partners.png'),
                        "buttons": [{
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                object_id: outgoing.data._id,
                                action: "add",
                                selected: i + 1,
                                ts: outgoing.data.ts,
                                initial: true
                            })
                        },
                        {
                            "type": "web_url",
                            "url": result.title_link,
                            "title": "View on Amazon"
                        },
                        {
                            "type": "postback",
                            "title": "Details",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "focus",
                                selected: i + 1,
                                ts: outgoing.data.ts
                            })
                        }],
                    }
            });

            cards.push( {
                "title": 'Click "See More Results" below for more products!',
                "image_url": giphy_gif,
                "buttons": [{
                    "type": "postback",
                    "title": "See More Results",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        action: "more",
                        ts: outgoing.data.ts
                    })
                },{
                    "type": "postback",
                    "title": "View Cart",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        action: "list",
                        ts: outgoing.data.ts
                    })
                 }]})
               var modify_menu = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": cards
                        }
                    },
                    "quick_replies":[
                              {
                                "content_type":"text",
                                "title":"Cheaper",
                                "payload": JSON.stringify({
                                        action: "cheaper",
                                        selected: '1'
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Similar",
                                "payload": JSON.stringify({
                                        action: "similar",
                                        selected: "1"
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Color",
                                "payload": JSON.stringify({
                                        action: "sub_menu_color",
                                        selected: "1"
                                    })
                              },
                              {
                                "content_type":"text",
                                "title":"Emoji",
                                "payload": JSON.stringify({
                                        dataId: outgoing.data.thread_id,
                                        action: "sub_menu_emoji",
                                        selected: "1"
                                    })
                              }
                            ]
                };

                //prevents showing back when there's no back
                // if (backCache > 0){
                //     console.log('BACK CACHE')
                //     modify_menu.quick_replies.push({
                //         "content_type":"text",
                //         "title":" < Back",
                //         "payload": JSON.stringify({
                //                 action: "back",
                //                 type:"last_search"
                //             })
                //       });
                // }

                request({
                    url: 'https://graph.facebook.com/v2.6/me/messages',
                    qs: {
                        access_token: fbtoken
                    },
                    method: 'POST',
                    json: {
                        recipient: {
                            id: channel
                        },
                        message: modify_menu,
                    }
                }, function(err, res, body) {
                    if (err) console.error('post err ', err);
                    console.log(body);
                    outgoing.ack();
                });
         })
    }

    function send_focus(channel, text, focus_info, outgoing) {
        var img_card = {
             "recipient": {
                "id": channel
            },
             "message":{
                "attachment":{
                  "type":"template",
                  "payload":{
                    "template_type":"generic",
                    "elements":[
                      {
                        "title": focus_info.price + ' | ' + focus_info.reviews,
                        "item_url": focus_info.title_link,
                        "image_url": focus_info.image_url,
                      }
                    ]
                  }
                }, "quick_replies":[
                  {
                    "content_type":"text",
                    "title":"Cheaper",
                    "payload": JSON.stringify({
                            action: "cheaper",
                            selected: focus_info.selected
                        })
                  } ,
                  {
                    "content_type":"text",
                    "title":"Similar",
                    "payload": JSON.stringify({
                            action: "similar",
                            selected: focus_info.selected
                        })
                  },
                  {
                    "content_type":"text",
                    "title":"Color",
                    "payload":   JSON.stringify({
                            action: "sub_menu_color",
                            selected: focus_info.selected
                        })
                  },
                  {
                    "content_type":"text",
                    "title":"Emoji",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        action: "sub_menu_emoji",
                        selected: focus_info.selected
                    })
                  },
                  {
                    "content_type":"text",
                    "title":" < Back",
                    "payload": JSON.stringify({
                            action: "back",
                            type:"last_menu"
                        })
                  }
                ]
              }, "notification_type": "NO_PUSH"
        };

        var focus_card = {
            "recipient": {
                "id": channel
            },
            "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "buttons": [{
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                object_id: outgoing.data._id,
                                action: "add",
                                selected: focus_info.selected,
                                ts: outgoing.data.ts
                            })
                        }],
                    "text": (focus_info.title + '\n' + focus_info.description + '\n').substring(0,300)
                }
              }
            },
            "notification_type": "NO_PUSH"
        };

         request.post({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: fbtoken
            },
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: focus_card
        }, function(err, res, body) {
            if (err) console.error('post err ', err);
            console.log(body)
            request.post({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: fbtoken
                },
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: img_card
            }, function(err, res, body) {
                if (err) console.error('post err ', err);
                console.log(body)
            })
        })
    }

    function send_cart(channel, text, outgoing) {
          var cart = outgoing.data.data;
          // console.log('getting to send_cart, outgoing: ', outgoing.data)
          var cartDisplay = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": []
                }
              }
          };
          var unique_items = _.uniqBy( cart.aggregate_items, 'ASIN');
            for (var i = 0; i < unique_items.length; i++) {
                var item = unique_items[i];
                var cart_item = {
                    "title":  `${item.title}`,
                    "subtitle": 'Price: ' + item.price + "\nQuantity:" + item.quantity,
                    "image_url": item.image,
                    "buttons":[
                        { "type": "postback",
                          "title": "➕",
                          "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "object_id": outgoing.data._id,"action": "add" ,"selected": (i + 1), initial: false })
                        },
                        { "type": "postback",
                          "title": "➖",
                          "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "object_id": outgoing.data._id, "action": "remove" ,"selected": (i + 1), initial: false})
                        },
                        { "type": "postback",
                          "title": "Remove All",
                          "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "empty", "selected": (i + 1), initial: false})
                        }
                    ]
                  }
                cartDisplay.attachment.payload.elements.push(cart_item);
              }

        request.post({
              url: 'https://graph.facebook.com/v2.6/me/messages',
              qs: {access_token: fbtoken},
              method: "POST",
              json: {
                recipient: {id: channel},
                message: cartDisplay,
              },
              headers: {
                  "content-type": "application/json",
              }
          },
          function (err, res, body) {
             if (err) console.log('post err ',err);
             console.log(body);

                  var summary_card = {
                        "recipient": {
                            "id": channel
                        },
                        "message": {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "button",
                                    "buttons": [
                                    {
                                        "type": "web_url",
                                        "url": cart.link,
                                        "title": "Check Out"
                                    }
                                   ],
                                    "text": 'Total: ' + cart.total
                                }
                            }
                        },
                        "notification_type": "NO_PUSH"
                    };

                    request.post({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: summary_card
                    }, function(err, res, body) {
                        if (err) console.error('post err ', err);
                    })
          })

    }

})


// @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ //
// @ @ @ @ @ @ @ @ @ @ @ lil cinna house :> @ @ @ @ @ @ @ @ //
// @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ //

//pass any FB body to it
//** bd == the message body, i.e. {text:'blah'}
//** sendTo == the FB id of the recipient
function send_universal_message(bd,sendTo){
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: fbtoken
        },
        method: 'POST',
        json: {
            recipient: {
                id: sendTo
            },
            message: bd,
            notification_type: "NO_PUSH"
        }
    }, function(err, res, body) {
        if (err) console.error('post err ', err);
    });
}

function start_story(recipient,sender){

    send_story(recipient,sender);


}

//recipient: id
//sender: id
//pointer: which sequence # we're going to
//select: which answer did user pick
function process_story(recipient,sender,pointer,select){

    //SAVE THIS quiz response TO USERS PERSONA as a session
    var query = {id: 'facebook_'+sender},
        update = { origin:'facebook' },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    Chatuser.findOneAndUpdate(query, update, options, function(err, user) {
        var obj = {
            recipient: recipient,
            sender: sender,
            ts: Date.now(),
            select: select,
            story: 'intro quiz',
            pointer: pointer - 1
        }
        user.persona.sessions.push(JSON.stringify(obj))
        user.save(function (err) {
            if(err) {
                console.error('ERROR!');
            }
        });
    });
    //////////


    //check if we should end story. will stop story after length of quiz question array
    if(pointer == onboarding_quiz.length - 1){

        //ADD TIMER DELAY FOR "TOTALING RESULTS...."


        //send image here




        //SEND PRESENT IMAGE
        //DELAY
        //SEND PRESENT

        console.log('FINAL RESULTS !!! ! ! ! ! ! ! ',fb_memory[sender].quiz)

        //console.log('MAXY KEY ',_.max(Object.keys(fb_memory[recipient].quiz), function (o) { return obj[o]; }))

        var item;

        if(fb_memory[sender].quiz >= 0 && fb_memory[sender].quiz <= 3){
            item = 'Flying Sailboat'
            send_image('sailboat.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_universal_message(x,sender);
            });
        }
        else if(fb_memory[sender].quiz >= 4 && fb_memory[sender].quiz <= 7){
            item = 'Lucky Goldfish'
            send_image('goldfish.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_universal_message(x,sender);
            });
        }
        else if(fb_memory[sender].quiz >= 8 && fb_memory[sender].quiz <= 9){
            item = 'Snowglobe Charm'
            send_image('snowglobe.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_universal_message(x,sender);
            });
        }
        else if(fb_memory[sender].quiz >= 10 && fb_memory[sender].quiz <= 12){
            item = 'Rainbow Pearl'
            send_image('pearl.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_universal_message(x,sender);
            });
        }else {
            item = 'Lucky Goldfish'
            send_image('goldfish.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_universal_message(x,sender);
            });
        }

        fb_memory[sender].quiz = 1;

        console.log('COLLECTABLE/////???/ ',item)

        //get highest ranking
        // var maxy = _.max(Object.keys(fb_memory[recipient].quiz), function (o) { return obj[o]; });
        // switch(maxy){
        //     case 'trendy':
        //         send_image('snowglobe.png',sender,function(){
        //         });
        //     break;
        //     case 'lavish':
        //         send_image('pearl.png',sender,function(){
        //         });
        //     break;
        //     case 'smart':
        //         send_image('goldfish.png',sender,function(){
        //         });
        //     break;
        //     case 'adventure':
        //         send_image('sailboat.png',sender,function(){
        //         });
        //     break;
        //     default:
        //         send_image('pearl.png',sender,function(){
        //         });
        // }

        fb_memory[sender].mode = 'shopping';



        var sendObj;
        switch(item){
            case 'Flying Sailboat':
             sendObj = {
                    "recipient": {
                        "id": sender.toString()
                    },
                    "message": {
                              "quick_replies":[
                                  {
                                    "content_type":"text",
                                    "title":"Athletic socks",
                                    "payload": JSON.stringify({
                                                dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'athletic socks'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"⛺",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'tent'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Fitbit",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'fitbit'})
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Retake Quiz",
                                    "payload": JSON.stringify({
                                            action: "take_quiz"
                                    })
                                  }
                                ],
                                "text": "Here are some cool things you might like! :)"
                    },
                    "notification_type": "NO_PUSH"
                };
            break;
            case 'Lucky Goldfish':
             sendObj = {
                    "recipient": {
                        "id": sender.toString()
                    },
                    "message": {
                              "quick_replies":[
                                  {
                                    "content_type":"text",
                                    "title":"Phone charger",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'external phone battery'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"🍧",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'shaved ice'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Keurig cups",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'keurig cups'})
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Retake Quiz",
                                    "payload": JSON.stringify({
                                            action: "take_quiz"
                                    })
                                  }
                                ],
                                "text": "Here are a some cool things you might like! :)"
                    },
                    "notification_type": "NO_PUSH"
                };
            break;
            case 'Rainbow Pearl':
             sendObj = {
                    "recipient": {
                        "id": sender.toString()
                    },
                    "message": {
                              "quick_replies":[
                                  {
                                    "content_type":"text",
                                    "title":"Amazon Echo",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'amazon echo'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"📷",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'camera'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Safecard wallet",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'safecard wallet'})
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Retake Quiz",
                                    "payload": JSON.stringify({
                                            action: "take_quiz"
                                    })
                                  }
                                ],
                                "text": "Here are a some cool things you might like! :)"
                    },
                    "notification_type": "NO_PUSH"
                };
            break;
            case 'Snowglobe Charm':
             sendObj = {
                    "recipient": {
                        "id": sender.toString()
                    },
                    "message": {
                              "quick_replies":[
                                  {
                                    "content_type":"text",
                                    "title":"Moleskin Notebook",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'moleskin notebook'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"✏️",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: 'pencil'
                                        })
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"4-port USB hub",
                                    "payload": JSON.stringify({
                                            dataId: "facebook_" + sender.toString(),
                                            action: "button_search",
                                            text: '4-port USB hub'})
                                  },
                                  {
                                    "content_type":"text",
                                    "title":"Retake Quiz",
                                    "payload": JSON.stringify({
                                            action: "take_quiz"
                                    })
                                  }
                                ],
                                "text": "Here are a some cool things you might like! :)"
                    },
                    "notification_type": "NO_PUSH"
                };
            break;
        }

        setTimeout(function() {
            request.post({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: fbtoken
                },
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: sendObj
            }, function(err, res, body) {
                if (err) console.error('post err ', err);
                console.log('@$@$@$@$@$@$@$@$@$@$@$@$@$ ',body)
            })
        }, 2000);





        //SAVE ITEM TO USER PROFILE
        var query = {id: 'facebook_'+sender},
            update = { origin:'facebook' },
            options = { upsert: true, new: true, setDefaultsOnInsert: true };
        Chatuser.findOneAndUpdate(query, update, options, function(err, user) {
            var obj = {
                item: item,
                ts: Date.now()
            }
            user.persona.items.push(JSON.stringify(obj))
            user.save(function (err) {
                if(err) {
                    console.error('ERROR!');
                }
            });
        });




        //SWITCH
        //CHOOSE PRESENT, display search buttons
    }else {
        pointer++;

        //this should really be in a DB asap @@@@@-----@@@@@
        if(!fb_memory[sender].quiz){
            fb_memory[sender].quiz = 1;
        }

        console.log('SELECTOR ',select)
        // console.log('SELECTED ',fb_memory[recipient].quiz[select])

        if(fb_memory[sender].quiz || fb_memory[sender].quiz == 0){
            fb_memory[sender].quiz = fb_memory[sender].quiz + select;
        }else {
            console.log('error: key not found for persona val')
        }

        console.log('@!@!@!@!@!@!@!@!@!@!@!@!@!@!@ ',fb_memory[sender].quiz);

        console.log('ADDING POINTER ',pointer)
        send_story(recipient,sender,pointer)
    }

}

function send_story(userid_z,recipient,pointer){

    //console.log('SENDING STORY ',userid_z)

    var storySender;




    // console.log('IFFFFFF ',fb_memory[userid_z])

    // if(fb_memory[userid_z]){
        //var story_pointer = pointer;

        //start from beginning of we dont have a pointer
        if(!pointer){
            pointer = 0;
        }

        console.log('@ @ @ @ @ @ story pointer @ @ @ @ @  ',pointer)
        //if(pointer || pointer == 0){
        var storySender = onboarding_quiz[pointer];
        console.log('WHAT IS IT???? ',JSON.stringify(storySender))
        storySender.recipient = {
            id: recipient
        };
        console.log('story SENDER FINAL ',storySender)
        // }else {
        //     var x = {text: "I'm sorry, I had brain freeze. I'm not sure what you said"}
        //     send_universal_message(x,sender);
        //     return;
        // }
    //}

    console.log('@ @  @ @ @ @ @ @ STORY SENDER ',JSON.stringify(storySender))



    //send res to user
    request.post({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: fbtoken
        },
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: storySender
    }, function(err, res, body) {

        if (err) console.error('post err ', err);

        // console.log('RESzzzz ',res)
        // console.log('body ',body)

        //fb_memory[userid_z].story_pointer++; //advance the story to next sequence

    })
}

//for higher quality images, upload them directly to FB
//img: local image url
function send_image(img,sender,callback){
    var r = request.post('https://graph.facebook.com/v2.6/me/messages?access_token='+fbtoken, function optionalCallback (err, httpResponse, body) {
      if (err) {
        callback();
        return console.error('upload failed:', err);
      }
      console.log('Upload successful!');
      callback();
    })
    var form = r.form()
    form.append('recipient', '{"id":"'+sender.toString()+'"}')
    form.append('message', '{"attachment":{"type":"image", "payload":{}}}')
    form.append('filedata', fs.createReadStream(__dirname +'/assets/'+img))
}

//onboarding quiz, sequential stories

                // trendy:0,
                // lavish:0,
                // smart:0,
                // adventure:0

var onboarding_quiz = [{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"You arrive in a foreign city, where do you stay?",
            "buttons":[
              {
                "type":"postback",
                "title":"Luxury hotel",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 0
                            })
              },
              {
                "type":"postback",
                "title":"Forest cabin",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 0
                            })
              },
              {
                "type":"postback",
                "title":"Vintage townhouse",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 0
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"After unpacking, you get a chance to explore. Where do you go first?",
            "buttons":[
              {
                "type":"postback",
                "title":"Local market",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 1
                            })
              },
              {
                "type":"postback",
                "title":"Explore nature",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 1
                            })
              },
              {
                "type":"postback",
                "title":"Art & Culture",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 1
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"Phew! You’ve been out exploring the whole day, how do you treat yourself?",
            "buttons":[
              {
                "type":"postback",
                "title":"Luxurious massage",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 2
                            })
              },
              {
                "type":"postback",
                "title":"New restaurant",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 2
                            })
              },
              {
                "type":"postback",
                "title":"Hanging with locals",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 2
                            })
              }
            ]
          }
        }
    }
},
{
    "message":{
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text":"It’s your last day on the trip, what do you remember most?",
            "buttons":[
              {
                "type":"postback",
                "title":"Feel of the City",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 2,
                                story_pointer: 3
                            })
              },
              {
                "type":"postback",
                "title":"Historical landmarks",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 3,
                                story_pointer: 3
                            })
              },
              {
                "type":"postback",
                "title":"Memories w. friends",
                "payload": JSON.stringify({
                                dataId: 'zzzz',
                                object_id: 'zzzz',
                                action: "story.answer",
                                selected: 0,
                                story_pointer: 3
                            })
              }
            ]
          }
        }
    }
}];

// @ @ @ @ @ @ @ @ @ @ @ bye cinna @ @ @ @ @ @ @ @ @ @ @ //