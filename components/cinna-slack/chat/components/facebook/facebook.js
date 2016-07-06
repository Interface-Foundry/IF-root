
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
process.on('uncaughtException', function(err) {
    console.error('uncaught exception', new Date())
    console.error(err.stack);
});
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var keyfile = process.env.NODE_ENV === 'production' ? __dirname + '/facebook-prod.pfx' : __dirname + '/facebook-dev.pfx';
var httpsServer = require('https').createServer({
  pfx: fs.readFileSync(keyfile)
}, app);
var search_results = require('./search_results');
var focus = require('./focus');
var fbtoken = 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD';
var emojiText = require('emoji-text'); //convert emoji to text
var kipcart = require('../cart');
var process_image = require('../process');

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
httpsServer.listen(4343, function(e) {
  if (kip.err(e)) return;
  console.log('chat app listening on https port 4343')
})

app.get('/facebook', function(req, res) {

    if (req.query['hub.verify_token'] === fbtoken) {
        res.send(req.query['hub.challenge']);
    } else {
        console.log('Error, wrong validation token');
        res.send('Error, wrong validation token');
    }
})

app.post('/facebook', function(req, res) {


      var welcome = { "setting_type":"greeting",
                        "greeting":{ "text":"Welcome to Kip, your personal AI shopping bot!" } }

    request({
            url: "https://graph.facebook.com/v2.6/me/thread_settings",
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: welcome
        }, function(err, body) {
           if (err) console.log('\n\n\n\nWARNING: WELCOME SET ERROR SHIEETTT: ', err)
            // console.log(body)
        });


            // console.log('\n\n\n\n\nFB Messenger raw message POST event: ', JSON.stringify(req.body),'\n\n\n\n\n');
    messaging_events = req.body.entry[0].messaging;
    if (!messaging_events) {
        return console.log('facebook.js messaging events missing:  ', JSON.stringify(req.body.entry[0]));
    }
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
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
        }

        request({
            url: "https://graph.facebook.com/v2.6/me/thread_settings",
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: set_menu
        }, function(err, body) {
           if (err) console.log('\n\n\n\nWARNING: FB SET MENU ERROR SHIEETTT: ', err)
            // console.log(body)
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
            }, function() {
                setTimeout(function(){ 
                     var typing_indicators = {
                          "recipient":{
                            "id": sender.toString()
                          },
                          "sender_action": "typing_off"
                        };
                    request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: {
                            access_token: fbtoken
                        },
                        method: 'POST',
                        json: typing_indicators
                    }, function() {})
                }, 2000);
             })
        }




        if (event.message && event.message.text) {

                 text = event.message.text;
                 text = emojiText.convert(text,{delimiter: ' '});
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
                // })
        }
         else if (!_.get(req.body.entry[0].messaging[i], 'message.sticker_id') && _.get(req.body.entry[0].messaging[i], 'message.attachments[0].type') == 'image') {
            var data = { file: {url_private: req.body.entry[0].messaging[i].message.attachments[0].payload.url}};
             process_image.imageSearch(data,'',function(res){
                console.log('\n\n\n\n\n\n\n\n\nTranslated image',res)
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
            db.Messages.find({
                thread_id: postback.dataId
            }).sort('-ts').exec(function(err, messages) {
                if (err) return console.error(err);
                if (messages.length == 0) {
                    return console.log('No message found');
                } else if (messages[0]) {
                    co(function*() {
                        var msg = messages[0];
                         if (postback.action == 'help') {
                            var help_card = {
                                "recipient": {
                                    "id": msg.source.channel
                                },
                                "message": {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "button",
                                            "buttons": [
                                               {
                                                    "type": "postback",
                                                    "title": "1. Headphones",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "button_search",
                                                        text: 'headphones',
                                                        ts: msg.ts
                                                    })
                                                },
                                                {
                                                   "type": "postback",
                                                    "title": "2. 🐔 🍜",
                                                    "payload": JSON.stringify({
                                                        dataId: msg.thread_id,
                                                        action: "button_search",
                                                        text: '🐔🍜',
                                                        ts: msg.ts
                                                    })
                                                },
                                                {
                                                    "type": "postback",
                                                    "title": "3. Books",
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
                                body: help_card
                            }, function(err, res, body) {
                                if (err) console.error('post err ', err);
                            })
                        }
                        else if (postback.action == 'button_search') {
                            var text = postback.text;
                            text = emojiText.convert(text,{delimiter: ' '});
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
                                if (postback.action == 'add' && postback.initial) {
                                    console.log('add --> postback: ', postback);
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
                                else if (postback.action == 'add' && !postback.initial) {
                                    co(function*() {
                                      console.log('addExtra --> postback: ', postback);
                                      var cart_id = (msg.source.origin === 'facebook') ? msg.source.org : msg.cart_reference_id || msg.source.team;
                                      var cart = yield kipcart.getCart(cart_id);
                                      var unique_items = _.uniqBy( cart.aggregate_items, 'ASIN');
                                      var item = unique_items[parseInt(postback.selected-1)];
                                      console.log('\n\n\n\n\n\\\n\n\nADDING AN EXTRA: ', item);
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
                                    })

                                }
                                else if (postback.action === 'remove') {
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
            else {
                // console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nhmm, shouldnt be getting here.. facebook.js line 466: ', message);
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

        // var typing_obj = {
        //   "recipient":{
        //     "id": channel
        //   },
        //   "sender_action":"typing_on"
        // };


        // request({
        //     url: 'https://graph.facebook.com/v2.6/me/messages',
        //     qs: {
        //         access_token: fbtoken
        //     },
        //     method: 'POST',
        //     json: typing_obj
        // }, function(err, res, body) {
        //     if (err) console.error('typing event err ', err);
            // console.log('typing event body: ',body);

              var giphy_gif = ''

        request('http://api.giphy.com/v1/gifs/search?q=' + outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
            if (err) console.log(err);

            // console.log('GIFY RETURN DATA: ', JSON.parse(body).data[0])
            giphy_gif = JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_width_small.url :  'http://kipthis.com/images/header_partners.png';

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
                                 },
                                // {
                                //     "type": "postback",
                                //     "title": "Home 🐧",
                                //     "payload": JSON.stringify({
                                //         dataId: outgoing.data.thread_id,
                                //         action: "home",
                                //         ts: outgoing.data.ts
                                //     })
                                // }
                                ],
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
                    // console.log(body,'\n\n\n\n\n\n\n\n\nACTUAL RESSSS: ',res);
                    outgoing.ack();
                });
         })
        // })



        // });




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
                                ts: outgoing.data.ts,
                                initial: true
                            })
                        },{
                                "type": "postback",
                                "title": 'Cheaper',
                                "payload": JSON.stringify({
                                    dataId: outgoing.data.thread_id,
                                    action: "cheaper",
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
                        }
                        ],

                        "text": (focus_info.price + '\n' + focus_info.description + '\n' + focus_info.reviews).substring(0,300)
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
            // console.log('\n\n\n\nUNIQUE ITEMMMMS: ', unique_items)
            // var userString = item.added_by.map(function(u) {
            //   return 'u';
            // }).join(', ');
            debugger;
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
                            access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
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
