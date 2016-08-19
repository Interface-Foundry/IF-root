"use strict";

var db = require('../../db');
var queue = require('./queue-mongo');
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

	
	this.paramGenMap = {	    
	    'shopping_modify.one_cheaper': function(userInputControl) { return { 'focus': userInputControl.focus, 
								 'param': 'less', 
								 'type': 'price' 
							       }
						      },				
	    'shopping_modify.one_genericDetail': function(userInputControl) { return { 'focus': userInputControl.focus,
							        'param': userInputControl.instruction, 
							        'type': userInputControl.searchAttributeValue 
							}
 									    },									   
	    'shopping_modify.one_similar': function(userInputControl) { return {'focus': userInputControl.focus,
										'param': userInputControl.instruction,
										'type': userInputControl.searchAttributeValue
									       }
								      }, 
	    'shopping_modify.one_color': function(userInputControl) { return {'focus': userInputControl.focus,
										'param': userInputControl.instruction,
										'type': userInputControl.searchAttributeValue
									       }
								    },
	    'shopping_modify.one_emoji': function(userInputControl) { return {'focus': userInputControl.focus,
										'param': userInputControl.instruction,
										'type': userInputControl.searchAttributeValue
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


	this.createParamGenKey = function(userInputData){
	    return [userInputData.mode, userInputData.action, userInputData.instruction].join('_');
	}

	
	this.mapActionToParams = function(userInputEvent){
	    console.log('>>> userInput is: ' + JSON.stringify(userInputEvent));
	    var paramGenKey = this.createParamGenKey(userInputEvent.data);
	    console.log('paramgen key is: ' + paramGenKey)
	    var paramGenerator = this.paramGenMap[paramGenKey];
	    if(paramGenerator === null || paramGenerator === undefined){		
		throw 'EXCEPTION: No parameter map defined for user input ' + JSON.stringify(userInput) + ' yielding key ' + paramGenKey;
	    }
	    return paramGenerator(userInputEvent.data);	    
	}
	

        return this;
    }

    respond(lastMessage, userInputEvent) { 


	console.log('############# Inside FBResponder.respond().')
	console.log('############ user input event : ' + JSON.stringify(userInputEvent))
	
	// if a control was actuated, 
	// the message must include the control name and the selection (or component mode) 
	
        var message = new db.Message({
            incoming: true,
            thread_id: this.responderType + '_' + this.sender.toString(),
            resolved: false,
            user_id: lastMessage.user_id,	       
            origin: this.responderType,	    	    
            text: this.mapActionToText(userInputEvent),
	    control_group: this.mapActionToMenuText(userInputEvent),
            source: lastMessage.source,
            amazon: lastMessage.amazon
	});

	if(userInputEvent.type === EventTypes.BUTTON_PRESS){
	    // NOTE: a better name for this would be "message.context", because woof.

	    console.log('################ inside FBResponder.respond().');
	    console.log('################ userInputEvent data is: ' + JSON.stringify(userInputEvent.data));


	    message.execute = [  
		{
		    mode: userInputEvent.data.mode,
		    action: userInputEvent.data.action,
		    params: this.mapActionToParams(userInputEvent),
		    selected: userInputEvent.data.selected
		}
	    ]
	}
	                   
        // queue it up for processing
        message.save().then(() => {
            queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
        });             
    }
};

module.exports = FBResponder;