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
 * This function sends focus to user
 * @param {string} channel: facebook api sender id
 * @param {string} text: self explanatory
 * @param {object} outgoing: the entire outgoing message object
 * @param {string} fbtoken: facebook send api token
 */
 
var send_focus = function* (channel, text, focus_info, outgoing, fbtoken) {
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

module.exports = send_focus;
