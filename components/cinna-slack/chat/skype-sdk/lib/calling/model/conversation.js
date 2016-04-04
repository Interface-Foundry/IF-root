'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelLimits = require('./limits');
const CallingModelEnums = require('./enums');
const Participant = require('./participant');
const Outcomes = require('./operation-outcomes');

/**
 * This base class defines a basic subset of properties which define a conversation.
 * Conversation class derives from this and adds more properties - they are passed in OnIncomingCall
 * ConversationResult class derives from this and adds more properties - they are passed in POST to callback Url to list operation outcomes
 *
 * @extends AbstractModelType
 *
 * @property {String} id - conversation unique identifier
 * @property {String} appId - optional. Application Id of the customer
 * @property {String} appState - optional. Opaque string to facilitate app developers to pass their custom data in this field back in the response
 * @property {Object} links - optional. Any links we want to surface to the customer for them to invoke us back on.
 */
class ConversationBase extends AbstractModelType
{
    /**
     * Creates a new conversationBase when called from the inheriting class. Must not be used directly.
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.id = null;
        this.appId = null;
        this.appState = null;
        this.links = null;

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
        var errors = [];

        errors = errors.concat(ModelValidation.validateString(context, this.id, 'ConversationBase.id'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.appState, 'ConversationBase.appState', true, CallingModelLimits.AppStateLength.Max ));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.appId, 'ConversationBase.appId'));
        errors = errors.concat(ModelValidation.validateDictionaryOfStrings(context, this.links, 'ConversationBase.links'));

        return errors;      
    }
}

/**
 * This class defines the set of the properties that define a conversation.
 * A conversation includes participants, modalities etc.
 * This object is specified in the body of the OnIncomingCall request sent to the client.
 * This object is used to represent both incoming and outgoing conversations.
 *
 * @extends ConversationBase
 *
 * @property {Object[]} participants - Participant class; array of participants in the conversation
 * @property {Boolean} isMultiParty - true if the call is a group call
 * @property {String} threadId - id of the chat thread if isMultiParty is true
 * @property {String[]} presentedModalityTypes - the modalities present in the call (audio, video, ...)
 * @property {String} callState - CallingModelEnums.CallState. Current state of the call
 * @property {String} subject - optional. Subject of the call
 * @property {Object} additionalData - optional. Additional arbitrary data
 */
class Conversation extends ConversationBase 
{
    /**
     * Creates a new conversation
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.participants = null; 
        this.isMultiParty = false;
        this.threadId = null;
        this.presentedModalityTypes = null;
        this.callState = null;
        this.subject = null;
        this.additionalData = null;

        this.populatePlainInput(inputData, {
            'participants' : function(attrData){return new Participant(attrData);}}
        );
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context) 
    {
        var errors = [];
        errors = errors.concat(super.validate(context));
        
        if(this.isMultiParty != null && this.isMultiParty)
        {
            errors = errors.concat(ModelValidation.validateString(context, this.threadId, 'Conversation.threadId'));
        }
        else
        {
            if(this.threadId != null) errors.push('Conversation.threadId must be null when Conversation.isMultiParty is not set');
        }

        errors = errors.concat(ModelValidation.validateEnum(context, this.callState, CallingModelEnums.CallState, 'Conversation.callState'));
        errors = errors.concat(ModelValidation.validateTypedObjectArray(context, this.participants, Participant, 'Conversation.participants', 'Participant'));
        errors = errors.concat(ModelValidation.validateEnumArray(context, this.presentedModalityTypes, CallingModelEnums.ModalityType, 'Conversation.presentedModalityTypes'));
        errors = errors.concat(ModelValidation.validateBoolean(context, this.isMultiParty, 'Conversation.isMultiParty'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.subject, 'Conversation.subject'));
        errors = errors.concat(ModelValidation.validateGenericObject(context, this.additionalData, 'Conversation.additionalData'));

        return errors;
    }
}

/**
 * Top class wrapping the result of the last workflow issued by the bot to the Calling service
 *
 * @extends ConversationBase
 * @property {Object} operationOutcome - The outcome of the last executed action in the previous workflow
 * @property {String} callState - CallingModelEnums.CallState. Current state of the call.
 */
class ConversationResult extends ConversationBase
{
    /**
     * Creates a new conversation result
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.operationOutcome = null;
        this.callState = CallingModelEnums.CallState.Idle;

        this.populatePlainInput(inputData, {
            'operationOutcome' : attrData => { return Outcomes.instantiateOperationOutcome(attrData); }
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
        var errors = [];
        errors = errors.concat(super.validate(context));

        errors = errors.concat(ModelValidation.validateEnum(context, this.callState, CallingModelEnums.CallState, 'ConversationResult.callState'));
        errors = errors.concat(ModelValidation.validateTypedObject(context, this.operationOutcome, Outcomes.OperationOutcomeBase, 'ConversationResult.operationOutcome', 'OperationOutcomeBase'));

        return errors;
    }
}

module.exports = { ConversationBase, Conversation, ConversationResult};