"use strict";

var db = require('../../../db');
var queue = require('../queue-mongo');
var _ = require('lodash');
const EventTypes = require('./constants');


class FBResponder {
    constructor(sender)  {
        this.responderType = 'facebook';
        this.sender = sender;
        this.actionTextMap = {
            'cheaper': function(userInputControl){ return userInputControl.selected + ' but cheaper'; },
            'similar': function(userInputControl){ return 'more like ' + userInputControl.selected; },
            'emoji_modify': function(userInputControl){ return userInputControl.text },
            'button_search': function(userInputControl){ return userInputControl.text }
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

	const shoppingMode = EventTypes.SHOPPING;
	const modifyOneAction = EventTypes.MODIFY_ONE;
	const cheaperInstruction = EventTypes.CHEAPER;
	const genericDetailInstruction = EventTypes.GENERIC_DETAIL;

	this.actionToParamGenMap = {	    
	    shoppingMode: {
		modifyOneAction: { 
		    cheaperInstruction: function(userInputControl) { return { 'focus': userInputControl.selector, 
								 'param': 'less', 
								 'type': 'price' 
							       }
						      },
				
		    genericDetailInstruction: function(userInputControl) { return { 'focus': userInputControl.selector,
							        'param': userInputControl.instruction, 
							        'type': userInputControl.searchAttributeValue 
								     } 		
							    }
		}
	    }
	}


        this.mapActionToMenuText = function(userInput){
        var menuConverter = this.postbackToControlGroupMap[userInput.action];
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

	
	this.mapActionToParams = function(userInput){
	    console.log('>>> userInput is: ' + JSON.stringify(userInput));

	    var paramGenerator = _.get(this.actionToParamGenMap, '[userInput.mode][userInput.action][userInput.instruction]', null);
	    if(paramGenerator === null){		
		throw '>> Sorry, I could not understand your input.';
	    }
	    return paramGenerator(userInput);	    
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
		    params: this.mapActionToParams(userInputEvent.data),
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