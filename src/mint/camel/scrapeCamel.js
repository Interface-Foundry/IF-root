var rp = require('request-promise');
var cheerio = require('cheerio');
var co = require('co');
var fs = require('fs');
var wait = require('co-wait');

var amazon = require('../../chat/components/amazon_search').lookup;
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
var getAmazon = function * (asin) {
  console.log('take a deep breath');
  yield wait(1500);
  console.log('querying amazon');
  var amazon_test = yield amazon({ASIN: asin});
  var item = {};
  // console.log('AMAZON RAW', amazon_test[0].BrowseNodes[0].BrowseNode);
  item.category = amazon_test[0].ItemAttributes[0].ProductGroup[0];
  console.log('is this a real category?', item.cat);
  item.info = amazon_test[0].ItemAttributes[0].Feature;
  item.images = {};
  // console.log(amazon_test[0])
  if (amazon_test[0].SmallImage) item.images.small = amazon_test[0].SmallImage[0].URL[0];
  if (amazon_test[0].MediumImage) item.images.medium = amazon_test[0].MediumImage[0].URL[0];
  if (amazon_test[0].LargeImage) item.images.large = amazon_test[0].LargeImage[0].URL[0];
  if (amazon_test[0].shortened_url) item.url = amazon_test[0].shortened_url;
  if (amazon_test[0].reviews) item.reviews = amazon_test[0].reviews;
  return item;
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

  // console.log('db', db)

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

    console.log('created camel');
    console.log('camel', camel);

    // console.log('INFO', amazon.info)
    if (amazon.info) {
      var blurbs = [];
      yield amazon.info.map(function * (b) {
        yield db.AmazonBlurbs.destroy({text: b});
        blurb = yield db.AmazonBlurbs.create({
            text: b//,
            // item: camel.id
          })
        blurbs.push(blurb);
      });

      console.log('created blurbs');
      // console.log('blurbs', blurbs);
    };
    try {
      yield blurbs.map(function * (b) {
        camel.blurbs.add(b.id);
        yield camel.save()
        console.log('whatever, here is a blurb', b.text)
      });

      // console.log('camel.blurbs', camel.blurbs);
      console.log('saved a model');
    }
    catch (err) {
      console.log('ERROR:', err)
    }
  }
  console.log('saved models');
};

var trimName = function (name) {
  console.log('original name', name);

  name = string_utils.dashes(name);
  name = string_utils.parens(name);
  name = string_utils.brackets(name);
  name = string_utils.ellipses(name);
  name = string_utils.commas(name);
  name = string_utils.periods(name);
  name = string_utils.spaces(name);

  console.log('final name', name);

  return name;
};

/**
 * Returns COUNT of the most recent deals in the database
 */
var todaysDeals = function * (count, id, categoryCounts) {
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
