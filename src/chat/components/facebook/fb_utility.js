
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
 * This function sends basic text send messages to messenger
 * @param {string} bd: body of json object to send to messenger api
 * @param {string} sendTo: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
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
            url: 'https://graph.facebook.com/v2.6/me/messages',
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

/**
 * This function sends a basic text message to the user. it will split up the length of the text as necessary.
 * @param {string} img: name of file
 * @param {string} sender: input raw sender id sent from fb
 * @param {string} fbtoken: facebook send api token
 * @param {object} callback: callback function
 */
function send_text(channel, text, outgoing, fbtoken) {
  //intercept of vanilla help message when user types 'help' instead of clicking help button
  if (text.indexOf("I'm Kip, your penguin shopper.") > -1)
  {
     fb_utility.send_suggestions_card(sender, fbtoken);
     return
  }
  function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g'));
  }
  if (text.length >= 200) {
      var text_array = chunkString(text, 250)
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



function send_results(channel, text, results, outgoing, fbtoken) {

  var giphy_gif = ''

request('http://api.giphy.com/v1/gifs/search?q=' + outgoing.data.original_query + '&api_key=dc6zaTOxFJmzC', function(err, res, body) {
    if (err) console.log(err);

    // console.log('GIFY RETURN DATA: ', JSON.parse(body).data[0])
    giphy_gif = JSON.parse(body).data[0] ? JSON.parse(body).data[0].images.fixed_width_small.url :  'http://kipthis.com/images/header_partners.png';

    var cards = results.map((result, i) => {
        var n = i + 1 + '';

        //get picstitch image
        if (result && result.image_url){
            var image = ((result.image_url.indexOf('http') > -1) ? result.image_url : 'http://kipthis.com/images/header_partners.png')
        } else {
            kip.debug('error: no result.image_url (picstitch) found');
            var image = 'http://kipthis.com/images/header_partners.png';
        }
        return {
                "title": result.title,
                "image_url": (result.image_url && result.image_url.indexOf('http') > -1 ? result.image_url : 'http://kipthis.com/images/header_partners.png'),
                "buttons": [{
                    "type": "postback",
                    "title": "Add to Cart",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        object_id: outgoing.data._id,
                        action: "add",
                        selected: i + 1,
                        ts: outgoing.data.ts,
                        initial: true
                    })
                },
                {
                    "type": "web_url",
                    "url": result.title_link,
                    "title": "View on Amazon"
                },
                {
                    "type": "postback",
                    "title": "Details",
                    "payload": JSON.stringify({
                        dataId: outgoing.data.thread_id,
                        action: "focus",
                        selected: i + 1,
                        ts: outgoing.data.ts
                    })
                }],
            }
    });

    cards.push( {
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
         }]})
       var modify_menu = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": cards
                }
            },
            "quick_replies":[
                      {
                        "content_type":"text",
                        "title":"Cheaper",
                        "payload": JSON.stringify({
                                action: "cheaper",
                                selected: '1'
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Similar",
                        "payload": JSON.stringify({
                                action: "similar",
                                selected: "1"
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Color",
                        "payload": JSON.stringify({
                                action: "sub_menu_color",
                                selected: "1"
                            })
                      },
                      {
                        "content_type":"text",
                        "title":"Emoji",
                        "payload": JSON.stringify({
                                dataId: outgoing.data.thread_id,
                                action: "sub_menu_emoji",
                                selected: "1"
                            })
                      }
                    ]
        };

        //prevents showing back when there's no back
        // if (backCache > 0){
        //     console.log('BACK CACHE')
        //     modify_menu.quick_replies.push({
        //         "content_type":"text",
        //         "title":" < Back",
        //         "payload": JSON.stringify({
        //                 action: "back",
        //                 type:"last_search"
        //             })
        //       });
        // }

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
                message: modify_menu,
            }
        }, function(err, res, body) {
            if (err) console.error('post err ', err);
            console.log(body);
            outgoing.ack();
        });
 })
}


function send_cart(channel, text, outgoing, fbtoken) {
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



function send_focus(channel, text, focus_info, outgoing, fbtoken) {
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



module.exports = { 
  send_cart: send_cart,
  send_results: send_results,
  send_text: send_text,
  send_card: send_card, 
  send_focus: send_focus,
  send_image: send_image,
  send_typing_indicator: send_typing_indicator, 
  get_last_message: get_last_message,
  set_menu: set_menu,
  send_suggestions_card: send_suggestions_card,
  send_story: send_story,
  process_story: process_story
}
