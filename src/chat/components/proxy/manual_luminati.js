var request = require('request');
var db = require('../../../db');
var options = require('./status').options;
var exec = require('child_process').exec;
var child;
// executes `pwd`
child = exec("luminati --customer lum-customer-kipthis-zone-gen --password e49d4ega1696 --port 24000 --proxy_count 3 --max_requests 20 --country us", function (error, stdout, stderr) {
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
  if (error !== null) {
    console.log('exec error: ' + error);
  }
});



module.exports =  manual_request = function(url, status) {
  return new Promise((resolve, reject)=>{
    var begin=Date.now();
    request({
      url: url,
      proxy: 'http://127.0.0.1:24000',
      headers: {
          'Accept': 'text/html,application/xhtml+xml',
             'Accept-Language':'en-US,en;q=0.8',
             'Cache-Control':'max-age=0',
             'Connection':'keep-alive'
      },
      timeout: 3000
    }, function(err, res, body) {
        var end= Date.now();
        var timeSpent=(end-begin)/10000;
        if (err) {
           db.Metrics.log('proxy', { proxy: 'manual_luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, options: options, error: err, status: status})
           reject(err);
        }
        else if (res.body.length > 0 && res.statusCode == 200) {
           db.Metrics.log('proxy', { proxy: 'manual_luminati', check: false, request_url: url, delay_ms: timeSpent, success: true, status: status, options: options})
           resolve(res.body);
        } 
        else {
           db.Metrics.log('proxy', { proxy: 'manual_luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, status: status, options: options, error: res.statusCode, body: res.body})
           reject(null)
        }
    })
  })
}


