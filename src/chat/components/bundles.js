var amazon = require('./amazon_search.js');
var db = require('db');
var co = require('co');
var _ = require('lodash');
var eachSeries = require('async-co/eachSeries');
var sleep = require('co-sleep');
var kipcart = require('./cart');

var snacks = module.exports.snacks = ['B017L0BL5E', 'B013KTYFYO', 'B00URCF2B8', 'B01BXU1RV6'];
var drinks = module.exports.drinks = ['B0048IAH30', 'B00L84GH9K', 'B00787YLJE'];
var supplies = module.exports.supplies = ['B00006IFKT', 'B01A6JLR88', 'B01G7J5QN8'];

var bundles = { snacks: snacks, drinks: drinks, supplies: supplies }


var addBundleToCart = module.exports.addBundleToCart = function * (bundle, userId ,cart_id) {
 var items = yield db.Item.find({'bundle': bundle, 'available': true},{'source_json':1 });
 yield eachSeries(items, function * (item) {
   var skip = false;
   try {
	 item = JSON.parse(item.source_json);
   } catch (err) {
   	 skip = true;
   	 kip.debug('\n\n\n\n\n\n\n\n\n\n\n bundles:23:err:', err,' \n\n\n\n\n\n\n\n\n\n\n')
   }
   yield kipcart.addToCart(cart_id, userId, item, 'team');
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
	      kip.debug('bundles.js:amazonlookup:error for item:',asin,' error: ',e);
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



var updater = module.exports.updater = function * () {    	 kip.debug('\n\n\n\n\n\n\n\n\n\n\n FIRING UPDTOR \n\n\n\n\n\n\n\n\n\n\n')
async.whilst(function * () { return true}, function* (loop) { yield updateBundles(); yield sleep(2000000); loop(); }, function() {}) }