'use strict';

const WebhookMessage = require('./model/v2/activity-incoming').WebhookMessage;
const HistoryDisclosed = require('./events/history-disclosed');
const TopicUpdated = require('./events/topic-updated');
const UserAdded = require('./events/user-added');
const UserRemoved = require('./events/user-removed');
const ContactNotification = require('./events/contact-notification');
const Message = require('./events/message');
const Attachment = require('./events/attachment');
const Enums = require('./model/v2/enums');

/**
 * types of events emitted by the Bot Platform
 *
 * for 'error' type, the associated event object is Error
 * for anything else, the associated event object is inheritor of Event
 */
const EventTypes = {
    Error: 'error',
    PersonalMessage: 'personalMessage',
    GroupMessage: 'groupMessage',
    Message: 'message',
    ThreadBotAdded: 'threadBotAdded',
    ThreadBotRemoved: 'threadBotRemoved',
    ThreadMemberAdded: 'threadAddMember',
    ThreadMemberRemoved: 'threadRemoveMember',
    ThreadTopicUpdate: 'threadTopicUpdated',
    ThreadHistoryDisclosedUpdate: 'threadHistoryDisclosedUpdate',
    ContactAdded: 'contactAdded',
    ContactRemoved: 'contactRemoved',
    Attachment: 'attachment'
};


/**
 * wrapper class around events emitted by the Bot Platform + tiny metadata
 *
 * @property {string} type - event type id, should be one of EventTypes
 * @property {object} event - event object; should be instance of Error for 'error' type, or instance of Event inheritor for everything else
 * @property {string} replyTo - optional; if set, indicates the other party where the eventual response should be submitted to
 */
class WebhookEvent
{
    /**
     *
     * @param type
     * @param eventObject
     * @param replyTo
     */
    constructor(type, eventObject, replyTo)
    {
        this.type = type;
        this.replyTo = replyTo;
        this.eventObject = eventObject;
    }
}

function _isGroupChatEvent(event)
{
    if(event == null || event.to == null) return false;
    return /@thread.skype/.test(event.to);
}

/**
 *  creates a WebhookEvent of error type
 *
 * @param {string} errorText - text of the error to be emitted with the error event

 * @returns {WebhookEvent} WebhookEvent of error type
 */
function fromError(errorText)
{
    return new WebhookEvent(EventTypes.Error, new Error(errorText));
}

/**
 *  creates a WebhookEvent from instantiated event
 *
 * @param {string} type - event type, should be one from EventTypes
 * @param {object} eventObject - instantiated event object
 * @param {string} replyTo - optional, set to eventObject.to by default; identification of the other party used for sending optional response

 * @returns {WebhookEvent} WebhookEvent of appropriate EventType type
 */
function fromData(type, eventObject, replyTo)
{
    if(typeof replyTo == 'undefined' && eventObject != null && eventObject.to != null) replyTo = eventObject.to;
    return new WebhookEvent(type, eventObject, replyTo);
}

/**
 *  converts the incoming Messaging service 'webhook' message into array of events
 *
 * @param {string} botId - configured bot's id (used for distinguishing of contact list events related to the bot-related and the other-party-related)
 * @param {array} requestData - webhook message request received from Messaging service, which should be array of objects

 * @returns {array} array of WebhookEvent instances
 */
function processRequestData(botId, requestData)
{
    let eventsOut = [];
    let message = null;

    try {
        message = new WebhookMessage(requestData);
    }
    catch(err)
    {
        eventsOut.push(fromError(`Incoming webhooks request could not be parsed, error: ${err.message}, request: ${JSON.stringify(requestData)}`));
        return eventsOut;
    }

    let errors = message.validate();
    if(errors.length > 0)
    {
        eventsOut.push(fromError(`Incoming webhooks request was invalid, errors: ${errors}, request: ${JSON.stringify(requestData)}`));
        return eventsOut;
    }

    message.activities.forEach(item => {
        try {
            switch (item.activity) {
            case Enums.IncomingActivityType.ConversationUpdate:
                eventsOut = eventsOut.concat(_convertConversationUpdate(botId, item));
                break;
            case Enums.IncomingActivityType.ContactRelationUpdate:
                eventsOut = eventsOut.concat(_convertContactRelationUpdate(item));
                break;
            case Enums.IncomingActivityType.Message:
                eventsOut = eventsOut.concat(_convertMessage(item));
                break;
            case Enums.IncomingActivityType.Attachment:
                eventsOut = eventsOut.concat(_convertAttachment(item));
                break;
            default:
                eventsOut.push(fromError(`activity type ${item.activity} is unsupported by Messaging service v2`));
            }
        }
        catch(error)
        {
            eventsOut.push(fromError(`failed to convert ${item.activity} to an event, error: ${error.message}`));
        }
    });

    return eventsOut;
}

function _convertConversationUpdate(botId, event)
{
    let eventsOut = [];

    if(event.historyDisclosed != null)
    {
        eventsOut.push(
            fromData(
                EventTypes.ThreadHistoryDisclosedUpdate,
                new HistoryDisclosed({
                    from : event.from,
                    to: event.to,
                    historyDisclosed: event.historyDisclosed,
                    eventTime: event.time
                })));
    }

    if(event.topicName != null)
    {
        eventsOut.push(
            fromData(
                EventTypes.ThreadTopicUpdate,
                new TopicUpdated({
                    from : event.from,
                    to: event.to,
                    topic: event.topicName,
                    eventTime: event.time
                })));
    }

    if(event.membersAdded != null)
    {
        event.membersAdded.forEach(item => {
            eventsOut.push(
                fromData(
                    item.indexOf(botId) != -1 ? EventTypes.ThreadBotAdded : EventTypes.ThreadMemberAdded,
                    new UserAdded({
                        from : event.from,
                        to: event.to,
                        targets: [ item ],
                        eventTime: event.time
                    })));
        });
    }

    if(event.membersRemoved != null)
    {
        event.membersRemoved.forEach(item => {
            eventsOut.push(
                fromData(
                    item.indexOf(botId) != -1 ? EventTypes.ThreadBotRemoved : EventTypes.ThreadMemberRemoved,
                    new UserRemoved({
                        from : event.from,
                        to: event.to,
                        targets: [ item ],
                        eventTime: event.time
                    })));
        });
    }

    return eventsOut;
}

function _convertContactRelationUpdate(event)
{
    let eventsOut = [];

    if (event.action === 'add') {
        eventsOut.push(
            fromData(
                EventTypes.ContactAdded,
                new ContactNotification({
                    from : event.from,
                    to: event.to,
                    action: event.action,
                    fromDisplayName: event.fromDisplayName,
                    eventTime: event.time
                }),
                event.from
        ));
    } else if (event.action === 'remove') {
        eventsOut.push(
            fromData(
                EventTypes.ContactRemoved,
                new ContactNotification({
                    from : event.from,
                    to: event.to,
                    action: event.action,
                    fromDisplayName: event.fromDisplayName,
                    eventTime: event.time
                }),
                event.from
        ));
    }

    return eventsOut;
}

function _convertMessage(event)
{
    let eventsOut = [];

    eventsOut.push(
        fromData(
            EventTypes.Message,
            new Message({
                from : event.from,
                to: event.to,
                content: event.content,
                contentType: 'text',
                messageId: event.id,
                eventTime: event.time
            }),
            null
        ));

    return eventsOut;
}

function _convertAttachment(event)
{
    let eventsOut = [];

    eventsOut.push(
        fromData(
            EventTypes.Attachment,
            new Attachment({
                from : event.from,
                to: event.to,
                name: event.name,
                attachmentType: event.type,
                views: event.views,
                eventTime: event.time,
                id: event.id
            }),
            _isGroupChatEvent(event) ? event.to : event.from
        ));

    return eventsOut;
}

module.exports = { WebhookEvent, processRequestData, fromError, fromData, EventTypes };
