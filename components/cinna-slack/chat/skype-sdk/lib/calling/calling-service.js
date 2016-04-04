'use strict';

const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('skype-sdk.calling.CallingService');
const inspect = require('util').inspect;

const conversations = require('./model/conversation');
const notifications = require('./model/notifications');
const enums = require('./model/enums');
const Workflow = require('./model/workflow');
const CallBackLink = require('./model/callback-link');

/**
 * Class representing a calling bot service.
 * 
 * Handles communication with Bot platform and emits events.
 */
class CallingService extends EventEmitter {
    /**
     * Create a bot service.
     * 
     * @param {string} callbackUri - The url that will be sent with each request
     *       as the callback url. Can be overriden in a workflow for each request.
     */
    constructor(callbackUri) {
        super();
        
        this.callbackUri = callbackUri;
        
        this.incomingCallHandler = null;
        this.callStateChangeHandler = null;
        this.answerCompletedHandler = null;
        this.hangupCompletedHandler = null;
        this.playPromptCompletedHandler = null;
        this.recognizeCompletedHandler = null;
        this.recordCompletedHandler = null;
        this.rejectCompletedHandler = null;
        this.workflowValidationCompletedHandler = null;
    }
    
    /**
     * Callback to finish processing of events.
     * 
     * @callback CallingBotService~finishEventHandling
     * 
     * @param {Error} error
     * @param {Workflow} workflow
     */
        
    /**
     * Callback to handle incoming call.
     * 
     * @callback CallingBotService~incomingCallHandler
     * 
     * @param {Conversation} conversation - The incoming call.
     * @param {Workflow} workflow - The workflow for responding to the event.
     * @param {CallingBotService~finishEventHandling} callback - The callback to finish processing of the event.
     */
    
    /**
     * Register handler for incoming call.
     * 
     * @param {CallingBotService~incomingCallHandler} Event handler.
     */
    onIncomingCall(handler) {
        this.incomingCallHandler = handler;
    }
    
    onCallStateChange(handler) {
        this.callStateChangeHandler = handler;
    }
    
    onAnswerCompleted(handler) {
        this.answerCompletedHandler = handler;
    }
    
    onHangupCompleted(handler) {
        this.hangupCompletedHandler = handler;
    }
    
    onPlayPromptCompleted(handler) {
        this.playPromptCompletedHandler = handler;
    }
    
    onRecognizeCompleted(handler) {
        this.recognizeCompletedHandler = handler;
    }
    
    onRecordCompleted(handler) {
        this.recordCompletedHandler = handler;
    }
    
    onRejectCompleted(handler) {
        this.rejectCompletedHandler = handler;
    }
    
    onWorkflowValidationCompleted(handler) {
        this.workflowValidationCompletedHandler = handler;
    }
    
    /**
     * Callback to finish incoming call processing.
     * 
     * If there is an error, the server should respond with 500, otherwise
     * it should return 201 and the responseMessage as the body.
     * 
     * @callback CallingBotService~processCallCallback
     * 
     * @param {Error} error
     * @param {string} responseMessage
     */
    
    /**
     * Process new incoming call.
     * 
     * Processes new incoming call and emits a new "incomingCall" event.
     * 
     * @param {object} content - The body of the request received from Bot platform.
     * @param {CallingBotService~processCallCallback}
     */
    processCall(content, callback) {
        const conversation = new conversations.Conversation(content);
        const errors = conversation.validate();
        if (errors.length !== 0) {
            debug(`Received conversation is invalid: ${inspect(content, { depth: 5 })}`);
            for (let error of errors) {
                debug('\t' + error);
            }
            
            return callback(new Error('Received invalid conversation.'));
        }
        
        this._tryCallHandler(
            this.incomingCallHandler,
            callback,
            [conversation, this._createWorkflow(), this._createWorkflowCallback(callback)]);
    }
    
    processCallback(content, additionalData, callback) {
        let result;
        let invalid = false;
        try {
            result = new conversations.ConversationResult(content);
        } catch (err) {
            invalid = true;
        }
        
        let errors = [];
        if (!invalid) {
            errors = result.validate();
        }
            
        if (errors.length > 0 || invalid) {
            debug(`Conversation result is invalid: ${inspect(content, { depth: 5 })}`);
            for (let error of errors) {
                debug('\t' + error);
            }
            debug('Trying to parse content as notification.');
            
            return this._processNotification(content, additionalData, (error, notificationResponse) => {
                if (error) { return callback(error); }
                
                const errors = notificationResponse.validate();
                if (errors.length > 0) { return callback(new Error('Received invalid notification response.')); }
                
                callback(null, notificationResponse);
            });
        }
        
        this._processConversationResult(result, additionalData, this._createWorkflowCallback(callback));
    }
    
    _createWorkflowCallback(callback) {
        return (error, workflow) => {
            if (error) { return callback(error); }
            
            if (workflow) {
                const errors = workflow.validate();
                if (errors.length > 0) { 
                    debug(`Workflow is invalid: ${inspect(workflow, { depth: 5 })}`);
                    for (let error of errors) {
                        debug('\t' + error);
                    }
                    
                    return callback(new Error('Received invalid workflow.')); 
                }
                callback(null, workflow);
            } else {
                callback(null);
            }            
        };
    }
    
    _createWorkflow() {
        const workflow = new Workflow();
        workflow.links = new CallBackLink({callBack: this.callbackUri});
        workflow.actions = [];
        return workflow;
    }
        
    _processNotification(content, additionalData, callback) {
        if (!('type' in content)) {
            return callback(new Error('Callback content not recognized.'));
        }
        
        if (content.type === enums.NotificationType.CallStateChange) {
            this._processCallStateChange(content, additionalData, callback);
        } else if (content.type === enums.NotificationType.RosterUpdate) {
            return callback(new Error('RosterUpdate event not supported yet.'));
        } else {
            return callback(new Error('Notification type not recognized.'));
        }
    }
    
    _processConversationResult(result, additionalData, callback) {
        const workflow = this._createWorkflow();
        
        if (result.operationOutcome.type === enums.OutcomeType.AnswerOutcome) {
            this._tryCallHandler(this.answerCompletedHandler, callback, [result, workflow, callback]);
            
        } else if (result.operationOutcome.type === enums.OutcomeType.HangupOutcome) {
            this._tryCallHandler(this.hangupCompletedHandler, callback, [result, workflow, callback]);
            
        } else if (result.operationOutcome.type === enums.OutcomeType.PlayPromptOutcome) {
            this._tryCallHandler(this.playPromptCompletedHandler, callback, [result, workflow, callback]);
            
        } else if (result.operationOutcome.type === enums.OutcomeType.RecognizeOutcome) {
            this._tryCallHandler(this.recognizeCompletedHandler, callback, [result, workflow, callback]);
        
        } else if (result.operationOutcome.type === enums.OutcomeType.RecordOutcome) {
            this._tryCallHandler(this.recordCompletedHandler, callback, [result, additionalData, workflow, callback]);
        
        } else if (result.operationOutcome.type === enums.OutcomeType.RejectOutcome) {
            this._tryCallHandler(this.rejectCompletedHandler, callback, [result, workflow, callback]);
            
        } else if (result.operationOutcome.type === enums.OutcomeType.WorkflowValidationOutcome) {
            this._tryCallHandler(this.workflowValidationCompletedHandler, callback, [result, workflow, callback]);
            
        } else {
            callback(new Error('Unknown conversation result type.'));
        }
    }
    
    _processCallStateChange(content, callback) {
        const notification = new notifications.CallStateChangeNotification(content);
        const errors = notification.validate();
        if (errors.length > 0) {
            debug(`Call state notification is invalid: ${inspect(notification, { depth: 5 })}`);
            for (let error of errors) {
                debug('\t' + error);
            }
            callback(new Error('Invalid call state notification.'));
        }
        
        const response = new notifications.NotificationResponse();
        this._tryCallHandler(this.callStateChangeHandler, callback, [notification, response, callback]);
    }
        
    _tryCallHandler(handler, callback, args) {
        if (handler === null) {
            return callback(new Error('No event handler found.'));
        } else {
            handler.apply(null, args);
        }
    }
}

module.exports = CallingService;