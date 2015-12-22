var cheerio = require('cheerio');
var request = require('request');


var getReviews = function(ASIN,callback) {

    //get reviews in circumvention manner (amazon not allowing anymore officially)
    request('http://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin='+ASIN+'', function(err, res, body) {
      if(err){
        console.log(err);
        callback();
      }
      else {

        $ = cheerio.load(body);

        // //get rating
        // var rating = ( $('.a-size-base').text()
        //   .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
        //   .map(function (v) {return +v;}).shift();

        // //get reviewCount
        // var reviewCount = ( $('.a-link-emphasis').text()
        //   .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
        //   .map(function (v) {return +v;}).shift();

        // //adding scraped reviews to amazon objects
        // data.amazon[i].reviews = {
        //     rating: rating,
        //     reviewCount: reviewCount
        // }
        callback(( $('.a-size-base').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift(),( $('.a-link-emphasis').text()
          .match(/\d+\.\d+|\d+\b|\d+(?=\w)/g) || [] )
          .map(function (v) {return +v;}).shift());
      }
    });

};


/////////// tools /////////////



/// exports
module.exports.getReviews = getReviews;
