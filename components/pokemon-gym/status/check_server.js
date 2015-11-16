'use strict';
var request = require('request')
var async = require('async')

/**
 * Check the status for a host
 * Returns JSON for the server stats.
 *
 * usage: check_server('pikachu.internal.kipapp.co', function(json) {})
 */
var check_server = module.exports = function(host, callback) {
  var done = false;

  request({
    url: 'http://' + host + ':8911/status',
    json: true
  }, function(e, r, b) {
    if (done) {
      return;
    }
    
    done = true;
    if (e) {
      return callback({
        err: 'Could not get statistics for server: '
      })
    }
    callback(null, r.body);
  })

  setTimeout(function() {
    if (!done) {
      done = true;
      callback(null,  {host: host, err: 'timeout'})
    }
  }, 5000)
}

// check many servers
var check_servers = module.exports.list = function(hosts, callback) {
  async.map(hosts, function(host, done) {
    check_server(host, done)
  }, callback)
}

if (!module.parent) {
  check_server('localhost', function(json) {
    if (json.err) {
      console.log(json);
    } else {
      console.log(json.host);
    }

    console.log(JSON.stringify(json, null, 2))
  });
}
