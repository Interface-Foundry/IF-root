'use strict';

const Event = require('./event');

/**
 * The received message event.
 * 
 * @extends Event
 *  
 * @property {string} from - The message's sender.
 * @property {string} to - The message's recipient. Either bot's id or a group id.
 * @property {content} content - The content of the message.
 * @property {number} messageId - The message's ID from Messaging Service.
 * @property {string} contentType -The content's type as defined by messaging service ("RichText"). 
 * @property {number} eventTime - The event sent timestamp.
 * @property {string} type - The event's type as defined by Messaging Service ("Message").
 */
class Message extends Event {
    /**
     * Create a message event.
     * 
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The message's sender.
     * @param {string} options.to - The message's recipient. Either bot's id or a group id.
     * @param {string} options.content - The content of the message.
     * @param {number} options.messageId - The message's ID from Messaging Service.
     * @param {string} options.contentType -The content's type as defined by messaging service ("RichText"). 
     * @param {number} options.eventTime - The event sent timestamp.
     * @param {string} options.type - The event's type as defined by messaging service ("Message").
     */
    constructor(event) {
        super(event);
        
        if (typeof event.content === 'undefined' || event.content === null)
            throw new Error('Missing mandatory field "content"');
        if (typeof event.contentType === 'undefined' || event.contentType === null)
            throw new Error('Missing mandatory field "contentType"');
        if (typeof event.messageId === 'undefined' || event.messageId === null)
            throw new Error('Missing mandatory field "messageId"');
        if (typeof event.eventTime === 'undefined' || event.eventTime === null)
            throw new Error('Missing mandatory field "eventTime"');
            
        this.content = event.content;
        this.contentType = event.contentType;
        this.messageId = event.messageId;
        this.eventTime = event.eventTime;
    } 
}

module.exports = Message;