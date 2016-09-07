var co = require('co');
var kip = require('kip');
var queue = require('../queue-mongo');
var db = require('../../../db');
var _ = require('lodash');
var request = require('request');
var async = require('async');
var fs = require('fs');
var config = require('../../../config');
var search_results = require('./search_results');
var focus = require('./focus');
var quick_reply = require('./quick_reply');
var emojiText = require('emoji-text'); //convert emoji to text
var kipcart = require('../cart');
var process_image = require('../process');
var process_emoji = require('../process_emoji').search;
var Chatuser = db.Chatuser;
var fbtoken;
var next = require("co-next")
fb_utility = require('./fb_utility');
var FBResponder = require('../responders');

var handle_postback = function* (event, sender, fb_memory, fbtoken, recipient) {
    try {
        var postback = JSON.parse(event.postback.payload);
    } catch(err) {
        console.log('POSTBACK PARSE ERR: ',err)
        var postback = event.postback.payload;
    }
    console.log('\n\n\npostback: ', postback,'\n\n\n');
    //@ @ @ @ @ @ @ @ @ @ @ @
    //@ @ @ @ @ ONBOARDING!!!!!!
    //@ @ @ @ @ @ @ @ @ @ @ @ @
    if ((postback.type && postback.type == 'GET_STARTED') || postback == 'GET_STARTED') {
        //send welcome image here
        //then one more text message intro
        //then send story
        fb_memory[sender].mode = 'onboarding';
        //res.send(200);
        fb_utility.send_image('cart.png',sender,fbtoken, function(){
            var x = {text: "Thanks for adding Kip! Take an adventure with us by answering this short quiz, and see what Kip finds for you :)"}
            //send image here
            fb_utility.send_card(x,sender, fbtoken);
            setTimeout(function() {
            var pointer = postback.story_pointer ? postback.story_pointer : 0;
            fb_utility.send_story(sender, pointer, fbtoken)
            }, 1500);
        });
    }
    //@ @ @ @ @ @ @ @ hiiiiiiiiiii @@ @ @ @ @ @ @ //
    else if (postback.action === 'story.answer') {
        yield fb_utility.process_story(sender,postback.story_pointer,postback.selected, fbtoken, fb_memory);
        return;
    }
    else if (postback.action == 'take_quiz'){
        fb_memory[sender].mode = 'onboarding';
        var pointer = 0;
        fb_utility.send_story(sender, pointer, fbtoken)
        return;
    }
    //@ @ @ @ @ @ @ @ byeeeeeee @ @ @ @ @ @ //

    var messages = yield db.Messages.find({
        thread_id: postback.dataId
    }).sort('-ts').exec();

    if (messages.length == 0) {
        console.log('No message found');
        var msg = new db.Message({
            incoming: true,
            thread_id: 'facebook_' + sender.toString(),
            resolved: false,
            user_id: "facebook_" + sender.toString(),
            origin: 'facebook',
            source: {
                'origin': 'facebook',
                'channel': sender.toString(),
                'org': "facebook_" + sender.toString(),
                'id': "facebook_" + sender.toString(),
                'user': sender.toString()
            },
            // amazon: msg.amazon
        });
    }  else {
       var msg = messages[0];
    }

    console.log('POSTBACK!!!', postback)

    if (postback.action == 'help') {
            fb_utility.send_suggestions_card(sender, fbtoken);
    }
    else if (postback.action == 'button_search') {
        var text = postback.text;
        text = emojiText.convert(text,{delimiter: ' '});
         //emoji parser doesnt recognize robot emoji wtf
        if (text.indexOf('🤖') > -1) text = text.replace('🤖','robot')
        // console.log('\n\n\n\nwe got to go: ', text, '\n\n\n\n')
        var new_message = new db.Message({
                incoming: true,
                thread_id: msg.thread_id,
                resolved: false,
                user_id: msg.user_id,
                origin: msg.origin,
                text: text,
                source: msg.source,
                amazon: msg.amazon 
            });
        // queue it up for processing
        var message = new db.Message(new_message);
        // queue it up for processing
        if(fb_memory[sender] && fb_memory[sender].mode && fb_memory[sender].mode == 'modify') {
            fb_memory[sender].mode = 'shopping';
        }

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
                    // console.log(message);
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

	// this is a new action type we will push in the button set
	if(postback.action == 'specify_option'){ 
	    // we are here because we showed an option set to the user and they selected one
	    // does the catalog item require further option selection?

	    // TODO: don't call this; get the item variations from the queue -- they must be 
	    // there already. getVariations does an additional scrape, which kills performance
	    var variations = amazon_variety.getVariations(msg.amazon[postback.selected].ASIN[0], msg);

	    // if there are item variations, do the following: 	    
	    var requiredAttrs = new RequiredAttributeGroup(variations);
            var selectedAttrs = /* TODO: pull the user's previous attribute selection(s) off the queue/out of storage */;
	    requiredAttrs.update(selectedAttrs);
	    
	    if(! requiredAttrs.isComplete()){
		var buttonGroupBuilder = new FBButtonSetBuilder(variations, sender);
		var buttonGroup = buttonGroupBuilder.build(requiredAttrs.getNextEmptyAttributeName());

		// send button ui back to user
		request.post({
		    // TODO: get this magic URL out of here
		    url: 'https://graph.facebook.com/v2.6/me/messages',
		    qs: {
			access_token: fbtoken
		    },
		    method: "POST",
		    json: true,
		    headers: {
			"content-type": "application/json",
		    },
		    body: buttonGroup
		}, function(err, res, body) {
		    if (err) console.error('post err ', err);
		});			  
	    }			    
	}
	if (postback.action == 'add' && postback.initial) {
                fb_utility.send_typing_indicator(sender, fbtoken)
                //Check if user scrolled up and this item is not from the previous search...
                var old_search = yield db.Messages.find({
                        thread_id: 'facebook_' + sender.toString()
                }).sort('-ts').exec(function(err, messages) {
                    if (err) return console.error(err);
                    if (messages.length == 0) {
                        console.log('No message found');
                    }
                    else if (messages[0]._id == postback.object_id) {
                        // console.log('THIS IS AN ITEM FROM THE LATEST SEARCH');
                        return 'false'
                    }
                    else if (messages[0]._id !== postback.object_id) {
                        // console.log('THIS IS AN NOOOOT ITEM FROM THE LATEST SEARCH', postback)
                        return postback.object_id;
                    }
                })
		
                if (old_search == 'false') {
                    //This is the latest search so just pass it through Kip like normal
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

                else if (old_search && postback.object_id){
                    // console.log('Mmkay this is an old search: ', postback);

                   //Check if user scrolled up and this item is not from the previous search...
                    var old_message = yield db.Messages.findById(postback.object_id).exec();
                    if (old_message && old_message.amazon && old_message.amazon.length > 0) {
                        var new_message = new db.Message({
                            incoming: true,
                            thread_id: old_message.thread_id,
                            resolved: false,
                            user_id: old_message.user_id,
                            origin: old_message.origin,
                            text: 'save ' + postback.selected,
                            source: old_message.source,
                            amazon: old_message.amazon,
                            searchSelect: [postback.selected],
                            flags: { old_search: true}
                            });
                        }
                        // queue it up for processing
                        var message = new db.Message(new_message);
                        message.save().then(() => {
                            queue.publish('incoming', message, ['facebook', sender.toString(), message.ts].join('.'))
                        });
                    }
            }
	
	else if (postback.action == 'add' && !postback.initial) {

                    fb_utility.send_typing_indicator(sender, fbtoken)

                      // console.log('addExtra --> postback: ', postback);
                      var cart_id = (msg.source.origin === 'facebook') ? msg.source.org : msg.cart_reference_id || msg.source.team;
                      var cart = yield kipcart.getCart(cart_id);
                      var unique_items = _.uniqBy( cart.aggregate_items, 'ASIN');
                      var item = unique_items[parseInt(postback.selected-1)];

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
            }	
            else if (postback.action === 'remove') {
                fb_utility.send_typing_indicator(sender, fbtoken)
                
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

            }

            else if (postback.action === 'list') {
                fb_utility.send_typing_indicator(sender, fbtoken)

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
              fb_utility.send_typing_indicator(sender, fbtoken)
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
                fb_utility.send_typing_indicator(sender, fbtoken)

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
}

module.exports = handle_postback;
