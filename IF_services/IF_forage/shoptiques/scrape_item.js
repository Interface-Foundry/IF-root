var cheerio = require('cheerio');
var request = require('request');
var Promise = require('bluebird');
var deepcopy = require('deepcopy');
var fs = require('fs');

/**
 * This file scrapes the data from a specific shoptique item url
 * data: {
 *  items: [],
 *  boutique: {}
 * }
 */
var scrape = module.exports = function(url){
    return new Promise(function(resolve, reject) {
        function scrapeBody(b) {
            var $ = cheerio.load(b);
            var item = {};
            var boutique = {};

            // boutique
            boutique.source = "shoptiques";  // in case we have to hide all these some day in one big batch
            boutique.name = $('div.boutique-introduction a').text();
            boutique.url = 'http://www.shoptiques.com' + $('div.boutique-introduction a').attr('href');
            boutique.neighborhood = $('div.boutique-neighborhood').text();
            boutique.addressText = $('div.address').text();
            boutique.city = $('div.address').attr('data-city');
            boutique.state = $('div.address').attr('data-state');
            boutique.description = $('div.boutique-introduction div.description').text();
            boutique.image = $('div.product-boutique div.top-left-image img').attr('data-src');
            boutique.followersCount = $('div.followers').text();
            var followerIdHack = $('div.followers').attr('id');
            if (followerIdHack) {
                boutique.idString = followerIdHack.replace('follower_count_', '');
                boutique.id = parseInt(boutique.idString);
            } else {
                boutique.idString = 'shoptique_' + url.split('/').pop();
                boutique.id = Math.random()*100000000|0;
            }

            // item
            item.source = "shoptiques";
            item.name = $('div.hidden-phone div.product-name>h1').text().trim();
            item.idString = $('div.hidden-phone div.product-name>h1').attr('id');
            item.id = parseInt(item.idString.replace('p-', ''));
            item.priceString = $('div.hidden-phone div.product-name span.product-price>span').text();
            item.price = parseFloat(item.priceString.replace('$', '')) || 0;
            item.loves = parseInt($('span#loveboxCount').text());
            item.description = $('[itemprop="description"]').text();
            item.fullDescription = $('[itemprop="description"]').parent().text();
            item.brand = $('span[itemprop="brand"]').text();
            item.categories = $('ul.shoptiques-breadcrumb li').toArray().map(function(l) { return $(l).text()});
            item.url = url;
            item.related = $('div.complete-look a.img[href*="/products/"]').toArray().map(function(w){return 'http://www.shoptiques.com' + $(w).attr('href')});


            // make one item per color
            var colors = $('#product-detail .colors a');

            var items = colors.toArray().map(function(c) {
                var i = deepcopy(item);
                i.color = $(c).attr('data-color');
                i.colorName = $(c).attr('data-color-name');
                i.colorImage = $(c).attr('style').replace(/.*url\('/, '').replace('\')', '');
                i.colorId = $(c).attr('data-id');
                i.images = $('div.carousel-holder a[data-id="' + i.colorId + '"]').toArray().map(function(a) {
                    return  $(a).attr('href').replace('_l.jpg', '_m.jpg');
                });
                return i;
            });
            resolve({
                items: items,
                boutique: boutique
            });
        }

        request(url, function(e, r, b) {
            scrapeBody(b);
        });
    });
};
