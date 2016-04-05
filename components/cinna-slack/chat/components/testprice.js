var request = require('request')

var url = 'http://www.amazon.com/Womens-Buckle-Riding-Boots-Coco-01v4-0/dp/B00AVPHLFQ%3Fpsc%3D1%26SubscriptionId%3DAKIAIM4IKQAE2WF4MJUQ%26linkCode%3Dxm2%26camp%3D2025%26creative%3D165953%26creativeASIN%3DB00AVPHLFQ';

//       var options = {
//           url: url,
//           headers: {
//               'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//               //'Accept-Encoding':'gzip, deflate, sdch',
//               'Accept-Language':'en-US,en;q=0.8',
//               'Avail-Dictionary':'qHs1hh9Q',
//               'Cache-Control':'max-age=0',
//               'Connection':'keep-alive',
//               'Cookie': 'x-wl-uid=1QzHcFaAi0nVvunUqsj2QM0aovhwKKa4/z/21QI5ffBtLYVQLyjBJO3g1oE2VXPT9NoEbSMLVwys=; session-token=Gm7LWvhq6XEXLZeKKU42xgF4vP+qspqT1cuuZtgDHBkJJlA3nVQgKQEiHCqTz3i+yy+0wmGd2gTa1mVMwTZlMxlSa2kFxTqaLyMVxw6BKlniNKztf8KYMpxDWuYQdF77DmOJaaWTtl6BbgNhSIQOqVbygqWy1T5JC0iIS6E6Rp0mum33Q3HTTTGo4u+5kmPAbUUDlhGXTmR5EA9d6ygJrFPZAOg+DhSKk1KukwwVmTkSPNGwnOM2bRin7ccXTbiG; csm-hit=03RP10K71JQAZRCBH9VN+s-03RP10K71JQAZRCBH9VN|1459801392100; ubid-main=181-9413107-8193525; session-id-time=2082787201l; session-id=187-3438060-7120357',
//               'Host':'www.amazon.com',
//               'Origin':'http://www.amazon.com',
//               //'Pragma':'no-cache',
//               'Upgrade-Insecure-Requests':'1',
//               'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
//               'Referer':url
//           }
//       };

//       request(options, function(err, response, body) {
//         console.log(body);
//       });




// var urlProxy = "http://" + "alyx" + ":" + "9fSvNH@aB4Hs2s>qcatsoupkanyecandle" + "@www.example.com";

// request(
//     {
//         url : url,
//         proxy: urlProxy
//     },
//     function (error, response, body) {
//         // Do more stuff with 'body' here
//     }
// );

var user = 'alyx';
var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com']; //avail proxies
var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
var port = '31280';
var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;

var proxiedRequest = request.defaults({
  proxy: proxyUrl,
  headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      //'Accept-Encoding':'gzip, deflate, sdch',
      'Accept-Language':'en-US,en;q=0.8',
      'Avail-Dictionary':'qHs1hh9Q',
      'Cache-Control':'max-age=0',
      'Connection':'keep-alive',
      'Cookie': 'x-wl-uid=1QzHcFaAi0nVvunUqsj2QM0aovhwKKa4/z/21QI5ffBtLYVQLyjBJO3g1oE2VXPT9NoEbSMLVwys=; session-token=Gm7LWvhq6XEXLZeKKU42xgF4vP+qspqT1cuuZtgDHBkJJlA3nVQgKQEiHCqTz3i+yy+0wmGd2gTa1mVMwTZlMxlSa2kFxTqaLyMVxw6BKlniNKztf8KYMpxDWuYQdF77DmOJaaWTtl6BbgNhSIQOqVbygqWy1T5JC0iIS6E6Rp0mum33Q3HTTTGo4u+5kmPAbUUDlhGXTmR5EA9d6ygJrFPZAOg+DhSKk1KukwwVmTkSPNGwnOM2bRin7ccXTbiG; csm-hit=03RP10K71JQAZRCBH9VN+s-03RP10K71JQAZRCBH9VN|1459801392100; ubid-main=181-9413107-8193525; session-id-time=2082787201l; session-id=187-3438060-7120357',
      'Host':'www.amazon.com',
      'Origin':'http://www.amazon.com',
      //'Pragma':'no-cache',
      'Upgrade-Insecure-Requests':'1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.110 Safari/537.36',
      'Referer':url
  }
});

proxiedRequest.get(url, function (err, resp, body) {
  console.log(body);
  console.log(err);
   console.log(resp);
});





