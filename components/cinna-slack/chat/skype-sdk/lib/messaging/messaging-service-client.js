/// <reference path="../../typings/main.d.ts" />
'use strict';

const debug = require('debug')('skype-sdk.MessagingServiceClient');
const util = require('util');
const async = require('async');
const request = require('request');

const S2SClient = require('./s2s');

class MessagingServiceClient {
    constructor(options) {
        this._messagingServiceVersion = 1;
        this._endpointFormat = options.endpointFormat || 'https://co4-df-server-s.gateway.messenger.live.com/v1/users/ME/conversations/%s/messages';
        this._s2sClient = new S2SClient(options);

        if (typeof options.key !== 'undefined' && options.key !== null)
            this._key = options.key;
        else
            throw new Error('Missing "key" option.');

        if (typeof options.cert !== 'undefined' && options.cert !== null)
            this._cert = options.cert;
        else
            throw new Error('Missing "cert" option.');
        
        if (typeof options.botId !== 'undefined' && options.botId !== null)
            this._botId = options.botId;
        else
            throw new Error('Missing "botId" option.');
            
        this._partnerName = this._botId.replace(/^28:/, '');
    }
    
    sendMessage(to, content, callback) {
        debug(`Sending message to "${to}" with content "${content}".`);
        
        const body = {
            messagetype: 'RichText',
            content: content,
            contenttype: 'text'
        };
        
        const endpoint = util.format(this._endpointFormat, to);
        
        async.waterfall([
            (next) => {
                debug('Getting server to server token.');
                this._s2sClient.getToken(next);
            },
            
            (token, next) => {
                debug(`Received server to server token: "${token}"`);
                
                const options = {
                    url: endpoint,
                    key: this._key,
                    cert: this._cert,
                    method: 'POST',
                    headers: {
                        'Cookie': 'accessToken=' + token,
                        'OnBehalfOf': this._botId,
                        'OriginService': 'partnerName=' + this._partnerName
                    },
                    json: body
                };
                
                debug(`Sending request to Messaging service with headers: ${JSON.stringify(options.headers)} and content: ${JSON.stringify(body)}`);
                const req = request(options, next);
                req.on('error', next);
            },
            
            (res, body, next) => {
                debug(`Received response from Messaging service ${res.statusCode} (${res.statusMessage})`);
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return next(new Error(`Received unexpected response ${res.statusCode} from Messaging Service: ${res.statusMessage}.`));
                }
                next(null, body);
            }
        ], callback);
    }
}

module.exports = MessagingServiceClient;