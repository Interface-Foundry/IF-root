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

    constructor(setName, optionArray) {

	this.setName = setName;
	this.options = optionArray
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