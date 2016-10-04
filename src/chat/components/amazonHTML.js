var request = require('request')
var cheerio = require('cheerio')
var kip = require('../../kip')
var debug = require('debug')('amazon')
var memcache = require('memory-cache');
var fs = require('fs')
var mailerTransport = require('../../mail/IF_mail.js');
const hutil = require('hutil');
var co = require('co');
var promisify = require("promisify-node");
var proxy_lib = require('./proxy/proxy_request');

const CACHE_TTL = 24 * 60 * 60 * 1000;
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

module.exports.basic = function(url, callback) {
        //remove referral info just in case
      url = url.replace('%26tag%3Dbubboorev-20','');
      url = url.replace('%26tag%3Dkrista08-20','');
      url = url.replace('%26tag%3Dkrista03-20','');
      url = url.replace('%26tag%3Dquic0b-20','');
      url = url.replace('%26tag%3Deileenog-20','');
      // check cache
      cache.get(url, function(err, product) {
        if (err) kip.debug('46: ',err);
        if (product) {
          callback(null, product);
          return;
        }
        var response = proxy_lib.request(url)
        .then(function(response) {
              process_data(response, product, url, callback);
        },function(err) {
          kip.debug('Proxy errored out.. ', err)
        });
  })       
}




function process_data(body, product, url, callback) {
     // we weill fill in these fields 🍹🌴
        var product = {
          price: '',
          text: '',
          full_html: '',
          asin: ''
        }
        debug('got reponse for url ' + url)
        var amazonSitePrice;
        var $ = cheerio.load(body);
        $('html').find('script').remove()
        $('html').find('style').remove()
        product.asin = $('input#ASIN').val();
        product.title = $('#productTitle').text();
        $('.votingStripe').remove()
        product.reviews = $('#revMHRL').text();
        //sort scraped price
        //try for miniATF
        if ($('#miniATF_price').text()){  //excluding scrapes with multiple prices (-) in field
            debug('😊 kk');
            amazonSitePrice = $('#miniATF_price').text().trim();
        }
        //if no miniATF, try for priceblock_ourprice
        else if ($('#priceblock_ourprice').text()){
            debug('😊 kk');
            amazonSitePrice = $('#priceblock_ourprice').text().trim();
        }
        else if ($('.buybox-price').text()){
            debug('😊 kk');
            amazonSitePrice = $('.buybox-price').text().trim();
            amazonSitePrice = amazonSitePrice.split("\n");
            amazonSitePrice = amazonSitePrice[0];
        }
        else if ($('#priceblock_saleprice').text()){
            debug('😊 kk');
            amazonSitePrice = $('#priceblock_saleprice').text().trim();
            amazonSitePrice = amazonSitePrice.split("\n");
            amazonSitePrice = amazonSitePrice[0];
        }
        else {
          debug('NO PRICE FOUND 😊😊😊😊😊😊😊 ',url);
          // debug('🍹 ',err);
        
        }
        //* * * * * * * * * *//
        //we have price from website
        if (amazonSitePrice){
            product.price = amazonSitePrice;
        }
        //Get reviews
        var reviewCount = $('#acrCustomerReviewText').text().trim();
        var rating = $('#acrPopover').text().trim();
        if (rating && reviewCount){
          product.reviews = {
            rating: parseFloat(rating.match(/^[0-9.,\s]+/)[0].trim()),
            reviewCount: reviewCount.match(/^[0-9.,\s]+/)[0].trim()
          }
        debug('& & & &  ',product.reviews);
        }
        else {
          console.error('no match for review ',rating)
          console.error('no match for review ',reviewCount)
        }
        //we found an image alternate for missing item images
        if($('#imgTagWrapperId').children('img').attr('data-old-hires')){
          product.altImage = $('#imgTagWrapperId').children('img').attr('data-old-hires');
        }else if ($('#imgTagWrapperId').children('img').attr('src') && checkURL($('#imgTagWrapperId').children('img').attr('src'))) {
          debug('wow we found an image url um ok, proceed....proceed...');
          product.altImage = $('#imgTagWrapperId').children('img').attr('src');
        }
        var textParts = {
          featureBulletText: $('#featurebullets_feature_div').text().replace(/\s+/g, ' '),
          descriptionText: $('#productDescription').text().replace(/\s+/g, ' '),
          productDetails: $('#productDetailsTable').text().replace(/<li>([^<li>]*)<\/li>/g, ' $1. ').replace(/\s+/g, ' '),
          aplusProductDescription: $('#aplusProductDescription').text().replace(/\s+/g, ' ')
        };
        // glue all the text parts together into one document
        product.text = Object.keys(textParts).map(function(key) { return textParts[key] }).join('\n\n');
        debug('done with url ' + url)
        debug(product)
        cache.put(url, product);
        callback(null, product);
}



// get the questions and ansewrs for a specific product url
module.exports.qa = function(asin, callback) {
  var cachekey = asin + '#QA'

  cache.get(cachekey, function(err, qa) {
    kip.err(err);
    if (qa) {
      debug('cache hit for qa ' + cachekey);
      return callback(null, qa);
    }

    debug('cache miss for qa ' + cachekey);

    var QA = [];

    var question_template = 'http://www.amazon.com/ask/questions/inline/$ASIN/$PAGE?_=$TIMESTAMP';
    function getQuestions(page, lastb) {
      debug(page);
      var timestamp = +new Date();
      var url = question_template
        .replace('$ASIN', asin)
        .replace('$PAGE', page)
        .replace('$TIMESTAMP', timestamp)

      debug(url);
      request({
        method: 'GET',
        url: url
      }, function (e, r, b) {
        if (e) {
          kip.err(e);
        }

        if (b === lastb) {
          cache.put(cachekey, QA)
          return callback(null, QA)
        }

        var $ = cheerio.load(b);
        // omg this is so brittle
        var done = false;
        $('[id^=question]').map(function(i, e) {
          var q = $(this).find('a').text().trim();
          var answer = $(this)
            .parent()
            .find('span').eq(2);
          if (answer.find('.askLongText')[0]) {
            answer.find('a').remove();
            answer = answer.find('.askLongText').text().trim()
          } else {
            answer = answer.text().trim()
          }
          var qa = {
            q: q,
            a: [answer]
          }
          QA.map(function(qa) {
            if (!done && qa.q === q) {
              done = true;
              cache.put(cachekey, QA)
              return callback(null, QA)
            }
          })
          if (!done) {
            debug(qa);
            QA.push(qa);
          }
        })

        // add a question cap
        if (page >= 10) {
          return callback(null, QA);
        }

        if ($('[id^=question]').toArray().length === 0) {
          return callback(null, QA);
        }

        if (!done) {
          getQuestions(++page, b);
        }
      })
    }
    getQuestions(1);

  })

}


function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

// module.exports = {
//   qa: qa,
//   basic: basic
// }
