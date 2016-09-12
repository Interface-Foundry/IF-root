const hutil = require('hutil');
const etask = require('hutil').etask;
var exec = require('child_process').exec;
var kip = require('../../../kip');
var async = require('async');
var request = require('request');
var db = require('../../../db');
var mesh_request = require('./mesh');
var luminati_request = require('./lib_luminati').luminati_request;
var ensured_luminati_request = require('./lib_luminati').ensured_luminati_request;
var manual_request = require('./manual_luminati');
const Luminati = require('luminati-proxy').Luminati;
var proxy_status = require('./status');
var sets = require('./settings').sets;
var sets_index = require('./settings').current_set;
var IntervalTimer = require('./IntervalTimer').IntervalTimer;
var async = require('async');
var argv = require('minimist')(process.argv.slice(2));
var test_mode = argv.proxy ? argv.proxy : false;
// e.g. run example for test mode: node reply_logic --proxy --interval=6000
proxy = {};
options = {};
if (test_mode) {
  console.log('Running proxy test mode..')
  async.eachSeries(sets, function iterator(set, callback) {
   if (proxy) {
    console.log('\n\n🤖stopping previous proxy...\n\n');
    proxy.stop();
   }
    proxy_status.current_index = sets_index;
    console.log('\n\n\n\n🤖starting #', sets_index,' proxy with options: ', set.config,' ...\nfor ',set.time_in_seconds,' seconds...\n\n\n\n');
    proxy = new Luminati(sets[sets_index].config);
    proxy.listen(24000, 'localhost');
    setTimeout(function() {
      console.log('\n\n🤖time to live elapsed... try ing next set...\n\n');
      sets_index = sets_index + 1;
      proxy.stop();
      return callback(null);
    }, set.time_in_seconds * 1000);
  }, function complete(err, res) {
      proxy.stop();
  });
} 
else {
  console.log('Running proxy normal mode..')
  options = {
      customer: 'kipthis', 
      password: 'e49d4ega1696', 
      zone: 'gen'
  };
  proxy = new Luminati(options);
  proxy.listen(24000, '127.0.0.1')
}

var request = function(url) {
      var status = proxy_status.check();
      var res;
      if (status.ready) {
          console.log('\nfiring luminati...\n')
          res = luminati_request(url, proxy, status.status);
      }
      else{
        console.log('\nfiring mesh...\n')
        res = mesh_request(url, status.status)
      }
      
      //stopProxy(proxy, 10000);
      return res;
};


var ensured_request = function(url) {
      var status = proxy_status.check();
      var res;
      if (status.ready) {
          console.log('\n\n\nfiring ensured_luminati...\n\n\n')
          res = ensured_luminati_request(url, proxy, status.status);
      } else {
          console.log('\n\n\nOops firing mesh instead...\n\n\n')
          res = mesh_request(url, status.status);
      }
      //stopProxy(proxy, 10000);
      return res;
};


function stopProxy(proxy, ms) {
   setTimeout(function(){
        // if (res instanceof Error || res == null) { 
          // console.log('\n\n\nProxy error: ', res.statusCode,'\n\n\n');
          proxy.stop();
        // }
      },ms)
}

module.exports = {
  request: request,
  ensured_request: ensured_request
}
