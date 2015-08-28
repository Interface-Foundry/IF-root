var quickflow = module.exports = require('quickflow')()

function log(data, done) {
// you don't even have to call done() if you don't want to
// all logging is up to you, so you don't have to rely on
// a complicated framework convention to make things work.
console.log(data)
}

function getCatalogURLs(data, done) {
var urls = ['http://www.dsw.com/Womens-Shoes-New-Arrivals/_/N-271o?activeCategory=102442'];

urls.map(done);

}

function getItemURLs(data, done) {
var kipScrapeTools = require('../kipScrapeTools');

if (!data) {
  return
}

console.log(data)

kipScrapeTools.load(data, function($) {
  $('.productContainer .productImage>a').map(function() {
    return $(this).attr('href');
  }).toArray().filter(function(u) {
    return u.indexOf('javascript') !== 0;
  }).map(function(u) {
    return 'http://www.dsw.com' + u;
  }).slice(0,1).map(done)
})
}

function scrapeItem(data, done) {
var kipScrapeTools = require('../kipScrapeTools')

// looks like http://www.dsw.com/shoe/crown+vintage+natasha+bootie?prodId=333140&activeCategory=102444&category=dsw12cat880002&activeCats=cat10006,dsw12cat880002
var urlParts = data.split(/[/?&=]/);
var name = urlParts[4];
var productId = urlParts[6];
var categoryId = urlParts[8];

kipScrapeTools.load(data, function($) {
  var sizes = $('select.sizes option').map(function() {
    return parseFloat($(this).html())
  }).toArray().filter(function(a) {
    return !!a;
  })
  
})
}

function extras(data, done) {
require('colors');
require('vvv');
}

function findStores(data, done) {
var url = 'http://www.dsw.com/dsw_shoes/product/206963/find'
var headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
}
var form = {
  sizes: 1000016,
  widths: 'M',
  zipCode: '10002',
  'lineItem.product.id': 13245,
  color: '',
  size: '',
  width: 'M',
  
}
}

quickflow.connect(getCatalogURLs, getItemURLs)
quickflow.connect(getItemURLs, log)
quickflow.connect(getItemURLs, scrapeItem)
quickflow.connect(extras)
quickflow.connect(findStores)
if (!module.parent) quickflow.run()