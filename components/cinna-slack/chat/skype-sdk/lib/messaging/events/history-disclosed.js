'use strict';

const Event = require('./event');

/**
 * The thread's history disclosed setting updated event.
 * 
 * @extends Event
 *  
 * @property {string} from - The message's sender.
 * @property {string} to - The message's recipient. Either bot's id or a group id.
 * @property {bool} historyDisclosed - Whether the history disclosed setting is turned on or off.
 * @property {number} eventTime - The event sent timestamp.
 * @property {string} type - The event's type as defined by Messaging Service ("ThreadHistoryDisclosedUpdate").
 */
class HistoryDisclosed extends Event {
    /**
     * Create a history disclosed event.
     * 
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {bool} options.historyDisclosed - Whether the history disclosed setting is turned on or off.
     * @param {number} options.eventTime - The event sent timestamp.
     * @param {string} options.type - The event's type as defined by Messaging Service ("ThreadHistoryDisclosedUpdate").
     */
    constructor(event) {
        super(event);
                
        if (typeof event.historyDisclosed === 'undefined' || event.historyDisclosed === null)
            throw new Error('Missing mandatory field "historyDisclosed"');
        if (typeof event.eventTime === 'undefined' || event.eventTime === null)
            throw new Error('Missing mandatory field "eventTime"');
            
        this.historyDisclosed = event.historyDisclosed;
        this.eventTime = event.eventTime;
    }
}

module.exports = HistoryDisclosed;