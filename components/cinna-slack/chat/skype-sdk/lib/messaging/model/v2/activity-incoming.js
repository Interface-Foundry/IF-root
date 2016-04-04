'use strict';

const AbstractModelType = require('../abstract-model-type');
const Enums = require('./enums');
const AttachmentViewInfo = require('./attachment').AttachmentViewInfo;

const ModelValidation = require('../model-validation');

/**
 * Top-level class of the 'webhook' messages, currently simply array of activities
 *
 * @extends AbstractModelType
 *
 * @property {Array} activities - Array of ActivityIncomingBase imple,entations; array of activities
 */
class WebhookMessage extends AbstractModelType
{
    /**
     * Creates a new WebhookMessage instance
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.activities = null;
        if(inputData != null)
        {
            if(Array.isArray(inputData)) {
                this.activities = [];
                inputData.forEach(item => {
                    this.activities.push(instantiateIncomingActivity(item));
                });
            }
            else
            {
                throw new Error('the input data is not an array');
            }
        }
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        return ModelValidation.validateTypedObjectArray(
            context, this.activities, ActivityIncomingBase, 'WebhookMessage.activities', 'ActivityIncomingBase');
    }
}

/**
 * Base class with attributes common to all the incoming activities
 *
 * @extends AbstractModelType
 *
 * @property {String} activity - Enums.IncomingActivityType; type of the incoming activity
 * @property {String} from - activity originator identifier
 * @property {String} to - activity recipient identifier
 * @property {String} time - server time of the event in ISO8601 format, e.g. YYYY-mm-ddThh:MM:ssZ
 */
class ActivityIncomingBase extends AbstractModelType
{
    /**
     * Creates a new ActionBase instance; it is forbidden to call this constructor directly
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.activity = null;
        this.from = null;
        this.to = null;
        this.time = null;

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
        var errors = ModelValidation.validateEnum(context, this.activity, Enums.IncomingActivityType, 'ActivityIncomingBase.activity');

        errors = errors.concat(ModelValidation.validateString(context, this.from, 'ActivityIncomingBase.from'));
        errors = errors.concat(ModelValidation.validateString(context, this.to, 'ActivityIncomingBase.to'));
        errors = errors.concat(ModelValidation.validateString(context, this.time, 'ActivityIncomingBase.time'));

        if(this.time != null && typeof(this.time) === 'string' && !(
        /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/.test(this.time)
            )) {
            errors.push('ActivityIncomingBase.time value ' + ActivityIncomingBase.time + ' is not a valid timestamp string according to ISO8601');
        }

        return errors;
    }
}

/**
 * Message posted into the Skype chat
 *
 * @extends ActivityIncomingBase
 *
 * @property {String} id - message activity id
 * @property {String} content - message text, optionally with Skype rich text object such as emoticons
 */
class IncomingMessage extends ActivityIncomingBase
{
    /**
     * Creates a new IncomingMessage instance
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);

        this.id = null;
        this.content = null;
        this.activity = Enums.IncomingActivityType.Message;

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
        var errors = super.validate(context);

        errors = errors.concat(ModelValidation.validateString(context, this.id, 'IncomingMessage.id'));
        errors = errors.concat(ModelValidation.validateString(context, this.content, 'IncomingMessage.content'));

        if(this.activity != null && this.activity != Enums.IncomingActivityType.Message)
            errors.push('IncomingMessage.activity is set to invalid value ' + this.activity);

        return errors;
    }
}

/**
 * Attachment shared in the Skype chat
 *
 * @extends ActivityIncomingBase
 *
 * @property {String} id - message activity id
 * @property {String} content - message text, optionally with Skype rich text object such as emoticons
 */
class IncomingAttachment extends ActivityIncomingBase
{
    /**
     * Creates a new IncomingAttachment instance
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);

        this.id = null;
        this.type = null;
        this.name = null;
        this.views = null;
        this.activity = Enums.IncomingActivityType.Attachment;

        this.populatePlainInput(inputData,{
            'views': attrData => {
                return new AttachmentViewInfo(attrData);
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
        var errors = super.validate(context);

        errors = errors.concat(ModelValidation.validateString(context, this.id, 'IncomingAttachment.id'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.type, Enums.AttachmentType,  'IncomingAttachment.type'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.name, 'IncomingAttachment.name'));
        errors = errors.concat(ModelValidation.validateTypedObjectArray(context, this.views, AttachmentViewInfo, 'IncomingAttachment.views', 'AttachmentViewInfo'));

        if(this.activity != null && this.activity != Enums.IncomingActivityType.Attachment)
            errors.push('IncomingAttachment.activity is set to invalid value ' + this.activity);

        return errors;
    }
}

/**
 * Notification when the bot is added or removed from the other party contact list
 *
 * @extends ActivityIncomingBase
 *
 * @property {String} action - Enums.ContactRelationAction; specifies whether bot was added or removed from the contact list
 * @property {String} fromDisplayName - optional; friendly display name of the user in “from”
 */
class ContactRelationUpdate extends ActivityIncomingBase
{
    /**
     * Creates a new ContactRelationUpdate instance
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);

        this.action = null;
        this.fromDisplayName = null;
        this.activity = Enums.IncomingActivityType.ContactRelationUpdate;

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
        var errors = super.validate(context);

        errors = errors.concat(ModelValidation.validateEnum(context, this.action, Enums.ContactRelationAction, 'ContactRelationUpdate.action'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.fromDisplayName, 'ContactRelationUpdate.fromDisplayName'));

        if(this.activity != null && this.activity != Enums.IncomingActivityType.ContactRelationUpdate)
            errors.push('ContactRelationUpdate.activity is set to invalid value ' + this.activity);

        return errors;
    }
}

/**
 * Notification when conversation properties changes
 *
 * @extends ActivityIncomingBase
 *
 * @property {Array} membersAdded - optional, Array of strings; list of identifiers of the members added to the chat
 * @property {Array} membersRemoved - optional, Array of strings; list of identifiers of the members removed from the chat
 * @property {String} topicName - optional; new chat topic name
 * @property {String} historyDisclosed - optional; new chat history disclosing behaviour
 */
class ConversationUpdate extends ActivityIncomingBase
{
    /**
     * Creates a new ConversationUpdate instance
     *
     * @param {Object} inputData - the object received from Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);

        this.membersAdded = null;
        this.membersRemoved = null;
        this.topicName = null;
        this.historyDisclosed = null;
        this.activity = Enums.IncomingActivityType.ConversationUpdate;

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
        var errors = super.validate(context);

        errors = errors.concat(ModelValidation.validateOptionalArrayOfStrings(context, this.membersAdded, 'ConversationUpdate.membersAdded'));
        errors = errors.concat(ModelValidation.validateOptionalArrayOfStrings(context, this.membersRemoved, 'ConversationUpdate.membersRemoved'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.topicName, 'ConversationUpdate.topicName'));
        errors = errors.concat(ModelValidation.validateOptionalBoolean(context, this.historyDisclosed, 'ConversationUpdate.historyDisclosed'));

        if(this.activity != null && this.activity != Enums.IncomingActivityType.ConversationUpdate)
            errors.push('ConversationUpdate.activity is set to invalid value ' + this.activity);

        if(this.membersAdded == null && this.membersRemoved == null && this.topicName == null && this.historyDisclosed == null)
        {
            errors.push('ConversationUpdate is invalid, no optional attribute is set');
        }

        return errors;
    }
}

/**
 * instantiates proper incoming activity class object from the passed generic object
 *
 * @param {Object} inputData - object, possibly the relevant part of deserialized JSON received from the Messaging service
 *
 * @returns {Object} appropriate instance of ActivityIncomingBase extending class
 *
 * @throws Error if inputData are null, inputData.activity is not set or is not from Enums.IncomingActivityType
 */
function instantiateIncomingActivity(inputData)
{
    if(inputData == null)
    {
        throw new Error('activity data are null');
    }
    else if(typeof inputData  != 'object' || Array.isArray(inputData))
    {
        throw new Error('Invalid type of the activity data');
    }
    else if(inputData.activity == null)
    {
        throw new Error('activity attribute in the activity data is undefined or null');
    }

    switch(inputData.activity)
    {
    case Enums.IncomingActivityType.Attachment:
        return new IncomingAttachment(inputData);

    case Enums.IncomingActivityType.ContactRelationUpdate:
        return new ContactRelationUpdate(inputData);

    case Enums.IncomingActivityType.ConversationUpdate:
        return new ConversationUpdate(inputData);

    case Enums.IncomingActivityType.Message:
        return new IncomingMessage(inputData);
    }

    throw new Error('Unsupported ' + inputData.activity + ' activity type in the activity data');
}


module.exports = { ActivityIncomingBase, IncomingMessage, IncomingAttachment, ContactRelationUpdate,
                   ConversationUpdate, WebhookMessage, instantiateIncomingActivity };
