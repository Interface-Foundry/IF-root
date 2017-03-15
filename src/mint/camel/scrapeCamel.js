var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');

/**
 * Models loaded from the waterline ORM
 */
var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

const url = 'https://camelcamelcamel.com';

var scrape = function * () {
  return rp(url)
    .then(function (result) {
      // console.log('result', result);
      return result;
    });
};

var camelScrape = function * () {
  var camel = yield scrape()

  $ = cheerio.load(camel);
  var names = [];
  var asins = [];
  var prices = [];

  //gets names and asins
  $('div.deal_top_inner').each(function (i, e) {
    names.push($('a', e).eq(1).text());
    var url = $('a', e).eq(0).attr('href')
    url = url.split('/')
    var qs = url[url.length-1].split('?')
    asins.push(qs[0])
  });

  console.log('got names')

  //gets new and old prices
  $('table.product_grid').first().find('div.deal_bottom_inner').each(function (i, e) {
    $('div.compare_price', e).each(function (i, e) {
      var price = $(e).text().split('\n')[2].trim().slice(1);
      price = Number(price.split(',').join(''));
      if (i % 2 === 0) prices.push({new: price});
      else prices[prices.length-1].old = price;
    });
  });

  console.log('got first half of prices')

  var originalPricesLength = prices.length;

  $('table.product_grid').last().find('div.deal_bottom_inner').each(function (i, e) {
    $('div.compare_price', e).each(function (j, e) {
      var price = $(e).text().split('\n')[2].trim();
      if (j % 2 == 1) {
        price = price.split(' ')[1];
        price = price.slice(1, price.length-1);
      }
      price = Number(price.slice(1).split(',').join(''));

      if (j % 2 === 0) {
        prices.push({old: price});
      }
      else {
        prices[i + j + originalPricesLength - 1].new = Number((prices[i + j + originalPricesLength - 1].old - price).toFixed(2));
      }
    })
  });

  console.log('got prices')

  for (var i = 0; i < names.length; i++) {
    console.log('about to create model')
    db.camel_items.create({
      name: names[i],
      asin: asins[i],
      price: prices[i].new,
      previousPrice: prices[i].old
    }).exec()
    console.log('created one record maybe');
  }

  console.log('saved models')
}

co(camelScrape)
