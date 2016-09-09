var request = require('request');
var db = require('../../../db');
var options = require('./status').options;


module.exports = mesh_request = function (url, status) {
    return new Promise(function(resolve,reject) {
      var begin= Date.now();
      var user = 'alyx';
      var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
      var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com','us-ny.proxymesh.com','us-il.proxymesh.com','us-ca.proxymesh.com']; //avail proxies
      var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
      var port = '31280';
      var mesh_proxy = "http://" + user + ":" + password + "@" + host + ":" + port;
      request({
        url: url,
        proxy: mesh_proxy,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
             'Accept': 'text/html,application/xhtml+xml',
             'Accept-Language':'en-US,en;q=0.8',
             'Cache-Control':'max-age=0',
             'Connection':'keep-alive'



            // 'Accept': 'text/html,application/xhtml+xml',
            // 'Accept-Language':'en-US,en;q=0.8',
            // 'Cache-Control':'max-age=0',
            // 'Connection':'keep-alive',
            // 'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
            // 'Host':'www.amazon.com',
            // 'Origin':'http://www.amazon.com',
            // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
        }
        , timeout: 2000
      }, function(err, res, body) {
         var end= Date.now();
         var timeSpent=(end-begin)/10000;
           if (err) {
             console.log('\n\n\nmesh_request error: ',err,'\n\n\n');
             db.Metrics.log('proxy', { proxy: 'mesh', check: false,request_url: url, delay_ms: timeSpent, success: false, error: err})
             reject(err);
          }
          else if (body.length > 0){
             db.Metrics.log('proxy', { proxy: 'mesh', check: false, request_url: url, delay_ms: timeSpent, success: true})
             resolve(body);
          }
          else {
             console.log('\n\n\nmesh_request error: ',res.statusCode,'\n\n\n');
             db.Metrics.log('proxy', { proxy: 'mesh', check: false,request_url: url, delay_ms: timeSpent, success: false, error: res.statusCode})
             reject('fail')
          }
    });
  })
}
