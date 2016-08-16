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
        'emoji_modify': function(subMenu){ return subMenu.text },
        'button_search': function(subMenu){ return subMenu.text }
        };

          //abstract out to yaml later
        this.menuTextMap = {
            'button_search': function(){ return [{type: 'fb_quick_reply', buttons: ['headphones','🐔 🍜','books']}] },
            'emoji_modify': function(){ return [{type: 'fb_quick_reply', buttons: ['🍪','👖','🌹','☕','🔨', '👻','💯']}]  },
            'sub_menu_emoji': function(){ return [{type: 'fb_emoji_modify', buttons: ['🍪','👖','🌹','☕','🔨', '👻','💯']}]  },
            'sub_menu_color': function(){ return [{type: 'fb_sub_menu_color', buttons: ['Black','White','Blue','Red','Brown', 'Pink']}] }
        }
        this.mapActionToMenuText = function(subMenu){
        var menuConverter = this.menuTextMap[subMenu.action];
            if(menuConverter === null || menuConverter === undefined){
                return [{type: 'default', buttons: ['Cheaper','Similar','Color','Emoji']}]; 
            }
            return menuConverter();
        }

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
                amazon: lastMessage.amazon,
                control_group: this.mapActionToMenuText(subMenu)
              });
            console.log(0, menus)

        // queue it up for processing
        message.save().then(() => {
            queue.publish('incoming', message, [this.responderType, sender.toString(), message.ts].join('.'))
        });             
    }

};

module.exports = FBResponder;