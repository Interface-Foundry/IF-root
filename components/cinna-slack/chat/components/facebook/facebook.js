
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
var db = require('../../../db')
var _ = require('lodash');
var http = require('http');
var request = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
//set env vars
var config = require('../../../config');
process.on('uncaughtException', function(err) {
    console.error('uncaught exception', new Date())
    console.error(err.stack);
});
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var search_results = require('./search_results');
var focus = require('./focus');
var fbtoken = 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD';

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
})

app.get('/facebook', function(req, res) {
    if (req.query['hub.verify_token'] === fbtoken) {
        //bot stuff
        res.send(req.query['hub.challenge']);
    } else {
        console.log('Error, wrong validation token');
        res.send('Error, wrong validation token');
    }
})

app.post('/facebook', function(req, res) {
    // console.log('\n\n\n\n\n\nRES: ', res,'\n\n\n\n\n\n\n')
    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            text = event.message.text;
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

        } else if (event.postback) {
            var postback = JSON.parse(event.postback.payload);
            console.log('\n\n\npostback: ', postback,'\n\n\n');
            db.Messages.find({
                thread_id: postback.dataId
            }).sort('-ts').exec(function(err, messages) {
                if (err) return console.error(err);
                if (messages.length == 0) {
                    return console.log('No message found');
                } else if (messages[0]) {
                    co(function*() {
                        var msg = messages[0];
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
                                        console.log(message);
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
                                if (postback.action == 'add') {
                                    console.log('add --> postback: ', postback);
                                    // if (!postback.initial) {
                                    //      var img_card = {
                                    //          "recipient": {
                                    //             "id": msg.source.channel
                                    //         }, 
                                    //         "message":{
                                    //             "attachment":{
                                    //               "type":"image",
                                    //               "payload":{
                                    //                 "url": 'http://kipthis.com/kip_modes/mode_success.png'
                                    //               }
                                    //             }
                                    //           },
                                    //           "notification_type": "NO_PUSH"
                                    //     };

                                    //     request.post({
                                    //         url: 'https://graph.facebook.com/v2.6/me/messages',
                                    //         qs: {
                                    //             access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
                                    //         },
                                    //         method: "POST",
                                    //         json: true,
                                    //         headers: {
                                    //             "content-type": "application/json",
                                    //         },
                                    //         body: img_card
                                    //     }, function(err, res, body) {
                                    //         if (err) console.error('post err ', err);
                                    //         console.log(body);
                                    //         var new_message = new db.Message({
                                    //             incoming: true,
                                    //             thread_id: msg.thread_id,
                                    //             resolved: false,
                                    //             user_id: msg.user_id,
                                    //             origin: msg.origin,
                                    //             text: 'save ' + postback.selected,
                                    //             source: msg.source,
                                    //             amazon: msg.amazon,
                                    //             searchSelect: [postback.selected]
                                    //       });
                                    //         // queue it up for processing
                                    //         var message = new db.Message(new_message);
                                    //         message.save().then(() => {
                                    //             queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    //         });
                                    //     })
                                    // } else {
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
                                    // }
                        
                                } else if (postback.action === 'remove') {
                                        //  var img_card = {
                                        //      "recipient": {
                                        //         "id": msg.source.channel
                                        //     }, 
                                        //     "message":{
                                        //         "attachment":{
                                        //           "type":"image",
                                        //           "payload":{
                                        //             "url": 'http://kipthis.com/kip_modes/mode_success.png'
                                        //           }
                                        //         }
                                        //       },
                                        //       "notification_type": "NO_PUSH"
                                        // };
                                        // request.post({
                                        //     url: 'https://graph.facebook.com/v2.6/me/messages',
                                        //     qs: {
                                        //         access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
                                        //     },
                                        //     method: "POST",
                                        //     json: true,
                                        //     headers: {
                                        //         "content-type": "application/json",
                                        //     },
                                        //     body: img_card
                                        // }, function(err, res, body) {
                                        //     if (err) console.error('post err ', err);
                                        //     console.log(body);
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
                                        // })
                                
                                } else if (postback.action === 'list') {
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
                                      var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: 'similar ' + postback.selected,
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
                                      var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: msg.user_id,
                                        origin: msg.origin,
                                        text: 'empty cart',
                                        source: msg.source,
                                        amazon: msg.amazon
                                      });
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
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
                                // console.log('hitting 367', msg);
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
                }
            }); // end of db.find
        }
    }
    res.sendStatus(200);


     

});



//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.facebook');
queue.topic('outgoing.facebook').subscribe(outgoing => {
    console.log('facebook outgoing message');
    console.log(outgoing);
    // var data = outgoing.data;
    var fbtoken = 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'

    try {
        console.log('outgoing message');
        console.log(outgoing);
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

    function send_results(channel, text, results, outgoing) {

        console.log('this is what a non-clothing product looks like: ', JSON.stringify(results[0]));

        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": results[0].title,
                        "image_url": (results[0].image_url.indexOf('http') > -1 ? results[0].image_url : 'http://kipthis.com/images/header_partners.png'),
                        "buttons": [{
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 1,
                                ts: outgoing.data.ts,
                                initial: true
                            })
                        },
                        {
                            "type": "web_url",
                            "url": results[0].title_link,
                            "title": "View on Amazon"
                        }, 
                        {
                            "type": "postback",
                            "title": "Details",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "focus",
                                selected: 1,
                                ts: outgoing.data.ts
                            })
                        }],
                    }, {
                        "title": results[1].title,
                        "image_url": (results[1].image_url.indexOf('http') > -1 ? results[1].image_url : 'http://kipthis.com/images/header_partners.png'),
                        "buttons": [{
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 2,
                                ts: outgoing.data.ts,
                                initial: true
                            })
                        },
                        {
                            "type": "web_url",
                            "url": results[1].title_link,
                            "title": "View on Amazon"
                        }, 
                        {
                            "type": "postback",
                            "title": "Details",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "focus",
                                selected: 2,
                                ts: outgoing.data.ts
                            })
                        }],
                    }, {
                        "title": results[2].title,
                        "image_url": ((results[2].image_url.indexOf('http') > -1) ? results[2].image_url : 'http://kipthis.com/images/header_partners.png'),
                        "buttons": [{
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 3,
                                ts: outgoing.data.ts,
                                initial: true
                            })
                        },
                        {
                            "type": "web_url",
                            "url": results[2].title_link,
                            "title": "View on Amazon"
                        }, 
                        {
                            "type": "postback",
                            "title": "Details",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "focus",
                                selected: 3,
                                ts: outgoing.data.ts
                            })
                        }],
                    },
                    {
                        "title": 'Click the See More button to view more results from Kip',
                        "image_url":  'http://kipthis.com/images/header_family.png',
                        "buttons": [{
                            "type": "postback",
                            "title": "See More Results",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "more",
                                ts: outgoing.data.ts
                            })
                        },
                        {
                            "type": "postback",
                            "title": "Home 🐧",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "home",
                                ts: outgoing.data.ts
                            })
                        }],
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
                    id: channel
                },
                message: messageData,
            }
        }, function(err, res, body) {
            if (err) console.error('post err ', err);
            console.log(body);
            outgoing.ack();
        });

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
                        "title": focus_info.title,
                        "item_url": focus_info.title_link,
                        "image_url": focus_info.image_url, 
                        "subtitle": focus_info.price,
                      }
                    ]
                  }
                }
              },
              "notification_type": "NO_PUSH"
        }

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
                                action: "add",
                                selected: focus_info.selected,
                                ts: outgoing.data.ts
                            })
                        },
                        {
                            "type": "postback",
                            "title": "Similar",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "similar",
                                selected: focus_info.selected,
                                ts: outgoing.data.ts
                            })
                        },{
                                "type": "web_url",
                                "url": focus_info.title_link,
                                "title": 'View on Amazon'
                            }
                        ],
                         
                        "text": (focus_info.description + '\n' + focus_info.reviews).substring(0,300)
                    }
                }
            },
            "notification_type": "NO_PUSH"
        };

         request.post({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {
                access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
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
            request.post({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {
                    access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
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
            })
        })
    }

    function send_cart(channel, text, outgoing) {
          var cart = outgoing.data.data;
          // console.log(cart);
          var cartDisplay = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": []
                }
              }
          };
          console.log('facebook.js-send_cart()-cart: ', cart)
        for (var i = 0; i < cart.aggregate_items.length; i++) {
            var item = cart.aggregate_items[i];
            var userString = item.added_by.map(function(u) {
              return 'u';
            }).join(', ');
            var cart_item = {
                "title":  `${item.title}`,
                "subtitle": 'Price: ' + item.price + "\nQuantity:" + item.quantity,
                "image_url": item.image,
                "buttons":[
                    { "type": "postback", 
                      "title": "➕", 
                      "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "add" ,"selected": (i + 1), initial: false })
                    },
                    { "type": "postback", 
                      "title": "➖", 
                      "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "remove" ,"selected": (i + 1), initial: false})
                    },
                    { "type": "postback", 
                      "title": "Empty Cart", 
                      "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "empty", initial: false})
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
          })

    }

})
