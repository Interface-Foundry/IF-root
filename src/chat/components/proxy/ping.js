/**
 * This module simply starts an infinite loop which pings a known url via the
 * luminati proxy every so often as a way of performing a health-check on
 * luminati.
 *
 * This module should not be imported by anything except for the top-level
 * application.
 */

var async = require('async');
var cheerio = require('cheerio');
var config = require('../../../config');
var proxyRequest = require('./request').proxyRequest;
var status = require('./status');

var amazon_url = 'https://www.amazon.com/gp/product/B01AW25FPU/';

async.whilst(
  function test() { return true; },
  function fn(callback) {
    var begin = Date.now();
    var pingLog = {
      check: true,
      proxy: 'luminati',
      success: false,
      url: amazon_url,
    }

    proxyRequest(amazon_url, 1, 'luminati')
    .then(body => {
      var $ = cheerio.load(body);
      var reviews = $('#revMHRL').text();
      pingLog.success = !!reviews;
      pingLog.delay_ms = Date.now() - begin;
      db.Metrics.log('proxy', pingLog);

      status.set(pingLog.success, pingLog.delay_ms);
      setTimeout(function() { callback() }, config.proxy.luminati.intervalMillis || 300000);
    })
    .catch(err => {
      pingLog.error = err;
      pingLog.delay_ms = Date.now() - begin;
      db.Metrics.log('proxy', pingLog);

      status.set(false, pingLog.delay_ms);
      setTimeout(function() { callback() }, config.proxy.luminati.intervalMillis || 300000);
    });
  }
); 
