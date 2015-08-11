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
    db.landmarks
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

            request(url, function(e, r, b) {
                if (e) {
                    console.error(e);
                    return done(e);
                }

                // Load the page
                var $ = cheerio.load(b);
                var item = {};

                // We are only interested in a specific section of the page
                var section = $(data.wrapper);

                // turn 'img.product-thumbnail=>data-image-full' into
                // $('img.product-thumbnail').map(function(){return $(this).attr('data-image-full');}).get()
                var scrapeArray = function(str) {
                    if (str.indexOf('=>') > 0) {
                        str = str.split('=>');
                        return section.find(str[0]).map(function() {
                            return $(this).attr(str[0]);
                        })
                    } else {
                        return section.find(str).map(function() {
                            return $(this).text();
                        })
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
                item = {
                    source_generic_item: {
                        url: data.url,
                        images: scrapeArray(data.itemImageURL)
                    },
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
                    item.price = scrapeString(data.price).replace('$', '') || 0;
                }

                if (data.categories) {
                    item.itemTags = {
                        categories: scrapeArray(data.categories)
                    }
                }

                item = new db.Landmark(item);

                // add in the parent's info
                db.Landmarks.findById(data.parentId)
                    .exec(function(e, parent) {
                        if (e) {
                            return done(e);
                        }

                        item.parent = {
                            mongoId: data.parentId,
                            name: parent.name,
                            id: parent.id
                        }

                        // todo add owner
                        db.Users.findById(data.ownerId)
                            .exec(function(e, owner) {
                                if (e) {
                                    return done(e);
                                }

                                item.owner = {
                                    mongoId: data.ownerId,
                                    name: owner.name,
                                    profileID: owner.profileID
                                }

                                item.save(function(e) {
                                    if (e) {
                                        return done(e);
                                    }
                                    done();
                                });
                            })
                    })
            })
        })
});
