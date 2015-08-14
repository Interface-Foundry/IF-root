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

            var item = {
                source_generic_item: {
                    url: url,
                    images: section.kipScrapeArray(row.ItemImages)
                },
                name: section.kipScrapeString(row.ItemName),
                id: uuid.v4(),
                itemImageURL: section.kipScrapeArray(row.ItemImages),
                linkback: url
            };

            if (row.RelatedItemURLs) {
                item.source_generic_item.related = section.kipScrapeArray(row.RelatedItemURLs);
            }

            if (row.ItemDescription) {
                item.description = section.kipScrapeString(row.ItemDescription);
            }

            if (row.ItemPrice) {
                item.price = section.kipScrapeString(row.ItemPrice).replace(/[\$\,]/g, '') || 0;
            }

            if (row.ItemCategories) {
                item.itemTags = {
                    categories: section.kipScrapeArray(row.ItemCategories)
                }
            }

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

            console.log('scraping', row.StoreURL, 'with', row.URLSelector);
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