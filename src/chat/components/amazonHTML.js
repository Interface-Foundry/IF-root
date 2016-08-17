'use strict'

var request = require('request')
var cheerio = require('cheerio')
var kip = require('../../kip')
var debug = require('debug')('amazon')
var memcache = require('memory-cache');
var fs = require('fs')
var mailerTransport = require('../../mail/IF_mail.js');

//start luminati
// (this is a proxy server)
// const Luminati = require('luminati-proxy');
// const proxy = new Luminati({
//     customer: 'kipthis', // your customer name
//     password: 'e49d4ega1696', // your password
//     zone: 'gen', // zone to use
//     proxy_count: 5, //minimum number of proxies to use for distributing requests
// });
// proxy.on('response', res=>console.log('Response:', res));
// proxy.listen(24000, '127.0.0.1').then(()=>new Promise((resolve, reject)=>{

//     proxy.request('http://lumtest.com/myip', (err, res)=>{
//         if (err)
//             return reject(err);
//         resolve(res);
//     });

// })).then(res=>{
//     console.log('Result:', res.statusCode, res.body);
// }, err=>{
//     console.log('Error:', err);
// }).then(()=>proxy.stop());
// // end luminati

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
    url = url.replace('%26tag%3Dkrista03-20','');
    url = url.replace('%26tag%3Dquic0b-20','');
    url = url.replace('%26tag%3Deileenog-20','');

    // check cache
    cache.get(url, function(err, product) {
      kip.err(err);

      if (product) {
        debug('hit cache for url ' + url)
        callback(null, product)
        return;
      }

      debug('miss cache for url ' + url)

      //PROXY SERVICE STUFF
      var user = 'alyx';
      var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
      var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com','us-ny.proxymesh.com','us-il.proxymesh.com','us-ca.proxymesh.com']; //avail proxies
      var host = hostArr[Math.floor(Math.random()*hostArr.length)]; //get random host from array
      var port = '31280';
      var proxyUrl = "http://" + user + ":" + password + "@" + host + ":" + port;

      var proxiedRequest = request.defaults({
        proxy: proxyUrl,
        headers: {
            'Accept': 'text/html,application/xhtml+xml',
            //'Accept-Encoding':'gzip, deflate, sdch',
            'Accept-Language':'en-US,en;q=0.8',
            // 'Avail-Dictionary':'qHs1hh9Q',
            'Cache-Control':'max-age=0',
            'Connection':'keep-alive',
            'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
            'Host':'www.amazon.com',
            'Origin':'http://www.amazon.com',
            //'Pragma':'no-cache',
            // 'Upgrade-Insecure-Requests':'1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
            // 'Referer':url
        },
        timeout:800
      });


        // headers: {
        //     'Accept': '*/*',
        //     'Accept-Encoding':'gzip, deflate',
        //     'Accept-Language':'en-US,en;q=0.8',
        //     // 'Avail-Dictionary':'qHs1hh9Q',
        //     'Cache-Control':'max-age=0',
        //     'Content-Length':7620,
        //     'Connection':'keep-alive',
        //     'Content-Type':'text/plain;charset=UTF-8',
        //     // 'Cookie': 'csm-hit='+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN+s-'+Math.floor(Math.random() * 99) + 11+'RP'+Math.floor(Math.random() * 99) + 11+'K'+Math.floor(Math.random() * 99) + 11+'JQAZRCBH9VN|'+Math.floor(Math.random() * 9999999999999) + 1111111111111+'; ubid-main=181-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'; session-id-time=20827'+Math.floor(Math.random() * 99999) + 11111+'l; session-id=187-'+Math.floor(Math.random() * 9999999) + 1111111+'-'+Math.floor(Math.random() * 9999999) + 1111111+'',
        //     'Cookie':'skin=noskin; x-wl-uid=1ZkF/9DlKrGNXARXyoWaAKeH9OSn5mWPK7k8h9SNW1lQATtqZ9GthMaxV9Yh7iCDVJQblgK4+lM0=; session-token=AFXsr7dsTCgNkaqoJlQQt2p7zvIz4eGml/Bp8261MU7VhOJRh0pUJQPRPiFCSlSmRvn/yucYWpSOqD4afuFKVWsLmBhD1vvURM9fjGKH98hZPWyteX1jEXBcLR9rQbs7ETcuVp8WJXBYGfAgXLpdy/XsCOUXoPtb4h6qzFkAqqVWqCgPB2zABvUQ0MXxCDoyri6/iAFWY3beh8SO/YFjOAgIPaGr9E2QD0PJUy9dlVd7ArxfonLWn36+6vg/g67W; ubid-main=190-8589396-8276564; session-id-time=2082787201l; session-id=185-9694891-7040613',

        //     'Host':'fls-na.amazon.com',
        //     'Origin':'http://www.amazon.com',
        //     'Pragma':'no-cache',
        //     // 'Upgrade-Insecure-Requests':'1',
        //     'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+Math.floor(Math.random() * 9) + 1+') AppleWebKit/'+Math.floor(Math.random() * 999) + 111+'.'+Math.floor(Math.random() * 99) + 11+' (KHTML, like Gecko) Chrome/'+Math.floor(Math.random() * 99) + 11+'.0.'+Math.floor(Math.random() * 9999) + 1001+'2623.110 Safari/'+Math.floor(Math.random() * 999) + 111+'.36',
        //     'Referer':url
        // }

      proxiedRequest.get(url, function(err, response, body) {



        if (kip.error(err)) {
          console.error('error amazon get url ' + url)
          callback(err);
          return
        }
        if(err){
          debug('&^&^&^&^&^&^&^&^&^');
          console.error('^^$%$% ERROR ' + err);
        }

        // we weill fill in these fields 🍹🌴
        var product = {
          price: '',
          text: '',
          full_html: '',
          asin: ''
        }

        //timeout from proxy request! return early!
        if (err && err.message && err.message.code === 'ETIMEDOUT' || err && err.message && err.message.code === 'ESOCKETTIMEDOUT') { 
          return callback(product)
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


          debug('🍹 ',err);
          debug('🍹 ',response);
          debug('🍹 ',body);
          //send email about this issue
          // var mailOptions = {
          //     to: 'Kip Server <hello@kipthis.com>',
          //     from: 'cant find real amazon price <server@kipthis.com>',
          //     subject: 'cant find real amazon price',
          //     text: url
          // };
          // mailerTransport.sendMail(mailOptions, function(err) {
          //     if (err) debug(err);
          // });
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
        }else {
          console.error('no match for review ',rating)
          console.error('no match for review ',reviewCount)
        }

        //we found an image alternate for missing item images
        if($('#imgTagWrapperId').children('img').attr('data-old-hires')){
          product.altImage = $('#imgTagWrapperId').children('img').attr('data-old-hires');
        }else if ($('#imgTagWrapperId').children('img').attr('src') && checkURL($('#imgTagWrapperId').children('img').attr('src'))){
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
      });
    }).on('error', function(err) {
      
    console.log('proxy timeout or err! ',err)
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
