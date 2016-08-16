// responder.js



var FacebookResponder = function(sender, subMenu) {

    this.responderType = 'facebook';
    this.sender = sender;
    this.subMenu = subMenu;

    this.actionTextMap = {
	'cheaper': function(){ return this.subMenu.selected + ' but cheaper'; },
	'similar': function(){ return 'more like ' + this.subMenu.selected; }
	'emoji_modify': function(){ return this.subMenu.text }
    };

    this.mapActionToText = function(subMenuAction){
	
	var text = this.actionTextMap[subMenuAction];
	if(text === null || text === undefined){
	    text = ''; // whatever the default is
	}

	return text;
    }
    return this;
};


FacebookResponder.prototype.respond = function(last_message){

    
    var message = new db.Message({
                    incoming: true,
                    thread_id: this.responderType + '_' + this.sender.toString(),
                    resolved: false,
                    user_id: last_message.user_id,
                    origin: this.responderType,
                    text: this.mapActionToText(this.subMenu.action),
                    source: last_message.source,
                    amazon: last_message.amazon
                  });
            // queue it up for processing
            message.save().then(() => {
                queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
            });			    
};



new FacebookResponder(sender, sub_menu).respond(last_message);