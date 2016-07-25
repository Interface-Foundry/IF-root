module.exports.addPlugins = function($) {
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

module.exports.itemStringFields = ['ItemName', 'ItemPrice', 'ItemDescription'];
module.exports.itemArrayFields = ['ItemImages', 'RelatedItemURLs', 'ItemTags'];