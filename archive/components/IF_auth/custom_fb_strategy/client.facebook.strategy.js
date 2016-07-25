'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport-strategy'),
	  util = require('util'),
    lookup = require('./utils').lookup,
    https = require('https');
  

function Strategy(options, verify) {
  
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }
  console.log(verify);
  if (!verify) { throw new TypeError('Custom strategy requires a verify callback'); }
  
  this._userIdField = options.userIdField || 'userId';
  this._accessTokenField = options.accessTokenField || 'accessToken';
  this._verify = verify;

  passport.Strategy.call(this);
  this.name = 'client_facebook';
  
  //this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};
  
  var userId = lookup(req.body, this._userIdField) || lookup(req.query, this._userIdField);
  
  var accessToken = lookup(req.body, this._accessTokenField) || lookup(req.query, this._accessTokenField);
  
  if (!userId || !accessToken) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }
  
  var self = this;
 
  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }
  
  var req_options = {
    host: 'graph.facebook.com',
    path: '/me?access_token=' + accessToken
  };

  var callback = function(response){
    var str = '';

    response.on('data', function(chunk){
      str += chunk;
    });

    response.on('end', function(){
      self._verify(userId, accessToken, str, verified);
    });
  };


  var request = https.request(req_options, callback);
  request.end();
};


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
//module.exports.Strategy = Strategy;