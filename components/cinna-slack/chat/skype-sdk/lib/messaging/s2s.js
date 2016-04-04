/// <reference path="../../typings/main.d.ts" />
'use strict';

const EventEmitter = require('events').EventEmitter;
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const debug = require('debug')('skype-sdk.S2SClient');

class S2SClient extends EventEmitter {
    constructor(options) {
        super();
        const endpoint = options.s2sEndpoint || 'https://login.live.com/pksecure/oauth20_clientcredentials.srf';
        const parsedUrl = url.parse(endpoint);
        
        this._hostname = parsedUrl.hostname;
        this._port = parsedUrl.port || 443;
        this._path = parsedUrl.path || '';
        
        this._scope = options.scope || 'ssl.live.com';
        this._s2sAuthPolicy = options.s2sAuthPolicy || 'S2S_24HOURS_MUTUALSSL';
        this._renewBeforeExpiration = options.renewBeforeExpiration || 600;
        
        if (typeof options.siteId !== 'undefined' && options.siteId !== null)
            this._siteId = options.siteId;
        else 
            throw new Error('Missing "siteId" option.');

        if (typeof options.key !== 'undefined' && options.key !== null)
            this._key = options.key;
        else
            throw new Error('Missing "key" option.');
            
        if (typeof options.cert !== 'undefined' && options.cert !== null)
            this._cert = options.cert;
        else
            throw new Error('Missing "cert" option.');
        
        this._token = null;
        this._validUntil = new Date(0);
        this.renewingTicket = false;
    }
    
    getToken(callback) {
        debug('Getting S2S token.');
        if (new Date() < this._validUntil) {
            debug(`S2S token is still valid, returning it: ${this._token}`);
            return callback(null, this._token);
        } else {
            debug('S2S token expired, requesting a new one.');
            if (this.renewingTicket) {
                debug('S2S token is being renewed, waiting for "token" event.');
                this.once('token', callback);
            } else {
                this.renewingTicket = true;
                this.renewTicket((err, data) => {
                    this._setNewToken(err, data, callback);
                });
            }
        }
    }
    
    renewTicket(callback) {
        debug('Renewing S2S token.');
        const content = querystring.stringify({
            grant_type: 'client_credentials',
            client_id: this._siteId,
            scope: this._scope + '::' + this._s2sAuthPolicy
        });
        
        const options = {
            hostname: this._hostname,
            port: Number(this._port),
            path: this._path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': content.length
            },
            key: this._key,
            cert: this._cert
        };    
        options.agent = new https.Agent(options);
        
        debug(`Sending S2S request: ${content}`);
        
        const request = https.request(options, (res) => this._handleRenewTicketResponse(res, callback));
        request.on('error', callback);
        
        request.write(content);
        request.end();
    }
    
    _setNewToken(err, data, callback) {
        this.renewingTicket = false;
        if (err) {
            debug(`S2S token renewal failed with ${err}`);
            this.emit('token', err);
            return callback(err);
        }
        
        this._token = data.access_token;
        const now = new Date();
        this._validUntil = new Date(now.getTime() + (data.expires_in - this._renewBeforeExpiration) * 1000);
        
        debug(`S2S token renewed and valid until ${this._validUntil}: "${this._token}"`);
        
        this.emit('token', null, this._token);
        callback(null, this._token);
                
    }
    
    _handleRenewTicketResponse(res, callback) {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            var response = JSON.parse(data);
            if ('access_token' in response) {
                callback(null, response);
            } else if ('error' in response) {
                return callback(new Error(`${response['error']} (${response['error_description']})`));
            } else {
                return callback(new Error(`Failed to parse S2S ticket renewal response: ${data}`));
            }
        });
    }
}


module.exports = S2SClient;