var async = require('async');
var request = require('request');
var status = {};
var cheerio = require('cheerio');
var sets = require('./settings').sets;
var proxy_opt = {
      customer: 'kipthis', 
      password: 'e49d4ega1696', 
      zone: 'gen', 
      max_requests: 1,
      pool_size: 1 
      // max_requests: 20,
      // country: 'us',
      // log: 'NONE'
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
      var amazon_url = 'https://www.amazon.com/gp/product/B01AW25FPU/'
      var macys_url = 'http://www1.macys.com/shop/mens-clothing/mens-shoes?id=65&edge=hybrid&cm_sp=c2_1111US_catsplash_men-_-row4-_-icon_shoes'
      var test_url = 'http://kipthis.com/DONTTOUCH.txt'
      var url = amazon_url;
      var options = {
        url: url, 
        proxy: 'http://127.0.0.1:24000',
        timeout: 3000
      };
      var begin= Date.now();
      status.last_ping= Date.now();
      request(options,function(err, res, body){ 
        if (err) {
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.data_retrieved = false;
          status.age = (Date.now() - status.last_ping)/10000;
          console.log('\nstatus: ',status,'\n');
          db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: url, delay_ms: status.latency, success: false, error: err, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config } }); 
          setTimeout(function () {
            callback()
          }, ping_interval);
        } 
        else if (res && res.statusCode == 200 && body.length > 0) {
          var $ = cheerio.load(body);
          var reviews = $('#revMHRL').text();
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.data_retrieved = reviews ? true : false;
          status.age = (Date.now() - status.last_ping)/10000;
          console.log('\nstatus: ',status,'\n');
          db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: url, delay_ms: status.latency, success: true, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config}});
          setTimeout(function () {
            callback()
          },ping_interval);
        } else {
          var end= Date.now();
          status.latency=(end-begin)/10000;
          status.data_retrieved = false;
          status.age = (Date.now() - status.last_ping)/10000;
          console.log('\nstatus: ',status,'\n');
          db.Metrics.log('proxy', { proxy: 'luminati', check: true,request_url: url, delay_ms: status.latency, success: false, error: err, status: status, options: {id: module.exports.current_index ,config: sets[module.exports.current_index].config}}); 
          setTimeout(function () {
            callback()
          },ping_interval);
        }
      });
    },
    function (err) {}
); 

function check() {
    // console.log('\n\n\n\n',status,'\n\n\n\n');
    status.age = (Date.now() - status.last_ping)/10000;
    if (status.data_retrieved == true && status.latency <= 3) {
      return {ready: true, status: status };
    } else {
      return {ready: false, status: status };
    }
}

