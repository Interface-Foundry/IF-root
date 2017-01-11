var async = require('async');
var request = require('request');

var config = require('../../../config');
var db = require('../../../db');
var status = require('./status');

/**
 * returns a random integer between 0 and the specified exclusive maximum.
 */
function randomInt(exclusiveMax) {
  return Math.floor(Math.random() * Math.floor(exclusiveMax));
}

/**
 * returns a fake user agent to be used in request headers.
 */
function fakeUserAgent() {
  var osxVer = Math.floor(Math.random() * 9) + 1;
  var webkitMajVer = randomInt(999) + 111;
  var webkitMinVer = randomInt(99) + 11;
  var chromeMajVer = randomInt(99) + 11;
  var chromeMinVer = randomInt(9999) + 1001;
  var safariMajVer = randomInt(999) + 111;
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+ osxVer + 
  ') AppleWebKit/' + webkitMajVer + '.' + webkitMinVer + 
  ' (KHTML, like Gecko) Chrome/' + chromeMajVer + '.0.' + chromeMinVer + 
  '2623.110 Safari/' + safariMajVer +'.36';
}

/**
 * proxyRequest makes a request for the specified url up to numRetries times,
 * using the (optional) preferred proxy method.
 * 
 * this function is the public API of this module, and is the only exported
 * function.
 */
function proxyRequest(url, numRetries, proxyPref) {
  if (proxyPref == 'luminati' || (!proxyPref && status.get().ready)) {
    return luminatiRequest(url, numRetries);
  } else {
    return meshRequest(url, numRetries);
  }
};

/**
 * meshRequest uses the mesh proxy to request the specified url up to the
 * specified number of times (until success or 30 seconds has elapsed).
 */
function meshRequest(url, numRetries) {
  // choose a host at random
  var meshConfig = config.proxy.mesh;
  var host = meshConfig.hosts[Math.floor(Math.random()*meshConfig.hosts.length)];
  var proxyUrl = "http://" + meshConfig.user + ":" + meshConfig.password + "@" + host + ":" + meshConfig.port;
  return attemptRequest(url, proxyUrl, 'mesh', numRetries || 1);
}

/**
 * luminatiRequest uses the luminati proxy to request the specified url up to
 * the specified number of times (until success or 30 seconds has elapsed).
 */
function luminatiRequest(url, numRetries) {
  var proxyUrl = config.proxy.luminati.addr;
  if (proxyUrl.indexOf('http') < 0) proxyUrl = 'http://' + proxyUrl;
  return attemptRequest(url, proxyUrl, 'luminati', numRetries || 1);
}

/**
 * attemptRequest makes a request to the specified url via the specified proxy
 * url as many times as allowed (up to numRetries times) until it either 
 * succeeds or 30 seconds has elapsed.
 */
function attemptRequest(url, proxyUrl, proxyName, numRetries) {
  // repeat the request until the requested number of attempts.
  var success = false;
  var begin = Date.now();

  return new Promise((resolve, reject) => {
    async.whilst(
      function test() {
        if ((Date.now() - begin) > 30000) return false;
        if (success === true || numRetries <= 0) return false;
        return true;
      },
      function fn(callback) {
        numRetries--;
        makeRequest(url, proxyUrl, proxyName, 10000)
        // if we have succeeded
        .then(body => {
          success = true;
          callback(null, body);
        })
        // retry
        .catch(err => {
          setTimeout(function() { callback(); }, 1);
        });
      },
      function finalCallback(err, body) {
        if (body && !err) resolve(body);
        else reject(err);
      }
    );
  });
}

/**
 * makeRequest makes a SINGLE request, logs the result of that request to the
 * proxy database, and returns a promise that is fulfilled iff the request
 * completed successfully (statusCode == 200 and non-empty body).
 */
function makeRequest(url, proxyUrl, proxyName, timeoutMs) {
  var options = {
    url: url,
    proxy: proxyUrl,
    headers: {
      'User-Agent': fakeUserAgent(),
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language':'en-US,en;q=0.8',
      'Cache-Control':'max-age=0',
      'Connection':'keep-alive'
    },
    timeout: timeoutMs,
  }

  return new Promise((resolve, reject) => {
    var begin = Date.now();
    var status = {
      check: false,
      request_url: url,
      proxy: proxyName,
    };

    request(options, function(err, res, body) {
      status.delay_ms = Date.now() - begin;

      if (!err && (res.body.length == 0 || res.statusCode < 200 || res.statusCode >= 300)) {
        err = { bodyLength: res.body.length, statusCode: res.statusCode };
      }

      if (err) {
        status.success = false;
        reject(err);
      } else {
        status.success = true;
        resolve(body);
      }

      db.Metrics.log('proxy', status);
    });
  });
}

module.exports = {
  proxyRequest: proxyRequest,
};
