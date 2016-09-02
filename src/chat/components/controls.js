/**
 * @fileOverview Classes representing outbound data to be rendered into a platform-specific UI object.
 * @author <a href="mailto:binarymachineshop@gmail.com">Dexter Taylor</a>
 */

/**
 * @example
 * // create a Facebook button and output its information as JSON data
 * // assume preexisting sender object
 * // This creates a facebook button labeled "Cheaper" whose action 
 * // is modify.one and whose instruction is cheaper
 * new FBButton('Cheaper', 'modify.one', 'cheaper', sender, 'cheaper').render();
 * 
 */

"use strict";


class OptionSet{

    constructor(setName, buttonArray) {

	this.name = setName;
	this.options = optionArray

	return this;
    }

};


class ButtonGroupConfigBuilder() {

    constructor() {
	this.config = { "attachment_type": "default" };
	this.numRequiredFieldsMissing = 4;
	return this;
    }

    this.isComplete() = function() {
	return this.numRequiredFieldsMissing === 0;
    }


    this.setTitle = function(title) {
	this.config.title = title;
	this.numRequiredFieldsMissing--;
	return this;
    }


    this.setHeader = function(header) {
	this.config.header = header;
	this.numRequiredFieldsMissing--;
	return this;
    }


    this.setPrompt = function(prompt) {
	this.config.prompt = prompt;
	this.numRequiredFieldsMissing--;
	return this;
    }


    this.setAttachmentType = function(attachmentType) {
	this.attachmentType = attachmentType
	this.numRequiredFieldsMissing--;
	return this;
    }

    

    this.build(){
	//return JSON object?
    }
    
}






class SlackButtonGroup {

    constructor(header, optionSet, bgConfig) {
	// TODO	
    }

}


os1 = new OptionSet('sizes', ['small', 'medium', 'large']);
os2 = new OptionSet('color', ['blue', 'red', 'green-blue']);
 




new SlackButtonGroup("would you like to play a game?", [attachments], os1).render();

    this.render = function(){

	return {
	    "text": this.header,
	    "attachments": [
		{
		    "text": this.title,
		    "fallback": "You are unable to choose a game",
		    "callback_id": "wopr_game",
		    "color": "#3AA3E3",
		    "attachment_type": "default",
		    //"image_url": "",
		    //"thumb_url": "",
		    "actions": [
			{
			    "name": "chess",
			    "text": "Chess",
			    "type": "button",
			    "value": "chess"
			},
			{
			    "name": "maze",
			    "text": "Falken's Maze",
			    "type": "button",
			    "value": "maze"
			},
			{
			    "name": "war",
			    "text": "Thermonuclear War",
			    "style": "primary",
			    "type": "button",
			    "value": "war",
			    "confirm": {
				"title": "Are you sure?",
				"text": "Wouldn't you prefer a good game of chess?",
				"ok_text": "Yes",
				"dismiss_text": "No"
			    }
			}
		    ]
		}
	    ]
	}
    }
}


class FBButtonMenu {

    constructor(optionSet) {

	this.buttonArray = []
	buttonArray.map(function(value, index) {
	    buttonArray.push{}
	    primaryOptions[buttonName] = button;	    
	});
	return this;
    }

    	
    this.addOptions = function(optionName, buttonArray) {

	this.optionSets[optionName] = buttonArray
	return this;
    }


    this.selectPrimaryOption = function() {
	    
    }
}



/**
 * FBButton class for encapsulating Facebook UI buttons
 * @classdesc create an instance and call render() to generate outbound data for button rendering
 *
 */
class FBButton{
    /** 
     * @param {string} title the button's label
     * @param {string} actionName the action attribute of the user event
     * @param {string} instructionName the instruction attribute of the user event
     * @param {Object} sender the FB sender object
     * @param {String} searchAttrValue optional 
     */
    constructor(title, actionName, instructionName, sender, searchAttrValue) {		
	  this.title = title;  
      	  this.dataID = 'facebook_' + sender.toString();
	  this.action = actionName;
	  this.instruction = instructionName;
	  this.searchAttributeValue = searchAttrValue;	  
	  this.selector = 1;

	this.render = function() {
	    var data = {
		"content_type":"text",
		"title": this.title,
		"payload": JSON.stringify({
                    dataId: this.dataID,
                    action: this.action,
                    instruction: this.instruction,
		    focus: this.selector,
		    search_attribute_value: this.searchAttributeValue		    
		})
	    };
	    return data;
	}
    
    return this;
    }
};


module.exports = {
    'FBButton': FBButton
};