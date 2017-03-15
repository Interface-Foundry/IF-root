var rp = require('request-promise');
var co = require('co');
var cheerio = require('cheerio');

const url = 'https://camelcamelcamel.com';

var scrape = function () {
  return rp(url)
    .then(function (result) {
      // console.log('result', result);
      return result;
    });
};


scrape().then(function (camel) {
  $ = cheerio.load(camel);
  var names = [];
  var asins = [];
  var prices = [];
  var formerPrices = [];
  console.log('alternately:')
  $('div.deal_top_inner').each(function (i, e) {
    names.push($('a', e).eq(1).text());
    var url = $('a', e).eq(0).attr('href')
    url = url.split('/')
    var qs = url[url.length-1].split('?')
    asins.push(qs[0])
  });
  $('table.product_grid').first().find('div.deal_bottom_inner').each(function (i, e) {
    // console.log('this is an item')
    $('div.compare_price', e).each(function (i, e) {
      // console.log('this is a price')
      console.log($(e).text());
      console.log($(e).text().split('\n')[2].trim());
    })
  });
  // $('table.product_grid').last().find('div.deal_bottom_inner').each(function (i, e) {
  //   // console.log('this is an item')
  //   $('div.compare_price', e).each(function (i, e) {
  //     // console.log('this is a price')
  //     console.log($(e).text())
  //     // console.log($(e).html())
  //   })
  // });
  console.log('fin')
});
