'use strict';

const EventEmitter = require('events').EventEmitter;
const MessagingBotService = require('./messaging/messaging-service');
const CallingService = require('./calling/calling-service');
const eventTypes = require('./messaging/messaging-service-request-processor-v2').EventTypes;

/**
 * BotService unifies events and commands for both messaging and calling.
 * 
 * ### Messaging
 * For messaging events you can register multiple handlers, because
 * processing and replying to a message is done asynchronously.
 * Messaging events you can use are the following:
 *   - [contactAdded]{@link BotService#event:contactAdded}
 *   - [contactRemoved]{@link BotService#event:contactRemoved}
 *   - [message]{@link BotService#event:message}
 *   - [personalMessage]{@link BotService#event:personalMessage}
 *   - [groupMessage]{@link BotService#event:groupMessage}
 *   - [threadBotAdded]{@link BotService#event:threadBotAdded}
 *   - [threadAddMember]{@link BotService#event:threadAddMember}
 *   - [threadBotRemoved]{@link BotService#event:threadBotRemoved}
 *   - [threadRemoveMember]{@link BotService#event:threadRemoveMember}
 *   - [threadTopicUpdated]{@link BotService#event:threadTopicUpdated}
 *   - [threadHistoryDisclosedUpdate]{@link BotService#event:threadHistoryDisclosedUpdate}
 *   - [attachment]{@link BotService#event:attachment}
 * 
 * For personal and group commands it's necessary to also provide a regular expression, 
 * so there are helper function for that.
 *   - [onPersonalCommand()]{@link BotService#onPersonalCommand}
 *   - [onGroupCommand()]{@link BotService#onGroupCommand}
 * 
 * ### Calling
 * Calling events are synchronous and you need to respond to each one.
 * To ensure there is exactly one handler, the interface for these events
 * is slightly different and instead of using node.js events we provide
 * methods for registering the handlers like [onIncomingCall()]{@link BotService#onIncomingCall}.
 * The complete list of calling events is as follows:
 *   - [onIncomingCall()]{@link BotService#onIncomingCall}
 *   - [onAnswerCompleted()]{@link BotService#onAnswerCompleted}
 *   - [onRejectCompleted()]{@link BotService#onRejectCompleted}
 *   - [onHangupCompleted()]{@link BotService#onHangupCompleted}
 *   - [onPlayPromptCompleted()]{@link BotService#onPlayPromptCompleted}
 *   - [onRecognizeCompleted()]{@link BotService#onRecognizeCompleted}
 *   - [onRecordCompleted()]{@link BotService#onRecordCompleted}
 *   - [onWorkflowValidationCompleted()]{@link BotService#onWorkflowValidationCompleted}
 *   - [onCallStateChange()]{@link BotService#onCallStateChange}
 */
class BotService extends EventEmitter {
    /**
     * Create a new BotService instance. You don't have to specify both messaging and calling options if you need just one of them.
     * 
     * @param {Object} configuration - Bot Platform configuration.
     * @param {Object} [configuration.messaging] - Configuration for messaging service. Mandatory only if you want to use messaging service.
     * @param {string} configuration.messaging.botId - The bot's id (e.g. "28:trivia_bot").
     * @param {string} configuration.messaging.appId - The bot's application id for OAuth.
     * @param {string} configuration.messaging.appSecret - The bot's application secret for OAuth.
     * @param {number} configuration.messaging.requestTimeout - The https request timeout in milliseconds.
     * @param {Object} [configuration.calling] - Configuration for calling service. Mandatory only if you want to use calling service.
     * @param {string} configuration.calling.callbackUri - The url that will be sent with each request
     *       as the callback url. Can be overriden in a workflow for each request.
     */
    constructor(configuration) {
        super();
        
        this.messagingBotService = null;
        if ('messaging' in configuration) {
            this.messagingBotService = new MessagingBotService(configuration.messaging);
        }
        
        this.callingBotService = null;
        if ('calling' in configuration) {
            this.callingBotService = new CallingService(configuration.calling.callbackUri);
        }
        
        let messagingEvents = [];
        for (let eventName in eventTypes) {
            messagingEvents.push(eventTypes[eventName]);
        }
                
        this.on('newListener', (event, listener) => {
            if (messagingEvents.indexOf(event) > -1 && this.messagingBotService !== null) {
                this.messagingBotService.on(event, listener);
            }
        });
        
        this.on('removeListener', (event, listener) => {
            if (messagingEvents.indexOf(event) > -1 && this.messagingBotService !== null) {
                this.messagingBotService.removeListener(event, listener);
            }
        });
    }
    
    //
    // Messaging
    //
    
    /**
     * Register handler for command in 1:1 chats (messaging).
     * Callback will be called if there is a message in any 1:1 that matches the regular expression.
     *
     * **Note:** If a command is matched, the [personalMessage]{@link BotService#event:personalMessage} event won't be emitted.
     * 
     * @param {RegExp} regex - The regular expression that is used for matching 1:1 messages.
     * @param {BotService~commandCallback} callback - The callback that is called when a message is matched. 
     */
    onPersonalCommand(regex, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.onPersonalCommand(regex, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Register handler for command in group chats (messaging).
     * Callback will be called if there is a message in any group chat that matches the regular expression.
     * 
     * **Note:** If a command is matched, the [groupMessage]{@link BotService#event:groupMessage} event won't be emitted.
     * 
     * @param {RegExp} regex - The regular expression that is used for matching 1:1 messages.
     * @param {BotService~commandCallback} callback - The callback that is called when a message is matched. 
     */
    onGroupCommand(regex, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.onGroupCommand(regex, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Callback is called once the sent message is delivered / failed.
     * 
     * @callback BotService~sendMessageCallback
     * 
     * @param {Error} error - An error, if sending failed.
     */
    
    /**
     * Send a message. Message can be sent to any user or group chat (messaging).
     * 
     * @param {string} to - The recipient's username.
     * @param {string} content - The content of the message. If any html tags are present, they need to be valid or escaped (see `escape` parameter).
     * @param {bool} [escape] - If true, content will be escaped to prevent "&", "<", and ">" from breaking the message.
     * @param {BotService~sendMessageCallback} callback - The callback that handles the response.
     */
    send(to, content, escape, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.send(to, content, escape, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Callback for sending attachments.
     * 
     * @callback BotService~attachmentSentCallback
     * 
     * @param {Error} error - The error if there was one.
     * @param {AttachmentResponse} attachmentResponse - The response received after attachment was sent.
     */
    
    /**
     * Send an attachment (media) to a user or group chat
     *
     * @param {string} to - The username or group id of recipient.
     * @param {string} name - The attachment's name, `null` means no name is provided.
     * @param {string} type - The attachment's type, must be 'Image' or 'Video'.
     * @param {Buffer} binaryContent - The content that should be sent (binary data).
     * @param {Buffer} [thumbnailContent] - The thumbnail for the sent content (binary data).
     * @param {BotService~attachmentSentCallback} callback - Callback that is called after the attachment is sent.
     */
    sendAttachment(to, name, type, binaryContent, thumbnailContent, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.sendAttachment(to, name, type, binaryContent, thumbnailContent, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Callback for sending attachments and getting information about attachments.
     * 
     * @callback BotService~attachmentInfoCallback
     * 
     * @param {Error} error - The error if there was one.
     * @param {AttachmentInfo} attachmentInfo - The received information about the attachment.
     */
    
    /**
     * Get information about an attachment.
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link BotService~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {BotService~attachmentInfoCallback} callback - The callback that is called after the information is received.
     */
    getAttachmentInfo(attachmentId, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.getAttachmentInfo(attachmentId, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Callback for getting content of attachments.
     * 
     * @callback BotService~attachmentContentCallback
     * 
     * @param {Error} error - The error if there was one. 
     * @param {Buffer} content - The content of the blob.
     */
    
    /**
     * Get content of attachment (binary data).
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link BotService~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {string} viewId - The identifier of the attachment view (either 'original' or 'thumbnail') available in the attachment's info ({@link AttachmentInfo}).
     * @param {BotService~attachmentContentCallback} callback - The callback that is triggered after the attachment's content is downloaded.
     */
    getAttachment(attachmentId, viewId, callback) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.getAttachment(attachmentId, viewId, callback);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    /**
     * Process request and emit events (messaging).
     * 
     * @param {string | object} request - The body of the request received from messaging service.
     * 
     * @emits BotService#event:contactAdded
     * @emits BotService#event:contactRemoved
     * @emits BotService#event:message
     * @emits BotService#event:personalMessage
     * @emits BotService#event:groupMessage
     * @emits BotService#event:threadBotAdded
     * @emits BotService#event:threadAddMember
     * @emits BotService#event:threadBotRemoved
     * @emits BotService#event:threadRemoveMember
     * @emits BotService#event:threadTopicUpdated
     * @emits BotService#event:threadHistoryDisclosedUpdate
     * @emits BotService#event:attachment
     */
    processMessagingRequest(request) {
        if (this.messagingBotService !== null) {
            this.messagingBotService.processRequest(request);
        } else {
            throw new Error('Messaging not configured.');
        }
    }
    
    //
    // Calling
    //
    
    
    /**
     * Callback to finish processing of events.
     * 
     * @callback BotService~finishEventHandling
     * 
     * @param {Error} error
     * @param {Workflow} workflow
     */
    
    /** 
     * Callback to finish notification processing.
     * @callback BotService~finishNotificationHandling
     * 
     * @param {Error} error
     * @param {NotificationResponse} notificationResponse
     */
    
    /**
     * Callback to handle calling events.
     * 
     * @callback BotService~callNotificationHandler
     * 
     * @param {ConversationResult} conversationResult - The result of the last workflow.
     * @param {Workflow} workflow - The new workflow that should be updated and sent.
     * @param {BotService~finishEventHandling} callback - The callback to finish the processing of the event.
     */
    
    /**
     * Callback to handle calling events.
     * 
     * @callback BotService~recordNotificationHandler
     * 
     * @param {ConversationResult} conversationResult - The result of the last workflow.
     * @param {Buffer} record - The recorded audio in WMA format.
     * @param {Workflow} workflow - The new workflow that should be updated and sent.
     * @param {BotService~finishEventHandling} callback - The callback to finish the processing of the event.
     */
    
    /**
     * Register handler for the "answer action completed" event (calling).
     * 
     * You need to reply with an {@link Answer} action to incoming call to answer it.
     * After the {@link Answer} action is executed, you will get "answer action completed" event.
     * You need to implement this handler to be able to continue after answering the call.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link AnswerOutcome} class.  
     * 
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onAnswerCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onAnswerCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Callback to handle call state change.
     * 
     * @callback BotService~callStateChangeCallback
     * 
     * @param {CallStateChangeNotification} callStateChangeNotification
     * @param {NotificationResponse} notificationResponse
     * @param {BotService~finishNotificationHandling} callback - The event handler.
     */
        
    /**
     * Register handler for call state change (calling).
     * 
     * @param {BotService~callStateChangeCallback} handler
     */
    onCallStateChange(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onCallStateChange(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Register handler for "hangup action completed" event (calling).
     * 
     * During the call you can at any time send a {@link Hangup} action to end the call.
     * After the {@link Hangup} action is executed, you will get the "hangup action completed" event.
     * If you want to do some cleanup after the call is terminated, you need to implement a handler for this event.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link HangupOutcome} class.  
     * 
     * **Note**: In your handler you still need to call the callback, but don't provide any workflow as the call is already terminated.
     * 
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onHangupCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onHangupCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Callback to handle incoming call (calling).
     * 
     * @callback BotService~incomingCallHandler
     * 
     * @param {Conversation} conversation - The incoming call.
     * @param {Workflow} workflow - The workflow for responding to the event.
     * @param {BotService~finishEventHandling} callback - The callback to finish processing of the event.
     */
    
    /**
     * Register handler for incoming call (calling).
     * 
     * You get an event for each incoming call and it's up to you to decide if you
     * want to answer or reject the call. You need to implement this handler to be
     * able to answer or reject incoming calls.
     * 
     * @param {CallingBotService~incomingCallHandler} Event handler.
     */
    onIncomingCall(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onIncomingCall(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Register handler for "play prompt action completed" event (calling).
     * 
     * The registered handler will be called after a {@link PlayPrompt} action is executed.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link PlayPromptOutcome} class.  
     *
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onPlayPromptCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onPlayPromptCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Register handler for "recognize action completed" event (calling).
     * 
     * The registered handler will be called after a {@link Recognize} action is executed.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link RecognizeOutcome} class.  
     * 
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onRecognizeCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onRecognizeCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Register handler for "record action completed" event (calling).
     * 
     * The registered handler will be called after a {@link Record} action is executed.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link RecordOutcome} class.  
     * 
     * @param {BotService~recordNotificationHandler} handler - The event handler.
     */
    onRecordCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onRecordCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Register handler for "reject action completed" event (calling).
     * 
     * The registered handler will be called after an incoming call is rejected.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link RejectOutcome} class.  
     * 
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onRejectCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onRejectCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /** 
     * Register handler for "workflow validation completed" event (calling).
     * 
     * The "workflow validation completed" event will be emitted only if you send 
     * invalid {@link Workflow}.
     * 
     * In your handler you will get a {@link ConversationResult} object, it contains an `operationOutcome` field that has all the details about the outcome. For this handler, it will be an instance of {@link WorkflowValidationOutcome} class.  
     * 
     * @param {BotService~callNotificationHandler} handler - The event handler.
     */
    onWorkflowValidationCompleted(handler) {
        if (this.callingBotService !== null) {
            this.callingBotService.onWorkflowValidationCompleted(handler);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Callback to finish incoming call processing.
     * 
     * If there is an error, the server should respond with 500, otherwise
     * it should return 201 and the responseMessage as the body.
     * 
     * @callback BotService~processCallCallback
     * 
     * @param {Error} error
     * @param {string} responseMessage
     */
    
    /**
     * Process new incoming call.
     * 
     * Processes new incoming call and emits a new "incomingCall" event.
     * Will call the handler registered by [onIncomingCall()]{@link BotService#onIncomingCall}.
     * 
     * @param {object} content - The body of the request received from Bot platform.
     * @param {BotService~processCallCallback}
     */
    processCall(content, callback) {
        if (this.callingBotService !== null) {
            this.callingBotService.processCall(content, callback);
        } else {
            throw new Error('Calling not configured.');
        }
    }
    
    /**
     * Process new incoming callbacks.
     * 
     * Process a new incoming callback and call proper event handler.
     * 
     * @param {object} content - The body of the request received from Bot platform.
     * @param {additionalData} additionalData - The additional binary data received from Bot platform.
     * @param {BotService~processCallCallback}
     */
    processCallback(content, additionalData, callback) {
        if (this.callingBotService !== null) {
            this.callingBotService.processCallback(content, additionalData, callback);
        } else {
            throw new Error('Calling not configured.');
        }
    }
}

module.exports = BotService;