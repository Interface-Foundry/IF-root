var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db');
var Chatuser = db.Chatuser;
var _ = require('lodash');
var http = require('http');
var request = require('request');
var async = require('async');
var fs = require('fs');
//set env vars
var config = require('../../../config');
var quiz = require('./onboard_quiz');

/**
 * This function sends cart to user
 * @param {string} channel: facebook api sender id
 * @param {string} text: self explanatory
 * @param {object} outgoing: the entire outgoing message object
 * @param {string} fbtoken: facebook send api token
 */
 
var send_cart = function* (channel, text, outgoing, fbtoken) {
    var cart = outgoing.data.data;
    console.log('getting to send_cart, cart: ', cart)
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

module.exports = send_cart;
