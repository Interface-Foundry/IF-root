'use strict';

const Event = require('./event');

/**
 * The posted attachment details.
 *
 * @extends Event
 *
 * @property {string} from - The message's sender.
 * @property {string} to - The message's recipient. Either bot's id or a group id.
 * @property {string} id - The attachment unique identifier
 * @property {string} attachmentName - The attachment name if any
 * @property {string} attachmentType - the attachment type
 * @property {array} views - available attachment 'views' and the sizes. Array of AttachmentViewInfo instances.
 * @property {string} eventTime - The event sent timestamp in ISO 8601 format.
 * @property {string} type - The event's type
 */
class Attachment extends Event {
    /**
     * Create an attachment event.
     *
     * @param {Object} event - The object received from Messaging Service.
     * @param {string} event.from - The message's sender.
     * @param {string} event.to - The message's recipient. Either bot's id or a group id.
     * @param {number} event.eventTime - The event sent timestamp.
     * @param {string} event.name - The attachment name (optional)
     * @param {number} event.attachmentType - The attachment type
     * @param {string} event.id - the attachment id that can be used for downloading the content
     * @param {string} event.views - the available attachment vires.
     */
    constructor(event) {
        super(event);

        if (event.attachmentType == null)
            throw new Error('Missing mandatory field "attachmentType"');
        if (event.views == null)
            throw new Error('Missing mandatory field "views"');
        if (event.id == null)
            throw new Error('Missing mandatory field "id"');
        if (event.eventTime == null)
            throw new Error('Missing mandatory field "eventTime"');

        this.attachmentName = event.name;
        this.attachmentType = event.attachmentType;
        this.views = event.views;
        this.eventTime = event.eventTime;
        this.id = event.id;
    }
}

/** This event is emitted when a new attachment is posted.
 * @event BotService#attachment
 * @type {Attachment}
 */

module.exports = Attachment;
