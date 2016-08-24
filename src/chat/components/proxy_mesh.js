var request = require('request');
var db = require('../../db');


var mesh_request = function (url, busy) {
    return new Promise(function(resolve,reject) {
      console.log('firing mesh request...');
      var begin= Date.now();
      var user = 'alyx';
      var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
      var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com','us-ny.proxymesh.com','us-il.proxymesh.com','us-ca.proxymesh.com']; //avail proxies
      var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
      var port = '31280';
      var proxy = "http://" + user + ":" + password + "@" + host + ":" + port;
      request({
        url: url,
        proxy: proxy,
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
         var timeSpent=(end-begin)/10000+"milliseconds";
           if (err) {
            // kip.debug('mesh1')
             // db.Metrics.log('proxy', { proxy: 'mesh', request_url: url, delay_ms: timeSpent, success: fail, error: err})
             reject(err);
          }
          else if (res.statusCode == 200 && body.length > 0){
            // kip.debug('mesh2')
             db.Metrics.log('proxy', { proxy: 'mesh', request_url: url, delay_ms: timeSpent, success: true})
             resolve(body);
          }
          else {
            // kip.debug('mesh3')
             // db.Metrics.log('proxy', { proxy: 'mesh', request_url: url, delay_ms: timeSpent, success: fail, error: 'fail'})
             reject('fail')
          }
    });
  })
}

module.exports = {
  mesh_request: mesh_request
}