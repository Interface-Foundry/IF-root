var async = require('async');
var request = require('request');
var status = {};
async.whilst(
    function () { 
      return true; 
    },
    function (callback) {
      var options = {
        url: 'http://www.amazon.com/Helens-Pinkmartini-Colors-Sports-Sneakers/dp/B019MPDGHM%3Fpsc%3D1%26SubscriptionId%3DAKIAJWTPOWIOUPHJYG2Q%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB019MPDGHM', 
        proxy: 'http://127.0.0.1:24000'
      };
      var begin= Date.now();
      request(options,function(err, res, body){ 
        if (err) {
          setTimeout(function () {
            callback()
          }, 5000);
        } 
        else if (res && res.statusCode == 200 && body.length > 0) {
          status.last_ping= Date.now();
          var end= Date.now();
          status.latency=(end-begin)/10000;
          console.log('\nSTATUS: ',status,'\n')
          setTimeout(function () {
            callback()
          }, 3000);
        }
      });
    },
    function (err) {}
); 

var check = function() {
    console.log('\n',status,'\n');
    status.age = (Date.now() - status.last_ping)/10000;
    if (status.latency < 0.06 && status.age < 3) {
      return true;
    } else {
      return false;
    }
}

module.exports = { check: check}