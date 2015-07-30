var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');

// set up the fake data for the /trending api
var request = require('request');

// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
    var defaultLogger = function(){};

    this.error = defaultLogger;
    this.warning = defaultLogger;
    this.info = defaultLogger;
    this.debug = defaultLogger;
    this.trace = defaultLogger;
    this.close = defaultLogger;
};
var es = new elasticsearch.Client({
    host: global.config.elasticsearch.url,
    log: ESLogger
});

console.log('using elasticsearch', global.config.elasticsearch.url);

var pageSize = 20;
var defaultRadius = 2;

/**
 * Item Search
 * post body: {
	"text": "something tag la",
	"colors": ['FF00FF', 'FF00FF'],
	"categories": ['shoes'],
	"priceRange": 1, // or 2, 3, or 4
	"radius": .5, // miles
	"loc": {"lat": 34, "lon": -77}
  }

 example:
 {
	"text": "dress",
	"priceRange": 2,
	"radius": 0.5,
	"loc": {"lat": 40.7352793, "lon": -73.990638}
 }
 */
var searchItemsUrl = '/api/items/search';
app.post(searchItemsUrl, function (req, res, next) {

    // page is 0-indexed
    var page = parseInt(req.query.page) || 0;

    var responseBody = {
        links: {
            self: req.originalUrl,
            next: searchItemsUrl + '?page=' + (page + 1),
            prev: page == 0 ? null : searchItemsUrl + '?page=' + (page - 1),
            first: searchItemsUrl,
            last: null // there's no such thing as a last search result.  we have a long tail of non-relevant results
        },
        query: req.body,
        results: []
    };


    search(req.body, page)
        .then(function(results) {
            responseBody.results = results;
            res.send(responseBody);
        }, next)
});

/**
 * Takes any query, normalizes it, and performs a search
 * @param q
 * @param page
 * @returns {*}
 */
function search(q, page) {
    //
    // Normalize query
    //

    // text should be a string
    if (q.text && (typeof q.text !== 'string')) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.text must be a string, was ' + q.text});
    }

    // categories should be an array
    if (q.categories && !(q.categories instanceof Array)) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.categories must be an array, was ' + q.categories});
    }

    // color should be an array
    if (q.color && !(q.color instanceof Array)) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.color must be an array, was ' + q.color});
    }

    // priceRange should be a number 1-4
    if (q.priceRange && [1, 2, 3, 4].indexOf(q.priceRange) < 0) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.priceRange must be a number 1-4, was ' + q.priceRange});
    }

    // radius needs to be number parseable
    if (q.radius && isNaN(parseFloat(q.radius))) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.priceRange must be a number 1-4, was ' + q.priceRange
        });
    } else {
        q.radius = parseFloat(q.radius);
    }

    // loc should be {lon: Number, lat: Number}
    if (!q.loc) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.loc is required'});
    } else if (!q.loc.lat || !q.loc.lon) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.loc is required and needs "lat" and "lon" properties, was ' + q.loc});
    } else if (isNaN(parseFloat(q.loc.lat)) || isNaN(parseFloat(q.loc.lon))) {
        return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.loc is required and needs "lat" and "lon" properties to be numbers, was ' + q.loc});
    } else {
        q.loc.lat = parseFloat(q.loc.lat);
        if (q.loc.lat > 90 || q.loc.lat < -90) {
            return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.loc.lat must be valid latitude, was ' + q.loc.lat});
        }
        q.loc.lon = parseFloat(q.loc.lon);
        if (q.loc.lon > 180 || q.loc.lon < -180) {
            return Promise.reject({niceMessage: 'Could not complete search', devMessage: 'q.loc.lon must be valid longitude, was ' + q.loc.lon});
        }
    }

    if (q.text) {
        return textSearch(q, page);
    } else {
        return filterSearch(q, page);
    }
}

/**
 * Search implementation for a query that has text
 * Need to use elasticsearch for this
 * @param q query (must contain at least "text" and "loc" properties)
 * @param page
 */
function textSearch(q, page) {

    // elasticsearch impl
    // update fuzziness of query based on search term length
    var fuzziness = 0;
    if (q.text.length >= 4) {
        fuzziness = 1;
    } else if (q.text.length >= 6) {
        fuzziness = 2;
    }

    // here's some reading on filtered queries
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-filtered-query.html#_multiple_filters
    var filter = {
        bool: {
            must: [{
                geo_distance: {
                    distance: (q.radius || defaultRadius) + "mi",
                    "loc.coordinates": {
                        lat: q.loc.lat,
                        lon: q.loc.lon
                    }
                }
            }]
        }
    };

    // if the price is specified, add a price filter
    if (q.priceRange) {
        filter.bool.must.push({term: {price: q.priceRange}});
    }

    // only items, not worlds
    filter.bool.must.push({term: {world: false}});

    // put it all together in a filtered fuzzy query
    var fuzzyQuery = {
        size: pageSize,
        from: page * pageSize,
        index: "foundry",
        type: "landmarks",
        fields: [],
        body: {
            query: {
                filtered: {
                    query: {
                        multi_match: {
                            query: q.text,
                            fuzziness: fuzziness,
                            prefix_length: 1,
                            type: "best_fields",
                            fields: ["name^2", "id", "summary", "itemTags", "comments", "description", "parent.name"],
                            tie_breaker: 0.2,
                            minimum_should_match: "30%"
                        }
                    },
                    filter: filter
                }
            }
        }
    };

    return es.search(fuzzyQuery)
        .then(function(results) {
            var ids = results.hits.hits.map(function(r) { return r._id; });
            return db.Landmarks.find({_id: {$in: ids}}).exec();
        });
}

/**
 * Search implementation for a query that does not have text
 * Just use mongodb
 * @param q query (must contain at least loc" property)
 * @param page
 */
function filterSearch(q, page) {

    var radius = q.radius || defaultRadius; // miles
    radius = 1609.344 * radius; // meters

    var query = {
        world: false,
        loc: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [q.loc.lon, q.loc.lat]
                },
                $maxDistance: radius,
                $minDistance: 0
            }
        }
    };

    if (q.priceRange) {
        query.price = q.priceRange;
    }

    if (q.categories) {
        query['itemTags.categories'] = {$in: q.categories};
    }

    if (q.color) {
        query['itemTags.color'] = {$in: q.color};
    }

    return db.Landmarks
        .find(query)
        .limit(pageSize)
        .exec();
}


/**
 * Trending Items
 * POST /api/items/trending
 * body: {
 *   lat: Number,
 *   lon: Number,
 *   category: String (optional)
 * }
 */
var trendingItemsUrl = '/api/items/trending';
app.post(trendingItemsUrl, function (req, res, next) {
    // page is 0-indexed
    var page = parseInt(req.query.page) || 0;

    // make some links which allow easy page traversal on the client
    var links = {
        self: req.originalUrl,
        next: trendingItemsUrl + '?page=' + (page + 1),
        prev: page == 0 ? null : trendingItemsUrl + '?page=' + (page - 1),
        first: trendingItemsUrl,
        last: null // there's no such thing as a last search result.  we have a long tail of non-relevant results
    };



    request.post('http://localhost:2997/api/items/search', {
        body: {
            "text": "summer",
            "radius": 0.5,
            "loc": {"lat": 40.7352793, "lon": -73.990638}
        },
        json: true
    }, function (e, r, body) {

        res.send({
            query: req.body,
            links: links,
            results: [{
                category: 'Trending in Summer',
                results: body.results
            }, {
                category: 'Trending near you',
                results: body.results
            }]
        });
    });

    return;

    var loc = {
        type: 'Point',
        coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lon)]
    };

    //Get neighborhood name based on coordinates
    var url = global.config.neighborhoodServer.url + '/findArea?lat=' + loc.coordinates[0] + '&lon=' + loc.coordinates[1];

    request.get(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('req.body: ', req.body)
            var area = JSON.parse(body)

            var response = {
                results: [],
                links: links,
                query: req.body
            };

            var skip = parseInt(req.body.page) * pageSize;
            var query = {
                spherical: true,
                maxDistance: 1 / 111.12, //1km radius
                skip: skip,
                sort: {
                    like_count: -1
                },
                limit: pageSize
            };

            landmark.geoNear(loc, query, function (err, items) {
                if (err) console.log(err);
                if (!items) return res.send(440);

                var obj = {
                    category: 'Trending in ' + area.area,
                    results: items
                }
                response.results.push(obj)
                console.log('hitting', response)
                res.send(response);
            });
        }
    })

})


module.exports = app;