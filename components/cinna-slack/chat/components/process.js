var async = require('async');
var request = require('request');
var fs = require('fs');
var querystring = require('querystring');
const vision = require('node-cloud-vision-api');

var googl = require('goo.gl');
if (process.env.NODE_ENV === 'development') {
    googl.setKey('AIzaSyCKGwgQNKQamepKkpjgb20JcMBW_v2xKes')
} else {
    googl.setKey('AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk');
}

var urlShorten = function(data,callback2) {

    //single url for checkouts
    if (data.bucket == 'purchase' && data.action == 'checkout' || data.bucket == 'purchase' && data.action == 'save'){
        console.log('Mitsuprocess10: ',data.client_res)
        if (data.client_res){
           //var replaceReferrer = data.client_res.replace('kipsearch-20','bubboorev-20'); //obscure use of API on bubboorev-20
           var escapeAmazon = querystring.escape(data.client_res);

            // request.get('https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl='+querystring.escape('http://kipbubble.com/product/'+escapeAmazon+'/id/'+data.source.id+'/pid/shoppingcart')+'&format=txt', function(err, res, body) {
            //   if(err){
            //     console.log('URL SHORTEN error ',err);
            //   }
            //   else {
            //     callback2(body);
            //   }
            // });


            googl.shorten('http://kipbubble.com/product/'+escapeAmazon+'/id/'+data.source.id+'/pid/shoppingcart')
            .then(function (shortUrl) {
                callback2(shortUrl);
            })
            .catch(function (err) {
                console.error(err.message);
                callback2();
            });

        }
        else {
            console.log('error: client_res missing from urlShorten')
        }

    }
    //get all urls for new search
    else {
        var loopLame = [0,1,2];//lol
        var urlArr = [];
        async.eachSeries(loopLame, function(i, callback) {
            if (data.amazon[i]){
               //var replaceReferrer = data.amazon[i].DetailPageURL[0].replace('kipsearch-20','bubboorev-20'); //obscure use of API on bubboorev-20
               var escapeAmazon = querystring.escape(data.amazon[i].DetailPageURL[0]);

                googl.shorten('http://kipbubble.com/product/'+escapeAmazon+'/id/'+data.source.id+'/pid/'+data.amazon[i].ASIN[0])
                .then(function (shortUrl) {
                    urlArr.push(shortUrl);
                    callback();
                })
                .catch(function (err) {
                    console.error(err.message);
                    urlArr.push('http://kipthis.com');
                    callback();
                });

            }
            else{
                callback();
            }
        }, function done(){
            callback2(urlArr);
        });
    }

};

function getNumEmoji(data,number,callback){
    var numEmoji;
    switch(number){
        case 1: //emoji #1
            if (data.source.origin == 'socket.io'){
                numEmoji = '<div class="number">➊</div>';
            }
            else if (data.source.origin == 'slack' || data.source.origin == 'supervisor' ){
                numEmoji = ':one:';
            } 
            else if (data.source.origin == 'telegram'){
                numEmoji = '1️⃣';
            }
            break;
        case 2: //emoji #2
            if (data.source.origin == 'socket.io'){
                numEmoji = '<div class="number">➋</div>';
            }
            else if (data.source.origin == 'slack' || data.source.origin == 'supervisor' ){
                numEmoji = ':two:';
            }
            else if (data.source.origin == 'telegram'){
                numEmoji = '2️⃣';
            }
            break;
        case 3: //emoji #3
            if (data.source.origin == 'socket.io'){
                numEmoji = '<div class="number">➌</div>';
            }
            else if (data.source.origin == 'slack' || data.source.origin == 'supervisor' ){
                numEmoji = ':three:';
            }
            else if (data.source.origin == 'telegram'){
                numEmoji = '3️⃣';
            }
            break;
    }
    callback(numEmoji);
}

var emoji = {
  1: { slack: ':one:', html: '<div class="number">①</div>' },
  2: { slack: ':two:', html: '<div class="number">②</div>' },
  3: { slack: ':three:', html: '<div class="number">③</div>' },
  4: { slack: ':four:', html: '<div class="number">④</div>' },
  5: { slack: ':five:', html: '<div class="number">⑤</div>' },
  6: { slack: ':six:', html: '<div class="number">⑥</div>' },
  7: { slack: ':seven:', html: '<div class="number">⑦</div>' },
  8: { slack: ':eight:', html: '<div class="number">⑧</div>' },
  9: { slack: ':nine:', html: '<div class="number">⑨</div>' },
  10: { slack: '10.', html: '<div class="number">⑩</div>' },
  11: { slack: '11.', html: '<div class="number">⑪</div>' },
  12: { slack: '12.', html: '<div class="number">⑫</div>' },
  13: { slack: '13.', html: '<div class="number">⑬</div>' },
  14: { slack: '14.', html: '<div class="number">⑭</div>' },
  15: { slack: '15.', html: '<div class="number">⑮</div>' },
  16: { slack: '16.', html: '<div class="number">⑯</div>' },
  17: { slack: '17.', html: '<div class="number">⑰</div>' },
  18: { slack: '18.', html: '<div class="number">⑱</div>' },
  19: { slack: '19.', html: '<div class="number">⑲</div>' },
  20: { slack: '20.', html: '<div class="number">⑳</div>' },

}


//
// Shortens a url for a cart object.  I'm not super sure about the id right now.
//
function getCartLink(url, cart_id) {
  return googl.shorten('http://kipbubble.com/product/' + querystring.escape(url) + '/id/' + cart_id + '/pid/shoppingcart');
}

//
// Downloads slack file and runs through google vision for image to text search
// Token: pass auth token for slack team to get private url
//
var imageSearch = function(data,token,callback){

    if (data.file && data.file.url_private){

      var options = {
         uri : data.file.url_private,
         followRedirect: true,
         headers: {
             'Authorization': 'Bearer ' + token
         }
      };

      var savePath = __dirname + '/temp_imgs/'+Math.random().toString(36).substring(7)+data.file.filetype;

      request(options).pipe(fs.createWriteStream(savePath)).on('close', function(){

        // init with auth
        vision.init({auth: 'AIzaSyC9fmVX-J9f0xWjUYaDdPPA9kG4ZoZYsWk'})

        // construct parameters
        const req = new vision.Request({
          image: new vision.Image(savePath),
          features: [
            new vision.Feature('TEXT_DETECTION', 5),
            new vision.Feature('LABEL_DETECTION', 5)
          ]
        })

        // send single request
        vision.annotate(req).then((res) => {
          // handling response
          console.log(JSON.stringify(res.responses));

          var searchTerms = [];

          // //logo detection
          // if(res.responses && res.responses[0].logoAnnotations && res.responses[0].logoAnnotations[0]){
          //   searchTerms.push(res.responses[0].logoAnnotations[0].description);
          // }

          // //text detection
          if(res.responses && res.responses[0].textAnnotations && res.responses[0].textAnnotations[0]){ //only processing english, spanish, french right now
            if (res.responses[0].textAnnotations[0].locale == 'en' || res.responses[0].textAnnotations[0].locale == 'es' || res.responses[0].textAnnotations[0].locale == 'fr'){
              var textEx = res.responses[0].textAnnotations[0].description;
              textEx = textEx.replace(/(\r\n|\n|\r)/gm," "); //remove line breaks
              textEx = textEx.replace(/[\u0250-\ue007]/g, ''); //remove non-latin characters
              textEx = textEx.replace(/^(.{30}[^\s]*).*/, "$1"); //limit # of words
              searchTerms.push(textEx);          
            }
          } 

          //label detection
          if (searchTerms.length < 1){

            if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[0]){
              searchTerms.push(res.responses[0].labelAnnotations[0].description);
            }

            //lol this code is awful
            if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[1]){
              searchTerms.push(res.responses[0].labelAnnotations[1].description);
            }

            //lol this code is awful
            if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[2]){
              searchTerms.push(res.responses[0].labelAnnotations[2].description);
            }

            //lol this code is awful
            if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[3]){
              searchTerms.push(res.responses[0].labelAnnotations[3].description);
            }

            //lol this code is awful
            if(res.responses && res.responses[0].labelAnnotations && res.responses[0].labelAnnotations[4]){
              searchTerms.push(res.responses[0].labelAnnotations[4].description);
            }            
          }

          // check for search terms
          if(searchTerms.length > 0){
            console.log(searchTerms);
            callback(Array.from(new Set(searchTerms)).join(" ")); //remove dupes and make into string on return
          }
          else {
            callback();
          }

          fs.unlinkSync(savePath); //remove temp image

        }, (e) => {
          console.log('Error: ', e);
          fs.unlinkSync(savePath); //remove temp image
          callback();
        })

      });

    }
    else {
      console.error('error: no private url found');
    }

}


/////////// tools /////////////



/// exports
module.exports.urlShorten = urlShorten;
module.exports.getNumEmoji = getNumEmoji;
module.exports.getCartLink = getCartLink;
module.exports.emoji = emoji;
module.exports.imageSearch = imageSearch;
