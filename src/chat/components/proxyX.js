const hutil = require('hutil');
const etask = require('hutil').etask;
var exec = require('child_process').exec;
var kip = require('../../kip');
var fs = require('fs')
var async = require('async');
var request = require('request');
var db = require('../../db');
var mesh_request = require('./proxy_mesh').mesh_request;
var manual_request = require('./manual_luminati');
const Luminati = require('luminati-proxy').Luminati;
const proxy = new Luminati({
    customer: 'kipthis', // your customer name
    password: 'e49d4ega1696', // your password
    zone: 'gen', // zone to use
    proxy_count: 5, //minimum number of proxies to use for distributing requests
    // proxy_switch: true,
    pool_size: 9,
    max_requests: 100,
    log: 'NONE'
});
proxy.listen(24000, '127.0.0.1').then(res=>{
    console.log('\nLuminati Status: ', res.statusCode,'\n');
}, err=>{
    // console.log('Luminati Error:', err);
})


// luminatiReady = false;



// /// - - - - - REMOVED LUMINATI CHECKER FOR NOW - - - - - ///
// //lets check if luminati dies, forever
// async.whilst(
//     function () { 
//       return true; 
//     },
//     function (callback) {
//       var options = {
//         url: 'http://kipthis.com/DONTTOUCH.txt', //a single byte file lol
//         proxy: 'http://127.0.0.1:24000'
//       };
//       request(options,function(data){ 
//         luminatiReady = true;
//         setTimeout(function () {
//           callback()
//         }, 3000);
//       }, function(err){ 
//         luminatiReady = false;
//         setTimeout(function () {
//           callback()
//         }, 5000);

//       });
//     },
//     function (err) {
//         // 5 seconds have passed
//     }); 




var luminati_request = function (url) {
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
               console.log('\n\n\n\nLib luminati took : ', timeSpent,'\n\n\n\n');
            if (err) {
               // db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: false, error: err})
               reject(err);
            }
            else if (res.body.length > 0 && res.statusCode == 200) {
               db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: true})
               resolve(res.body);
            } 
            else {
               // db.Metrics.log('proxy', { proxy: 'luminati', request_url: url, delay_ms: timeSpent, success: false, error: 'fail'})
               reject()
            }
        });
    })
}




var request = function(url, busy) {
      var res0 = luminati_request(url)
      var res1 = mesh_request(url)
      var res = manual_request(url)
      return res1;
}





 
module.exports = {
   request: request
    };
