var amazon = require('./amazon_search.js');
var co = require('co');
var _ = require('lodash');
var eachSeries = require('async-co/eachSeries');
var sleep = require('co-sleep');
var kipcart = require('./cart');
var cron = require('cron');


// EDIT BUNDLES HERE THE ASIN OF THE AMAZON PRODUCT  //
var snacks = module.exports.snacks = ['B017L0BL5E', 'B013YT9VWG', 'B00JW4T466'];
var drinks = module.exports.drinks = ['B0048IAH30', 'B00L84GH9K', 'B00787YLJE'];
var supplies = module.exports.supplies = ['B00006IFKT', 'B01A6JLR88', 'B01G7J5QN8'];
// ------------------------------------------------ //

var bundles = { snacks: snacks, drinks: drinks, supplies: supplies }


var addBundleToCart = module.exports.addBundleToCart = function * (bundle, userId ,cart_id) {
 yield kipcart.emptyCart(cart_id);
 var items = yield db.Item.find({'bundle': bundle, 'available': true},{'source_json':1 });
 if (!items || items.length < 1) {
 	kip.debug(' \n\n\n bundle:24:items not cached in mongo, updating bundle \n\n\n');
 	yield updateBundle(bundle);
 	var items = yield db.Item.find({'bundle': bundle, 'available': true},{'source_json':1 });
 }
 if (!items) return
 yield eachSeries(items, function * (item) {
   var skip = false;
   try {
	 item = JSON.parse(item.source_json);
   } catch (err) {
   	 skip = true;
   }
   if (!skip){
   	 try { yield kipcart.addToCart(cart_id, userId, item, 'team'); } catch(err) { kip.debug('\n\n\n bundles:36:addtoCart err:', err,' \n\n\n') }
    }
  })
}


var updateBundles = module.exports.updateBundles = function * () {
  var bundleNames = Object.keys(bundles);
   yield eachSeries(bundleNames, function * (key) {
	yield eachSeries(bundles[key], function * (asin) {
	  var skip = false;
	  try {
	      var res = yield amazon.lookup({ ASIN: asin, IdType: 'ASIN'});
	   } catch (e) {
	   	 skip = true;
	   }
	  if (res && !skip) {
	  	 var item = res[0];
		  var existingItem = yield db.Item.findOne({'ASIN': item.ASIN[0]})
		  if (_.get(existingItem,'bundle')) {
			  var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0');
			  if (total_offers === 0) {
			  	existingItem.available = false;
			  	yield existingItem.save();
			  }
		  } else {
		  	 if (item.reviews && item.reviews.reviewCount) {
			    item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
			  }
			  yield new db.Item({
			      ASIN: _.get(item,'ASIN[0]'),
			      title: _.get(item,'ItemAttributes[0].Title[0]'),
			      source_json: JSON.stringify(item),
			      bundle: key,
			      available: true
			   }).save();
		  }
	    }
	 })
  })
};

var updateBundle = module.exports.updateBundle = function * (bundle) {
	yield eachSeries(bundles[bundle], function * (asin) {
	  var skip = false;
	  try {
	     var res = yield amazon.lookup({ ASIN: asin, IdType: 'ASIN'});
	   } catch (e) {
	   	 skip = true;
	   }
	  if (res && !skip) {
	  	 var item = res[0];
		  var existingItem = yield db.Item.findOne({'ASIN': item.ASIN[0]})
		  if (_.get(existingItem,'bundle')) {
			  var total_offers = parseInt(_.get(item, 'Offers[0].TotalOffers[0]') || '0');
			  if (total_offers === 0) {
			  	existingItem.available = false;
			  	yield existingItem.save();
			  }
		  } else {
		  	 if (item.reviews && item.reviews.reviewCount) {
			    item.reviews.reviewCount = parseInt(item.reviews.reviewCount);
			  }
			  yield new db.Item({
			      ASIN: _.get(item,'ASIN[0]'),
			      title: _.get(item,'ItemAttributes[0].Title[0]'),
			      source_json: JSON.stringify(item),
			      bundle: bundle,
			      available: true
			   }).save();
		  }
	    }
	 })
};


var updater  = module.exports.updater =  function () {
  kip.debug('setting cron job for updating bundle items at midnight...');
  new cron.CronJob('00 00 * * *', function () {
 	  co(updateBundles);
    }, function() {
  kip.debug('\n\n\n updated bundle items! \n\n\n');
    },
    true,
    'America/New_York');
}
