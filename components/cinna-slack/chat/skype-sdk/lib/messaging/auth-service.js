'use strict';

const request = require('request'); 
const EventEmitter = require('events').EventEmitter;

class AuthService extends EventEmitter {
    constructor(appId, appSecret, options) {
        super();
        
        this._appId = appId;
        this._appSecret = appSecret;
        
        options = options || {};
        
        this._token = null;
        this._validUntil = new Date(0);
        this._renewingToken = false;
        
        this._renewBeforeExpiration = options.renewBeforeExpiration || 600;
        this._scope = options.scope || 'https://graph.microsoft.com/.default';
        this._oAuthUrl = options.oauthUrl || 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    }
    
    getToken(callback) {
        if (new Date() < this._validUntil) {
            return callback(null, this._token);
        } else {
            if (this._renewingToken) {
                this.once('token', callback);
            } else {
                this._renewingToken = true;
                this._renewToken((err, data) => {
                    this._setNewToken(err, data, callback);
                });
            }
        }
    }
    
    _renewToken(callback) {
        const content = {
            client_id: this._appId,
            client_secret: this._appSecret,
            grant_type: 'client_credentials',
            scope: this._scope
        };
        
        request.post(this._oAuthUrl, {
            form: content
        }, (err, response, body) => {
            if (err) {
                return callback(err);
            }
            
            if (response.statusCode !== 200) {
                return callback(new Error(`Received error ${response.statusCode}: ${response.statusMessage}.`));
            }
            
            callback(null, body);
        });
    }
    
    _setNewToken(err, data, callback) {
        this._renewingToken = false;
        
        if (err) {
            this.emit('token', err);
            return callback(err);
        }
        
        const response = JSON.parse(data);
        this._token = response.access_token;
        const now = new Date();
        this._validUntil = new Date(now.getTime() + (response.expires_in - this._renewBeforeExpiration) * 1000);
        
        this.emit('token', null, this._token);
        callback(null, this._token);
    }
}

module.exports = AuthService;