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


class ButtonGroupConfigBuilder{

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
	// TODO: return JSON object; verify the format 
    }
    
}



class FacebookButtonGroup {

    constructor(bgConfig, buttons) {
	this.buttonGroupConfig = bgConfig;
	this.buttons = buttons
    }
}



class FBButtonMenu {

    // TODO: find out whether G would rather pass an array, or a ButtonGroup object
    constructor(buttonArray) {

	this.buttonArray = buttonArray	
	this.optionSets = {}
	return this;
    }
    

    // TODO: the remaining question here is how to derive the optionName.
    // If it comes from the action and the corresponding instruction, 
    // change the signature so that the caller doesn't need to assemble the key
    // by hand
    this.addSecondaryOptions = function(optionName, buttonArray) {

	this.optionSets[optionName] = buttonArray;
	return this;
    };


    this.createOptionKey = function(action, instruction, selector) {
	return [action, instruction, selector].join(':');
    }

    this.selectPrimaryOption = function() {
	return this.buttonArray;
    };


    
    this.selectSecondaryOption = function(optionName){

	secondaryButtonGroup = this.optionSets[optionName];
	if secondaryButttonGroup === null or secondaryButtonGroup === undefined {	    
	    return []
	}
	return secondaryButttonGroup;
    }

};



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