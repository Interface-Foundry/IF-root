'use strict';

const ModelValidation = require('./model-validation');
const CallingModelEnums = require('./enums');
const CallingModelLimits = require('./limits');
const Conversations = require('./conversation');
const RosterParticipant = require('./roster-participant');
const AbstractModelType = require('./abstract-model-type');
const CallBackLink = require('./callback-link');

/**
 * Base class for all notifications
 *
 * @extends ConversationBase
 *
 * @property {String} notificationType - string from CallingModelEnums.NotificationType; notification type identifier
 */
class NotificationBase extends Conversations.ConversationBase 
{
    /**
     * Creates a new NotificationBase instance; must not be called directly
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super(inputData);
        this.notificationType = null;

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

        errors = errors.concat(ModelValidation.validateEnum(context, this.notificationType, CallingModelEnums.NotificationType, 'NotificationBase.notificationType'));

        return errors;      
    }
}

/**
 * This class represents notification when a call state changes
 *
 * @extends NotificationBase
 *
 * @property {String} currentState - string from CallingModelEnums.CallState; current call state after the change.
 */
class CallStateChangeNotification extends NotificationBase 
{
    /**
     * Creates a new CallStateChangeNotification notification
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.notificationType = CallingModelEnums.NotificationType.CallStateChange;
        this.currentState = null;

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

        errors = errors.concat(ModelValidation.validateEnum(context, this.currentState, CallingModelEnums.CallState, 'CallStateChangeNotification.currentState'));
        if(this.notificationType != null && this.notificationType != CallingModelEnums.NotificationType.CallStateChange)
        {
            errors.push('CallStateChangeNotification.notificationType is set to ' + this.notificationType +
                        ' instead of CallingModelEnums.NotificationType.CallStateChange');
        }

        return errors;      
    }
}

/**
 * This class represents notification when list of call participant changes
 *
 * @extends NotificationBase
 *
 * @property {Object[]} participants - optional, array of RosterParticipant. Full list of the participants after the change.
 */
class RosterUpdateNotification extends NotificationBase 
{
    /**
     * Creates a new RosterUpdateNotification notification
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.notificationType = CallingModelEnums.NotificationType.RosterUpdate;
        this.participants = null;

        this.populatePlainInput(inputData, {
            'participants' : attrData =>{return new RosterParticipant(attrData);}
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

        errors = errors.concat(ModelValidation.validateTypedObjectArray(context, this.participants, RosterParticipant,
                              'RosterUpdateNotification.participants', 'RosterParticipant'));
        if(this.notificationType != null && this.notificationType != CallingModelEnums.NotificationType.RosterUpdate)
        {
            errors.push('CallStateChangeNotification.notificationType is set to ' + this.notificationType +
                ' instead of CallingModelEnums.NotificationType.RosterUpdate');
        }


        return errors;      
    }
}

/**
 * This class contains the response the customer sent for the notification POST to their callback url.
 *
 * @extends AbstractModelType
 *
 * @property {Object} links - optional, Callback. Link to call back the customer on, once we have processed the notification response from customer
 * @property {String} appState - optional. Opaque string to received in the request
 * @property {Object} additionalData - optional. Additional arbitrary data
 */
class NotificationResponse extends AbstractModelType
{
    /**
     * Creates a new notification response
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.links = null;
        this.appState = null;
        this.additionalData = null;

        this.populatePlainInput(inputData, {
            'links' : attrData => { return new CallBackLink(attrData);}
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

        errors = errors.concat(ModelValidation.validateOptionalTypedObject(context, this.links, CallBackLink, true, 'NotificationResponse.links', 'CallBackLink'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.appState, 'NotificationResponse.appState', true, CallingModelLimits.AppStateLength.Max ));
        errors = errors.concat(ModelValidation.validateGenericObject(context, this.additionalData, 'NotificationResponse.additionalData'));

        return errors;
    }
}

/**
 * instantiates proper notification class object from the passed generic object
 *
 * @param {Object} notificationData - object, possibly the relevant part of deserialized JSON received from the Calling service
 * @returns {Object} appropriate instance of NotificationBase extending class
 *
 * @throws Error if notificationData are null, notificationData.notificationType is not set or is not from CallingModelEnums.NotificationType
 */
function instantiateNotification(notificationData)
{
    if(notificationData == null)
    {
        throw new Error('notification data are null');
    }
    else if(typeof notificationData  != 'object' || Array.isArray(notificationData))
    {
        throw new Error('Invalid type of the notification data');
    }
    else if(notificationData.notificationType == null)
    {
        throw new Error('notificationType attribute in the notification data is undefined or null');
    }

    switch(notificationData.notificationType)
    {
    case CallingModelEnums.NotificationType.CallStateChange:
        return new CallStateChangeNotification(notificationData);

    case CallingModelEnums.NotificationType.RosterUpdate:
        return new RosterUpdateNotification(notificationData);
    }

    throw new Error('Unsupported ' + notificationData.notificationType + ' notification type in the notification data');
}

module.exports = {NotificationBase, CallStateChangeNotification, RosterUpdateNotification, NotificationResponse, instantiateNotification};
