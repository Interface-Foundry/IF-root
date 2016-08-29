var async = require('async');
var request = require('request');
var status = {};
var cheerio = require('cheerio');
var sets = require('./settings').sets;
var proxy_opt = {
    customer: 'kipthis', 
    password: 'e49d4ega1696', 
    zone: 'gen', 
    proxy_count: 3,
    // country: 'us',
    // request_timeout: 2,
    // sticky_ip: true,
    // proxy_switch: true,
    // pool_size: 9,
    max_requests: 5,
    log: 'NONE'
};
module.exports = { check: check, options: proxy_opt, current_index: 0};
var argv = require('minimist')(process.argv.slice(2));
var test_mode = argv.proxy ? argv.proxy : false;
var ping_interval = (argv.proxy && argv.interval) ? argv.interval : 300000;

async.whilst(
    function () { 
      return true; 
    },
    function (callback) {
      var amazon_url = 'http://www.amazon.com/Helens-Pinkmartini-Colors-Sports-Sneakers/dp/B019MPDGHM'
      var test_url = 'http://kipthis.com/DONTTOUCH.txt'
      var options = {
        url: amazon_url, 
        proxy: 'http://127.0.0.1:24000',
        timeout: 3000
      };
      var begin= Date.now();
      status.last_ping= Date.now();
      request(options,function(err, res, body){ 
        if (err) {
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.success = false;
          status.age = (Date.now() - status.last_ping)/10000;
          if (test_mode)console.log('\nstatus:', ping_interval,' : using option set #',  module.exports.current_index ,': ',status,'\n');
          if (test_mode) db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: test_url, delay_ms: status.latency, success: false, error: err, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config } }); 
          setTimeout(function () {
            callback()
          }, ping_interval);
        } 
        else if (res && res.statusCode == 200 && body.length > 0) {
          var $ = cheerio.load(body);
          var reviews = $('#revMHRL').text();
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.success = reviews ? true : false;
          status.age = (Date.now() - status.last_ping)/10000;
          if (test_mode)console.log('\nstatus:', ping_interval,' : using option set #',  module.exports.current_index ,': ',status,'\n');
          if (test_mode) db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: test_url, delay_ms: status.latency, success: true, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config}});
          setTimeout(function () {
            callback()
          },ping_interval);
        } else {
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.success = false;
          status.age = (Date.now() - status.last_ping)/10000;
         if (test_mode)console.log('\nstatus:', ping_interval,' : using option set #',  module.exports.current_index ,': ',status,'\n');
          if (test_mode) db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: test_url, delay_ms: status.latency, success: false, error: err, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config}}); 
          setTimeout(function () {
            callback()
          },ping_interval);
        }
      });
    },
    function (err) {}
); 

var check = function() {
    console.log('\n\n\n\n',status,'\n\n\n\n');
    status.age = (Date.now() - status.last_ping)/10000;
    if (status.success == true && status.latency <= 1 && status.age <= 60) {
      return {ready: true, status: status };
    } else {
      return {ready: false, status: status };
    }
}

