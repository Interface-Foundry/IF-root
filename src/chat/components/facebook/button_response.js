var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db')
var _ = require('lodash');
var request = require('request');
var async = require('async');

module.export = function send_button_response(messages) {
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
                        if (!postback.initial) {
                             var img_card = {
                                 "recipient": {
                                    "id": msg.source.channel
                                }, 
                                "message":{
                                    "attachment":{
                                      "type":"image",
                                      "payload":{
                                        "url": 'http://kipthis.com/kip_modes/mode_success.png'
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
                                console.log(body);
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
                            })
                        } else {
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
            
                    } else if (postback.action === 'remove') {
                             var img_card = {
                                 "recipient": {
                                    "id": msg.source.channel
                                }, 
                                "message":{
                                    "attachment":{
                                      "type":"image",
                                      "payload":{
                                        "url": 'http://kipthis.com/kip_modes/mode_success.png'
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
                                console.log(body);
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
                            })
                    
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
                    } else if (postback.action === 'focus') {
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
                    console.log('hitting 367', msg);
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
        }) // end of db.find 


}