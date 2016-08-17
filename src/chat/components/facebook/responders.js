"use strict";

var db = require('../../../db');
var queue = require('../queue-mongo');
const EventTypes = require('./event_types');


class FBResponder {
    constructor(sender)  {
        this.responderType = 'facebook';
        this.sender = sender;
        this.actionTextMap = {
            'cheaper': function(userInput){ return userInput.selected + ' but cheaper'; },
            'similar': function(userInput){ return 'more like ' + userInput.selected; },
            'emoji_modify': function(userInput){ return userInput.text },
            'button_search': function(userInput){ return userInput.text }
        };

        //abstract out to yaml later
    	// TODO: make sure we're getting button groups from ONE place
    	//
        this.postbackToControlGroupMap = {
            'button_search': function(){ return [{type: 'fb_quick_reply', buttons: ['headphones','🐔 🍜','books']}] },
            'emoji_modify': function(){ return [{type: 'fb_quick_reply', buttons: ['🍪','👖','🌹','☕','🔨', '👻','💯']}]  },
            'sub_menu_emoji': function(){ return [{type: 'fb_emoji_modify', buttons: ['🍪','👖','🌹','☕','🔨', '👻','💯']}]  },
            'sub_menu_color': function(){ return [{type: 'fb_sub_menu_color', buttons: ['Black','White','Blue','Red','Brown', 'Pink']}] }
        }

        this.mapActionToMenuText = function(userInput){
        var menuConverter = this.menuTextMap[userInput.action];
            if(menuConverter === null || menuConverter === undefined){
                return [{type: 'default', buttons: ['Cheaper','Similar','Color','Emoji']}]; 
            }
            return menuConverter();
        }

        this.mapActionToText = function(userInput){
        var converter = this.actionTextMap[userInput.action];
            if(converter === null || converter === undefined){
                return '...'; // whatever the default is 
            }
            return converter(userInput);
        }
        return this;
    }

    respond(lastMessage, userInputEvent) { 
	
	// if a control was actuated, 
	// the message must include the control name and the selection (or component mode) 
	
        var message = new db.Message({
            incoming: true,
            thread_id: this.responderType + '_' + this.sender.toString(),
            resolved: false,
            user_id: lastMessage.user_id,	       
            origin: this.responderType,	    	    
            text: this.mapActionToText(userInputEvent.data),
	    control_group: this.mapActionToMenuText(userInputEvent.data),
            source: lastMessage.source,
            amazon: lastMessage.amazon
	});

	if(userInputEvent.type === EventTypes.BUTTON_PRESS){
	    // NOTE: a better name for this would be "message.context", because woof.
	    message.execute = [  
		{
		    mode: userInputEvent.data.mode,
		    action: userInputEvent.data.action,
		    params: {},
		    selected: userInputEvent.data.selected
		}
	    ]
	}
	           
        console.log(0, lastMessage, userInputEvent.data)

        // queue it up for processing
        message.save().then(() => {
            queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
        });             
    }
};

module.exports = FBResponder;