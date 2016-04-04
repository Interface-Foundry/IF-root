'use strict';

const Event = require('./event');

/**
 * The bot was added to user's contacts event. 
 * 
 * @extends Event
 *  
 * @property {string} from - The message's sender.
 * @property {string} to - The message's recipient. Either bot's id or a group id.
 * @property {string} fromDisplayName - The user's display name, as it appears in their profile.
 * @property {string} type - The event's type as defined by Bot Platform ("AgentContactNotification").
 * @property {string} action - Should decide if user added ("add") or removed ("removed") the bot. Currently only "add" is supported. 
 */
class ContactNotification extends Event {
    /**
     * Create an event.
     * 
     * @extends Event
     *  
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {string} options.fromDisplayName - The user's display name, as it appears in their profile.
     * @param {string} options.type - The event's type as defined by Bot Platform ("AgentContactNotification").
     * @param {string} options.action - Should decide if user added ("add") or removed ("removed") the bot. Currently only "add" is supported. 
     */
    constructor(event) {
        super(event);
                
        if (typeof event.fromDisplayName === 'undefined' || event.fromDisplayName === null)
            throw new Error('Missing mandatory field "fromDisplayName"');
        if (typeof event.action === 'undefined' || event.action === null)
            throw new Error('Missing mandatory field "action"');
                    
        this.fromDisplayName = event.fromDisplayName;
        this.action = event.action;
    }
}

module.exports = ContactNotification;