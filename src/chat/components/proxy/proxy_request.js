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
var status = require('./status');
const proxy = new Luminati({
    customer: 'kipthis', 
    password: 'e49d4ega1696', 
    zone: 'gen', 
    proxy_count: 5,
    // proxy_switch: true,
    pool_size: 9,
    max_requests: 100,
    log: 'NONE'
});

proxy.listen(24000, '127.0.0.1')

module.exports.request = function(url) {
      var ready = status.check();
      var res;
      if (ready) {
        kip.debug('firing luminati...')
        res = luminati_request(url, proxy)
      } else{
        kip.debug('firing mesh...')
        res = mesh_request(url)
      }
      return res;
}
