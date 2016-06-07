'use strict'

var request = require('request')
var cheerio = require('cheerio')
var kip = require('kip')
var debug = require('debug')('amazon')
var memcache = require('memory-cache');
var fs = require('fs')
var async = require('async');
var mailerTransport = require('../../../IF_mail/IF_mail.js');


var requestPromise = require('request-promise');


//CONNECTION POOLING HERE
var proxyPool = []; //current good sessions

var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
var luminatiReady = false;
//starting luminati process

//lets check if luminati dies, forever
async.whilst(
    function () { 
      return true; 
    },
    function (callback) {

        var options = {
          url: 'http://kipthis.com/DONTTOUCH.txt', //a single byte file lol
          proxy: 'http://127.0.0.1:23000'
        };
        requestPromise(options).then(function(data){ 
          //console.log('LUMINATI SUCCESS')
          luminatiReady = true;
          //proxyPool.push(super_proxy);
          //callback();
          setTimeout(function () {
            callback()
          }, 10000);
        }, function(err){ 

          //console.log('LUMINATI ERROR ')
          luminatiReady = false;

          setTimeout(function () {
            callback()
          }, 10000);

        });

        // setTimeout(callback, 10000);//every 20 sec...


    },
    function (err) {
        // 5 seconds have passed


    }
); 

// var util = require('util')
// var exec = require('child_process').exec;
// var child;
// // executes `pwd`
// child = exec("luminati-proxy --customer lum-customer-kipthis-zone-gen --password e49d4ega1696 --pool_size 9 --session_timeout 60000 --max_requests 100", function (error, stdout, stderr) {
//   util.print('stdout: ' + stdout);
//   util.print('stderr: ' + stderr);
//   if (error !== null) {
//     console.log('exec error: ' + error);
//   }
// });




// var exec = require('child_process').exec;

// var cmd = 'luminati-proxy --customer lum-customer-kipthis-zone-gen --password e49d4ega1696 --pool_size 9 --session_timeout 60000 --max_requests 100';
// console.log(cmd);
// exec(cmd, function(error, stdout, stderr) {
//   // command output is in stdout
//   console.log('LUMINATI OUTPUT ',stdout)
//   if (!error && !stderr){
//     console.log('LUMINATI READY')
//     luminatiReady = true;
//   }
// });
// - - - - - - - - -  - -//


//start

//in AAMZON LOOP, grab any good sessions

// function proxyPooling(){

//   genSession(function(proxy,sessionId)){

//     proxyPool[sessionId] = proxy;

//     var options1 = {
//       url: 'http://lumtest.com/myip.json',
//       proxy: super_proxy,
//       headers: {
//           'User-Agent': user_agent
//       }
//     };

//   }

  

//   requestPromise(options1).then(function(data){ 

//     //ok session worked, save it to proxyPool


//     console.timeEnd("concatenation");

//   }, function(err){ 
//     console.error(err); 
//   });



//   //always have 20 sessions going, because fuck it.

// }


/// / / / /  LUMINATI PROXY STUFF / / / / / / / 
//so you charge $500 a month but your solution doesn't work out of the box ok ok luminati >_>

//start with these sessions to pool
// var count = [1,2,3,4,5,6,7,8,9]; //lol
// async.eachSeries(count, function(c, callback) {

//   genSession(c,function(){
//     console.log('preloaded luminati session #'+c)
//   });

//   setTimeout(function() {
//     callback();
//   }, 15000);

// }, function done(){
//   setTimeout(function() {
//     sessionRenewer(); //start renewing sessions forever
//   }, 60000);
  
// }) 

// //pool new sessions over time
// function sessionRenewer(){
//   async.whilst(
//       function () { 
//         return true; 
//       },
//       function (callback) {
//           genSession((1000000 * Math.random()),function(){
//             if(proxyPool.length < 17){
//               proxyPool.shift() // remove oldest session
//             }else {
//               while (proxyPool.length > 13){
//                 proxyPool.shift()
//               }  
//             }
//           })
//           setTimeout(callback, 7000);//every 7 sec...
//       },
//       function (err) {
//           // 5 seconds have passed
//       }
//   ); 
// }

// //gen session for pool
// function genSession(num,callback){
//   var username = 'lum-customer-kipthis-zone-gen';
//   var password = 'e49d4ega1696';
//   var port = 22225;
//   var session_id = (1000000 * Math.random())|0; //the only important part 

//   var super_proxy = 'http://'+username+'-country-us-session-'+session_id+':'+password+'@45.55.206.5:22225';

//   var options = {
//     url: 'http://kipthis.com/DONTTOUCH.txt', //a single byte file lol
//     proxy: super_proxy,
//     headers: {
//         'User-Agent': user_agent
//     }
//   };
//   requestPromise(options).then(function(data){ 
//     proxyPool.push(super_proxy);
//     callback();
//   }, function(err){ 
//     //console.log('LUMINATI PROXY ERROR, trying genSession again')
//     setTimeout(function() {
//       genSession(num, function(){
//       });  
//     }, 10000); //wait to try gen session again
//   });
// }
// // // / / / / LUMINATI PROXY end  / / /  


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
module.exports.basic = function basic(url, callback, num) {

    //remove referral info just in case
    url = url.replace('%26tag%3Dbubboorev-20','');
    url = url.replace('%26tag%3Dkrista08-20','');
    url = url.replace('%26tag%3Dkrista03-20','');
    url = url.replace('%26tag%3Dquic0b-20','');


    // check cache
    cache.get(url, function(err, product) {
      kip.err(err);

      if (product) {
        debug('hit cache for url ' + url)
        callback(null, product)
        return;
      }

      debug('miss cache for url ' + url)

      if(!num){
        num = 1;
      }else {
        num = num + 1;
      }
      console.log('+🍹 ',num)
      console.log('🍹 ',proxyPool.length)
      console.log('🍹🍹 ',proxyPool.length-num)
      console.log('🍹🍹🍹 ',luminatiReady)

      //var falsy = false;

      //we have luminati proxies in session pool

      if (luminatiReady){
      //if (falsy == true){

        //http://127.0.0.1:23000
        console.log('REQUEST🍹WITH🍹THIS🍹 ',proxyPool.length-num)

        var proxiedRequest = request.defaults({
          proxy: 'http://127.0.0.1:23000',
          headers: {
              'User-Agent': user_agent
          }
        }); 

      }
      //no luminati proxies in pool, so use proxymesh instead
      else {
        //PROXYMESH PROXY 
        var user = 'alyx';
        var password = '9fSvNH@aB4Hs2s>qcatsoupkanyecandle';
        var hostArr = ['us-dc.proxymesh.com','us-fl.proxymesh.com']; //avail proxies
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
          }
        });      
      }

      var processing = true;

      //this ensures we dont spend more than 3 seconds trying to scrape item
      // setTimeout(function() {
      //   if (processing){
      //     console.log('KILLED SEARCH!!!!🍹!!!!!!🍹!!!!!!!!🍹!!!')
      //     callback(null,'WARNING: LUMINATI PROXY TOOK TOO LONG!');
      //     return;
      //   }
      // }, 3000);

      proxiedRequest.get(url, function(err, response, body) {

        processing = false;

        if (kip.error(err)) {
          console.error('error amazon get url ' + url)
          callback(err);
          return;
        }
        if(err){
          console.log('&^&^&^&^&^&^&^&^&^');
          console.error('^^$%$% ERROR ' + err);
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


          // console.log('🍹 ',err);
          // console.log('🍹 ',response);
          // console.log('🍹 ',body);
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

        //Get reviews
        var reviewCount = $('#acrCustomerReviewText').text().trim();
        var rating = $('#acrPopover').text().trim();

        //amazon glitch
        if(rating.length > 22){
          rating = rating.split('stars')
          rating = rating[0]
        }

        if (rating && reviewCount){
          product.reviews = {
            rating: parseFloat(rating.match(/^[0-9.,\s]+/)[0].trim()),
            reviewCount: reviewCount.match(/^[0-9.,\s]+/)[0].trim()
          }
          console.log('& & & &  ',product.reviews);
        }else {
          console.error('no match for review ',rating)
          console.error('no match for review ',reviewCount)
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
