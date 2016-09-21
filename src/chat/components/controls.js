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




class RequiredAttributeGroup{

    constructor(variationValues) {
	this.attributes = {}
	this.requiredAttributeNames = Object.keys(variationValues);
	this.numRequiredAttribsMissing = optionNames.length;
	return this;
    

    this.isComplete = function(){
	if(this.numRequiredAttribsMissing == 0){
	    return true;
	}
	return false;
    }

    this.setAttribute = function(name, value){
	if(this.requiredAttributeNames.find(name)){
	    this.attributes[name] = value;
	    if(! this.isComplete()){
		this.numRequiredAttribsMissing--;
	    }
	}
    }

    this.getNextEmptyAttributeName = function(){
	var populatedAttributes = Object.keys(this.attributes);
	if(populatedAttributes.length == requiredAttributeNames.length){
	    return null;
	}
	result = null;
	
	for (var i=0; i < this.requiredAttributeNames.length; i++) {
	    index = populatedAttributes.indexOf(this.requiredAttributeNames[i]);
	    if (index == -1) {
		result = this.requiredAttributeNames[i];
		break;
	    }
	}
	return result;
    }

    this.update = function(data) {
	Object.keys(data).map(function(key){
	    this.setAttribute(key, data[key]);
	})
    }

    this.getAttributes = function() {
	return this.attributes;
    }
    }
}




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


/**
 * @param {Object} variationValues {key_1:[Val1,..,Val3],..,key_n: [Val1,.]}
 * 
 */
class FBButtonSetBuilder {

    constructor(variantMap, sender) {	
	this.buttonSetMap = {}
	Object.keys(variantMap).map(function(variantName){
	    
	    var variantValues = variantMap[variantName]
	    var buttons = []
	    for(v in variantValues) {
		buttons.push(new FBButton(v, constants.ITEM_ADD, constants.BY_ATTRIBUTE, sender, this.normalizeName(v)));
	    }
	    this.buttonSetMap[variantName] = buttons	    
	});
    }


    this.normalizeName = function(name) {
	var re = /(\s+)/g;
	return name.toLowerCase().replace(re, '_'); 
    }


    this.build = function(key) {
	var response = []
	var buttons = this.buttonSetMap[key]
	if(buttons === null || buttons === undefined){
	    return response
	}
	
	buttons.map(function(b){
	    response.push(b.render())
	})
	
	return response
    }
}



/*

action for new buttons is "Add"
instruction for new buttons is -- make one up  
searchAttrValue is the actual selection val, lowercased and with underscores instead of whitespace

*/

class SlackButton{
 /** 
     * @param {string} title the button's label
     * @param {string} actionName the action attribute of the user event
     * @param {string} instructionName the instruction attribute of the user event
     * @param {Object} sender the FB sender object
     * @param {String} searchAttrValue optional 
     */
    constructor(name, text, style, type, value) {

    	this.data = {
    		name: name,
			text:text,
			style: style,
			type: type,
			value: value
	    };		
	  

		this.render = function() {
	   
	    	return this.data;
		}

		this.setConfirmation = function(title, text, okMsg, cancelMsg) {

			this.data['confirm'] = {
				title: title, 
				text: text,
				ok_text: okMsg,
				dismiss_text: cancelMsg
			};
		}
    
    return this;
    }
}
class SlackCard {
	constructor(text) {

		this.data = { text: text };

		return this;
	}
}

class SlackAttachment{
 
    constructor(text, fallback, callbackId, color, attachmentType) {

    	this.data = {
    		text: text,
			fallback: fallback,
			callbackId: callbackId,
			color: color,
			attachmentType: attachmentType	    };		
	  	
	  	this.addButton = function(slackButton) {

	  	}

		this.render = function() {
	   
	    	return this.data;
		}
    
    return this;
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