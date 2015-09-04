/**
 * A collection of tools to help us scrape sites easier
 */

var addPlugins = function($) {
    /**
     * Combines a selector and .map() to return an array of strings via calling .text()
     * Can also return attribute values if you use '=>', because it calls .attr()
     *
     * Examples:
     * $(document).kipScrapeArray('.categories') returns something like ['womens', 'athletic']
     * $(document).kipScrapeArray('.categories a=>href') returns something like ['/categories/womens', '/categories/athletic']
     *
     * @param str
     * @returns {*}
     */
    $.fn.kipScrapeArray = function(str) {
        if (str.indexOf('=>') > 0) {
            str = str.split('=>');
            return this.find(str[0]).map(function() {
                return $(this).attr(str[1]);
            }).toArray();
        } else {
            return this.find(str).map(function() {
                return $(this).text().trim();
            }).toArray();
        }
    };

    /**
     * like the above but just for single values
     * @param str
     * @returns {*}
     */
    $.fn.kipScrapeString = function(str) {
        if (str.indexOf('=>') > 0) {
            str = str.split('=>');
            return this.find(str[0]).attr(str[0]);
        } else {
            return this.find(str).text().trim();
        }
    };
};

var cheerio = require('cheerio');
var request = require('request');
/**
 * Loads a url, callback with $
 * example:
 * load('shoptiques.com/wow', function($) {
 *   var name = $('.product-detail h2').text().trim();
 * })
 *
 * callback never fired if error loading page
 * @type {Function}
 */
var load = module.exports.load = function(url, callback) {
    request({
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.8'
        }
    }, function(e, r, b) {
        if (e) {
            console.error('could not load url "' + url + '"');
            console.error(e);
            return;
        }

        var $ = cheerio.load(b);
        addPlugins($);
        callback($);
    })
}
