var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var elasticsearch = require('elasticsearch');

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

var defaultResultCount = 20;

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

    // elasticsearch impl
    // update fuzziness of query based on search term length
    var fuzziness = 0;
    var q = req.body.text;
    if (q.length >= 4) {
        fuzziness = 1;
    } else if (q.length >= 6) {
        fuzziness = 2;
    }

    // here's some reading on filtered queries
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-filtered-query.html#_multiple_filters
    var filter = {
        bool: {
            must: [{
                geo_distance: {
                    distance: (req.body.radius || "0.5") + "mi",
                    "loc.coordinates": {
                        lat: req.body.loc.lat,
                        lon: req.body.loc.lon
                    }
                }
            }]
        }
    };

    // if the price is specified, add a price filter
    if (req.body.priceRange && [1, 2, 3, 4].indexOf(req.body.priceRange) > -1) {
        filter.bool.must.push({term: {price: req.body.priceRange}});
    }

    // only items, not worlds
    filter.bool.must.push({term: {world: false}});

    // put it all together in a filtered fuzzy query
    var fuzzyQuery = {
        size: defaultResultCount,
        from: page * defaultResultCount,
        index: "foundry",
        type: "landmarks",
        fields: [],
        body: {
            query: {
                filtered: {
                    query: {
                        multi_match: {
                            query: q,
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

    es.search(fuzzyQuery)
        .then(function(results) {
            var ids = results.hits.hits.map(function(r) { return r._id; });
            db.Landmarks.find({_id: {$in: ids}}, function(err, results) {
                responseBody.results = results;
                res.send(responseBody);
            });
        }, function(err) {
            next(err);
        });


    return;


    // mongo impl
    var query = {
        world: false,
        loc: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [req.body.loc.lon, req.body.loc.lat]
                },
                $maxDistance: radiusInMeters,
                $minDistance: 0
            }
        }
    };

    db.Landmarks.find(query).execAsync()
        .then(function(items) {
            res.send({
                query: req.body,
                links: links,
                results: items
            });
        }).catch(next);
});


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

            var skip = parseInt(req.body.page) * defaultResultCount;
            var query = {
                spherical: true,
                maxDistance: 1 / 111.12, //1km radius
                skip: skip,
                sort: {
                    like_count: -1
                },
                limit: defaultResultCount
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