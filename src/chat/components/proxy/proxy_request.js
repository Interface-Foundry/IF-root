const hutil = require('hutil');
const etask = require('hutil').etask;
var exec = require('child_process').exec;
var kip = require('../../../kip');
var config = require('../../../config');
var async = require('async');
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

proxy = {};
options = {};

if (config.proxy.luminati.runLocal) {
  console.log('initializing local luminati proxy.');
  async.eachSeries(sets, function iterator(set, callback) {
    if (proxy) {
      console.log('\n\n🤖stopping previous proxy...\n\n');
      proxy.stop();
    }
    proxy_status.current_index = sets_index;
    // console.log('\n\n\n\n🤖starting #', sets_index,' proxy with options: ', set.config,' ...\nfor ',set.time_in_seconds,' seconds...\n\n\n\n');
    proxy = new Luminati(sets[sets_index].config);
    proxy.listen(24000, 'localhost');

    setTimeout(function() {
      console.log('\n\n🤖time to live elapsed... trying next set...\n\n');
      sets_index = sets_index + 1;
      proxy.stop();
      return callback(null);
    }, set.time_in_seconds * 1000);
  }, function complete(err, res) {
    proxy.stop();
  });
} else {
  console.log('using remote luminati proxy: ' + config.proxy.luminati.addr);
  proxy = undefined;
}

var request = function(url) {
      var status = proxy_status.check();
      var res;
      if (status.ready) {
        // console.log('\nfiring luminati...\n');
        res = luminati_request(url, proxy, status.status);
      } else {
        // console.log('\nfiring mesh...\n');
        res = mesh_request(url, status.status);
      }
      // stopProxy(proxy, 10000);
      return res;
};


var ensured_request = function(url) {
      var status = proxy_status.check();
      var res;
      if (status.ready) {
          // console.log('\n\n\nfiring ensured_luminati...\n\n\n')
          res = ensured_luminati_request(url, proxy, status.status);
      } else {
          // console.log('\n\n\nOops firing mesh instead...\n\n\n')
          res = mesh_request(url, status.status);
      }

      //stopProxy(proxy, 10000);
      return res;
};


function stopProxy(proxy, ms) {
   setTimeout(function(){ proxy.stop(); }, ms);
}

module.exports = {
  request: request,
  ensured_request: ensured_request
};
