'use strict';

const AbstractModelType = require('../abstract-model-type');
const Limits = require('./limits');
const ModelValidation = require('../model-validation');

/**
 * Message activity - representation of Skype text message
 *
 * @extends AbstractModelType
 *
 * @property {String} content - text message, optionally with Skype rich text object such as emoticons
 */
class Message extends AbstractModelType
{
    /**
     * Creates a new message
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.content = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        return ModelValidation.validateString(context, this.content, 'Message.content', false, Limits.MessageContentSizeBytes);
    }
}

/**
 * Message activity - representation of an activity (message, content sharing, ...) in the Skype chat
 *
 * @extends AbstractModelType
 *
 * @property {Object} message - Message; text message, optionally with Skype rich text object such as emoticons
 */
class Activity extends AbstractModelType
{
    /**
     * Creates a new activity
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.message = null;

        this.populatePlainInput(inputData,{
            'message': attrData => {
                return new Message(attrData);
            }
        });
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        return ModelValidation.validateTypedObject(context, this.message, Message, 'Activity.message', 'Message');
    }
}

module.exports = { Activity, Message };
