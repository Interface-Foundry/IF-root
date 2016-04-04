'use strict';

/**
 * The received event.
 * 
 * @property {string} from - The message's sender.
 * @property {string} to - The message's recipient. Either bot's id or a group id.
 * @property {string} type - optional; The event's type as defined by Messaging Service v1 API.
 */
class Event {    
    /**
     * Create an event.
     * 
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {string} options.type - The event's type as defined by Messaging Service.
     */
    constructor(event) {
        if(event == null) throw new Error('No input event provided');
        if (typeof event.from === 'undefined' || event.from === null)
            throw new Error('Missing mandatory field "from"');
            
        if (typeof event.to === 'undefined' || event.to === null)
            throw new Error('Missing mandatory field "to"');

        this.from = event.from;
        this.to = event.to;
        this.type = event.type;
    }
}

module.exports = Event;