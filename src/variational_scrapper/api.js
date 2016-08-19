var request = require('request');
var cheerio = require('cheerio');
var db = require('../db');
var ItemVariation = db.ItemVariation;
var co = require('co');


/*
* given objects like:
* @param {variationValues} products variations and types of variations
* @param {asinVariationValues} products index of variationValues and the asin for that specific match up
* @returns {array} the uhhhhh.
*
*   Example:
*    variationValues:{ size_name:[ '6 B(M) US',...,'11 B(M) US' ],
*       color_name: [ 'Black', 'Gray', 'Blue', 'Taupe' ] },
*    asinVariationValues:{{B01CI6RY52: { size_name: '0', ASIN: 'B01CI6RY52', color_name: '1' },B01CI40M8U: { size_name: '5', ASIN: 'B01CI40M8U', color_name: '2' }}
*    convert to [{asin: 'B01CI6RY52', size_name: '6 B(M) US', color_name: 'Gray'] ...{ }}
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
* @param {asin} product with no offer codes.
* @returns {v}  variations and respective asins
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




var ASIN = 'B01CI6RTRK';
var z = get_variations(ASIN)

