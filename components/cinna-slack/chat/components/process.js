var async = require('async');
var request = require('request');
var querystring = require('querystring');


var urlShorten = function(data,callback2) {

    //single url for checkouts
    if (data.bucket == 'purchase' && data.action == 'checkout' || data.bucket == 'purchase' && data.action == 'save'){
        if (data.client_res){
           //var replaceReferrer = data.client_res.replace('kipsearch-20','bubboorev-20'); //obscure use of API on bubboorev-20
           var escapeAmazon = querystring.escape(data.client_res);
            request.get('https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl='+querystring.escape('http://kipbubble.com/product/'+escapeAmazon)+'&format=txt', function(err, res, body) {
              if(err){
                console.log('URL SHORTEN error ',err);
              }
              else {
                callback2(body);
              }
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
                request.get('https://api-ssl.bitly.com/v3/shorten?access_token=da558f7ab202c75b175678909c408cad2b2b89f0&longUrl='+querystring.escape('http://kipbubble.com/product/'+escapeAmazon)+'&format=txt', function(err, res, body) {
                  if(err){
                    console.log(err);
                    callback();
                  }
                  else {
                    urlArr.push(body);
                    console.log('!! ',urlArr);
                    callback();
                  }
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
            else if (data.source.origin == 'slack'){
                numEmoji = ':one:';
            }
            break;
        case 2: //emoji #2
            if (data.source.origin == 'socket.io'){
                numEmoji = '<div class="number">➋</div>';
            }
            else if (data.source.origin == 'slack'){
                numEmoji = ':two:';
            }
            break;
        case 3: //emoji #3
            if (data.source.origin == 'socket.io'){
                numEmoji = '<div class="number">➌</div>';
            }
            else if (data.source.origin == 'slack'){
                numEmoji = ':three:';
            }
            break;
    }
    callback(numEmoji);
}


/////////// tools /////////////



/// exports
module.exports.urlShorten = urlShorten;
module.exports.getNumEmoji = getNumEmoji;
