
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
var send_cart = require('./send_cart');

/**
 * This function sends basic text send messages to messenger
 * @param {string} bd: body of json object to send to messenger api
 * @param {string} sendTo: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 */
var send_card = function(bd,sendTo, fbtoken){
    request({
        url: 'https://graph.facebook.com/v2.7/me/messages',
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

/**
 * This function sends a basic welcome to kip message along with 3 suggested search buttons
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 * @returns {boolean} true or false whether api send was successful
 */
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
            url: 'https://graph.facebook.com/v2.7/me/messages',
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
 * This function sets the persistent menu for fb app
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
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
           if (err) {
            console.log('\n\n\n\nWARNING: FB SET MENU ERROR: ', err, body);

           }
            else {
                console.log('\n\n\n\n\n\nFB SET MENU : ',body)
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

/**
 * This function sends a typing indicator to the user
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 */
var send_typing_indicator = function(sender, fbtoken) {
    var typing_indicator = {
          "recipient":{
            "id": sender.toString()
          },
          "sender_action": "typing_on"
        };

        request({
            url: 'https://graph.facebook.com/v2.7/me/messages',
            qs: {
                access_token: fbtoken
            },
            method: 'POST',
            json: typing_indicator
        }, function() { })
}

/**
 * This function retrieves the last message related to user by thread_id from mongo
 * @param {string} sender: input raw sender id sent from fb
 * @returns {object} latest message object from user
 * @returns {boolean} returns false if no message received
 */
var get_last_message = function*(sender) {
    var result = yield db.Messages.find({
        thread_id: 'facebook_' + sender.toString()
    }).sort('-ts').exec()
    if (result[0]) return result[0];
    else return false
}

/**
 * This function sends the appropriate question from the pre-set quiz based on a pointer
 * @param {string} sender: input raw sender id sent from fb
 * @param {number} pointer: which question the user is on
 * @param {string} fbtoken: facebook send api token
 */
var send_story = function (sender,pointer,fbtoken){
    var storySender;
        //start from beginning of we dont have a pointer
        if(!pointer){
            pointer = 0;
        }
        //if(pointer || pointer == 0){
        var storySender = quiz[pointer];
        storySender.recipient = {
            id: sender
        };
    //send res to user
    request.post({
        url: 'https://graph.facebook.com/v2.7/me/messages',
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


/**
 * This function checks if user is stored in mongo, then starts or ends the quiz as necessary
 * @param {string} sender: input raw sender id sent from fb
 * @param {number} pointer: which question the user is on
 * @param {string} fbtoken: facebook send api token
 */
var process_story = function*(sender,pointer,select,fbtoken,fb_memory){
    //SAVE THIS quiz response TO USERS PERSONA as a session
    var query = {id: 'facebook_'+sender},
        update = { origin:'facebook' },
        options = { upsert: true, new: true, setDefaultsOnInsert: true };
    Chatuser.findOneAndUpdate(query, update, options, function(err, user) {
        var obj = {
            recipient: sender,
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
    //check if we should end story. will stop story after length of quiz question array
    if(pointer == quiz.length - 1){
        var item;
        if(fb_memory[sender].quiz >= 0 && fb_memory[sender].quiz <= 3){
            item = 'Flying Sailboat'
            console.log('but i ask again 1')
            yield send_image('sailboat.png',sender, fbtoken, null)
            var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
            send_card(x,sender, fbtoken);
        }
        else if(fb_memory[sender].quiz >= 4 && fb_memory[sender].quiz <= 7){
            item = 'Lucky Goldfish'
                        console.log('but i ask again 2')
            yield send_image('goldfish.png',sender, fbtoken, null)
            var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
            send_card(x,sender, fbtoken);
        }
        else if(fb_memory[sender].quiz >= 8 && fb_memory[sender].quiz <= 9){
            item = 'Snowglobe Charm'
                        console.log('but i ask again 3')
            yield send_image('snowglobe.png',sender, fbtoken, null)
            var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
            send_card(x,sender, fbtoken);
        }
        else if(fb_memory[sender].quiz >= 10 && fb_memory[sender].quiz <= 12){
            item = 'Rainbow Pearl'
            console.log('but i ask again 4')
            yield send_image('pearl.png',sender, fbtoken, null)
            var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
            send_card(x,sender, fbtoken);
        }else {
            item = 'Lucky Goldfish'
            console.log('but i ask again 5')
            yield send_image('goldfish.png',sender, fbtoken, null)
            var x = {text: "You got a "+item+" as a souvenir! Thanks for taking the quiz"}
            send_card(x,sender, fbtoken);
        }
        fb_memory[sender].quiz = 1;
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
                                "text": "Here are some cool things you might like! :)"
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
                                "text": "Here are some cool things you might like! :)"
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
                                "text": "Here are some cool things you might like! :)"
                    },
                    "notification_type": "NO_PUSH"
                };
            break;
        }
        setTimeout(function() {
            request.post({
                url: 'https://graph.facebook.com/v2.7/me/messages',
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
        if(fb_memory[sender].quiz || fb_memory[sender].quiz == 0){
            fb_memory[sender].quiz = fb_memory[sender].quiz + select;
        }else {
            console.log('error: key not found for persona val')
        }
        send_story(sender,pointer,fbtoken)
    }
}


/**
 * This function sends an image to messenger
 * @param {string} img: name of file
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 * @param {object} callback: callback function
 */
var send_image = function*(img,sender,fbtoken,callback){
    if (!callback || callback == undefined || callback == null) {
        callback = function(){}
    }
    console.log('\n\n\n i mean bro ', img, sender, fbtoken, callback, '\n\n\n');
    var r = request.post({url: 'https://graph.facebook.com/v2.7/me/messages?access_token='+fbtoken, formData: form},function (err, httpResponse, body) {
          if (err) {
            kip.debug('upload failed:', err);
          }
          console.log('Upload successful!  Server responded with:', body);
          callback();
        });
    var form = r.form()
    form.append('recipient', '{"id":"'+sender.toString()+'"}')
    form.append('message', '{"attachment":{"type":"image", "payload":{}}}')
    form.append('filedata', fs.createReadStream(__dirname +'/assets/'+img))
    // return this;
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
