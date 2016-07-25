var request = require('request');
var _ = require('lodash');
var Promise = require('bluebird');
var debug = require('debug')('cloudsight');

var Cloudsight = function(opts) {
  if (!(this instanceof Cloudsight)) {
    return new Cloudsight(opts);
  }
  debug('initializing Cloudsight object with options:')
  debug(opts);

  this.key = opts.key;
}

/**
 * Pass it an image url.  works with either callbacks or promises
 */
Cloudsight.prototype.get = function(url, callback) {
  var me = this;
  var promise;
  if (typeof callback !== 'function') {
    var deferred = Promise.pending();
    callback = function(err, value){
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(value);
      }
    };
    promise = deferred.promise;
  }

  debug('attempting to process url %s', url);
  request({
    url: 'https://api.cloudsightapi.com/image_requests',
    headers: {
      Authorization: 'CloudSight ' + me.key
    },
    method: 'POST',
    json: true,
    qs: {
        'image_request[remote_image_url]': url,
        'image_request[locale]': 'en-US',
        'image_request[language]': 'en'
    }
  }, function (e, r, b) {
    if (e) {
      debug('could not reach cloudsight api');
      callback(e);
      return;
    } else if (!b.token) {
      debug('could get valid response from cloudsight api');
      callback(b);
      return;
    }

    var i = setInterval(function () {
      request({
        url: 'https://api.cloudsightapi.com/image_responses/' + b.token,
        json: true,
        headers: {
          Authorization: 'CloudSight ' + me.key
        },
        method: 'GET'
      }, function (e, r, b) {
        if (e) {
          debug('could not reach cloudsight api during poll');
          clearInterval(i);
          callback(e);
        } else if (b.status === 'not completed') {
          debug('got response, status is "not completed"');
          return;
        } else {
          if (!b.categories) {
            b.categories = [];
          }
          callback(null, b)
          clearInterval(i);
        }
      })
    }, 2000)
  })

  return promise;
}

module.exports = Cloudsight;
