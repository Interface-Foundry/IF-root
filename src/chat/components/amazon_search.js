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
var parseAmazon = require('./search.js').parseAmazon;
var amazonHTML = promisify(require('./amazonHTML'));
var db = require('../../db');
var async = require('async');
var wait = require('co-wait');

var logging = require('winston');
logging.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/*
Affiliate tag:
eileenog-20
Access Key ID:
AKIAIS2R5G6NPAMLEDNQ
Secret Access Key:
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
Access Key ID:
AKIAJWTPOWIOUPHJYG2Q
Secret Access Key:
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
*/

var aws_clients = {
  AKIAJ7JWQNS2HH5UYNVQ: amazon.createClient({
    awsId: "AKIAJ7JWQNS2HH5UYNVQ",
    awsSecret: "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",
    awsTag: "eileenog-20"
  }),
  AKIAJWTPOWIOUPHJYG2Q: amazon.createClient({
    awsId: "AKIAJWTPOWIOUPHJYG2Q",
    awsSecret: "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",
    awsTag: "eileenog-20"
  })
};

var DEFAULT_CLIENT = 'AKIAJ7JWQNS2HH5UYNVQ';

var aws_client_id_list = Object.keys(aws_clients);

var i = 0;
// Round-robin method for spreading the load between all our clients.
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


/*
* Lookup object based on ASIN
*
* @param {Object} params should be Object like {asin: ASIN, IdType: 'ASIN'}
* @return {Object} enhanced_result for specific item
*/

var lookup = function (params, origin) {
  logging.debug('Using Amazon Lookup')
  var timer = new kip.SavedTimer('lookup.timer', {params: params})
  db.Metrics.log('lookup.amazon', params)
  if (!params.ASIN) {
    logging.info('error params: ', params)
    throw new Error('No Asin provided')
  }

  params.IdType = params.IdType || 'ASIN'

  amazonParams = {
    Availability: 'Available',
    Condition: 'New',
    IdType: params.IdType,
    ItemId: params.ASIN,
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank'
  }

  timer.tic('requesting amazon ItemLookup api');
  try {
    co(function *(){
      logging.debug('looking up asin', amazonParams);
      var results = yield get_client().itemLookup(amazonParams)
      timer.tic('got results from ItemLookup api')
      var enhanced = yield enhance_results(results, origin, timer)
      timer.tic('done enhancing result')
      timer.stop()
      return enhanced
    })
  } catch (e) {
    return Promise.reject('Item not available');
  }
}


 // {"mode":"shopping",
 // "action":"modify.one",
 // "params":{"query":"shoes","focus":[1],"val":[{"hsl":[170,255,127],"rgb":[0,0,255],"name":"Blue","hex":"#0000FF"},{"hsl":[170,255,64],"rgb":[0,0,128],"name":"Navy Blue","hex":"#000080"},{"hsl":[159,185,145],"rgb":[65,105,225],"name":"Royal Blue","hex":"#4169E1"},{"hsl":[194,255,65],"rgb":[75,0,130],"name":"Indigo","hex":"#4B0082"}],"type":"color"},"_id":"578fa1f16e7ef4c065933966"}


var search = function*(params,origin) {
  var timer = new kip.SavedTimer('search.timer', {params: params, origin: origin})
  db.Metrics.log('search.amazon', params)

  if (!params.query) {
    winston.debug('error params: ', params)
    throw new Error('no query specified')
  }



  amazonParams = {
    ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank',
    Keywords: params.query,
    Availability: 'Available'
  };


  // Amazon price queries are formatted as string of cents...
  if (params.min_price) {
    amazonParams.MinimumPrice = (params.min_price * 100).toFixed(0)
  }

  if (params.max_price) {
    amazonParams.MaximumPrice = (params.max_price * 100).toFixed(0)
  }

  var skip = 0;
  if (params.skip > 0) {
    amazonParams.ItemPage = 1 + params.skip / 9 | 0 // 9 results per page
    skip = params.skip % 9 // if skip = 3, page=1 and skip = 3
  // assumes skip is a multiple of 3
  // skip = 0: p1, s0
  // skip = 3: p1, s3
  // skip = 6: p1, s6
  // skip = 9; p2, s0
  }

  //modify?


  debug('🔍 do the amazon search! 🔎 ')
  debug('input params', params)
  debug('amazon params', amazonParams)

  if (params.productGroup && params.browseNodes) {
      var key;
      var browseNodeBackup;
      yield parseAmazon(params.productGroup, params.browseNodes, function(res) {
        key = res;
      });
      if (key && key.BrowseNode) {
        amazonParams.SearchIndex = key.SearchIndex;
        amazonParams.BrowseNode = key.BrowseNode;
        browseNodeBackup = key.BrowseNode.slice(0);
      }
  }
  var originalParams = Object.assign({},amazonParams);


  if (params.color && params.color.name) {
    amazonParams.Keywords = params.color.name;
  }
  else if (params.val && params.val.length > 1 && params.type !== 'color') {
      winston.debug('found multiple modifiers...')
      amazonParams.Keywords = '';
     for (var i = 1; i < params.val.length; i++) {
      var val = (typeof params.val[i] == 'object' ? params.val[i] : (typeof params.val[i] == 'string' ? params.val[i].toLowerCase() : params.val[i]));
      amazonParams.Keywords = amazonParams.Keywords + ' ' + val;
     }
     if (params.type && params.type == 'genericDetail') {
      var all_modifiers_string = amazonParams.Keywords.split('').slice(0).join('');
      var all_modifiers_array = all_modifiers_string.split(' ');
     }
  } else if (params.val && params.val.length == 1) {
     amazonParams["Keywords"] = (params.val[0].name)  ? params.val[0].name.toLowerCase() + ' ' + params.query : ((typeof params.val[0] == 'string') ?  params.val[0].toLowerCase() + ' ' + params.query : amazonParams["Keywords"]);
  }
  timer.tic('requesting amazon ItermSearch api');
  try {
      winston.debug('👺1: as is...', amazonParams);
      var results = yield get_client().itemSearch(amazonParams);
   }
   catch (e) {
      //If more than one modifier
      if (all_modifiers_array) {
        winston.debug('👺2: remove each keyword one-by-one, and try both with node-traversal and without...');
         amazonParams.Keywords = amazonParams.Keywords + ' ' + params.query;
        for (var i = 0; i < all_modifiers_array.length-1; i++) {
          try {
               var modifier = all_modifiers_array[i];
               if (!amazonParams.BrowseNode) {
                 amazonParams.BrowseNode = browseNodeBackup;
               }
               amazonParams.Keywords = amazonParams.Keywords.replace(modifier.trim(), '').trim();
                winston.debug('trying : ', amazonParams)
                var res1 = yield get_client().itemSearch(amazonParams);
                yield wait(1500);
                if (res1 && res1.length >= 1) {
                 var results = res1
                 winston.debug('breaking out...')
                 break;
                } else {
                    if (amazonParams.BrowseNode) {
                     delete amazonParams.BrowseNode;
                    }
                    winston.debug('trying : ', amazonParams)
                    try{
                      var res1 = yield get_client().itemSearch(amazonParams);
                      yield wait(1500);
                      if (res1 && res1.length >= 1) {
                         var results = res1
                          winston.debug('breaking out...')
                         break;
                      }
                    } catch(err) {}
                }
            }
            catch (e) {
               if (res1 && res1.length >= 1) {
                var results = res1
                 winston.debug('breaking out...')
                 break;
                }  else {
                  if (amazonParams.BrowseNode) {
                     delete amazonParams.BrowseNode;
                    }
                    winston.debug('trying : ', amazonParams);
                    try {
                      yield wait(1500);
                      var res1 = yield get_client().itemSearch(amazonParams);
                    } catch(err) {

                    }
                    if (res1 && res1.length >= 1) {
                     var results = res1
                     winston.debug('breaking out...')
                     break;
                    }
                }
            }
        } // end of for loop
        if (!results || (results && results.length < 1)) {
            winston.debug('👺3: cutting modifiers failed, search just the original query in a node-traversal search, then try a non-node-traversal search... ');
            amazonParams.Keywords = params.query;
            amazonParams.BrowseNode = browseNodeBackup;
            winston.debug('trying : ', amazonParams);
            try {
              yield wait(1500);
              winston.debug('trying : ', amazonParams);
              var results = yield get_client().itemSearch(amazonParams);
            } catch(err) {
               if (amazonParams.BrowseNode) {
                  delete amazonParams.BrowseNode;
                }
                try {
                  yield wait(1500);
                  winston.debug('trying : ', amazonParams);
                  var results = yield get_client().itemSearch(amazonParams);
                } catch(err) {}
            }

        }
      // Only one modifier
      } else {
        winston.debug('👺4 One modifier, as is did not work... ');
        try {
          if (amazonParams.BrowseNode) {
             delete amazonParams.BrowseNode;
          }
            yield wait(1500);
            // amazonParams.Keywords = amazonParams.Keywords + ' ' + params.query;
            winston.debug('trying : ', amazonParams);
            var results = yield get_client().itemSearch(originalParams);
        }
        catch(err) {
          winston.debug('👺5', amazonParams);
            try {
               amazonParams.Keywords = params.query;
               yield wait(1500);
               winston.debug('trying : ', amazonParams);
               var results = yield get_client().itemSearch(originalParams);
             } catch(err) {
            }

        if (!results || (results && results.length < 1)) {
           try {
               amazonParams.Keywords = params.query;
               yield wait(1500);
               winston.debug('trying : ', amazonParams);
               var results = yield get_client().itemSearch(originalParams);
            } catch(err) {
            }
          }
        }
        if(!results || (results && results.length < 1)) {
             if (amazonParams.BrowseNode) {
                delete amazonParams.BrowseNode;
              }
              winston.debug('👺6: ', amazonParams);
              if (amazonParams.Keywords && amazonParams.Keywords.split(' ').length > 2) {
                kip.debug('someone probably sent a really long string: ', amazonParams.Keywords);
                  //like if someone sends a paragraph.. patch fix for now todo fix later
                  return null;
              }
              try {
                yield wait(1500);
                winston.debug('trying : ', amazonParams.Keywords);
                var results = yield get_client().itemSearch(amazonParams);
              } catch(err) {
                try {
                   amazonParams.Keywords = params.query;
                   yield wait(1500);
                   winston.debug('trying : ', amazonParams);
                   var results = yield get_client().itemSearch(originalParams);
                 } catch(err) {}
              }
            if (!results || (results && results.length < 1)) {
               try {
                   amazonParams.Keywords = params.query;
                   yield wait(1500);
                   winston.debug('trying : ', amazonParams);
                   var results = yield get_client().itemSearch(originalParams);
                } catch(err) {}
            }
        }
      }
  }
  timer.tic('got results from ItermSearch api')

  if (results && results.length > 1) {
    kip.debug(`Found ${results.length} results (before paging)`.green)
  }
  else {
    return null
  }
  results = results.slice(skip, skip + 3)
  results.original_query = params.query
  timer.tic('enhancing results')
  var enhanced_results = yield enhance_results(results,origin, timer)
  timer.tic('done enhancing results')
  timer.stop()

    
  return enhanced_results
}


/*
params:
asin
skip
*/
var similar = function*(params,origin) {
  var timer = new kip.SavedTimer('similar.timer', {params: params, origin: origin});

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

  timer.tic('hitting amazon SililarityLookip api');
  var results = yield get_client().similarityLookup(amazonParams);
  timer.tic('got results from amazon SimilarityLookup api')
  results = results.slice(params.skip, params.skip + 3);
  results.original_query = params.query;


  // if there aren't enough results... do a weaker search
  if (results.length < 1) {
    // TODO do the weak search thing.  looks like the weak search thing
    // just removes some words from the search query.
    throw new Error('no results found');
  // results = yield weakSearch(params); TODO
  // results = results.slice(skip, 3); // yeah whatevers
  }

  var er = yield enhance_results(results,origin, timer);
  timer.stop();
  return er;
}


// Decorates the results for a party 🎉
function* enhance_results(results, origin, timer) {
  // enhance the results, naturally.
  timer.tic('getting all prices');
  yield results.map((r, i) => {
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
  timer.tic('got prices')

  var urls = yield picstitch.stitchResultsPromise(results,origin); // no way i'm refactoring this right now
  timer.tic('stitched results');
  for (var i = 0; i < urls.length; i++) {
    results[i].picstitch_url = urls[i];
    // getItemLink should include user_id to do user_id lookup for link shortening
    results[i].shortened_url = yield processData.getItemLink(results[i].DetailPageURL[0]);
  }
  timer.tic('shortened urls');
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

    if (product && product.reviews) {
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

module.exports.lookup = lookup;
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
  console.log('testing'.yellow);
  co(function*() {
    var result = yield search({
      query: process.argv[2]
    })

    console.log(result);
  }).catch(e => {
    console.log(e.stack);
  })
}