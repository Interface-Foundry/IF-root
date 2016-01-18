var request = require('request')
var cheerio = require('cheerio')
var kip = require('kip')
var debug = require('debug')('amazon')

// in mem cache that can clean itself to 1000 items max
var cache = {
  get: function(url, cb) {
    //  in-mem impl, can do redis later
    if (this._cache[url]) {
      cb(null, this._cache[url])
    } else {
      cb()
    }
  },

  put: function(url, product) {
    debug('putting cache for ' + url);
    this._cache[url] = product;
  },

  _cache: {},

  clean: function() {
    // keep only 1000 items in cache
    if (Object.keys(cache._cache) > 1000) {
      // randomly delete 1000 of them...
      Object.keys(cache._cache)
        .map(function(k) {
          return {
            key: k,
            sort: Math.random()
          }
        })
        .sort(function(a, b) { return a.sort > b.sort })
        .splice(-1000)
        .map(function(i) {
          delete cache._cache[k.key];
        })
    }
  }
};

// cache cleaning, every day make sure there are at most 1000 items in cache
setInterval(cache.clean, 24 * 60 * 60 * 1000)

/**
 callback should be function(error, product) {}
 where product = {
           price: '',
           color_options: [], // TODO scrape color options in the future
           text: ''
         }
 */
module.exports = function get(url, callback) {

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
        //blocked by amazon? use offer price
        // item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0]
        else if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice){
            //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
            console.log('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

            product.price = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

        }
        else if (item.ItemAttributes[0].ListPrice){

            console.log('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

            if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                product.price = '';
            }
            else {
              // add price
              product.price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
            }
        }
        else {
            console.log('/!/!!! warning: no webscrape price found for amazon item');
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

if (!module.parent) {
  module.exports('http://www.amazon.com/Acer-G226HQL-21-5-Inch-Screen-Monitor/dp/B009POS0GS/ref=sr_1_1?s=pc&ie=UTF8&qid=1453137893&sr=1-1&keywords=monitor', function(err, product) {
    kip.fatal(err)
    console.log(product);
    module.exports('http://www.amazon.com/Acer-G226HQL-21-5-Inch-Screen-Monitor/dp/B009POS0GS/ref=sr_1_1?s=pc&ie=UTF8&qid=1453137893&sr=1-1&keywords=monitor', function(err, product) {
      console.log('hopefully hit cache')
    })

  })
}
