var request = require('request');
var config = require('../../../config');
var db = require('../../../db');
var options = require('./status').options;


module.exports = mesh_request = function (url, status) {
    return new Promise(function(resolve,reject) {
      var begin= Date.now();
      var meshConfig = config.proxy.mesh;

      // choose a host at random
      var host = meshConfig.hosts[Math.floor(Math.random()*meshConfig.hosts.length)];
      var mesh_proxy = "http://" + meshConfig.user + ":" + meshConfig.password + "@" + host + ":" + meshConfig.port;
      request({
        url: url,
        proxy: mesh_proxy,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language':'en-US,en;q=0.8',
            'Cache-Control':'max-age=0',
            'Connection':'keep-alive'
        },
        timeout: 2000
      }, 
      function(err, res, body) {
        var end= Date.now();
        var timeSpent=(end-begin)/10000;

        var proxyLog = {
          proxy: 'mesh',
          check: false,
          request_url: url,
          delay_ms: timeSpent,
          success: false,
        };

        if (err) {
          console.log('\n\n\nmesh_request error: ',err,'\n\n\n');
          proxyLog.error = err;
          db.Metrics.log('proxy', proxyLog);
          reject(err);
        } else if (body.length > 0){
          proxyLog.success = true;
          db.Metrics.log('proxy', proxyLog);
          resolve(body);
        } else {
          console.log('\n\n\nmesh_request error: ',res.statusCode,'\n\n\n');
          proxyLog.error = res.statusCode;
          db.Metrics.log('proxy', proxyLog);
          reject('fail');
        }
    });
  });
};
