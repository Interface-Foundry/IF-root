#!/usr/bin/env node

logging.info('camelcamelcamel');

var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var wait = require('co-wait');
var _ = require('lodash');

var lookupAmazonItem = require('../server/utilities/amazon_cart').lookupAmazonItem;
var request = require('../../chat/components/proxy/request');
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

  function makeRequest(url) {
	   return request.luminatiRequest(url, 3)
		   .then(body => {
			      // console.log('success', body);
          console.log('success');
          return body;
		    })
		   .catch(err => {
			    console.log('bad');
		    });
  }

  logging.info('about to scrape');
  var stuff = yield makeRequest(url);
  return stuff;
};


/**
 * Queries the amazon API after a 1.5 second delay
 * @param ASIN of the item we're querying
 * @returns the product category of the item
 */
var getAmazon = function * (asin) {
  logging.info('take a deep breath');
  yield wait(1500);

  var amazon_item = yield lookupAmazonItem(asin);
  if (!amazon_item) {
    logging.debug('COULD NOT FIND ITEM ON AMAZON');
    return null;
  }
  logging.info('amazon queried');
  if (!amazon_item.Item) {
    console.log('AMAZON ITEM', (amazon_item.Errors ? amazon_item.Errors: amazon_item));
    return null;
  }
  amazon_item = amazon_item.Item;
  // logging.info('AMAZON OBJECT:', amazon_item);
  var item = {};
  item.url = amazon_item.DetailPageURL;
  item.category = amazon_item.ItemAttributes.ProductGroup;
  // logging.info('is this a real category?', item.cat);
  item.info = amazon_item.ItemAttributes.Feature;
  item.images = {};
  if (amazon_item.SmallImage) item.images.small = amazon_item.SmallImage.URL;
  if (amazon_item.MediumImage) item.images.medium = amazon_item.MediumImage.URL;
  if (amazon_item.LargeImage) item.images.large = amazon_item.LargeImage.URL;
  if (amazon_item.DetailPageUrl) item.url = amazon_item.DetailPageUrl;
  // if (amazon_test[0].reviews) item.reviews = amazon_test[0].reviews;
  // logging.info('got this:', item);
  return item;
};

/**
 * Scrapes camelcamelcamel and saves today's deals to mongo as camel_items
 */
var scrapeCamel = function * () {
  logging.info('scrape camel called');
  var camel = yield scrape();
  logging.info('scraped');

  $ = cheerio.load(camel);

  var names = [];
  var asins = [];
  var prices = [];

  logging.info('loaded cheerio');

  //gets names, asins, and urls to scrape categories from
  $('div.deal_top_inner').each(function (i, e) {
    names.push($('a', e).eq(1).text());
    var url = $('a', e).eq(0).attr('href');
    url = url.split('/');
    var qs = url[url.length-1].split('?');
    asins.push(qs[0]);
  });

  logging.info('got names and asins');

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

    if (!amazon) continue;

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

    // logging.info('camel', camel);
    // logging.info('amazon', amazon.info);
    if (!Array.isArray(amazon.info)) amazon.info = [amazon.info];

    var blurbs = [];
    if (amazon.info && amazon.info.length) {
      yield amazon.info.map(function * (b) {
        blurb = yield db.AmazonBlurbs.create({
            text: b
          });
        blurbs.push(blurb);
      });

      logging.info('created blurbs');
    }
    try {
      yield blurbs.map(function * (b) {
        camel.blurbs.add(b.id);
        yield camel.save();
      });

      logging.info('saved a model');
    }
    catch (err) {
      logging.info('ERROR:', err);
    }
  }
  logging.info('saved models');
  return yield rankDeals();
};

/**
 * orders the deals to prevent clumps of the same category; saves the ranking to the db
 */
var rankDeals = function * () {
  // console.log('rankDeals called');
  var deals = yield db.CamelItems.find({active: true});
  var rankedDeals = [];
  var deferred = [];
  var dealSet = [];
  var categoryCounts = {};
  while (deals.length || deferred.length) {
    // logging.info('rankedDeals', rankedDeals.map(c => c.category));
    // logging.info('deferred', deferred.map(c => c.category));
    // logging.info('dealSet', dealSet.map(c => c.category));
    // logging.info('categoryCounts', categoryCounts);
    //if we have completed a set, we don't have to worry about repeating those categories
    logging.info('in the loop');
    logging.info('rankedDeals.length', rankedDeals.length);
    logging.info('deferred.length', deferred.length);
    if (!deals.length) {
      console.log('early break');
      rankedDeals = rankedDeals.concat(dealSet).concat(deferred);
      // deals = [];
      // deferred = [];
      break;
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
    logging.info('done with iteration');
  }

  console.log('done iterating -- some say atlanta, some say new york');

  for (var i = 0; i < rankedDeals.length; i++) {
    console.log('gonna update a record now');
    yield db.CamelItems.update({id: rankedDeals[i].id}, {position: i});
  }
  console.log('ranked deals done');
  return rankedDeals;
};

/**
 * trims item name
 * @param name {string} long, messy version of item name
 * @returns shortened cleaner version of name
 */
var trimName = function (name) {
  // logging.info('original name', name);
  name = string_utils.ellipses(name);
  var all_specs = string_utils.getSpecs(name);
  // logging.info('specs', all_specs);
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

module.exports = function () {
  co(function * () {
    yield scrapeCamel();
    // var deals = require('./deals');
    // yield deals.getDeals(count);
  });
};
