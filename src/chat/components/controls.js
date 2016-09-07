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




class RequiredOptionGroup{
    constructor(variationValues) {
	this.optionValues = {}
	this.optionNames = Object.keys(variationValues);
	this.numRequiredValuesMissing = optionNames.length;
    }

    this.isComplete = function(){
	if(this.numRequiredValuesMissing < 1){
	    return true;
	}
	return false;
    }

    this.setOption = function(name, value){
	if(this.optionNames.find(name)){
	    this.optionValues[name] = value;
	    this.numRequiredValuesMissing--;
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

    constructor(variantMap) {	
	this.buttonSetMap = {}
	Object.keys(variantMap).map(function(variantName){
	    
	    var variantValues = variantMap[variantName]
	    var buttons = []
	    for(v in variantValues) {
		buttons.push(new FBButton(v, constants.ITEM_ADD, constants.BY_ATTRIBUTE, 'sender', this.normalizeName(v))); // TODO: where do we get the sender?
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