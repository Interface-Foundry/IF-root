'use strict';

const AbstractModelType = require('./abstract-model-type');
const ModelValidation = require('./model-validation');
const CallingModelEnums = require('./enums');
const CallingModelLimits = require('./limits');
const CallBackLink = require('./callback-link');
const Actions = require('./actions');

/**
 * This class contains the workflow the customer sent for the OnInComingCall POST or any subsequent POST to their callback url.
 * Basically this workflow defines the set of actions, the customer wants us to perform and then callback to them.
 *
 * @extends AbstractModelType
 *
 * @property {String} actions - list of actions to perform . ex : playPrompt, record, hangup
 * @property {Object} links - optional. Callback link to call back the customer on, once we have performed the set of actions
 * @property {String} appState - optional. Opaque string to facilitate app developers to pass their custom data in this field . This field is echo'd back in the 'result' POST for this 'workflow'
 * @property {String} notificationSubscriptions - optional. Registration to notification updates. Registration to CallingModelEnums.NotificationType.CallStateChange must be set as is by default, rosterUpdate is relevant only for multiparty calls.
 * @property {Object} additionalData - optional. Additional arbitrary data
 */
class Workflow extends AbstractModelType
{
    /**
     * Creates a new workflow
     *
     * @param {Object} inputData - the object received from Calling service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();
        this.links = null;
        this.actions = null;
        this.appState = null;
        this.notificationSubscriptions = [ CallingModelEnums.NotificationType.CallStateChange ];
        this.additionalData = null;

        this.populatePlainInput(inputData, {
            'links' : attrData => { return new CallBackLink(attrData); },
            'actions' : attrData => { return Actions.instantiateAction(attrData); }});
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

        errors = errors.concat(ModelValidation.validateOptionalTypedObject(context, this.links, CallBackLink, 'Workflow.links', 'CallBackLink'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.appState, 'Workflow.appState', false, CallingModelLimits.AppStateLength.Max));
        errors = errors.concat(ModelValidation.validateEnumArray(context, this.notificationSubscriptions, CallingModelEnums.NotificationType, 'Workflow.notificationSubscriptions'));
        if(Array.isArray(this.notificationSubscriptions) && this.notificationSubscriptions.indexOf(CallingModelEnums.NotificationType.CallStateChange) < 0)
        {
            errors.push('Workflow.notificationSubscriptions does not contain subscription to ' + CallingModelEnums.NotificationType.CallStateChange + ' notification as it should');
        }
        errors = errors.concat(ModelValidation.validateGenericObject(context, this.additionalData, 'Workflow.additionalData'));

        errors = errors.concat(Actions.validateActionArray(context, this.actions, 'Workflow.actions'));
        
        return errors;      
    }
}

module.exports = Workflow;