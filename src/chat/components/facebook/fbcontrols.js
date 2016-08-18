

"use strict";
// new FBButton("some_emoji", "modify.one", "generic_detail", userObj, "blue")

class FBButton{

    constructor(title, actionName, instructionName, sender, searchAttrValue) {
	  this.title = title;  
      	  this.dataID = 'facebook_' + sender.toString();
	  this.action = actionName;
	  this.instruction = instructionName;
	  this.searchAttributeValue = searchAttrValue;	  
	  this.selector = 1;
    

	this.render = function() {
	    return {
		"content_type":"text",
		"title": this.title,
		"payload": JSON.stringify({
                    dataId: this.dataID,
                    action: this.action,
                    instruction: this.instruction,
		    focus: this.selector,
		    search_attribute_value: this.searchAttributeValue
		})
	    }
	}
    
    return this;
    }
};


module.exports = FBButton;