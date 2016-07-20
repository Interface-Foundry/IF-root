var _ = require('lodash')

module.exports = function(text) {
  // text = text.toLowerCase()
  text = text.toString().toLowerCase()
  var dataModify = {
    type: 'price'
  }

  price_terms.less.map(function(t) {
    if (text.indexOf(t) >=0) {
      dataModify.param = 'less';
    }
  })

  price_terms.more.map(function(t) {
    if (text.indexOf(t) >= 0) {
      dataModify.param = 'more';
    }
  })

  // make sure we found a param
  if (!dataModify.param) {
    return false;
  }

  // TODO find price value

  return dataModify;

}

module.exports.isPriceModifier = function(text) {
  if (!text) { return false }
  // text = text.toLowerCase();
  text = text.toString().toLowerCase();
  return all_terms.reduce(function(found, term) {
    return found || term.indexOf(text) >= 0;
  })
}

var price_terms = {
  less: [
  'cheapest',
  'cheaper',
  'cheap',
  'least expensive',
  'less expensive',
  'less',
  'too expensive',
  'too pricey',
  'less money',
  'too much money'
],
more: [  // we got ourselves a high-roller
  'more expensive',  // what about "it's more expensive that i can afford"
  'fancier',
  'too cheap'
]}

var all_terms = _.flatten(_.values(price_terms))
