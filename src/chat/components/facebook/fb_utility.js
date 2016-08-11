
var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db');
var Chatuser = db.Chatuser;
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
var send_card = function(bd,sendTo, fbtoken){
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


//recipient: id
//sender: id
//pointer: which sequence # we're going to
//select: which answer did user pick
var process_story = function*(recipient,sender,pointer,select,fbtoken,fb_memory){

  console.log('process_Story FIRED!!!  stuff: ')
  console.log(recipient,sender,pointer,select,fbtoken,fb_memory )

    //SAVE THIS quiz response TO USERS PERSONA as a session
    var query = {id: 'facebook_'+sender},
        update = { origin:'facebook' },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    Chatuser.findOneAndUpdate(query, update, options, function(err, user) {
        var obj = {
            recipient: recipient,
            sender: sender,
            ts: Date.now(),
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
    if(pointer == quiz.length - 1){

        console.log('FINAL RESULTS !!! ! ! ! ! ! ! ',fb_memory[sender].quiz)

        //console.log('MAXY KEY ',_.max(Object.keys(fb_memory[recipient].quiz), function (o) { return obj[o]; }))

        var item;

        if(fb_memory[sender].quiz >= 0 && fb_memory[sender].quiz <= 3){
            item = 'Flying Sailboat'
            send_image('sailboat.png',sender,fbtoken, function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_card(x,sender, fbtoken);
            });
        }
        else if(fb_memory[sender].quiz >= 4 && fb_memory[sender].quiz <= 7){
            item = 'Lucky Goldfish'
            send_image('goldfish.png',sender,fbtoken, function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_card(x,sender, fbtoken);
            });
        }
        else if(fb_memory[sender].quiz >= 8 && fb_memory[sender].quiz <= 9){
            item = 'Snowglobe Charm'
            send_image('snowglobe.png',sender,fbtoken,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_card(x,sender, fbtoken);
            });
        }
        else if(fb_memory[sender].quiz >= 10 && fb_memory[sender].quiz <= 12){
            item = 'Rainbow Pearl'
            send_image('pearl.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_card(x,sender, fbtoken);
            });
        }else {
            item = 'Lucky Goldfish'
            send_image('goldfish.png',sender,function(){
                var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
                send_card(x,sender, fbtoken);
            });
        }

        fb_memory[sender].quiz = 1;

        console.log('COLLECTABLE/////???/ ',item)

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
        send_story(recipient,sender,pointer, sender, fbtoken)
    }

}




//for higher quality images, upload them directly to FB
//img: local image url
var send_image = function (img,sender,fbtoken,callback){
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


module.exports = { 
  send_card: send_card, 
  send_image: send_image,
  send_typing_indicator: send_typing_indicator, 
  get_last_message: get_last_message,
  set_menu: set_menu,
  send_suggestions_card: send_suggestions_card,
  send_story: send_story,
  process_story: process_story
}
