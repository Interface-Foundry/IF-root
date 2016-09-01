const hutil = require('hutil');
const etask = require('hutil').etask;
var exec = require('child_process').exec;
var kip = require('../../../kip');
var async = require('async');
var request = require('request');
var db = require('../../../db');
var mesh_request = require('./mesh');
var luminati_request = require('./lib_luminati');
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

if (test_mode) {
  console.log('Running proxy test mode..')
  async.eachSeries(sets, function iterator(set, callback) {
   if (proxy) {
    console.log('\n\n🤖stopping previous proxy...\n\n');
    proxy.stop();
   }
    proxy_status.current_index = sets_index;
    console.log('\n\n\n\n🤖starting #', sets_index,' proxy with options: ', set.config,' ...\nfor ',set.time_in_seconds,' seconds...\n\n\n\n');
    var proxy = new Luminati(sets[sets_index].config);
    proxy.listen(24000, '127.0.0.1');
    setTimeout(function() {
      console.log('\n\n🤖time to live elapsed... trying next set...\n\n');
      sets_index = sets_index + 1;
      proxy.stop();
      return callback(null);
    }, set.time_in_seconds * 1000);
  }, function complete(err, res) {
      proxy.stop();
  });
} 
else {
  const proxy = new Luminati({
      customer: 'kipthis', 
      password: 'e49d4ega1696', 
      zone: 'gen', 
      proxy_count: 3, 
      max_requests: 20,
      country: 'us',
      log: 'NONE'
  });
  proxy.listen(24000, '127.0.0.1')
}

module.exports.request = function(url) {
      var status = proxy_status.check();
      var res;
      if (status.ready) {
        kip.debug('firing luminati...')
        res = luminati_request(url, proxy, status.status);
      } else{
        kip.debug('firing mesh...')
        res = mesh_request(url, status.status);
      }
      proxy.stop();
      return res;
};

