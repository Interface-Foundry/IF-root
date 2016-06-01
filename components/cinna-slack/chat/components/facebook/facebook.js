
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
            console.log('postback: ', postback);
            db.Messages.find({
                thread_id: postback.dataId
            }).sort('-ts').exec(function(err, messages) {
                if (err) return console.error(err);
                if (messages.length == 0) {
                    return console.log('NO MSG FOUND OMG: ', event.postback.dataId)
                } else if (messages[0]) {
                    co(function*() {
                        var msg = messages[0];
                         //
                        // Returns the amazon results as it is stored in the db (json string)
                        // Recalls more history from the db if it needs to, and the history is just appended
                        // to the existing history so you don't need to worry about stuff getting too messed up.
                        //
                        function* getLatestAmazonResults(message) {
                            message.history = [];
                            var results,
                                i = 0;
                            while (!results) {
                                console.log('message.thread_id: ', message.thread_id)
                                if (!message.history[i]) {
                                    var more_history = yield db.Messages.find({
                                        thread_id: message.thread_id,
                                        ts: {
                                            $lte: message.ts
                                        }
                                    }).sort('-ts').skip(i).limit(20);

                                    if (more_history.length === 0) {
                                        console.log(message);
                                        throw new Error('Could not find amazon results in message history for message ' + message._id)
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
                            console.log(0, postback.action);
                                if (typeof msg.amazon  == 'string') {
                                    //WHERE I LEFT OFF
                                    msg.amazon = JSON.parse(msg.amazon); //lmao amazon
                                }
                                if (postback.action === 'add') {
                                    console.log(1)
                                     var new_message = new db.Message({
                                        incoming: true,
                                        thread_id: msg.thread_id,
                                        resolved: false,
                                        user_id: 'kip',
                                        origin: msg.origin,
                                        text: 'save ' + postback.selected,
                                        source: msg.source,
                                        amazon: msg.amazon,
                                        searchSelect: [postback.selected]
                                      });
                                    // var newMsg = {};
                                    // newMsg.source = msg.source;
                                    // newMsg.thread_id = msg.thread_id
                                    // newMsg.msg = 'save ' + postback.selected;
                                    // newMsg.text = newMsg.msg;
                                    // newMsg.bucket = 'purchase';
                                    // newMsg.action = 'add';
                                    // newMsg.tokens = [newMsg.msg];
                                    // newMsg.thread = msg.thread;
                                    // newMsg.thread.sequence += 1;
                                    // newMsg.incoming = true;
                                    // newMsg.amazon = msg.amazon;
                                    // newMsg.recallHistory = msg.amazon;
                                    // newMsg.searchSelect = [];
                                    // newMsg.searchSelect.push(postback.selected);
                                    // newMsg.source = {
                                    //     'origin': 'facebook',
                                    //     'channel': sender.toString(),
                                    //     'org': "facebook_" + sender.toString(),
                                    //     'id': "facebook_" + sender.toString(),
                                    //     'user': sender.toString()
                                    // };
                                    // queue it up for processing
                                    var message = new db.Message(new_message);
                                    message.save().then(() => {
                                        console.log(3)

                                        queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                                    });
                                // ioKip.preProcess(newMsg);
                                } else if (postback.action === 'remove') {
                                    var newMsg = {};
                                    newMsg.source = msg.source;
                                    newMsg.msg = 'remove ' + postback.selected;
                                    newMsg.bucket = 'purchase';
                                    newMsg.action = 'remove';
                                    newMsg.tokens = [newMsg.msg];
                                    newMsg.thread = msg.thread;
                                    newMsg.thread.sequence += 1;
                                    newMsg.incoming = true;
                                    newMsg.recallHistory = msg.recallHistory;
                                    newMsg.amazon = msg.amazon;
                                    newMsg.searchSelect = [];
                                    newMsg.searchSelect.push(postback.selected);
                                    newMsg.source = {
                                        'origin': 'facebook',
                                        'channel': sender.toString(),
                                        'org': "facebook_" + sender.toString(),
                                        'id': "facebook_" + sender.toString(),
                                        'user': sender.toString()
                                    };
                                    ioKip.incomingAction(newMsg);
                                } else if (postback.action === 'list') {
                                    var newMsg = {};
                                    newMsg.source = msg.source;
                                    newMsg.msg = 'view cart';
                                    newMsg.bucket = 'purchase';
                                    newMsg.action = 'list';
                                    newMsg.tokens = [newMsg.msg];
                                    newMsg.thread = msg.thread;
                                    newMsg.thread.sequence += 1;
                                    newMsg.incoming = true;
                                    newMsg.amazon = msg.amazon;
                                    newMsg.source = {
                                        'origin': 'facebook',
                                        'channel': sender.toString(),
                                        'org': "facebook_" + sender.toString(),
                                        'id': "facebook_" + sender.toString(),
                                        'user': sender.toString()
                                    };
                                    ioKip.preProcess(newMsg);
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

            if (message.mode === 'shopping' && message.action === 'focus' && message.focus) {
                console.log('focus message :', message);
                return_data = yield focus(message);
                return send_focus(message.source.channel, message.text, return_data, outgoing);
            }

            if (message.mode === 'cart' && message.action === 'view') {
                return send_cart(message.source.channel, message.text, outgoing); 
            }



            outgoing.ack();

        }).then(() => {
            outgoing.ack();
        }).catch(e => {
            console.log(e);
            // bot.rtm.sendMessage("I'm sorry I couldn't quite understand that", message.source.channel, () => {
            outgoing.ack();
        // })
        })
    } catch ( e ) {
        kip.err(e);
    }


    function send_results(channel, text, results, outgoing) {
        // console.log('\n\ndataId: ', outgoing.data.searchId, '\n\n');
        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": results[0].title,
                        "image_url": results[0].image_url,
                        "buttons": [{
                            "type": "web_url",
                            "url": results[0].title_link,
                            "title": "View on Amazon"
                        }, {
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 1,
                                ts: outgoing.data.ts
                            })
                        }],
                    }, {
                        "title": results[1].title,
                        "image_url": results[1].image_url,
                        "buttons": [{
                            "type": "web_url",
                            "url": results[1].title_link,
                            "title": "View on Amazon"
                        }, {
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 2,
                                ts: outgoing.data.ts
                            })
                        }],
                    }, {
                        "title": results[2].title,
                        "image_url": results[2].image_url,
                        "buttons": [{
                            "type": "web_url",
                            "url": results[2].title_link,
                            "title": "View Amazon"
                        }, {
                            "type": "postback",
                            "title": "Add to Cart",
                            "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "add",
                                selected: 3,
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
            console.log(body)
            outgoing.ack();
        });

    }

    function send_focus(channel, text, results, outgoing) {
        var messageData = {
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
                                "url": results[0].title_link,
                                "title": "See Product"
                            }
                        ],
                        "text": results[1].text
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
            body: messageData
        }, function(err, res, body) {
            if (err) console.error('post err ', err);
            console.log(body)
        })
    }

    function send_cart(channel, text, outgoing) {
          var cart = outgoing.data.data;
          console.log(cart);
          var cartDisplay = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": []
                }
              }
          };
        for (var i = 0; i < cart.aggregate_items.length; i++) {
            var item = cart.aggregate_items[i];
            var userString = item.added_by.map(function(u) {
              return 'u';
            }).join(', ');
            var cart_item = {
                "title":  `${item.title} added by: ${userString}`,
                "subtitle": 'Price: ' + item.price + "\nQuantity:" + item.quantity,
                "image_url": item.image,
                "buttons":[
                    { "type": "postback", 
                      "title": "➕", 
                      "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "add" ,"selected": (i + 1) })
                    },
                    { "type": "postback", 
                      "title": "➖", 
                      "payload": JSON.stringify({"dataId": outgoing.data.thread_id, "action": "remove" ,"selected": (i + 1) })
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


        // console.log('firing send_cart: ', JSON.stringify(cart));
        // { _id: 574f2acf49b8bac669c05f81,
        //      __v: 0,
        //      amazon:
        //       { Request: [Object],
        //         CartId: [Object],
        //         HMAC: [Object],
        //         URLEncodedHMAC: [Object],
        //         PurchaseURL: [Object],
        //         SubTotal: [Object],
        //         CartItems: [Object] },
        //      link: 'http://goo.gl/n6SeM6',
        //      created_date: Wed Jun 01 2016 14:34:55 GMT-0400 (EDT),
        //      deleted: false,
        //      purchased: false,
        //      items: [ [Object] ],
        //      total: '$19.43',
        //      aggregate_items: [ [Object] ],
        //      id: '574f2acf49b8bac669c05f81' },
        //   __v: 0 }

    //       if (data.client_res.length === 0) {
    //           var emptyMessage = {
    //               "recipient": {"id": data.source.channel},
    //               "message": {
    //                   "text": "Your Cart is empty!"
    //                   // messages.join('\n')
    //               },
    //               "notification_type": "NO_PUSH"
    //           };
    //          request.post({ 
    //           url: 'https://graph.facebook.com/v2.6/me/messages',
    //           qs: {access_token: fbtoken},
    //           method: "POST",
    //           json: true,
    //           headers: {
    //               "content-type": "application/json",
    //           },
    //           body: emptyMessage
    //           },
    //           function (err, res, body) {
    //               if (err) console.log('post err ',err);
    //               console.log(body);

    //               })
    //              return;
    //       }

    //       data.client_res[0].shift();
    //       data.client_res[0].shift();
    //         var cartDisplay = {
    //           "attachment": {
    //             "type": "template",
    //             "payload": {
    //               "template_type": "generic",
    //               "elements": []
    //             }
    //           }
    //       };
    //       var count = 0;
    //       data.client_res[0].forEach(function(el) {
    //           if (el.text && el.text.title && el.text.price && el.text.quantity) {
    //               var cart_item = {
    //                 "title": el.text.title,
    //                 "subtitle": 'Price: ' + el.text.price + "\nQuantity:" + el.text.quantity,
    //                 "buttons":[
    //                     { "type": "postback", 
    //                       "title": "➕", 
    //                       "payload": JSON.stringify({"dataId": data.searchId, "action": "add" ,"selected": (count + 1) })
    //                     },
    //                     { "type": "postback", 
    //                       "title": "➖", 
    //                       "payload": JSON.stringify({"dataId": data.searchId, "action": "remove" ,"selected": (count + 1) })
    //                     }
    //                 ]
    //               }
    //               if (el.thumb_url) {
    //                 cart_item.image_url =  el.thumb_url;
    //               }
    //                cartDisplay.attachment.payload.elements.push(cart_item);
    //                count++;
    //           }
    //       })

    

    }



    // if (data.action == 'focus') {

    //      console.log('facebook outgoing client_res:', data);

    //      try {
    //        var formatted = data.client_res[1].split('|')[1].split('>')[0] + '\n' + data.client_res[1].split('|')[0].split('<')[1];
    //        formatted = formatted.slice(0,-1);
    //      } catch(err) {
    //        console.log('io.js 1269 err: ',err);
    //        return;
    //      }
    //     data.client_res[1] = formatted ? formatted : data.client_res[1];
    //     var toSend = truncate(data.client_res[1]) + '\n' + (data.client_res[2] ? truncate(data.client_res[2]) : '') + '\n'  + (data.client_res[3] ? truncate(data.client_res[3]) : '') + '\n' + (data.client_res[4] ? truncate(data.client_res[4]) : '');
    //       var focusMessage = {
    //           "recipient": {"id": data.source.channel},
    //           "message": {
    //                "attachment":{
    //                 "type":"template",
    //                 "payload":{
    //                   "template_type":"button",
    //                   "buttons":[
    //                     {
    //                       "type":"web_url",
    //                       "url": data.recallHistory.urlShorten[parseInt(data.msg.trim())-1],
    //                       "title": "See Product"
    //                     }
    //                   ],
    //                   "text": toSend
    //                 }
    //               }
    //           },
    //           "notification_type": "NO_PUSH"
    //        };
    //       // console.log(url, focusMessage)
    //       request.post({ 
    //           url: 'https://graph.facebook.com/v2.6/me/messages',
    //           qs: {access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'},
    //           method: "POST",
    //           json: true,
    //           headers: {
    //               "content-type": "application/json",
    //           },
    //           body: focusMessage
    //       }, function (err, res, body) {
    //          if (err) console.error('post err ',err);
    //          console.log(body)
    //       })

    //   }
    //    else if (data.action == 'save') {
    //       console.log('\n\n\nFacebook SAVE Client_res: ', JSON.stringify(data.client_res));
    //       data.msg = 'view cart';
    //       data.bucket = 'purchase';
    //       data.action = 'list';
    //       var message = new db.Message({
    //         msg: 'view cart',
    //         bucket: 'purchase',
    //         action: 'list',
    //         incoming: true,
    //         thread_id: "facebook_" + sender.toString() + Date.now(),
    //         original_text: 'view cart',
    //         text: 'view cart',
    //         user_id: "facebook_" + sender.toString(),
    //         origin: 'facebook',
    //         source: {
    //               'origin':'facebook',
    //               'channel': sender.toString(),
    //               'org': "facebook_" + sender.toString(),
    //               'id':"facebook_" + sender.toString(),
    //               'user': sender.toString()
    //           }
    //       });
    //       message.save().then(() => {
    //         queue.publish('incoming', message, ['facebook', sender.toString(), Date.now()].join('.'))
    //       });
    //   }
    //   else if (data.action == 'checkout') {
    //       var message = {
    //               "recipient": {"id": data.source.channel},
    //               "message": {
    //                   "text": data.client_res[0][data.client_res[0].length-1].text
    //               },
    //               "notification_type": "NO_PUSH"
    //           };
    //       request.post({ 
    //           url: 'https://graph.facebook.com/v2.6/me/messages',
    //           qs: {access_token: fbtoken},
    //           method: "POST",
    //           json: true,
    //           headers: {
    //               "content-type": "application/json",
    //           },
    //       body: message
    //       },
    //       function (err, res, body) {
    //           if (err) console.log('post err ',err);
    //           console.log(body);
    //       })
    //   }
    //   else if (data.action === 'remove') {
    //       console.log('\n\n\nFacebook SAVE Client_res: ', JSON.stringify(data.client_res));
    //       data.msg = 'view cart';
    //       data.bucket = 'purchase';
    //       data.action = 'list';
    //       var message = new db.Message({
    //         msg: 'view cart',
    //         bucket: 'purchase',
    //         action: 'list',
    //         incoming: true,
    //         thread_id: "facebook_" + sender.toString() + Date.now(),
    //         original_text: 'view cart',
    //         text: 'view cart',
    //         user_id: "facebook_" + sender.toString(),
    //         origin: 'facebook',
    //         source: {
    //               'origin':'facebook',
    //               'channel': sender.toString(),
    //               'org': "facebook_" + sender.toString(),
    //               'id':"facebook_" + sender.toString(),
    //               'user': sender.toString()
    //           }
    //       });
    //       message.save().then(() => {
    //         queue.publish('incoming', message, ['facebook', sender.toString(), Date.now()].join('.'))
    //       });
    //   }
    //   else if (data.action === 'list') {
    //       console.log('FACEBOOK LIST', JSON.stringify(data.client_res), data.action, data.bucket)
    //       if (data.client_res.length === 0) {
    //           var emptyMessage = {
    //               "recipient": {"id": data.source.channel},
    //               "message": {
    //                   "text": "Your Cart is empty!"
    //                   // messages.join('\n')
    //               },
    //               "notification_type": "NO_PUSH"
    //           };
    //          request.post({ 
    //           url: 'https://graph.facebook.com/v2.6/me/messages',
    //           qs: {access_token: fbtoken},
    //           method: "POST",
    //           json: true,
    //           headers: {
    //               "content-type": "application/json",
    //           },
    //           body: emptyMessage
    //           },
    //           function (err, res, body) {
    //               if (err) console.log('post err ',err);
    //               console.log(body);

    //               })
    //              return;
    //       }

    //       data.client_res[0].shift();
    //       data.client_res[0].shift();
    //         var cartDisplay = {
    //           "attachment": {
    //             "type": "template",
    //             "payload": {
    //               "template_type": "generic",
    //               "elements": []
    //             }
    //           }
    //       };
    //       var count = 0;
    //       data.client_res[0].forEach(function(el) {
    //           if (el.text && el.text.title && el.text.price && el.text.quantity) {
    //               var cart_item = {
    //                 "title": el.text.title,
    //                 "subtitle": 'Price: ' + el.text.price + "\nQuantity:" + el.text.quantity,
    //                 "buttons":[
    //                     { "type": "postback", 
    //                       "title": "➕", 
    //                       "payload": JSON.stringify({"dataId": data.searchId, "action": "add" ,"selected": (count + 1) })
    //                     },
    //                     { "type": "postback", 
    //                       "title": "➖", 
    //                       "payload": JSON.stringify({"dataId": data.searchId, "action": "remove" ,"selected": (count + 1) })
    //                     }
    //                 ]
    //               }
    //               if (el.thumb_url) {
    //                 cart_item.image_url =  el.thumb_url;
    //               }
    //                cartDisplay.attachment.payload.elements.push(cart_item);
    //                count++;
    //           }
    //       })

    //       request.post({ 
    //           url: 'https://graph.facebook.com/v2.6/me/messages',
    //           qs: {access_token: fbtoken},
    //           method: "POST",
    //           json: {
    //             recipient: {id: data.source.channel},
    //             message: cartDisplay,
    //           },
    //           headers: {
    //               "content-type": "application/json",
    //           }
    //       },
    //       function (err, res, body) {
    //          if (err) console.log('post err ',err);
    //          console.log(body);
    //       })
    //   }
    //   else if (data.action == 'smalltalk') {
    //    var message = {
    //           "recipient": {"id": data.source.channel},
    //           "message": {
    //               "text": data.client_res[0]
    //           },
    //           "notification_type": "NO_PUSH"
    //       };
    //      request.post({ 
    //       url: 'https://graph.facebook.com/v2.6/me/messages',
    //       qs: {access_token: fbtoken},
    //       method: "POST",
    //       json: true,
    //       headers: {
    //           "content-type": "application/json",
    //       },
    //       body: message
    //       },
    //       function (err, res, body) {
    //           if (err) console.log('post err ',err);
    //           console.log(body);
    //       })
    //   }
    //   else {
    //      // console.log('ELSE data.client_res: ',data.client_res);
    //      var message = {
    //           "recipient": {"id": data.source.channel},
    //           "message": {
    //               "text": data.text
    //           },
    //           "notification_type": "NO_PUSH"
    //       };
    //      request.post({ 
    //       url: 'https://graph.facebook.com/v2.6/me/messages',
    //       qs: {access_token: fbtoken},
    //       method: "POST",
    //       json: true,
    //       headers: {
    //           "content-type": "application/json",
    //       },
    //       body: message
    //       },
    //       function (err, res, body) {
    //           if (err) console.log('post err ',err);
    //           console.log(body);
    //       })
    //   }



})
