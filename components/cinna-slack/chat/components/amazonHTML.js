'use strict'

var request = require('request')
var cheerio = require('cheerio')
var kip = require('kip')
var debug = require('debug')('amazon')
var memcache = require('memory-cache');

const CACHE_TTL = 24 * 60 * 60 * 1000;

// in mem cache that can clean itself to 1000 items max
var cache = {
  get: function(key, cb) {
    //  in-mem impl, can do redis later
    if (memcache.get(key)) {
      cb(null, memcache.get(key))
    } else {
      cb()
    }
  },

  put: function(url, product) {
    debug('putting cache for ' + url);
    memcache.put(url,  product, CACHE_TTL);
  }
};

/**
 callback should be function(error, product) {}
 where product = {
           price: '',
           color_options: [], // TODO scrape color options in the future
           text: ''
         }
 */
module.exports.basic = function basic(url, callback) {

    //remove referral info just in case
    url = url.replace('%26tag%3Dbubboorev-20','');

    // check cache
    cache.get(url, function(err, product) {
      kip.err(err);

      if (product) {
        debug('hit cache for url ' + url)
        callback(null, product)
        return;
      }

      debug('miss cache for url ' + url)

      //add request headers
      var options = {
          url: url,
          headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              //'Accept-Encoding':'gzip, deflate, sdch',
              'Accept-Language':'en-US,en;q=0.8',
              'Cache-Control':'no-cache',
              'Connection':'keep-alive',
              'Cookie': 'x-wl-uid=1pueisgHxMYKWT0rswq5JqfnPdFseLZ/OxR7UupM9FY0RLpoyRkASv5p0aqDde7UxdAH0ye/4HGk=; ubid-main=184-9837454-1099037; session-id-time=2082787201l; session-id=189-6797902-2253123',
              'Host':'www.amazon.com',
              'Origin':'http://www.amazon.com',
              'Pragma':'no-cache',
              'Upgrade-Insecure-Requests':'1',
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36',
              'Referer':url
          }
      };

      request(options, function(err, response, body) {
        if (kip.error(err)) {
          console.error('error amazon get url ' + url)
          callback(err);
          return
        }

        debug('got reponse for url ' + url)

        // we weill fill in these fields 🍹🌴
        var product = {
          price: '',
          text: ''
        }

        var amazonSitePrice;

        $ = cheerio.load(body);

        //sort scraped price
        //try for miniATF
        if ($('#miniATF_price').text() && $('#miniATF_price').text().indexOf('-') < 0){  //excluding scrapes with multiple prices (-) in field
            console.log('😊 kk');
            amazonSitePrice = $('#miniATF_price').text().trim();
        }
        //if no miniATF, try for priceblock_ourprice
        else if ($('#priceblock_ourprice').text() && $('#priceblock_ourprice').text().indexOf('-') < 0){
            console.log('😊 kk');
            amazonSitePrice = $('#priceblock_ourprice').text().trim();
        }

        //* * * * * * * * * *//

        //we have price from website
        if (amazonSitePrice){  //excluding scrapes with multiple prices (-) in field
            product.price = amazonSitePrice;
        }

        var textParts = {
          featureBulletText: $('#featurebullets_feature_div').text().replace(/\s+/g, ' '),
          descriptionText: $('#productDescription').text().replace(/\s+/g, ' '),
          productDetails: $('#prodDetails').text().replace(/\s+/g, ' '),
          aplusProductDescription: $('#aplusProductDescription').text().replace(/\s+/g, ' ')
        };

        // glue all the text parts together into one document
        product.text = Object.keys(textParts).map(function(key) { return textParts[key] }).join('\n\n');
        debug('done with url ' + url)
        debug(product)

        cache.put(url, product);
        callback(null, product);
      });
    })
}

// get the questions and ansewrs for a specific product url
module.exports.qa = function(url, callback) {
  var cachekey = url + '#QA'

  cache.get(cachekey, function(err, qa) {
    kip.err(err);
    if (qa) {
      debug('cache hit for qa ' + cachekey);
      return callback(null, qa);
    }

    // example url:
    // http://www.amazon.com/Acer-G226HQL-21-5-Inch-Screen-Monitor/dp/B009POS0GS/ref=sr_1_1?s=pc&ie=UTF8&qid=1453137893&sr=1-1&keywords=monitor
    var dp = url.match(/\/dp\/(.*)\//)[1];
    var question_template = 'http://www.amazon.com/ask/questions/inline/$DP/$PAGE';
    
  })

}

if (!module.parent) {
  module.exports.basic('http://www.amazon.com/Acer-G226HQL-21-5-Inch-Screen-Monitor/dp/B009POS0GS/ref=sr_1_1?s=pc&ie=UTF8&qid=1453137893&sr=1-1&keywords=monitor', function(err, product) {
    kip.fatal(err)
    console.log(product);
    module.exports.basic('http://www.amazon.com/Acer-G226HQL-21-5-Inch-Screen-Monitor/dp/B009POS0GS/ref=sr_1_1?s=pc&ie=UTF8&qid=1453137893&sr=1-1&keywords=monitor', function(err, product) {
      console.log('hopefully hit cache')
    })

  })
}
