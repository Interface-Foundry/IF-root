var cheerio = require('cheerio');
var request = require('request');


var getReviews = function(ASIN,callback) {
    //get reviews in circumvention manner (amazon not allowing anymore officially)
    request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+ASIN+'', function(err, res, body) {
      if(err){
        console.log('getReviews error: ',err);
        callback();
      }
      else {
        $ = cheerio.load(body);
        callback(( $('.a-size-base').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift(),( $('.a-link-emphasis').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift());
      }
    });
};

var getPrices = function(url,callback){

    //remove referral info
    url = url.substring(0, url.indexOf('%'));

    var options = {
        url: url,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            //'Accept-Encoding':'gzip, deflate, sdch',
            'Accept-Language':'en-US,en;q=0.8',
            'Cache-Control':'no-cache',
            'Connection':'keep-alive',
            'Cookie': 'x-wl-uid=1BjpaGuxCTGdAWCxWU+87j+O+jpfyZqUylkd3CN1WoeO9KIRkjfML+wpDwHWA8DucgbG7gBgUpx8=; session-token=g74T/8uiz3D897wNrVE7VcWXJAkKIURxLCI+Tnjf94aIBBtNDTI065vGc31bO7NG2V/U9FW4mEgBsWCy60e5Dqscj/OXBD1k4auqBj0p5RSGftxSCZzlCXmkGxe2aTECiW87OqDvvze8bpWgdlt4J8kpl/SXmbMVGg5w9N9BfxULpNtvYmm61nyCI7tTwr7noOluf+z6rI9W+4hTCZpU8xewfrQEG6NZKdAz+T7D25zfjfqciUZ+KEzAcmR+Jk3DYDDoG57sSiU=; csm-hit=1M5M5G84TW4EN2G1T6T1+s-0W6WGGYC27MJ8C0HPSF5|1451418645254; ubid-main=192-9287373-0652310; session-id-time=2082787201l; session-id=185-1853384-1692700',
            'Host':'www.amazon.com',
            'Origin':'http://www.amazon.com',
            'Pragma':'no-cache',
            'Upgrade-Insecure-Requests':'1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
            'Referer':url
        }
    };
    request(options, function(err, response, body) {
      if(err){
        console.log('getPrices error: ',err);
        callback();
      }
      else {
        $ = cheerio.load(body);
        callback($('#miniATF_price').text());
      }
    });

}

/////////// tools /////////////



/// exports
module.exports.getReviews = getReviews;
module.exports.getPrices = getPrices;
