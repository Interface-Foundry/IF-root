var request = require('request');
var cheerio = require('cheerio');

var uuid = require('uuid');
var co = require('co');
var promisify = require('promisify-node');

var async = require('async');
var wait = require('co-wait');

var db = require('db');
var queue = require('./queue-mongo');
var _ = require('lodash');
var ItemVariation = db.itemvariation;
var amazon_search = require('./amazon_search.js');

var logging = require('winston');
logging.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/*
* create pubsub with
*
*/
function pubsubVariation(item) {
  logging.debug('\n\n\ncreating variation for: ', item.ASIN);
  queue.publish(
    'variation.' + item.source.origin,
    item,
    item._id + '.variation.' + uuid.v4())
}

/*
* given objects like:
* @param {Object} variationValues products variations and types of variations
* @param {Object} asinVariationValues products index of variationValues and
*                 the asin for that specific match up
* @returns {array} array of options per asin.
*
*   Example:
*    variationValues:{
*       size_name:[ '6 B(M) US',...,'11 B(M) US' ],
*       color_name: [ 'Black', 'Gray', 'Blue', 'Taupe' ]
*     },
*    asinVariationValues:{{
*     B01CI6RY52: { size_name: '0', ASIN: 'B01CI6RY52', color_name: '1' },
*     B01CI40M8U: { size_name: '5', ASIN: 'B01CI40M8U', color_name: '2' }}
*
*    convert to:
*     [{asin: 'B01CI6RY52', size_name: '6 B(M) US', color_name: 'Gray'] ...{ }}
*/
function createItemArray(variationValues, asinVariationValues) {
  var init_array = []
  for (var asin in asinVariationValues) {
    var item_var = {id: asin}
    for (var key in asinVariationValues[asin]) {
      if (variationValues.hasOwnProperty(key)) {
        var tmp_prop = key
        var tmp_val = variationValues[key][asinVariationValues[asin][key]]
        item_var[tmp_prop] = tmp_val
        }
      }
    init_array.push(item_var);
    }
  if (init_array.length === []) {
    return Promise.reject('No variations');
  }
  return init_array
}



/**
* given asin, goto amazon page, scrape variations.
* @param {string} product with no offer codes.
* @returns {Object}  variations and respective asins
*/
function getVariations(asin, message) {
  var variation = {
    base_asin: asin,
    url: 'https://www.amazon.com/dp/'  + asin,
    asins: []
  };

  request(variation.url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('#twisterJsInitializer_feature_div > script').each(function(i, element) {
        var data = element.children[0].data
        var lines = data.split('\n');
        lines = lines.slice(2, lines.length - 3)
        var data = lines.join('\n');
        eval(data) // returns value that contains dataToReturn var
        variation.variationValues = dataToReturn.variationValues
        variation.asinVariationValues = dataToReturn.asinVariationValues
        variation.asins = createItemArray(variation.variationValues, variation.asinVariationValues)
      })
    }


  var item = new ItemVariation({
    ASIN: variation.base_asin,
    variationValues: variation.variationValues,
    asins: variation.asins,
    source: message
  })
  item.save(function(err) {
    if (err) throw err;
  });

  pubsubVariation(item)
  });
};


/*
* createItemReqs should present user in facebook or slack or whatever with
* buttons to click for each object in variationValues and return what items
* were clicked
*
* @param {Object} variationValues {key_1:[Val1,..,Val3],..,key_n: [Val1,.]}
* @returns {Object} itemAttribsToUse {key_1: val_1,...,key_n:val_n}
*/
function createItemReqs(variationValues){
    var itemAttribsToUse = {}
    logging.debug('SELECT ONE OF THE FOLLOWING: ', Object.keys(variationValues))

    // BUTTONS AND STUFF WOULD BE RIGHT HERE, along

    var buttonSetBuilder = new FBButtonSetBuilder(variationValues);
    // at this point, calling buttonSetBuilder.build('color_name') would give you
    // a set of buttons labeled "Black", "Gray", "Blue", "Purple"

    var optionGroup = new RequiredAttribueGroup(variationValues);
    // optionGroup.isComplete() should yield false because you haven't
    // made enough selections to satisfy the group's parameters
    
    // now, in response to each user button click, you can call:
    // optionGroup.setAttribute('color_name', '<color_name_here>')
    // optionGroup.setAttribute('size_name', '<shoe_size_here>')
    // 
    // optionGroup.isComplete() should now yield true; you've set the required parameters
    // 


    // LISTEN TO PUBSUB FOR RESPONSE

    // SELECT RANDOM SAMPLE FOR TIME BEING:
    for (var key in variationValues) {
	itemAttribsToUse[key] = _.sample(variationValues[key])
    }
    logging.debug('Item Atrbs to use: ', itemAttribsToUse)
    return itemAttribsToUse
}


/*
* Picks Item ASIN from created
*
* @param {string} ASIN identifier
* @returns {}
*/
function pickItem(item) {
  var to_ret = {}
  ItemVariation.findOne({'source.id': item.id}, function(err,obj) {
    // var itemAttribsToUse = createItemReqs(obj.variationValues) // get this from incoming pubsubs after buttons
    var itemAttribsToUse = item.variations
    var goodItem = _.filter(obj.asins, _.matches(itemAttribsToUse))
    if (goodItem.length > 0) {
      logging.debug('ADD TO CART ASIN: ', goodItem[0].id)
      // lookup item and add to cart
      var i = {
        ASIN: goodItem[0].id,
        origin: 'facebook'
      }
      var results =  amazon_search.lookup(i, i.origin)
      return results
    }
    else {
      throw new Error('no Item Matches the reqs provided by user')
    }
  });
}


// this is just for slotting into reply_logic at later date if we dont use a mode
function interceptIncoming(item) {
  if (incoming.data.mode === 'variation.mode') {
    var results = pickItem(item)
  }
}


// exportz
module.exports.createItemReqs = createItemReqs;
module.exports.getVariations = getVariations;
module.exports.pickItem = pickItem;


// TESTING BELOW
var ASIN = 'B01CI6RTRK';
var message = {
  user : "914619145317222",
  id : "facebook_914619145317222",
  org : "facebook_914619145317222",
  channel : "914619145317222",
  origin : "facebook"
}
var item = {ASIN: 'B01CI6RTRK',
            id: 'facebook_914619145317xxx',
            variations: {
              color_name: 'Gray',
              size_name: '8 B(M) US'
            }}

// var z = getVariations(ASIN, message)
// pickItem(item)
// interceptIncoming(item)


