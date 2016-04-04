'use strict';

const Event = require('./event');

/**
 * The thread's topic updated event.
 * 
 * @extends Event
 * 
 * @property {string} from - The user who modified the thread's topic.
 * @property {string} to - The id of the group which topic was updated.
 * @property {string} topic - The new topic.
 * @property {number} eventTime - The event sent timestamp.
 * @property {string} type - The event's type as defined by Messaging Service ("NewTopic").
 */
class TopicUpdated extends Event {
    /**
     * Create a topic updated event.
     * 
     * @param {Object} options - The object received from Messaging Service.
     * @param {string} options.from - The user who modified the thread's topic.
     * @param {string} options.to - The id of the group which topic was updated.
     * @param {string} options.topic - The new topic.
     * @param {number} options.eventTime - The event sent timestamp.
     * @param {string} options.type - The event's type as defined by Messaging Service ("NewTopic").
     */
    constructor(event) {
        super(event);
                
        if (typeof event.topic === 'undefined' || event.topic === null)
            throw new Error('Missing mandatory field "topic"');
        if (typeof event.eventTime === 'undefined' || event.eventTime === null)
            throw new Error('Missing mandatory field "eventTime"');
            
        this.topic = event.topic;
        this.eventTime = event.eventTime;
    }
}

module.exports = TopicUpdated;