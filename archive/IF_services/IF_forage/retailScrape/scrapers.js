var cheerio = require('cheerio');
var scrapingUtils = require('./scrapingUtils');
var request = require('request');
var uuid = require('uuid');
var URL = require('url');
var Promise = require('bluebird');

/**
 * Gets all the data from an item detail page. Returns a normal object, not mongoose doc.
 * @param url
 * @param row
 * @returns {bluebird|exports|module.exports}
 */
module.exports.scrapeItemDetail = function(url, row) {
    return new Promise(function(resolve, reject) {
        if (!url) { return reject('no url provided') }

        request(url, function(e, r, b) {
            if (e) {
                console.error(e);
                return reject(e);
            }

            // Load the page
            var $ = cheerio.load(b);
            scrapingUtils.addPlugins($);

            // We might only interested in a specific section of the page
            var section = $(row.ContentWrapper || 'body');

            var item = scrapingUtils.itemStringFields.reduce(function(item, k) {
                if (row[k]) {
                    item[k] = section.kipScrapeString(row[k]);
                }
                return item;
            }, {});

            item = scrapingUtils.itemArrayFields.reduce(function(item, k) {
                if (row[k]) {
                    item[k] = section.kipScrapeArray(row[k]);
                }
                return item;
            }, item);

            resolve(item);
        })
    })
};

module.exports.scrapeSiteCatalog = function(row) {
    return new Promise(function(resolve, reject) {
        request(row.StoreURL, function(e, r, b) {
            if (e) {
                console.error(e);
                return reject(e);
            }

            // Load the page
            var $ = cheerio.load(b);
            scrapingUtils.addPlugins($);

            var urls = $('body').kipScrapeArray(row.URLSelector).map(function(url) {

                // make sure the url is valid.  sometimes they're just '/something/here' so
                // we have to add the host from the store url.
                var u = URL.parse(url);
                if (!u.host) {
                    var storeURL = URL.parse(row.StoreURL);
                    url = storeURL.protocol + '//' + storeURL.host + url;
                }

                return url
            })
            resolve(urls);
        })
    })
};