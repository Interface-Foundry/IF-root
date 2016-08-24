var request = require('request');
var db = require('../../../db');

module.exports = luminati_request = function (url, proxy) {
    return new Promise((resolve, reject)=>{
        var begin= Date.now();
        proxy.request({ 
          url: url,
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
        }, function(err, res){
               var end= Date.now();
               var timeSpent=(end-begin)/10000;
            if (err) {
               db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: false, error: err})
               reject(err);
            }
            else if (res.body.length > 0 && res.statusCode == 200) {
               db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: true})
               resolve(res.body);
            } 
            else {
               db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: false, error: 'fail'})
               reject()
            }
        });
    })
}
