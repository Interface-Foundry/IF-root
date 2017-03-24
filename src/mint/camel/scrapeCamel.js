var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var wait = require('co-wait');
var _ = require('lodash');

// amazon = new Apac({
//   awsId: 'AKIAIQWK3QCI5BOJTT5Q',
//   awsSecret: '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',
//   assocId: 'motorwaytoros-20'
// });

var lookupAmazonItem = require('../server/utilities/amazon_cart').lookupAmazonItem;

// var amazon = require('../../chat/components/amazon_search').lookup
var string_utils = require('./string_utils');

var db;
const dbReady = require('../db');
dbReady.then((models) => { db = models; }).catch(e => console.error(e));

const url = 'https://camelcamelcamel.com';
const count = 5;

/**
 * Scrapes camelcamelcamel
 * @returns full site HTML
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
  console.log('querying amazon');
  var amazon_item = yield lookupAmazonItem(asin);
  console.log('amazon queried');
  // var amazonParams = {
  //   Availability: 'Available',
  //   Condition: 'New',
  //   IdType: 'ASIN',
  //   ItemId: asin,
  //   ResponseGroup: 'ItemAttributes,Images,OfferFull,BrowseNodes,SalesRank'
  // };
  // var amazon_test = amazon.execute('ItemLookup', amazonParams);
  amazon_item = amazon_item.Item;
    // console.log('AMAZON OBJECT:', amazon_item);
  var item = {};
  item.url = amazon_item.DetailPageURL;
  item.category = amazon_item.ItemAttributes.ProductGroup;
  console.log('is this a real category?', item.cat);
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
  console.log('scrape camel called');
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
  console.log('asins', asins);

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
      // info: amazon.info
    });

    console.log('created camel'); //never prints
    console.log('camel', camel);

    var blurbs = [];
    // console.log('INFO', amazon.info)
    if (amazon.info && amazon.info.length) {
      yield amazon.info.map(function * (b) {
        yield db.AmazonBlurbs.destroy({text: b});
        blurb = yield db.AmazonBlurbs.create({
            text: b//,
            // item: camel.id
          });
        blurbs.push(blurb);
      });

      console.log('created blurbs');
      // console.log('blurbs', blurbs);
    }
    try {
      yield blurbs.map(function * (b) {
        camel.blurbs.add(b.id);
        yield camel.save();
        // console.log('whatever, here is a blurb', b.text)
      });

      // console.log('camel.blurbs', camel.blurbs);
      console.log('saved a model');
    }
    catch (err) {
      console.log('ERROR:', err);
    }
  }
  console.log('saved models');
};

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
 * Returns COUNT of the most recent deals in the database
 */
var todaysDeals = function * (count, id, categoryCounts) {
  console.log('todays deals called');
  yield dbReady;

  if (id) {
    var lastCamel = yield db.CamelItems.findOne({id: id});
    var where = {
      or: [
        {
          skipped: true
        },
        {
          createdAt:  {
            '<' : lastCamel.createdAt
          }
        }
      ]
    };
  }
  else {
    where = {};
  }

  var query = {
    limit: count,
    sort: 'createdAt DESC',
    where: where
  };

  console.log('about to query for camels');
  var camels = yield db.CamelItems.find(query);
  console.log('got the camels');
  console.log('this many', camels.length);
  camels.map(c => console.log(c.name));

  //set skipped to false, because we're at least provisionally including them in the next batch
  camels.map(function * (c) {
    if (c.skipped) yield db.CamelItems.update({id: c.id}, {skipped: false});
  });
  return yield spreadCategories(camels, categoryCounts);
};

var spreadCategories = function * (camels, categoryCounts) {
  //goes through camels and keeps track of category counts
  console.log('these are our camel categories:', camels.map(c => c.category));
  var skipped = [];
  yield dbReady;
  if (!categoryCounts) categoryCounts = {};
  var semiUniqueCamels = [];
  yield camels.map(function * (c) {
    if (!categoryCounts[c.category]) {
      categoryCounts[c.category] = 1;
      semiUniqueCamels.push(c);
    }
    else if (categoryCounts[c.category] === 1) {
      categoryCounts[c.category]++;
      semiUniqueCamels.push(c);
    }
    else {
      //oh, no, we've already shown as many deals of this category as we want to
      skipped.push(c);
    }
  });

  // console.log('semi unique camels', semiUniqueCamels)
  //if the length has changed, call today's deals with updated count and id
    //which should then call this, etc, recursively, until we either run out of items or have the distribution we want
  console.log('semiUniqueCamels.length', semiUniqueCamels.length);
  if (camels.length === semiUniqueCamels.length) {
    yield skipped.map(function * (c) {
      yield db.CamelItems.update({id: c.id}, {skipped: true});
    });
    return semiUniqueCamels;
  }
  else return semiUniqueCamels.concat(yield todaysDeals(camels.length - semiUniqueCamels.length, camels[camels.length-1].id, categoryCounts));
};

// co(todaysDeals).catch(e => console.error(e));

co(function * () {
  yield scrapeCamel();
  // return; //DELENDUM
  console.log('done w/ scraping');
  var deals = yield todaysDeals(count);
  console.log('FINAL DEALS');
  deals.map(d => {
    console.log(d.name);
    // console.log(d.category);
  });
  console.log(deals[deals.length-1].id);
});

module.exports = {
  scrape : scrapeCamel,
  getDeals : function * (id) {
    return getDeals(count, id);
  }
};
