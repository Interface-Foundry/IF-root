var job = require('job');
var db = require('db');
var cheerio = require('cheerio');
var request = require('request');
var uuid = require('uuid');

/**
 * Scrapes a generic boutique online gallery
 * Needs data: {
 *  parentId: string mongodb id,
 *  ownerId: string mongodb id,
 *  url: url of item to scrape,
 *  linkbackname: the human-readable name like "shoptiques.com"
 *  wrapper: html element to search inside,
 *  name: selector for name,
 *  price: selector for price,
 *  description: selector for description,
 *  categories: selector for categories,
 *  itemImageURL: selector for itemImageURLs,
 *  related: selector for related url's
 * }
 */
var scrapeSite = job('scrape-generic-site', function(data, done) {
    console.log('processing', data.url);
    data.wrapper = data.wrapper || 'body';


    // first check if we have already scraped this thing
    db.Landmarks
        .findOne({'source_generic_item.url': data.url})
        .exec(function(e, l) {
            if (e) {
                console.error(e);
                return done(e);
            }
            if (l) {
                console.log('already found', data.url);
                return done();
            }

            request(data.url, function(e, r, b) {
                debugger;
                if (e) {
                    console.error(e);
                    return done(e);
                }

                // Load the page
                var $ = cheerio.load(b);

                // We are only interested in a specific section of the page
                var section = $(data.wrapper);

                // turn 'img.product-thumbnail=>data-image-full' into
                // $('img.product-thumbnail').map(function(){return $(this).attr('data-image-full');}).get()
                var scrapeArray = function(str) {
                    debugger;
                    if (str.indexOf('=>') > 0) {
                        str = str.split('=>');
                        return section.find(str[0]).map(function() {
                            return $(this).attr(str[1]);
                        }).toArray();
                    } else {
                        return section.find(str).map(function() {
                            return $(this).text();
                        }).toArray();
                    }
                }

                var scrapeString = function(str) {
                    if (str.indexOf('=>') > 0) {
                        str = str.split('=>');
                        return section.find(str[0]).attr(str[0]);
                    } else {
                        return section.find(str).text();
                    }
                }

                // Create a new landmark for the item
                var item = {
                    parent: data.parent,
                    owner: data.owner,
                    source_generic_item: {
                        url: data.url,
                        images: scrapeArray(data.itemImageURL)
                    },
                    loc: data.loc,
                    name: scrapeString(data.name),
                    id: uuid.v4(),
                    itemImageURL: scrapeArray(data.itemImageURL),
                    linkback: data.url,
                    linkbackname: data.linkbackname
                };

                if (data.related) {
                    item.source_generic_item.related = scrapeArray(data.related);
                }

                if (data.description) {
                    item.description = scrapeString(data.description);
                }

                if (data.price) {
                    item.price = scrapeString(data.price).replace(/[\$\,]/g, '') || 0;
                }

                if (data.categories) {
                    item.itemTags = {
                        categories: scrapeArray(data.categories)
                    }
                }

                var i = new db.Landmark(item);
                i.save(function(e, i) {
                    if (e) {
                        console.error(e);
                        return done(e);
                    }
                    console.log(JSON.stringify(i.toObject()));
                    done();
                })
            })
        })
});
