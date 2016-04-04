'use strict';

const debug = require('debug')('skype-sdk.MessagingServiceClientV2');
const request = require('request');
const util = require('util');
const async = require('async');

const TokenService = require('./auth-service');
const activities = require('./model/v2/activity-outgoing');
const attachment = require('./model/v2/attachment');
const Limits = require('./model/v2/limits');

const ActivitiesBaseUrlFmt = '/v2/conversations/%s/activities';
const ConversationAttachmentsBaseUrlFmt = '/v2/conversations/%s/attachments';
const AttachmentsBaseUrlFmt = '/v2/attachments/%s';
const AttachmentsViewsBaseUrlFmt = '/v2/attachments/%s/views/%s';

/**
 * Client implementing messaging service API v2
 */
class MessagingServiceClientV2
{
    /**
     * Create a new instance of MessagingServiceClientV2
     *
     * @param {object} options - The configuration options.
     * @param {string} options.botId - The bot's id.
     * @param {string} options.serverUrl - The messaging service endpoint.
     * @param {string} options.appId - The bot's application id for OAuth.
     * @param {string} options.appSecret - The bot's application secret for OAuth.
     * @param {number} [options.requestTimeout] - The https request timeout in milliseconds.
     * @param {boolean} [options.enableRequestDebugging] - True if debugging information from submitting the request shall be printed out.
     */
    constructor(options)
    {
        this._validateConfigurationOptions(options);
        this._messagingServiceVersion = 2;
        this._baseUrl = options.serverUrl.trim();
        this._timeout = options.requestTimeout || 15000;
        this._appId = options.appId.trim();
        this._appSecret = options.appSecret.trim();
        this._tokenService = new TokenService(this._appId, this._appSecret);
        
        if (options.enableRequestDebugging !== null &&
            typeof options.enableRequestDebugging !== 'undefined' &&
            options.enableRequestDebugging) { 
            request.debug = true;
        }
        
    }

    _validateConfigurationOptions(options)
    {
        if (typeof options === 'undefined' || options === null) {
            throw new Error('options is null.');
        }
        if (typeof options.botId === 'undefined' || options.botId === null) {
            throw new Error('options.botId is missing in the options.');
        }
        if (typeof options.serverUrl === 'undefined' || options.serverUrl === null) {
            throw new Error('options.serverUrl is missing in the options.');
        }
        if (typeof options.appId === 'undefined' || options.appId === null) {
            throw new Error('options.appId is missing in the options.');
        }
        if (typeof options.appSecret === 'undefined' || options.appSecret === null) {
            throw new Error('options.appSecret is missing in the options.');
        }
    }
    
    /**
     * Callback for sending messages.
     * 
     * @callback MessagingServiceClientV2~sendMessageCallback
     * @param {Error} error - The error if there was one.
     */

    /**
     * Submits a text message to a user or group chat.
     *
     * @param {string} to - The username or group id of recipient.
     * @param {string} content - Content to be submitted.
     * @param {MessagingServiceClientV2~sendMessageCallback} callback - Callback that's called after the message is delivered or delivery failed.
     */
    sendMessage(to, content, callback)
    {
        debug(`Sending message to ${to} with content ${content}`);

        const activity = new activities.Activity();
        activity.message = new activities.Message();
        activity.message.content = content;

        const errors = activity.validate();
        if (errors.length > 0)
        {
            throw new Error(`message validation has failed: ${errors}`);
        }

        const url = util.format(ActivitiesBaseUrlFmt, to);
        
        async.waterfall([
            (next) => {
                this._tokenService.getToken(next);
            },
            (token, next) => {
                const serializedContent = JSON.stringify(activity);                
                const options = {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    url: this._baseUrl + url,
                    method: 'POST',
                    followRedirect: true,
                    maxRedirects: 10,
                    body: serializedContent
                };
                
                var req = request(options, next);
                req.on('error', next);
            },
            (res, body, next) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return next(new Error(`Received unexpected response ${res.statusCode} from Messaging Service: ${res.statusMessage}.`));
                }
                next(null);
            }
        ], callback);
    }
    
    /**
     * Callback for sending attachments and getting information about attachments.
     * 
     * @callback MessagingServiceClientV2~attachmentSentCallback
     * 
     * @param {Error} error - The error if there was one.
     * @param {AttachmentResponse} attachmentResponse - The response received after attachment was sent.
     */

    /**
     * Post an attachment (media) to a user or group chat
     *
     * @param {string} to - The username or group id of recipient.
     * @param {string} name - The attachment's name, null means no name is provided.
     * @param {string} type - The attachment's type, must be 'Image' or 'Video'.
     * @param {Buffer} binaryContent - The content that should be sent (binary data).
     * @param {Buffer} [thumbnailContent] - The thumbnail for the sent content (binary data).
     * @param {MessagingServiceClientV2~attachmentSentCallback} callback - Callback that is called after the attachment is sent.
     */
    postAttachment(to, name, type, binaryContent, thumbnailContent, callback)
    {
        debug(`Posting attachment to ${to}`);

        const att = new attachment.Attachment();
        att.name = name;
        att.type = type;
        att.originalBase64 = binaryContent == null ? null : Buffer(binaryContent, 'binary').toString('base64');
        att.thumbnailBase64 = thumbnailContent == null ? null : Buffer(thumbnailContent, 'binary').toString('base64');

        const errors = att.validate();
        if(errors.length > 0)
        {
            throw new Error(`attachment validation has failed: ${errors}`);
        }

        const url = util.format(ConversationAttachmentsBaseUrlFmt, to);

        async.waterfall([
            (next) => {
                this._tokenService.getToken(next);
            },
            (token, next) => {
                const serializedContent = JSON.stringify(att);
                if (serializedContent.length > Limits.AttachmentRequestSize.Max) {
                    next(new Error('Serialized content size exceeds maximum allowed limit.'));
                }
                
                const options = {
                    headers: {
                        Authorization: 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    url: this._baseUrl + url,
                    method: 'POST',
                    followRedirect: true,
                    maxRedirects: 10,
                    body: serializedContent
                };
                
                var req = request(options, next);
                req.on('error', next);
            },
            (res, body, next) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return next(new Error(`Received unexpected response ${res.statusCode} from Messaging Service: ${res.statusMessage}.`));
                }
                const response = new attachment.AttachmentResponse(JSON.parse(body));
                next(null, response);
            }
        ], callback);
    }
    
    /**
     * Callback for sending attachments and getting information about attachments.
     * 
     * @callback MessagingServiceClientV2~attachmentInfoCallback
     * 
     * @param {Error} error - The error if there was one.
     * @param {AttachmentInfo} attachmentInfo - The received information about the attachment.
     */

    /**
     * Get information about an attachment.
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link MessagingServiceClientV2~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {MessagingServiceClientV2~attachmentInfoCallback} callback - The callback that is called after the information is received.
     */
    getAttachmentInfo(attachmentId, callback)
    {
        debug(`Getting description of attachment with id ${attachmentId}`);

        if(attachmentId == null) throw new Error('attachmentId is null');

        const url = util.format(AttachmentsBaseUrlFmt, attachmentId);
        
        async.waterfall([
            (next) => {
                this._tokenService.getToken(next);
            },
            (token, next) => {
                const options = {
                    headers: {
                        Authorization: 'Bearer ' + token
                    },
                    url: this._baseUrl + url,
                    method: 'GET',
                    followRedirect: true,
                    maxRedirects: 10
                };
                
                var req = request(options, next);
                req.on('error', next);                
            },
            (res, body, next) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return next(new Error(`Received unexpected response ${res.statusCode} from Messaging Service: ${res.statusMessage}.`));
                }
                const response = new attachment.AttachmentInfo(JSON.parse(body));
                next(null, response);
            }
        ], callback);
    }
    
    /**
     * Callback for getting content of attachments.
     * 
     * @callback MessagingServiceClientV2~attachmentContentCallback
     * 
     * @param {Error} error - The error if there was one. 
     * @param {Buffer} content - The content of the blob.
     */

    /**
     * Get content of attachment (binary data).
     *
     * @param {string} attachmentId - The unique attachment identifier received from the response to [postAttachment()]{@link MessagingServiceClientV2~postAttachment} or from the [attachment]{@link BotService#event:attachment} event.
     * @param {string} viewId - The identifier of the attachment view (either 'original' or 'thumbnail') available in the attachment's info ({@link AttachmentInfo}).
     * @param {MessagingServiceClientV2~attachmenContentCallback} callback - The callback that is triggered after the attachment's content is downloaded.
     */
    getAttachment(attachmentId, viewId, callback)
    {
        debug(`Getting description of attachment with id ${attachmentId}`);

        if(attachmentId == null) throw new Error('attachmentId is null');
        if(viewId == null) throw new Error('viewId is null');

        const url = util.format(AttachmentsViewsBaseUrlFmt, attachmentId, viewId);
        
        async.waterfall([
            (next) => {
                this._tokenService.getToken(next);
            },
            (token, next) => {
                const options = {
                    headers: {
                        Authorization: 'Bearer ' + token
                    },
                    url: this._baseUrl + url,
                    method: 'GET',
                    followRedirect: true,
                    maxRedirects: 10,
                    encoding: null
                };
                
                var req = request(options, next);
                req.on('error', next);
            },
            (res, body, next) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return next(new Error(`Received unexpected response ${res.statusCode} from Messaging Service: ${res.statusMessage}.`));
                }
                next(null, body);
            }
        ], callback);
    }
}

module.exports = MessagingServiceClientV2;
