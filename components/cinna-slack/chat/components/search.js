var cheerio = require('cheerio');
var request = require('request');
var async = require('async');


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

var getPrices = function(item,callback){

    var url = item.DetailPageURL[0];

    //remove referral info
    //url = url.substring(0, url.indexOf('%'));
    url = url.replace('%26tag%3Dbubboorev-20','');

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

    // x-wl-uid=1pueisgHxMYKWT0rswq5JqfnPdFseLZ/OxR7UupM9FY0RLpoyRkASv5p0aqDde7UxdAH0ye/4HGk=; session-token=pHpj+cnUgYC4W2Rn2n9o73yp+lXb0KSR/RbK3x0u3v3WlRsNCa/OUvsttZ96usiUcaxYriSqj01Z5SfTJ3FDKfR26IzhBNWkL6RfUz+HGW7FAcXDB9o753uz+PuRJPiySAKOH/rPFCUb8VIAJRBEWAv6znee4buG2t6zmYgRcTY9JxeR2a+rbm47d8sDJ6D2N+gT7NcJ4m2gC3FLET2y1ebwWTgvHHAbYmiMAdFtfIZkY9Lgh985Ow0wt9CIqxOI; ubid-main=184-9837454-1099037; session-id-time=2082787201l; session-id=189-6797902-2253123
    // x-wl-uid=1BjpaGuxCTGdAWCxWU+87j+O+jpfyZqUylkd3CN1WoeO9KIRkjfML+wpDwHWA8DucgbG7gBgUpx8=; session-token=g74T/8uiz3D897wNrVE7VcWXJAkKIURxLCI+Tnjf94aIBBtNDTI065vGc31bO7NG2V/U9FW4mEgBsWCy60e5Dqscj/OXBD1k4auqBj0p5RSGftxSCZzlCXmkGxe2aTECiW87OqDvvze8bpWgdlt4J8kpl/SXmbMVGg5w9N9BfxULpNtvYmm61nyCI7tTwr7noOluf+z6rI9W+4hTCZpU8xewfrQEG6NZKdAz+T7D25zfjfqciUZ+KEzAcmR+Jk3DYDDoG57sSiU=; csm-hit=0X1PVGRZ848AM38HDXQY+s-0X1PVGRZ848AM38HDXQY|1451428278076; ubid-main=192-9287373-0652310; session-id-time=2082787201l; session-id=185-1853384-1692700
    //expired
    // csm-hit=1M5M5G84TW4EN2G1T6T1+s-0W6WGGYC27MJ8C0HPSF5|1451418645254; 

    //new
    // csm-hit=0X1PVGRZ848AM38HDXQY+s-0X1PVGRZ848AM38HDXQY|1451428278076; 

    //tsu
    // csm-hit=0XK6JCHDTNBQY3ZT0BZA+s-19NN5QDKVXWYPA059PBF|1451429645652;


    request(options, function(err, response, body) {
      if(err){
        console.log('getPrices error: ',err);
        callback();
      }
      else {
        $ = cheerio.load(body);
        var realPrice;
        var amazonSitePrice;

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
            realPrice = amazonSitePrice;
        }
        //blocked by amazon? use offer price
        // item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0]
        else if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice){
            //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
            console.log('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

            realPrice = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

        }
        else if (item.ItemAttributes[0].ListPrice){

            console.log('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

            if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                realPrice = '';
            }
            else {
              // add price
              realPrice = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
            }
        }
        else {
            console.log('/!/!!! warning: no webscrape price found for amazon item');
            realPrice = '';
        }


        if (!realPrice){
            realPrice = '';
        }
        callback(realPrice);
      }
    });

}


var getAmazonStuff = function(data,results,callback3){

    //!\\ //!\\ NOTE!!! Add timeout here, fire callback if parallel doesnt fire callback!!

    async.parallel([
        //* * item 1 * * *//
        //get review
        function(callback){
            var id = results[0].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            //GET PRICE
            getPrices(results[0],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        },

        //* * item 2 * * *//
        //get review
        function(callback){
            var id = results[1].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            getPrices(results[1],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        },

        //* * item 3 * * *//
        //get review
        function(callback){
            var id = results[2].ASIN[0];
            getReviews(id,function(rating,count){
                var obj = {
                    rating:rating,
                    reviewCount:count
                }
                callback(null,obj);
            });
        },
        //get real price
        function(callback){
            getPrices(results[2],function(realPrice){
                var obj = {
                    realPrice:realPrice
                }
                callback(null,obj);
            });
        }
    ],
    function(err, rez){
        if (err){
            console.log('Error: parallel getAmazonStuff in search.js ',err);
        }
        var count = 0;
        var loopLame = [0,0,1,1,2,2];
        async.eachSeries(loopLame, function(i, callback) {
            if (data.amazon[i]){

                //TEST SCRAPE RESULTS NULL BEORE PROCESS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                if (rez[count].rating){
                    console.log('add rating');
                    data.amazon[i].reviews = rez[count];
                }
                else if(rez[count].realPrice){
                    console.log('add real price');
                    data.amazon[i].realPrice = rez[count].realPrice;
                }
                else {
                    console.log('/!/ Warning: no reviews or real prices found for current item: ',data);
                }
                count++;
                callback();
            }
            else {
                callback();
            }
        }, function done(){
            callback3(data);
        });
    });   
}

/////////// tools /////////////



/// exports
module.exports.getReviews = getReviews;
module.exports.getPrices = getPrices;
module.exports.getAmazonStuff = getAmazonStuff;