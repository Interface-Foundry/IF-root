/*eslint-env es6*/
var promisify = require('promisify-node');
var co = require('co');
var _ = require('lodash');
var debug = process.env.NODE_ENV=='production' ? function(){} : console.log.bind(console);
var kip = require('../../kip');


var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var amazonHTML = promisify(require('./amazonHTML'));
var client = amazon.createClient({
  awsId: "AKIAIKMXJTAV2ORZMWMQ",
  awsSecret: "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",
  awsTag: "quic0b-20"
});


/*
params:
  query
  skip
  sort
  brand
  max_price
  min_price
  search_index

  http://docs.aws.amazon.com/AWSECommerceService/latest/DG/ItemSearch.html
*/
var search = function*(params) {
  if (!params.query) {
    throw new Error('no query specified');
  }

  if (!params.skip) {
    params.skip = 0;
  }

  amazonParams = {
    responseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank',
    Keywords: params.query
  };

  if (params.skip > 0) {
    amazonParams.ItemPage = 1 + params.skip/9|0; // 9 results per page
    var skip = params.skip % 9; // if skip = 3, page=1 and skip = 3
    // assumes skip is a multiple of 3
    // skip = 0: p1, s0
    // skip = 3: p1, s3
    // skip = 6: p1, s6
    // skip = 9; p2, s0
  }

  console.log('🔍 do the amazon search! 🔎 ')
  var results = yield client.itemSearch(amazonParams);
  results = results.slice(skip, 3);

  // if there aren't enough results... do a weaker search
  if (results.length < 1) {
    // TODO do the weak search thing.  looks like the weak search thing
    // just removes some words from the search query.
    throw new Error('no results found');
    // results = yield weakSearch(params); TODO
    // results = results.slice(skip, 3); // yeah whatevers
  }

  // enhance the results, naturally.
  yield results.map(r => {
    if ((_.get(r, 'Offers[0].TotalOffers[0]') || '0') === '0') {
      r.mustSelectSize = true;
    }

    return getPricesPromise(r).then(data => {
      r.realPrice = data.price;
      r.altImage = data.altImage;
      r.reviews = data.reviews;
    })
  });

  // cool i've got the results now...

  return results;
}

var getPrices = function(item,callback){

    var url = item.DetailPageURL[0];
    var price;  // get price from API
    var altImage;
    var reviews;

    var formattedPrice = _.get(item, 'Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice');
    if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice){
        //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
        debug('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

        price = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

    }
    else if (item.ItemAttributes[0].ListPrice){

        debug('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

        if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
            price = '';
        }
        else {
          // add price
          price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
        }
    }

    debug('price PRE PROCESS ',price);

    amazonHTML.basic(url, function(err, product) {
      kip.err(err); // print error

      debug('& & & & & & & & & & & &PRODUCT OBJ ',product);

      if (product.reviews){
        reviews = product.reviews;
      }

      if (product && product.price) {
        debug('returning early with price: ' + product.price);
        debug('returning early with rice ' + product.altImage);
          // if(product.altImage){
          //   altImage = product.altImage;
          // }
        return callback(product.price,product.altImage,reviews)
      }

      debug('product.price: ' + product.price + ', price: ' + price);

      price = product.price || price || '';
      debug('final price: ' + price);
      if(product.altImage){
        altImage = product.altImage;
      }

      callback(price,altImage,reviews);
    })
}

////////////// lol //////////////////
var getPricesPromise = function(item) {
  return new Promise((resolve, reject) => {
    getPrices(item, (price, altImage, reviews) => {
      resolve({
        price: price,
        altImage: altImage,
        reviews: reviews,
        satellite_emoji: '🛰'
      })
    })
  })
}


if (!module.parent) {
  co(function*() {
    var result = yield search({
      query: 'arduino'
    })

    console.log(result);
  }).catch(e => {
    console.log(e.stack);
  })
}
