
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
var quiz = require('./onboard_quiz');

/**
 * This function sends a welcome message plus suggested search buttons
 * @param {string} input raw sender id sent from fb
 */
var  send_card = function(bd,sendTo, fbtoken){
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


var send_suggestions_card = function(sender, fbtoken) {

    var card = {
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
            body: card
        }, function(err, res, body) {
            if (err) {console.error('post err ', err); 
              return false;
            } else{
                return true;
            }
        });

}



/**
 * This function sends a welcome message plus suggested search buttons
 * @param {string} input raw sender id sent from fb
 */
var set_menu = function(sender, fbtoken) {

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
              "title":"Retake Quiz",
              "payload":JSON.stringify({
                    action: "take_quiz"
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
           if (err) return false
            else {
                return true
            }
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

}

var send_typing_indicator = function(sender, fbtoken) {
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

var get_last_message = function*(sender) {
    var result = yield db.Messages.find({
        thread_id: 'facebook_' + sender.toString()
    }).sort('-ts').exec()
    if (result[0]) return result[0];
    else return false
}


var send_story = function (userid_z,recipient,pointer, sender, fbtoken){
    console.log('SENDING STORY ',userid_z)

    var storySender;
        //start from beginning of we dont have a pointer
        if(!pointer){
            pointer = 0;
        }

        console.log('@ @ @ @ @ @ story pointer @ @ @ @ @  ',pointer)
        //if(pointer || pointer == 0){
        var storySender = quiz[pointer];
        console.log('WHAT IS IT???? ',JSON.stringify(storySender))
        storySender.recipient = {
            id: recipient
        };
        console.log('story SENDER FINAL ',storySender)
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
    })
}


module.exports = { 
  send_card: send_card, 
  send_typing_indicator: send_typing_indicator, 
  get_last_message: get_last_message,
  set_menu: set_menu,
  send_suggestions_card: send_suggestions_card,
  send_story: send_story
}
