'use strict';

const Busboy = require('busboy');
const createDebug = require('debug');
const inspect = require('util').inspect;

function responseCallback(req, res, debug) {
    return function(err, response) {
        if (err) {
            debug('Sending response 500 with error: ' + err);
            res.status(500);
            res.end();
            return;
        }
        debug('Sending response 200: \n' + inspect(response, { depth: 5 }));

        res.status(200);
        res.send(response);
    };
}

function parseBody(req, callback) {
    if (typeof req.body === 'undefined') {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            let body;
            try {
                body = JSON.parse(data);
            } catch (error) {
                callback(error);
            }
            callback(null, body);
        });
    } else {
        callback(null, req.body);
    }
}

/**
 * Create a calling handler for REST frameworks like Express or Restify.
 * Returns function(req, res).
 * 
 * Example of usage:
 * ```javascript
 * const skype = require('skype-sdk');
 * const restify = require('restify');
 * 
 * const botService = new skype.BotService(...);
 * const server = restify.createServer();
 * server.post('/v1/calls', skype.incomingCallHandler(botService));
 * ...
 * ```
 * 
 * @param {BotService} botService - Bot service that should be used for handling the requests.
 */
function incomingCallHandler(botService) {
    const debug = createDebug('skype-sdk.incomingCallHandler');
    return (req, res) => {
        const callback = responseCallback(req, res, debug);
        parseBody(req, (err, body) => {
            debug('Received call: \n' + inspect(body, { depth: 5 }));
            botService.processCall(body, callback);
        });
    };
}

/**
 * Create a handler for calling callbacks for REST frameworks like Express or Restify.
 * Returns function(req, res).
 * 
 * Example of usage:
 * ```javascript
 * const botkit = require('skype-sdk');
 * const restify = require('restify');
 * 
 * const botService = new botkit.BotService(...);
 * const server = restify.createServer();
 * server.post('/v1/callbacks', botkit.incomingCallbackHandler(botService));
 * ...
 * ```
 *  
 * @param {BotService} botService - Bot service that should be used for handling the requests.
 */
function incomingCallbackHandler(botService) {
    const debug = createDebug('skype-sdk.incomingCallbackHandler');

    return (req, res) => {
        const callback = responseCallback(req, res, debug);
        if (req.is('application/json')) {
            parseBody(req, (err, body) => {
                if (err) {
                    return callback(err);
                }
                debug('Received callback: \n' + inspect(body, { depth: 5 }));
                botService.processCallback(body, null, callback);
            });
        } else if (req.is('multipart/form-data')) {
            const busboy = new Busboy({ headers: req.headers, defCharset: 'binary' });

            let result;
            let recordedAudio;

            busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
                debug(`Field [${fieldname}]: value: ${typeof (val)} encoding: ${encoding} mimetype: ${mimetype}`);

                if (fieldname === 'recordedAudio') {
                    recordedAudio = new Buffer(val, 'binary');
                    debug('Recorded audio buffer: ' + inspect(recordedAudio.slice(0, 10), { depth: 5 }));
                } else if (fieldname === 'conversationResult') {
                    result = JSON.parse(val);
                    debug('Received conversation result: \n' + inspect(val, { depth: 5 }));
                }
            });

            busboy.on('finish', () => {
                debug('Busboy finished.');
                botService.processCallback(result, recordedAudio, callback);
            });

            req.pipe(busboy);
        }
    };
}

module.exports = {
    incomingCallbackHandler,
    incomingCallHandler
};