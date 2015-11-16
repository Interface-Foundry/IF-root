'use strict';
var request = require('request')

/**
 * Check the status for a host
 * Returns JSON for the server stats.
 *
 * usage: check_server('pikachu.internal.kipapp.co', function(json) {})
 */
var check_server = module.exports = function(host, callback) {
  request({
    url: 'http://' + host + ':8911/status',
    json: true
  }, function(e, r, b) {
    if (e) {
      return callback({
        err: 'Could not get statistics for server: '
      })
    }

    callback(r.body);
  })
}

if (!module.parent) {
  check_server('localhost', function(json) {
    if (json.err) {
      console.log(json);
    } else {
      console.log(json.host);
    }
  });
}
