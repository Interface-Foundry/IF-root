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
var search_results = require('./search_results');
var focus = require('./focus');
var emojiText = require('emoji-text'); //convert emoji to text
var kipcart = require('../cart');
var process_image = require('../process');
var process_emoji = require('../process_emoji').search;
var Chatuser = db.Chatuser;
var next = require("co-next") 
var fb_utility = require('./fb_utility');

var quick_reply = function* (event, sender, fb_memory, fbtoken, recipient) {

    var last_message = yield fb_utility.get_last_message(sender);
    console.log('shiet whats the last message yo', last_message)
    var sub_menu = event.message.quick_reply.payload;
    try {
        sub_menu = JSON.parse(sub_menu);
    } catch(err) {
        console.log(err)
    }
    //sub-menu actions
    if (sub_menu.action && sub_menu.action == 'button_search') {
        if (!last_message || last_message == null) {
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
            });
            // queue it up for processing
            if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                fb_memory[sender].mode = 'shopping';
            }
            message.save().then(() => {
                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
            });
        }
        else if (last_message) {
            var message = new db.Message({
                incoming: true,
                thread_id: 'facebook_' + sender.toString(),
                resolved: false,
                user_id: last_message.user_id,
                origin: 'facebook',
                text: sub_menu.text,
                source: last_message.source,
                amazon: last_message.amazon });
            // queue it up for processing
            if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                    fb_memory[sender].mode = 'shopping';
            }
            message.save().then(() => {
                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
            });
        }
    }
    else if (sub_menu.action && sub_menu.action == 'take_quiz'){
        fb_memory[sender].mode = 'onboarding';
        fb_utility.send_story(recipient,sender);
    }
    else if (sub_menu.action && sub_menu.action == 'cheaper') {
        console.log(event.message)
            if (!last_message) {
                return console.log('No message found');
            } else if (last_message) {
                var message = new db.Message({
                    incoming: true,
                    thread_id: 'facebook_' + sender.toString(),
                    resolved: false,
                    user_id: last_message.user_id,
                    origin: 'facebook',
                    text: sub_menu.selected + ' but cheaper',
                    source: last_message.source,
                    amazon: last_message.amazon
                  });
            // queue it up for processing
            message.save().then(() => {
                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
            });
        }
    } else if (sub_menu.action && sub_menu.action == 'similar') {
            if (!last_message) {
                return console.log('No message found');
            } else if (last_message) {
                var message = new db.Message({
                    incoming: true,
                    thread_id: 'facebook_' + sender.toString(),
                    resolved: false,
                    user_id: last_message.user_id,
                    origin: 'facebook',
                    text: 'more like ' + sub_menu.selected,
                    source: last_message.source,
                    amazon: last_message.amazon
                  });
            // queue it up for processing
            message.save().then(() => {
                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
            });
        }
    }
    //
    //  --If user hits back button..--
    //
    else if (sub_menu.action && sub_menu.action == 'back') {
        console.log('\n\n\n\n\n\BackCache: ', backCache,'\n\n\n\n\n')
        var messages = db.Messages.find({
            thread_id: 'facebook_' + sender.toString()
        }).sort('-ts').exec();
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
        } else if (sub_menu.action === 'emoji_modify') {
            if (!last_message) {
                    return console.log('No message found');
            } 
            else if (last_message) {
                // var emoji_query = (_.get(JSON.parse(msg.amazon)[0], 'ItemAttributes[0].ProductGroup[0]') && sub_menu.text) ?  (_.get(JSON.parse(msg.amazon)[0], 'ItemAttributes[0].ProductGroup[0]').toLowerCase()  + ' ' + sub_menu.text) : sub_menu.text;
                // console.log('emoji_query: ', emoji_query)
                var message = new db.Message({
                    incoming: true,
                    thread_id: 'facebook_' + sender.toString(),
                    resolved: false,
                    user_id: last_message.user_id,
                    origin: 'facebook',
                    text: sub_menu.text,
                    source: last_message.source,
                    amazon: last_message.amazon
                });
             if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
                fb_memory[sender].mode = 'shopping';
             }
            // queue it up for processing
            message.save().then(() => {
                queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
            });
          }
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
                                text: '1 but denim'
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
       } // end of switch
}



module.exports = quick_reply