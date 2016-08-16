"use strict";

var db = require('../../../db');
var queue = require('../queue-mongo');

class FBResponder {
    constructor(sender)  {
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

    respond(lastMessage, subMenu) {
        var message = new db.Message({
                incoming: true,
                thread_id: this.responderType + '_' + this.sender.toString(),
                resolved: false,
                user_id: lastMessage.user_id,
                origin: this.responderType,
                text: this.mapActionToText(subMenu),
                source: lastMessage.source,
                amazon: lastMessage.amazon
              });
            console.log(0, lastMessage, subMenu)

        // queue it up for processing
        message.save().then(() => {
            console.log(1)
            queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
        });             
    }

};

module.exports = FBResponder;