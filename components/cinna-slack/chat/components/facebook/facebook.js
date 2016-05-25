var telegram = require('telegram-bot-api');
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
process.on('uncaughtException', function (err) {
  console.error('uncaught exception', new Date())
  console.error(err.stack);
});
var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/static'))
app.get('/healthcheck', function (req, res) {
  res.send('💬 🌏')
})
//parse incoming body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
server.listen(8444, function(e) {
  if (e) { console.error(e) }
  console.log('chat app listening on port 8000 🌏 💬')
})

app.get('/facebook', function (req, res) {
  var fbtoken = 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD';
  if (req.query['hub.verify_token'] === fbtoken) {
    //bot stuff
    res.send(req.query['hub.challenge']);
  }
  else {res.send('Error, wrong validation token'); }
})

app.post('/facebook', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      console.log(JSON.stringify(req.body));
      var message = new db.Message({
        incoming: true,
        thread_id: "facebook_" + sender.toString() + Date.now(),
        original_text: text,
        user_id: "facebook_" + sender.toString(),
        origin: 'facebook',
        source: {
              'origin':'facebook',
              'channel': sender.toString(),
              'org': "facebook_" + sender.toString(),
              'id':"facebook_" + sender.toString(),
              'user': sender.toString()
          }
      });

      // clean up the text
      message.text = message.original_text.trim(); //remove extra spaces on edges of string

      // queue it up for processing
      message.save().then(() => {
        queue.publish('incoming', message, ['facebook', sender.toString(), Date.now()].join('.'))
      });
   
    }
    else if (event.postback) {
       var postback= JSON.parse(event.postback.payload);
       console.log('postback: ', postback)
        db.Message.findById(postback.dataId, function (err, msg) {
            if(err){
                console.log('Error: Cannot find initial search for recallHistory');
            }
            else {
                if (msg && msg.amazon){
                    var tempArr = msg.amazon; //lmao amazon
                    msg.amazon = [];
                    async.eachSeries(tempArr, function(item, callback2) {
                        msg.amazon.push(JSON.parse(item)); //ughhhh
                        callback2();
                    }, function done(err){
                        if (err) console.error(err);

                        if (postback.action === 'add') {
                          var newMsg = {};
                          newMsg.source = msg.source;
                          newMsg.msg = 'save ' + postback.selected;
                          newMsg.bucket = 'purchase';
                          newMsg.action = 'add';
                          newMsg.tokens = [newMsg.msg];
                          newMsg.thread = msg.thread;
                          newMsg.thread.sequence += 1;
                          newMsg.incoming = true;
                          // newMsg.amazon = msg.amazon;
                          newMsg.recallHistory = msg.recallHistory;
                          // newMsg.searchSelect = [];
                          // newMsg.searchSelect.push(postback.selected);
                          newMsg.source =  {
                              'origin':'facebook',
                              'channel': sender.toString(),
                              'org': "facebook_" + sender.toString(),
                              'id':"facebook_" + sender.toString(),
                              'user': sender.toString()
                          };
                          ioKip.preProcess(newMsg);
                        }
                        else if (postback.action === 'remove') {
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
                          newMsg.source =  {
                              'origin':'facebook',
                              'channel': sender.toString(),
                              'org': "facebook_" + sender.toString(),
                              'id':"facebook_" + sender.toString(),
                              'user': sender.toString()
                          };
                          ioKip.incomingAction(newMsg);
                        }
                        else if (postback.action === 'list') {
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
                          newMsg.source =  {
                              'origin':'facebook',
                              'channel': sender.toString(),
                              'org': "facebook_" + sender.toString(),
                              'id':"facebook_" + sender.toString(),
                              'user': sender.toString()
                          };
                          ioKip.preProcess(newMsg);
                        }
                    });
                }
                else {
                  console.log('NO MSG FOUND OMG: ',event.postback.dataId)
                }
            }
        });
    }
  }
  res.sendStatus(200);
});

//
// Mechanism for responding to messages
//
kip.debug('subscribing to outgoing.facebook hopefully');
queue.topic('outgoing.facebook').subscribe(outgoing => {
  console.log('facebook outgoing message');
  console.log(outgoing);
  var data = outgoing.data;
  var fbtoken = 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'
      if (data.action == 'initial' || data.action == 'modify' || data.action == 'similar' || data.action == 'more') {
        console.log(0, data.client_res);

             var messageData = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": [{
                      "title": data.client_res[1].message,
                      "image_url": data.client_res[1].photo,
                      "buttons": [{
                        "type": "web_url",
                        "url": data.client_res[1].link,
                        "title": "Product Link"
                      }, {
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload": JSON.stringify({dataId: data.searchId, action: "add", selected: 1})
                      }],
                    },{
                      "title": data.client_res[2].message,
                      "image_url": data.client_res[2].photo,
                      "buttons": [{
                        "type": "web_url",
                        "url": data.client_res[2].link,
                        "title": "Product Link"
                      }, {
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload": JSON.stringify({dataId: data.searchId, action: "add", selected: 2})
                      }],
                    },{
                      "title": data.client_res[3].message,
                      "image_url": data.client_res[3].photo,
                      "buttons": [{
                        "type": "web_url",
                        "url": data.client_res[3].link,
                        "title": "Product Link"
                      }, {
                        "type": "postback",
                        "title": "Add to Cart",
                        "payload": JSON.stringify({dataId: data.searchId, action: "add", selected: 3})
                      }],
                    }]
                  }
                }
              };

            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: fbtoken},
                method: 'POST',
                json: {
                  recipient: {id: data.source.channel},
                  message: messageData,
                }
              }, function (err, res, body) {
                    if (err) console.error('post err ',err);
                    console.log(body)
             });
        }
        else if (data.action == 'focus') {

           console.log('facebook outgoing client_res:', data);

           try {
             var formatted = data.client_res[1].split('|')[1].split('>')[0] + '\n' + data.client_res[1].split('|')[0].split('<')[1];
             formatted = formatted.slice(0,-1);
           } catch(err) {
             console.log('io.js 1269 err: ',err);
             return;
           }
          data.client_res[1] = formatted ? formatted : data.client_res[1];
          var toSend = truncate(data.client_res[1]) + '\n' + (data.client_res[2] ? truncate(data.client_res[2]) : '') + '\n'  + (data.client_res[3] ? truncate(data.client_res[3]) : '') + '\n' + (data.client_res[4] ? truncate(data.client_res[4]) : '');
            var focusMessage = {
                "recipient": {"id": data.source.channel},
                "message": {
                     "attachment":{
                      "type":"template",
                      "payload":{
                        "template_type":"button",
                        "buttons":[
                          {
                            "type":"web_url",
                            "url": data.recallHistory.urlShorten[parseInt(data.msg.trim())-1],
                            "title": "See Product"
                          }
                        ],
                        "text": toSend
                      }
                    }
                },
                "notification_type": "NO_PUSH"
             };
            // console.log(url, focusMessage)
            request.post({ 
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: 'EAAT6cw81jgoBAFtp7OBG0gO100ObFqKsoZAIyrtClnNuUZCpWtzoWhNVZC1OI2jDBKXhjA0qPB58Dld1VrFiUjt9rKMemSbWeZCsbuAECZCQaom2P0BtRyTzpdKhrIh8HAw55skgYbwZCqLBSj6JVqHRB6O3nwGsx72AwpaIovTgZDZD'},
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: focusMessage
            }, function (err, res, body) {
               if (err) console.error('post err ',err);
               console.log(body)
            })

        }
         else if (data.action == 'save') {
            console.log('\n\n\nFacebook SAVE Client_res: ', JSON.stringify(data.client_res));
            data.msg = 'view cart';
            data.bucket = 'purchase';
            data.action = 'list';
            var message = new db.Message({
              msg: 'view cart',
              bucket: 'purchase',
              action: 'list',
              incoming: true,
              thread_id: "facebook_" + sender.toString() + Date.now(),
              original_text: 'view cart',
              text: 'view cart',
              user_id: "facebook_" + sender.toString(),
              origin: 'facebook',
              source: {
                    'origin':'facebook',
                    'channel': sender.toString(),
                    'org': "facebook_" + sender.toString(),
                    'id':"facebook_" + sender.toString(),
                    'user': sender.toString()
                }
            });
            message.save().then(() => {
              queue.publish('incoming', message, ['facebook', sender.toString(), Date.now()].join('.'))
            });
        }
        else if (data.action == 'checkout') {
            var message = {
                    "recipient": {"id": data.source.channel},
                    "message": {
                        "text": data.client_res[0][data.client_res[0].length-1].text
                    },
                    "notification_type": "NO_PUSH"
                };
            request.post({ 
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: fbtoken},
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
            body: message
            },
            function (err, res, body) {
                if (err) console.log('post err ',err);
                console.log(body);
            })
        }
        else if (data.action === 'remove') {
            console.log('\n\n\nFacebook SAVE Client_res: ', JSON.stringify(data.client_res));
            data.msg = 'view cart';
            data.bucket = 'purchase';
            data.action = 'list';
            var message = new db.Message({
              msg: 'view cart',
              bucket: 'purchase',
              action: 'list',
              incoming: true,
              thread_id: "facebook_" + sender.toString() + Date.now(),
              original_text: 'view cart',
              text: 'view cart',
              user_id: "facebook_" + sender.toString(),
              origin: 'facebook',
              source: {
                    'origin':'facebook',
                    'channel': sender.toString(),
                    'org': "facebook_" + sender.toString(),
                    'id':"facebook_" + sender.toString(),
                    'user': sender.toString()
                }
            });
            message.save().then(() => {
              queue.publish('incoming', message, ['facebook', sender.toString(), Date.now()].join('.'))
            });
        }
        else if (data.action === 'list') {
            console.log('FACEBOOK LIST', JSON.stringify(data.client_res), data.action, data.bucket)
            if (data.client_res.length === 0) {
                var emptyMessage = {
                    "recipient": {"id": data.source.channel},
                    "message": {
                        "text": "Your Cart is empty!"
                        // messages.join('\n')
                    },
                    "notification_type": "NO_PUSH"
                };
               request.post({ 
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: fbtoken},
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: emptyMessage
                },
                function (err, res, body) {
                    if (err) console.log('post err ',err);
                    console.log(body);

                    })
                   return;
            }

            data.client_res[0].shift();
            data.client_res[0].shift();
              var cartDisplay = {
                "attachment": {
                  "type": "template",
                  "payload": {
                    "template_type": "generic",
                    "elements": []
                  }
                }
            };
            var count = 0;
            data.client_res[0].forEach(function(el) {
                if (el.text && el.text.title && el.text.price && el.text.quantity) {
                    var cart_item = {
                      "title": el.text.title,
                      "subtitle": 'Price: ' + el.text.price + "\nQuantity:" + el.text.quantity,
                      "buttons":[
                          { "type": "postback", 
                            "title": "➕", 
                            "payload": JSON.stringify({"dataId": data.searchId, "action": "add" ,"selected": (count + 1) })
                          },
                          { "type": "postback", 
                            "title": "➖", 
                            "payload": JSON.stringify({"dataId": data.searchId, "action": "remove" ,"selected": (count + 1) })
                          }
                      ]
                    }
                    if (el.thumb_url) {
                      cart_item.image_url =  el.thumb_url;
                    }
                     cartDisplay.attachment.payload.elements.push(cart_item);
                     count++;
                }
            })

            request.post({ 
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: fbtoken},
                method: "POST",
                json: {
                  recipient: {id: data.source.channel},
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
        else if (data.action == 'smalltalk') {
         var message = {
                "recipient": {"id": data.source.channel},
                "message": {
                    "text": data.client_res[0]
                },
                "notification_type": "NO_PUSH"
            };
           request.post({ 
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: fbtoken},
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: message
            },
            function (err, res, body) {
                if (err) console.log('post err ',err);
                console.log(body);
            })
        }
        else {
           // console.log('ELSE data.client_res: ',data.client_res);
           var message = {
                "recipient": {"id": data.source.channel},
                "message": {
                    "text": data.text
                },
                "notification_type": "NO_PUSH"
            };
           request.post({ 
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: fbtoken},
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: message
            },
            function (err, res, body) {
                if (err) console.log('post err ',err);
                console.log(body);
            })
        }
})
