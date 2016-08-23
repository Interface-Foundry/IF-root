var request = require('request');
var cheerio = require('cheerio');
var db = require('../db');
var _ = require('lodash');
var ItemVariation = db.itemvariation;
var amazon = require('../amazon-product-api_modified');

var logging = require('winston');
logging.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

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
function create_item_array(variationValues, asinVariationValues) {
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
  return init_array
}


/**
* given asin, goto amazon page, scrape variations.
* @param {string} product with no offer codes.
* @returns {Object}  variations and respective asins
*/
function get_variations(asin) {

  var v = {
    base_asin: asin,
    url: 'https://www.amazon.com/dp/'  + asin,
    asins: []
  };

  request(v.url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('#twisterJsInitializer_feature_div > script').each(function(i, element) {
        var data = element.children[0].data
        var lines = data.split('\n');
        lines = lines.slice(2, lines.length - 3)
        var data = lines.join('\n');
        eval(data) // returns value that contains dataToReturn var
        v.variationValues = dataToReturn.variationValues
        v.asinVariationValues = dataToReturn.asinVariationValues
        v.asins = create_item_array(v.variationValues, v.asinVariationValues)
      })
    }

  var item = new ItemVariation({
    ASIN: v.base_asin,
    variationValues: v.variationValues,
    asins: v.asins
  })

  item.save(function(err) {
    if (err) throw err;
  });
  });
};

/*
* Picks Item ASIN from created
*
* @param {string} ASIN identifier
*/
function pickItem(asin) {
  ItemVariation.findOne({ASIN: asin}, function(err,obj) {
    var itemAttribsToUse = createItemReqs(obj.variationValues)
    var goodItem = _.filter(obj.asins, _.matches(itemAttribsToUse))
    if (goodItem.length > 0) {
      console.log('ADD TO CART ASIN: ', goodItem[0].id)
      // lookup item and add to cart
    }
    else {
      throw new Error('no Item Matches the reqs provided by user')
    }
  });
}

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
  // BUTTONS AND STUFF WOULD BE RIGHT HERE:
  //

  // select random sample being:
  for (var key in variationValues) {
    itemAttribsToUse[key] = _.sample(variationValues[key])
  }
  logging.debug('Item Atrbs to use: ', itemAttribsToUse)

  return itemAttribsToUse
}


// TESTING BELOW
var ASIN = 'B01CI6RTRK';

pickItem(ASIN)
// var z = get_variations(ASIN)

