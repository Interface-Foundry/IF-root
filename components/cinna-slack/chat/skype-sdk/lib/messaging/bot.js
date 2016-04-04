'use strict';

/** Class representing a bot. 
 * 
 * Passed to event handlers to simplify replying to the creator of the event. 
 */
class Bot {
    /**
     * Create a bot.
     * 
     * @param {string} replyTo - The username to whom the reply should be sent.
     * @param {MessagingService} messagingService - An instance of messaging service.
     */
    constructor(replyTo, messagingService) {
        this._replyTo = replyTo;
        this._messagingService = messagingService;
    }
    
    /**
     * Send a reply to the user who created the original event.
     * For 1:1 chats it sends the reply to the creator of the original event.
     * For group chats it sends the reply to the group chat.
     * 
     * @param {string} content - The content of the message.
     * @param {bool} [escape] - If true, content will be escaped to prevent "&", "<", and ">" from breaking the message.
     * @param {BotService~sendMessageCallback} [callback] - The callback that handles the response.
     */
    reply(content, escape, callback) {
        this._messagingService.send(this._replyTo, content, escape, callback);
    }
    
    replyWithAttachment(name, type, binaryContent, thumbnailContent, callback) {
        this._messagingService.sendAttachment(this._replyTo, name, type, binaryContent, thumbnailContent, callback);
    }
    
    /**
     * Send a message. Message can be sent to any user or group chat.
     * 
     * @param {string} to - The recipient's username.
     * @param {string} content - The content of the message. If any html tags are present, they need to be valid or escaped (see `escape` parameter).
     * @param {bool} [escape] - If true, content will be escaped to prevent "&", "<", and ">" from breaking the message.
     * @param {BotService~sendMessageCallback} [callback] - The callback that handles the response.
     */
    send(to, content, escape, callback) {
        this._messagingService.send(to, content, escape, callback);
    }
    
    sendAttachment(to, name, type, binaryContent, thumbnailContent, callback) {
        this._messagingService.sendAttachment(to, name, type, binaryContent, thumbnailContent, callback);
    }
}

module.exports = Bot;