//
// facebook_responder.js
//
// consolidated conversation logic for facebook
//


function FBResponder(sender) {

    this.responderType = 'facebook';
    this.sender = sender;
    

    this.actionTextMap = {
	'cheaper': function(subMenu){ return subMenu.selected + ' but cheaper'; },
	'similar': function(subMenu){ return 'more like ' + subMenu.selected; },
	'emoji_modify': function(subMenu){ return subMenu.text }
    };

    this.mapActionToText = function(subMenu){
	var converter = this.actionTextMap[subMenu.action];
	if(converter === null || converter === undefined){
	    return ''; // whatever the default is 
	}

	return converter(subMenu);
    }
    return this;
}

FBResponder.prototype.respond = function(lastMessage, subMenu){
	
    var message = new db.Message({
                    incoming: true,
                    thread_id: this.responderType + '_' + this.sender.toString(),
                    resolved: false,
                    user_id: last_message.user_id,
                    origin: this.responderType,
                    text: this.mapActionToText(subMenu),
                    source: last_message.source,
                    amazon: last_message.amazon
    });
    // queue it up for processing
    message.save().then(() => {
	queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
    });			    
};

module.exports = FBResponder;

//new FacebookResponder(sender, subMenu).respond(last_message);
