'use strict'

var request = require('request')
var cheerio = require('cheerio')
var kip = require('kip')
var debug = require('debug')('amazon')
var memcache = require('memory-cache');
var fs = require('fs')
var mailerTransport = require('../../../IF_mail/IF_mail.js');

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

/**
 callback should be function(error, product) {}
 where product = {
           price: '',
           color_options: [], // TODO scrape color options in the future
           text: '',
           full_html: ''
         }
 */
module.exports.basic = function basic(url, callback) {

    //remove referral info just in case
    url = url.replace('%26tag%3Dbubboorev-20','');
    url = url.replace('%26tag%3Dkrista08-20','');

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
          text: '',
          full_html: '',
          asin: ''
        }

        var amazonSitePrice;

        var $ = cheerio.load(body);
        $('html').find('script').remove()
        $('html').find('style').remove()
        if (process.env.NODE_ENV && process.env.NODE_ENV.indexOf('development') === 0) {
          fs.writeFileSync('debug.html', $.html());
        }

        product.asin = $('input#ASIN').val();
        product.title = $('#productTitle').text();
        $('.votingStripe').remove()
        product.reviews = $('#revMHRL').text();


        //sort scraped price
        //try for miniATF
        if ($('#miniATF_price').text()){  //excluding scrapes with multiple prices (-) in field
            console.log('😊 kk');
            amazonSitePrice = $('#miniATF_price').text().trim();
        }
        //if no miniATF, try for priceblock_ourprice
        else if ($('#priceblock_ourprice').text()){
            console.log('😊 kk');
            amazonSitePrice = $('#priceblock_ourprice').text().trim();
        }
        else if ($('.buybox-price').text()){
            console.log('😊 kk');
            amazonSitePrice = $('.buybox-price').text().trim();
            amazonSitePrice = amazonSitePrice.split("\n");
            amazonSitePrice = amazonSitePrice[0];
        }
        else if ($('#priceblock_saleprice').text()){
            console.log('😊 kk');
            amazonSitePrice = $('#priceblock_saleprice').text().trim();
            amazonSitePrice = amazonSitePrice.split("\n");
            amazonSitePrice = amazonSitePrice[0];
        }
        else {
          console.log('NO PRICE FOUND 😊😊😊😊😊😊😊 ',url);
          //send email about this issue
          // var mailOptions = {
          //     to: 'Kip Server <hello@kipthis.com>',
          //     from: 'cant find real amazon price <server@kipthis.com>',
          //     subject: 'cant find real amazon price',
          //     text: url
          // };
          // mailerTransport.sendMail(mailOptions, function(err) {
          //     if (err) console.log(err);
          // });
        }
        //* * * * * * * * * *//

        //we have price from website
        if (amazonSitePrice){
            product.price = amazonSitePrice;
        }

        //we found an image alternate for missing item images
        if($('#imgTagWrapperId').children('img').attr('data-old-hires')){
          product.altImage = $('#imgTagWrapperId').children('img').attr('data-old-hires');
        }else if ($('#imgTagWrapperId').children('img').attr('src') && checkURL($('#imgTagWrapperId').children('img').attr('src'))){
          console.log('wow we found an image url um ok, proceed....proceed...');
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
      });
    })
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
