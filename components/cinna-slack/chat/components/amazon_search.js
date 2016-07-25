/*eslint-env es6*/
var promisify = require('promisify-node');
var co = require('co');
var _ = require('lodash');
var debug = process.env.NODE_ENV == 'production' ? function() {} : console.log.bind(console);
var verbose = process.env.VERBOSE ? console.log.bind(console) : function() {};
var kip = require('../../kip');

var processData = require('./process');
var picstitch = require('./picstitch');
var amazon = require('../amazon-product-api_modified'); //npm amazon-product-api
var amazonHTML = promisify(require('./amazonHTML'));
var db = require('../../db');


var aws_clients = {
  AKIAIKMXJTAV2ORZMWMQ: amazon.createClient({
    awsId: "AKIAIKMXJTAV2ORZMWMQ",
    awsSecret: "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",
    awsTag: "quic0b-20"
  }),
  AKIAIM4IKQAE2WF4MJUQ: amazon.createClient({
    awsId: "AKIAIM4IKQAE2WF4MJUQ",
    awsSecret: "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",
    awsTag: "quic0b-20"
  })
};

var DEFAULT_CLIENT = 'AKIAIKMXJTAV2ORZMWMQ';

var aws_client_id_list = Object.keys(aws_clients);

var i = 0;
function get_client() {
  i++;
  if (i === aws_client_id_list.length) {
    i = 0;
  }
  return aws_clients[aws_client_id_list[i]];
}

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
var search = function*(params,origin) {

  db.Metrics.log('search.amazon', params);

  if (!params.query) {
    console.log('error params: ', params)
    throw new Error('no query specified');
  }

  amazonParams = {
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank',
    Keywords: params.query,
    Availability: 'Available'
  };

  // Amazon price queries are formatted as string of cents...
  if (params.min_price) {
    amazonParams.MinimumPrice = (params.min_price * 100).toFixed(0);
  }

  if (params.max_price) {
    amazonParams.MaximumPrice = (params.max_price * 100).toFixed(0);
  }

  var skip = 0;
  if (params.skip > 0) {
    amazonParams.ItemPage = 1 + params.skip / 9 | 0; // 9 results per page
    skip = params.skip % 9; // if skip = 3, page=1 and skip = 3
  // assumes skip is a multiple of 3
  // skip = 0: p1, s0
  // skip = 3: p1, s3
  // skip = 6: p1, s6
  // skip = 9; p2, s0
  }

  debug('🔍 do the amazon search! 🔎 ');
  debug('input params', params);
  debug('amazon params', amazonParams);

  var results = yield get_client().itemSearch(amazonParams);
  results = results.slice(skip, skip + 3);
  results.original_query = params.query

  // if there aren't enough results... do a weaker search
  if (results.length < 1) {
    // TODO do the weak search thing.  looks like the weak search thing
    // just removes some words from the search query.
    throw new Error('no results found');
  // results = yield weakSearch(params); TODO
  // results = results.slice(skip, 3); // yeah whatevers
  }

  return yield enhance_results(results,origin);
}


/*
params:
asin
skip
*/
var similar = function*(params,origin) {
  params.asin = params.asin || params.ASIN; // because freedom.
  if (!params.asin) {
    throw new Error('no ASIN specified');
  }

  if (!params.skip) {
    params.skip = 0;
  }

  if (params.skip > 6) {
    throw new Error('similar items page stops at 10 total by default')
    // TODO make a similar search querystring and get more results that way.
    // like function similarQuery(item, params)
  }

  amazonParams = {
    responseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank',
    ItemId: params.asin
  };

  debug('🔍 do the amazon search! 🔎 ')
  debug('input params', params);
  debug('amazon params', amazonParams);

  var results = yield get_client().similarityLookup(amazonParams);
  results = results.slice(params.skip, params.skip + 3);
    results.original_query = params.query


  // if there aren't enough results... do a weaker search
  if (results.length < 1) {
    // TODO do the weak search thing.  looks like the weak search thing
    // just removes some words from the search query.
    throw new Error('no results found');
  // results = yield weakSearch(params); TODO
  // results = results.slice(skip, 3); // yeah whatevers
  }

  return yield enhance_results(results,origin);
}


// Decorates the results for a party 🎉
function* enhance_results(results, user_id) {
  // enhance the results, naturally.
  yield results.map(r => {
    if ((_.get(r, 'Offers[0].TotalOffers[0]') || '0') === '0') {
      r.mustSelectSize = true;
    }

    return co(function*() {
      var data = yield getPricesPromise(r);
      r.realPrice = data.price;
      r.altImage = data.altImage;
      r.reviews = data.reviews;
      return r;
    })
  });

  console.log('incomign results!!!! ',results)

  var urls = yield picstitch.stitchResultsPromise(results,origin); // no way i'm refactoring this right now

  for (var i = 0; i < 3; i++) {
    results[i].picstitch_url = urls[i];
    // getItemLink should include user_id to do user_id lookup for link shortening
    results[i].shortened_url = yield processData.getItemLink(results[i].DetailPageURL[0]);
  }
  // cool i've got the results now...

  return results;

}


var getPrices = function(item, callback) {

  var url = item.DetailPageURL[0];
  var price; // get price from API
  var altImage;
  var reviews;

  var formattedPrice = _.get(item, 'Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice');
  if (item.Offers && item.Offers[0] && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price && item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice) {
    //&& item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].Price
    verbose('/!/!!! warning: no webscrape price found for amazon item, using Offer array');

    price = item.Offers[0].Offer[0].OfferListing[0].Price[0].FormattedPrice[0];

  } else if (item.ItemAttributes[0].ListPrice) {

    verbose('/!/!!! warning: no webscrape price found for amazon item, using ListPrice array');

    if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0') {
      price = '';
    } else {
      // add price
      price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
    }
  }

  verbose('price PRE PROCESS ', price);

  amazonHTML.basic(url, function(err, product) {
    kip.err(err); // print error

    verbose('& & & & & & & & & & & &PRODUCT OBJ ', product);

    if (product.reviews) {
      reviews = product.reviews;
    }

    if (product && product.price) {
      verbose('returning early with price: ' + product.price);
      verbose('returning early with rice ' + product.altImage);
      // if(product.altImage){
      //   altImage = product.altImage;
      // }
      return callback(product.price, product.altImage, reviews)
    }

    verbose('product.price: ' + product.price + ', price: ' + price);

    price = product.price || price || '';
    verbose('final price: ' + price);
    if (product.altImage) {
      altImage = product.altImage;
    }

    callback(price, altImage, reviews);
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


module.exports.similar = similar;
module.exports.search = search;

/*  TESTING
  _______     _____  ______   _______   __    __   __    ______
/\_______)\ /\_____\/ ____/\/\_______)\/\_\  /_/\ /\_\  /_/\___\
\(___  __\/( (_____/) ) __\/\(___  __\/\/_/  ) ) \ ( (  ) ) ___/
  / / /     \ \__\   \ \ \    / / /     /\_\/_/   \ \_\/_/ /  ___
 ( ( (      / /__/_  _\ \ \  ( ( (     / / /\ \ \   / /\ \ \_/\__\
  \ \ \    ( (_____\)____) )  \ \ \   ( (_(  )_) \ (_(  )_)  \/ _/
  /_/_/     \/_____/\____\/   /_/_/    \/_/  \_\/ \/_/  \_\____/
*/
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
