const BotService = require('./lib/bot-service');

// Messaging
const Attachment = require('./lib/messaging/events/attachment');
const messagingHandler = require('./lib/utils/messaging-handler');
const azureUtils = require('./lib/utils/azure-utils');
const Message = require('./lib/messaging/events/message');
const ContactNotification = require('./lib/messaging/events/contact-notification');
const HistoryDisclosed = require('./lib/messaging/events/history-disclosed');
const TopicUpdated = require('./lib/messaging/events/topic-updated');
const UserAdded = require('./lib/messaging/events/user-added');
const UserRemoved = require('./lib/messaging/events/user-removed');

// Calling
const actions = require('./lib/calling/model/actions');
const Prompt = require('./lib/calling/model/prompt');
const RecognitionOption = require('./lib/calling/model/recognition-option');
const CallBackLink = require('./lib/calling/model/callback-link');
const CollectDigits = require('./lib/calling/model/collect-digits');
const conversations = require('./lib/calling/model/conversation');
const notification = require('./lib/calling/model/notifications');
const outcomes = require('./lib/calling/model/operation-outcomes');
const Participant = require('./lib/calling/model/participant');
const Workflow = require('./lib/calling/model/workflow');
const callingUtils = require('./lib/utils/calling-handler');

module.exports = {
    BotService,
    
    // Messaging
    Attachment,
    Message,
    ContactNotification,
    HistoryDisclosed,
    TopicUpdated,
    UserAdded,
    UserRemoved,
    
    // Calling
    Answer: actions.Answer,
    Hangup: actions.Hangup,
    Recognize: actions.Recognize,
    PlayPrompt: actions.PlayPrompt,
    Record: actions.Record,
    Reject: actions.Reject,
    CallBackLink,
    CollectDigits,
    Conversation: conversations.Conversation,
    ConversationResult: conversations.ConversationResult,
    CallStateChangeNotification: notification.CallStateChangeNotification,
    NotificationResponse: notification.NotificationResponse,
    AnswerOutcome: outcomes.AnswerOutcome,
    HangupOutcome: outcomes.HangupOutcome,
    PlayPromptOutcome: outcomes.PlayPromptOutcome,
    RecognizeOutcome: outcomes.RecognizeOutcome,
    ChoiceOutcome: outcomes.ChoiceOutcome,
    CollectDigitsOutcome: outcomes.CollectDigitsOutcome,
    RecordOutcome: outcomes.RecordOutcome,
    TranscriptionOutcome: outcomes.TranscriptionOutcome,
    RejectOutcome: outcomes.RejectOutcome,
    WorkflowValidationOutcome: outcomes.WorkflowValidationOutcome,
    Participant,
    Prompt,
    RecognitionOption,
    Workflow,
    
    // Utils
    messagingHandler,
    ensureHttps: azureUtils.ensureHttps,
    verifySkypeCert: azureUtils.verifySkypeCert,
    incomingCallHandler: callingUtils.incomingCallHandler,
    incomingCallbackHandler: callingUtils.incomingCallbackHandler
};