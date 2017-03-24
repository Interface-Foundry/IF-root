var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var wait = require('co-wait');
var _ = require('lodash');

var lookupAmazonItem = require('../server/utilities/amazon_cart').lookupAmazonItem;

var string_utils = require('./string_utils');

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

const url = 'https://camelcamelcamel.com';
const count = 10; //The number of deals / camel items that should be returned

/**
 * Scrapes camelcamelcamel
 * @returns full site HTML
 * @param the mongoId (as a string) of the last camel item we've shown the user
 */
var scrape = function * (previousId) {

  /**
   * returns a random integer between 0 and the specified exclusive maximum.
   */
  function randomInt(exclusiveMax) {
    return Math.floor(Math.random() * Math.floor(exclusiveMax));
  }

  /**
   * returns a fake user agent to be used in request headers.
   */
  function fakeUserAgent() {
    var osxVer = Math.floor(Math.random() * 9) + 1;
    var webkitMajVer = randomInt(999) + 111;
    var webkitMinVer = randomInt(99) + 11;
    var chromeMajVer = randomInt(99) + 11;
    var chromeMinVer = randomInt(9999) + 1001;
    var safariMajVer = randomInt(999) + 111;
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_'+ osxVer +
    ') AppleWebKit/' + webkitMajVer + '.' + webkitMinVer +
    ' (KHTML, like Gecko) Chrome/' + chromeMajVer + '.0.' + chromeMinVer +
    '2623.110 Safari/' + safariMajVer +'.36';
  }

  // l🐪o🐪l🐪
  var crypto = require('crypto');
  var camelSession = crypto.randomBytes(32).toString('hex');
  var camelNoneMatch = crypto.randomBytes(32).toString('hex');
  var ALNI = crypto.randomBytes(29).toString('hex');
  var gadsA = crypto.randomBytes(16).toString('hex');
  var gadsB = randomInt(99999999) + 11111111;
  var gcaA = randomInt(99999999) + 11111111;
  var gcaB = randomInt(9999999999999) + 1111111111111;
  var gaA = randomInt(9) + 1;
  var gaB = randomInt(9) + 1;
  var gaC = randomInt(999999999) + 111111111;
  var gaD = randomInt(9999999999) + 1111111111;

  var options = {
    uri: url,
    //PROXY to be added later ??
    //proxy: 'http://127.0.0.1:24000',
    gzip: true,
    headers: {
      'Host': 'camelcamelcamel.com',
      'Connection': 'keep-alive',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': fakeUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, sdch, br',
      'Accept-Language': 'en-US,en;q=0.8',
      'Cookie': 'tz=America/New_York; __qca=P0-'+gcaA+'-'+gcaB+'; __gads=ID='+gadsA+':T='+gadsB+':S=ALNI_'+ALNI+'; OX_plg=pm; camel_session='+camelSession+'; _ga=GA'+gaA+'.'+gaB+'.'+gaC+'.'+gaD+'',
      'If-None-Match':'W/"'+camelNoneMatch+'"'
    }
  };

  console.log('about to scrape', options);

  return rp(options)
    .then(function (result) {
      console.log('result', result);
      return result;
    })
    .catch(function (err) {
      console.log('err ',err);
    });
};

/**
 * Queries the amazon API after a 1.5 second delay
 * @param ASIN of the item we're querying
 * @returns the product category of the item
 */
var getAmazon = function * (asin) {
  console.log('take a deep breath');
  yield wait(1500);

  var amazon_item = yield lookupAmazonItem(asin);
  console.log('amazon queried');
  amazon_item = amazon_item.Item;
  // console.log('AMAZON OBJECT:', amazon_item);
  var item = {};
  item.url = amazon_item.DetailPageURL;
  item.category = amazon_item.ItemAttributes.ProductGroup;
  // console.log('is this a real category?', item.cat);
  item.info = amazon_item.ItemAttributes.Feature;
  item.images = {};
  if (amazon_item.SmallImage) item.images.small = amazon_item.SmallImage.URL;
  if (amazon_item.MediumImage) item.images.medium = amazon_item.MediumImage.URL;
  if (amazon_item.LargeImage) item.images.large = amazon_item.LargeImage.URL;
  if (amazon_item.DetailPageUrl) item.url = amazon_item.DetailPageUrl;
  // if (amazon_test[0].reviews) item.reviews = amazon_test[0].reviews;
  console.log('got this:', item);
  return item;
};

/**
 * Scrapes camelcamelcamel and saves today's deals to mongo as camel_items
 */
var scrapeCamel = function * () {
  // console.log('scrape camel called');
  var camel = yield scrape();
  console.log('scraped');

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
  // console.log('asins', asins);

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

  //set last batch of camelItems to inactive
  yield db.CamelItems.update({active: true}, {active: false});

  //save new camel items to the db
  for (var i = 0; i < names.length; i++) {
    var amazon = yield getAmazon(asins[i]); //would be cleaner to do this elsewhere
    //if an item with that ASIN is already in the db, delete it
    yield db.CamelItems.destroy({asin: asins[i]});

    //saves items to the db

    var camel = yield db.CamelItems.create({
      original_name: names[i],
      name: trimName(names[i]),
      asin: asins[i],
      price: prices[i].new,
      previousPrice: prices[i].old,
      category: amazon.category,
      small: (amazon.images.small || null),
      medium: (amazon.images.medium || null),
      large: (amazon.images.large || null),
      url: amazon.url
    });

    console.log('created camel'); //never prints
    console.log('camel', camel);

    var blurbs = [];
    if (amazon.info && amazon.info.length) {
      yield amazon.info.map(function * (b) {
        yield db.AmazonBlurbs.destroy({text: b});
        blurb = yield db.AmazonBlurbs.create({
            text: b
          });
        blurbs.push(blurb);
      });

      console.log('created blurbs');
    }
    try {
      yield blurbs.map(function * (b) {
        camel.blurbs.add(b.id);
        yield camel.save();
      });

      console.log('saved a model');
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }
  console.log('saved models');
  yield rankDeals();
};

/**
 * orders the deals to prevent clumps of the same category; saves the ranking to the db
 */
var rankDeals = function * () {
  var deals = yield db.CamelItems.find({active: true});
  var rankedDeals = [];
  var deferred = [];
  var dealSet = [];
  var categoryCounts = {};
  while (deals.length || deferred.length) {
    // console.log('rankedDeals', rankedDeals.map(c => c.category));
    // console.log('deferred', deferred.map(c => c.category));
    // console.log('dealSet', dealSet.map(c => c.category));
    // console.log('categoryCounts', categoryCounts);
    //if we have completed a set, we don't have to worry about repeating those categories
    if (!deals.length) {
      return rankedDeals.concat(dealSet).concat(deferred);
    }
    if (dealSet.length === count) {
      rankedDeals = rankedDeals.concat(dealSet);
      deals = deals.concat(deferred); //deals deferred from last batch are up next for this one
      dealSet = [];
      categoryCounts = {};
      deferred = [];
    }
    else {
      var nextDeal = deals.pop();
      if (categoryCounts[nextDeal.category] > 1) {
        //we want to defer this to the next batch
        deferred.push(nextDeal);
      }
      else {
        dealSet.push(nextDeal);
        if (categoryCounts[nextDeal.category]) categoryCounts[nextDeal.category]++;
        else categoryCounts[nextDeal.category] = 1;
      }
    }
  }

  for (var i = 0; i < rankedDeals.length; i++) {
    yield db.CamelItems.update({id: rankedDeals[i].id}, {position: i});
  }

  return rankedDeals;
};

/**
 * trims item name
 * @param name {string} long, messy version of item name
 * @returns shortened cleaner version of name
 */
var trimName = function (name) {
  console.log('original name', name);

  name = string_utils.ellipses(name);

  var all_specs = string_utils.getSpecs(name);
  console.log('specs', all_specs);

  name = string_utils.dashes(name);
  name = string_utils.parens(name);
  name = string_utils.brackets(name);
  name = string_utils.commas(name);
  name = string_utils.periods(name);
  name = string_utils.spaces(name);

  var redundant_specs = string_utils.getSpecs(name);

  var specs = _.difference(all_specs, redundant_specs);

  return name + ' ' + specs.join(' ');
};

/**
 * Returns some number (global variable 'count') of the most recent deals in the database
 * @param lastPosition {string} rank of the last deal we've shown the viewer (and therefore don't want to show again)
 */
var getDeals = function * (lastPosition) {
  console.log('todays deals called');
  yield dbReady;

  if (!lastPosition) lastPosition = -1;

  var query = {
    limit: count,
    sort: 'position',
    where: {
      active: true,
      position: {
        '>': lastPosition
      }
    }
  };

  console.log('about to query for camels');
  var camels = yield db.CamelItems.find(query);

  //if there's something wrong with the value passed in, just start from the beginning
  if (!camels.length && lastPosition > -1) return yield getDeals();

  console.log('got the camels');
  // console.log('this many', camels.length);
  // camels.map(c => console.log(c.category));
  return yield camels;
};

// co(function * () {
//   yield scrapeCamel();
//   // console.log('done w/ scraping and ordering');
//   var deals = yield getDeals();
//   console.log('FINAL DEALS');
//   deals.map(d => {
//     console.log(d.name, d.category);
//   });
//   console.log(deals[deals.length-1].id);
// });

module.exports = {
  scrape : scrapeCamel,
  getDeals : getDeals
};
