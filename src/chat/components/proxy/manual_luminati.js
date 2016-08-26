var request = require('request');
var db = require('../../../db');
var options = require('./status').options;
var exec = require('child_process').exec;
var child;
// executes `pwd`
child = exec("luminati --customer lum-customer-kipthis-zone-gen --password e49d4ega1696 --port 34000 --pool_size 9 --session_timeout 60000 --max_requests 100", function (error, stdout, stderr) {
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
      proxy: 'http://127.0.0.1:34000',
      headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language':'en-US,en;q=0.8',
          'Cache-Control':'max-age=0',
          'Connection':'keep-alive',
          'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
          'Host':'www.amazon.com',
          'Origin':'http://www.amazon.com',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
      }
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
           db.Metrics.log('proxy', { proxy: 'manual_luminati', check: false,request_url: url, delay_ms: timeSpent, success: false, error: 'fail', status: status, options: options})
           reject()
        }
    })
  })
}


