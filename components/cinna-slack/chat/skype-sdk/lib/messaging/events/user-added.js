'use strict';

const Event = require('./event');

/**
 * The user/bot added to group chat event.
 * 
 * @extends Event
 * 
 * @property {string} from - The user who added (removed) other users to (from) group chat. 
 * @property {string} to - The group id of the modified group.
 * @property {string[]} targets - The list of added users (usernames).
 * @property {number} eventTime - The event sent timestamp.
 * @property {string} type - The event's type as defined by Messaging Service ("ThreadAddMember").
 */
class UserAdded extends Event {
    /**
     * Create a user/bot added to group chat event.
     * 
     * @extends Event
     *  
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {string[]} options.targets - The list of added users (usernames).
     * @param {number} options.eventTime - The event sent timestamp.
     * @param {string} options.type - The event's type as defined by Messaging Service ("ThreadAddMember").
     */
    constructor(event) {
        super(event);
        
        if (typeof event.targets === 'undefined' || event.targets === null)
            throw new Error('Missing mandatory field "targets"');
        if (typeof event.eventTime === 'undefined' || event.eventTime === null)
            throw new Error('Missing mandatory field "eventTime"');
            
        this.targets = event.targets;
        this.eventTime = event.eventTime;
    }
}

module.exports = UserAdded;