/// <reference path="../../typings/main.d.ts" />
'use strict';

const debug = require('debug')('skype-sdk.MessagingService');
const EventEmitter = require('events').EventEmitter;

const MessagingServiceClient = require('./messaging-service-client');
const MessagingServiceClientV2 = require('./messaging-service-client-v2');
const Bot = require('./bot');
const Message = require('./events/message');
const ContactNotification = require('./events/contact-notification');
const HistoryDisclosed = require('./events/history-disclosed');
const TopicUpdated = require('./events/topic-updated');
const UserAdded = require('./events/user-added');
const UserRemoved = require('./events/user-removed');
const eventTypes = require('./messaging-service-request-processor-v2').EventTypes;

const WebhookEvents = require('./messaging-service-request-processor-v2');

/**
 * Class representing a messaging service.
 * 
 * Handles communication with messaging service and emits events.
 */
class MessagingService extends EventEmitter {
    /**
     * Create an agent service.
     * 
     * @param {Object} options - Configuration for messaging service. For additional optional arguments see {@link MessagingServiceClient} and {@link S2SClient}.
     * @param {string} options.botId - The bot's id (e.g. "28:trivia_agent").
     * @param {string} options.messagingServiceVersion - optional, default 2; version of the messaging service to use
     * @param {number} options.siteId - The agent's Site ID, for server to server authentication.
     * @param {string} options.key - The path of the private key of the agent in PEM format. Used for server to server authentication.
     * @param {string} options.cert - The path of the certificate key of the agent in PEM format. Used for server to server authentication.
     */
    constructor(options) {
        super();

        this._messagingServiceVersion = options.messagingServiceVersion || 2;
        
        if (this._messagingServiceVersion == 1) {
            this._messagingServiceClient = new MessagingServiceClient(options);
        }
        else
        {
            this._messagingServiceClient = new MessagingServiceClientV2(options);
        }
                
        this._botId = options.botId.trim();
        this._personalCommandMappings = [];
        this._groupCommandMappings = [];

        this.on('message', this._parseMessage);
    }
    
    /**
     * Register handler for command in 1:1 chats.
     * Callback will be called if there is a message in any 1:1 that matches the regular expression.
     * 
     * @param {RegExp} regex - The regular exception that is used for matching 1:1 messages.
     * @param {BotService~commandCallback} callback - The callback that is called when a message is matched. 
     */
    onPersonalCommand(regex, callback) {
        this._personalCommandMappings.push({regex: regex, callback: callback});
    }
    
    /**
     * Register handler for command in group chats.
     * Callback will be called if there is a message in any group chat that matches the regular expression.
     * 
     * @param {RegExp} regex - The regular exception that is used for matching 1:1 messages.
     * @param {BotService~commandCallback} callback - The callback that is called when a message is matched. 
     */
    onGroupCommand(regex, callback) {
        this._groupCommandMappings.push({regex: regex, callback: callback});
    }
       
    /**
     * Send a message. Message can be sent to any user or group chat.
     * 
     * @param {string} to - The recipient's username.
     * @param {string} content - The content of the message.
     * @param {bool} [escape] - If true, content will be escaped to prevent "&", "<", and ">" from breaking the message.
     * @param {MessagingServiceClient~sendMessageCallback} callback - The callback that handles the response.
     */
    send(to, content, escape, callback) {
        if (escape) {
            content = content.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
        this._messagingServiceClient.sendMessage(to, content, callback);
    }
    
    /**
     * Send an attachment (media) to a user or group chat
     *
     * @param {string} to - The username or group id of recipient.
     * @param {string} name - The attachment's name, null means no name is provided.
     * @param {string} type - The attachment's type, must be 'Image' or 'Video'.
     * @param {Buffer} binaryContent - The content that should be sent (binary data).
     * @param {Buffer} [thumbnailContent] - The thumbnail for the sent content (binary data).
     * @param {MessagingServiceClientV2~attachmentInfoCallback} callback - Callback that is called after the attachment is sent.
     */
    sendAttachment(to, name, type, binaryContent, thumbnailContent, callback) {
        if (this._messagingServiceVersion === 2) {
            this._messagingServiceClient.postAttachment(to, name, type, binaryContent, thumbnailContent, callback);
        } else {
            callback(new Error('Posting of attachments is not available with current version of messaging service client.'));
        }
    }
    
    /**
     * Get information about an attachment.
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link MessagingServiceClientV2~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {MessagingServiceClientV2~attachmentInfoCallback} callback - The callback that is called after the information is received.
     */
    getAttachmentInfo(attachmentId, callback) {
        if (this._messagingServiceVersion === 2) {
            this._messagingServiceClient.getAttachmentInfo(attachmentId, callback);
        } else {
            callback(new Error('Not available with current version of messaging service client.'));
        }
    }
    
    /**
     * Get content of attachment (binary data).
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link MessagingServiceClientV2~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {string} viewId - The identifier of the attachment view (either 'original' or 'thumbnail') available in the attachment's info ({@link AttachmentInfo}).
     * @param {MessagingServiceClientV2~attachmentContentCallback} callback - The callback that is triggered after the attachment's content is downloaded.
     */
    getAttachment(attachmentId, viewId, callback) {
        if (this._messagingServiceVersion === 2) {
            this._messagingServiceClient.getAttachment(attachmentId, viewId, callback);
        } else {
            callback(new Error('Not available with current version of messaging service client.'));
        }
    }
    
    /**
     * Process request and emit events.
     * 
     * @param {string | object} request - The body of the request received from Messaging service.
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
     */
    processRequest(request) {
        let requestData;
        if (typeof request === 'object') {
            debug(`Processing new request ${JSON.stringify(request)}`);
            requestData = request;
        } else {
            debug(`Processing new request ${request}`);
            try {
                requestData = JSON.parse(request);
            } catch(e) {
                return this.emit('error', new Error(`Json parsing failed with "${e.message}". Request: ${request}`));
            }
        }

        if(this._messagingServiceVersion == 1)
        {
            let event = this._processRequestV1(request, requestData);
            this._emitWebhookEvent(event);
        }
        else if(this._messagingServiceVersion == 2)
        {
            debug('Processing event over v2.');
            let events = WebhookEvents.processRequestData(this._botId, requestData);
            events.forEach(item => {
                this._emitWebhookEvent(item);
            });
        }
        else
        {
            this.emit('error', new Error('Unsupported version of the Messaging service: ' + this._messagingServiceVersion ));
        }
    }

    _emitWebhookEvent(webhookEvent)
    {
        if(webhookEvent == null || webhookEvent.eventObject == null || webhookEvent.type === null) return;
        if(webhookEvent.type === 'error')
        {
            this.emit(webhookEvent.type, webhookEvent.eventObject);
        }
        else
        {
            this.emit(webhookEvent.type, new Bot(webhookEvent.replyTo, this), webhookEvent.eventObject);
        }
    }

    _processRequestV1(request, requestData)
    {
        if (!requestData.hasOwnProperty('type'))
        {
            return WebhookEvents.fromError(`Request cannot be parsed: ${request}`);
        }

        let eventType;
        if (/message/i.test(requestData.type)) {
            /**
             * This event is emitted for every received message.
             * @event BotService#message
             * 
             * @param {Bot} bot
             * @param {Message} event
             */
            debug('Parsed Message event.');
            return WebhookEvents.fromData(eventTypes.Message, new Message(requestData), null);

        } else if (/ThreadAddMember/i.test(requestData.type)) {
            if (requestData.targets.indexOf(this._botId) !== -1) {
                /**
                 * This event is emitted when the agent is added to group chat.
                 * @event BotService#threadBotAdded
                 * @param {Bot} bot
                 * @param {UserAdded} event
                 */
                debug('Parsed ThreadBotAdded event.');
                eventType = eventTypes.ThreadBotAdded;
            } else {
                /**
                 * This event is emitted when some users are added to group chat.
                 * @event BotService#threadAddMember
                 * @param {Bot} bot
                 * @param {UserAdded} event
                 */
                debug('Parsed ThreadAddMember event.');
                eventType = eventTypes.ThreadMemberAdded;
            }
            return WebhookEvents.fromData(eventType, new UserAdded(requestData));

        } else if (/ThreadRemoveMember/i.test(requestData.type)) {
            if (requestData.targets.indexOf(this._botId) !== -1) {
                /**
                 * This event is emitted when the agent is removed from group chat.
                 * @event BotService#threadBotRemoved
                 * @param {Bot} bot
                 * @param {UserRemoved} event
                 */
                debug('Parsed ThreadBotRemoved event.');
                eventType = eventTypes.ThreadBotRemoved;
            } else {
                /**
                 * This event is emitted when some users are removed from group chat.
                 * @event BotService#threadRemoveMember
                 * @param {Bot} bot
                 * @param {UserRemoved} event
                 */
                debug('Parsed ThreadRemoveMember event.');
                eventType = eventTypes.ThreadMemberRemoved;
            }
            return WebhookEvents.fromData(eventType, new UserRemoved(requestData));

        } else if (/ThreadTopicUpdate/i.test(requestData.type)) {
            /** This event is emitted when the topic of a group chat is updated.
             * @event BotService#threadTopicUpdated
             * @param {Bot} bot
             * @param {TopicUpdated} event
             */
            debug('Parsed ThreadTopicUpdate event.');
            return WebhookEvents.fromData(eventTypes.ThreadTopicUpdate, new TopicUpdated(requestData));

        } else if (/ThreadHistoryDisclosedUpdate/i.test(requestData.type)) {
            /** This event is emitted when the "history disclosed" option of a group chat is changed.
             * @event BotService#threadHistoryDisclosedUpdate
             * @param {Bot} bot
             * @param {HistoryDisclosed} event
             */
            debug('Parsed ThreadHistoryDisclosedUpdate event.');
            return WebhookEvents.fromData(eventTypes.ThreadHistoryDisclosedUpdate, new HistoryDisclosed(requestData));

        } else if (/AgentContactNotification/i.test(requestData.type)) {
            /**
             * This event is emitted when users add the agent as a buddy.
             * 
             * Example:
             * ```javascript
             * botkit.on('contactAdded', (bot, event) => {
             *     bot.reply(`Hello ${event.fromDisplayName}, it's great that we are now buddies.`); 
             * });
             * ```
             * 
             * @event BotService#contactAdded
             * @param {Bot} bot
             * @param {ContactNotification} event
             */
            
            /**
             * This event is emitted when users removes the agent from his contact list.
             * You won't be able to send a message to the user.
             * 
             * Example:
             * ```javascript
             * botkit.on('contactRemoved', (bot, event) => {
             *     console.log(`We lost user ${event.from}.`);
             * });
             * ```
             * 
             * @event BotService#contactRemoved
             * @param {Bot} bot
             * @param {ContactNotification} event
             */
            debug('Parsed AgentContactNotification event.');
            if (requestData.action === 'add') {
                return WebhookEvents.fromData(eventTypes.ContactAdded, new ContactNotification(requestData), requestData.from);
            } else if (requestData.action === 'remove') {
                return WebhookEvents.fromData(eventTypes.ContactRemoved, new ContactNotification(requestData), requestData.from);
            }
        }

        return WebhookEvents.fromError('No event recognized: ' + request);
    }

    _parseMessage(agent, request) {
        let mappings = this._personalCommandMappings;
        
        /**
         * This event is emitted for every 1:1 chat message which isn't handled by any registered command.
         * @event BotService#personalMessage
         * @param {Bot} bot
         * @param {Message} event
         */
        let defaultEvent = eventTypes.PersonalMessage;
        let replyTo = request.from;
        if (/@(p2p.)?thread.skype/.test(request.to)) { 
            /**
             * This event is emitted for every group chat message which isn't handled by any registered command.
             * @event BotService#groupMessage
             * @param {Bot} bot
             * @param {Message} event
             */
            mappings = this._groupCommandMappings;
            defaultEvent = eventTypes.GroupMessage;
            replyTo = request.to;
        }
                
        let found = false;
        mappings.forEach(mapping => {
            if (mapping.regex.test(request.content)) {  
                mapping.regex.lastIndex = 0;
                found = true;
                mapping.callback(new Bot(replyTo, this), request);
            }
        });        
        
        if (!found)
            this.emit(defaultEvent, new Bot(replyTo, this), request);
    }
                    
    // Callback definitions.
    
    /**
     * The callback called when a message matches a registered command.
     * 
     * @callback BotService~commandCallback
     * 
     * @param {Bot} bot - The bot for replying to the command.
     * @param {BotService~Message} request - The matched event.
     */
}

module.exports = MessagingService;
