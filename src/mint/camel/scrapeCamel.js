var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var wait = require('co-wait');

var amazon = require('../../chat/components/amazon_search').lookup;
//takes (params, origin)
//params: {IdType, ASIN}

/**
 * Models loaded from the waterline ORM
 */
// var db;
// const dbReady = require('../db');
// dbReady.then((models) => { db = models; }).catch(e => console.error(e));
co(function * () {
  yield db = require('../db');
})

const url = 'https://camelcamelcamel.com';
var count = 5;
var position = 0;

/**
 * Scrapes camelcamelcamel
 * @returns full site HTML
 */
var scrape = function * (previousId) {
  return rp(url)
    .then(function (result) {
      // console.log('result', result);
      return result;
    });
};

/**
 * Queries the amazon API after a 1.5 second delay
 * @param ASIN of the item we're querying
 * @returns the product category of the item
 */
var getCategory = function * (asin) {
  console.log('take a deep breath');
  yield wait(1500);
  console.log('querying amazon');
  var amazon_test = yield amazon({ASIN: asin});
  return amazon_test[0].ItemAttributes[0].ProductGroup[0];
};

/**
 * Scrapes camelcamelcamel and saves today's deals to mongo as camel_items
 */
var scrapeCamel = function * () {
  var camel = yield scrape();

  $ = cheerio.load(camel);
  var names = [];
  var asins = [];
  var prices = [];

  console.log('loaded cheerio');

  //gets names, asins, and urls to scrape categories from
  $('div.deal_top_inner').each(function (i, e) {
    names.push($('a', e).eq(1).text());
    var url = $('a', e).eq(0).attr('href');
    url = url.split('/');
    var qs = url[url.length-1].split('?');
    asins.push(qs[0]);
  });

  console.log('got names and asins');

  //gets new and old prices from the most popular section
  $('table.product_grid').first().find('div.deal_bottom_inner').each(function (i, e) {
    $('div.compare_price', e).each(function (i, e) {
      var price = $(e).text().split('\n')[2].trim().slice(1);
      price = Number(price.split(',').join(''));
      if (i % 2 === 0) prices.push({new: price});
      else prices[prices.length-1].old = price;
    });
  });

  var originalPricesLength = prices.length;

  //get new and old prices from the best deals section, which is formatted differently
  $('table.product_grid').last().find('div.deal_bottom_inner').each(function (i, e) {
    $('div.compare_price', e).each(function (j, e) {
      var price = $(e).text().split('\n')[2].trim();
      if (j % 2 === 1) {
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
    });
  });

  for (var i = 0; i < names.length; i++) {
    var cat = yield getCategory(asins[i]); //would be cleaner to do this elsewhere
    //if an item with that ASIN is already in the db, delete it
    yield db.CamelItems.destroy({asin: asins[i]});

    //saves items to the db
    db.CamelItems.create({
      name: names[i],
      asin: asins[i],
      price: prices[i].new,
      previousPrice: prices[i].old,
      category: cat
    }).exec(function (err, result) {
      if (err) console.log('error:', err);
    });
  }

  console.log('saved models');
};

/**
 * Returns COUNT of the most recent deals in the database
 */
var todaysDeals = function * (latest_id) {
  // yield scrapeCamel();

  var query = {
    limit: count,
    sort: 'createdAt DESC',
  };

  if (latest_id) {
    console.log('latest id')
    var lastCamel = yield db.CamelItems.findOne({where: {asin: latest_id}});
    console.log('found the last camel')
    query.where = {
      createdAt : {
        '<=' : lastCamel.createdAt
      }
    };
  }

  console.log('no latest id / done with latest id');
  var camels = yield db.CamelItems.find(query);
  camels.map(c => console.log(c.name));
};

module.exports = todaysDeals;

co(todaysDeals('B00MEZF2S4'));
