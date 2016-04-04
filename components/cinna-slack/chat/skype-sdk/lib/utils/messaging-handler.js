'use strict';

const debug = require('debug')('skype-sdk.messagingHandler');

/**
 * Create a messaging handler for rest frameworks like Express or Restify.
 * Returns function(req, res).
 * 
 * Example of usage:
 * ```javascript
 * const botkit = require('skype-sdk');
 * const restify = require('restify');
 * 
 * const botService = new botkit.BotService(...);
 * const server = restify.createServer();
 * server.post('/v1/chat', botkit.messagingHandler(botService));
 * ...
 * ```
 * 
 * @param {BotService} botService - Bot service that should be used for handling the requests.
 */
function messagingHandler(botService) {    
    return (req, res) => {
        if (req.body) {
            debug(`Received request with body ${JSON.stringify(req.body)}, passing it to botService.`);
            botService.processMessagingRequest(req.body);
        } else {
            let requestData = '';
            debug('Received request, receiving data.');
            req.on('data', (chunk) => requestData += chunk);
            req.on('end', () => {
                debug(`Received all data ${requestData}, passing it to botService.`);
                botService.processMessagingRequest(requestData);
            });
        }
        res.status(201);
        res.end();
    };
}

module.exports = messagingHandler;