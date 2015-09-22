var db = require('db');
var elasticsearch = require('elasticsearch');
var config = require('config');
var express = require('express');
var Promise = require('bluebird');
var app = express();
var kip = require('kip');
var geolib = require('geolib');
var searchterms = require('./searchterms');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pageSize = 20;
var defaultRadius = 2;

// logs elasticsearch stuff, flesh out later once we know what's useful
var ESLogger = function(config) {
    var defaultLogger = function() {};

    this.error = defaultLogger;
    this.warning = defaultLogger;
    this.info = defaultLogger;
    this.debug = defaultLogger;
    this.trace = defaultLogger;
    this.close = defaultLogger;
};
var es = new elasticsearch.Client({
    host: config.elasticsearch.url,
    log: ESLogger
});


// parse user if we're running this on it's own server
if (!module.parent) {
  //app.use(require('../IF_auth/new_auth.js'));
}
app.use(cookieParser());
app.use(bodyParser.json());

var searchItemsUrl = '/api/items/search';
app.post(searchItemsUrl, function(req, res, next) {

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
        .then(function(res) {
            if (res.length < 20) {
                req.body.radius = 5;
                console.log('searching radius', req.body.radius);
                return search(req.body, page);
            } else {
                return res;
            }
        })
        .then(function(res) {
            if (res.length < 20) {
                req.body.radius = 50;
                console.log('searching radius', req.body.radius);
                return search(req.body, page);
            } else {
                return res;
            }
        })
        .then(function(res) {
            if (res.length < 20) {
                req.body.radius = 500;
                console.log('searching radius', req.body.radius);
                return search(req.body, page);
            } else {
                return res;
            }
        })
        .then(function(results) {
            // first un-mongoose the results
            results = results.map(function(r) {
              return r.toObject();
            })

            // Add the parents here.  fetch them from the db in one query
            // The goal is to make item.parents a list of landmarks ordered by
            // distance to the search location.  And make item.parent the
            // closest one.

            // only make one db call to fetch all the parents in this result set
            var allParents = results.reduce(function (all, r) {
              return all.concat(r.parents || []);
            }, [])

            db.Landmarks.find({
              _id: {$in: allParents}
            }, function(e, parents) {
              if (e) { return next(e); }
              debugger;

              results.map(function(r) {
                var strparents = r.parents.map(function(_id) { return _id.toString()});
                r.parents = parents.filter(function(p) {
                  return strparents.indexOf(p._id.toString()) >= 0;
                }).sort(function(a, b) {
                  // sort by location
                  var a_dist = geolib.getDistance({
                    longitude: a.loc.coordinates[0],
                    latitude: a.loc.coordinates[1]
                  }, {
                    longitude: req.body.loc.lon,
                    latitude: req.body.loc.lat
                  });
                  var b_dist = geolib.getDistance({
                    longitude: b.loc.coordinates[0],
                    latitude: b.loc.coordinates[1]
                  }, {
                    longitude: req.body.loc.lon,
                    latitude: req.body.loc.lat
                  });
                  return a_dist < b_dist;
                });
                r.parent = r.parents[0];
              })

              responseBody.results = results;
              res.send(responseBody);
            })

            // (new db.Analytics({
            //   anonId: req.anonId,
            //   userId: req.userId,
            //   action: 'search',
            //   data: {
            //     query: req.body,
            //     resultCount: results.length
            //   }
            // })).save();
        }, next)
});

function search(q, page) {
    //
    // Normalize query
    //

    // text should be a string
    if (q.text && (typeof q.text !== 'string')) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.text must be a string, was ' + q.text
        });
    }

    // categories should be an array
    // these are the buttons they click
    if (q.categories && !(q.categories instanceof Array)) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.categories must be an array, was ' + q.categories
        });
    }

    // color should be an array
    // these are converted to the appropriave hsl colors
    if (q.color && !(q.color instanceof Array)) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.color must be an array, was ' + q.color
        });
    }

    // also add any colors from the text fields to the color array
    // TODO

    // priceRange should be a number 1-4
    if (q.priceRange && [1, 2, 3, 4].indexOf(q.priceRange) < 0) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.priceRange must be a number 1-4, was ' + q.priceRange
        });
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
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.loc is required'
        });
    } else if (!q.loc.lat || !q.loc.lon) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.loc is required and needs "lat" and "lon" properties, was ' + q.loc
        });
    } else if (isNaN(parseFloat(q.loc.lat)) || isNaN(parseFloat(q.loc.lon))) {
        return Promise.reject({
            niceMessage: 'Could not complete search',
            devMessage: 'q.loc is required and needs "lat" and "lon" properties to be numbers, was ' + q.loc
        });
    } else {
        q.loc.lat = parseFloat(q.loc.lat);
        if (q.loc.lat > 90 || q.loc.lat < -90) {
            return Promise.reject({
                niceMessage: 'Could not complete search',
                devMessage: 'q.loc.lat must be valid latitude, was ' + q.loc.lat
            });
        }
        q.loc.lon = parseFloat(q.loc.lon);
        if (q.loc.lon > 180 || q.loc.lon < -180) {
            return Promise.reject({
                niceMessage: 'Could not complete search',
                devMessage: 'q.loc.lon must be valid longitude, was ' + q.loc.lon
            });
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

      console.log('text search', q);

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
                      "geolocation": {
                          lat: q.loc.lat,
                          lon: q.loc.lon
                      }
                  }
              }]
          }
      };

      // if the price is specified, add a price filter
      if (q.priceRange) {
          filter.bool.must.push({
              term: {
                  priceRange: q.priceRange
              }
          });
      }

      // put it all together in a filtered fuzzy query
      var fuzzyQuery = {
          size: pageSize,
          from: page * pageSize,
          index: "kip",
          type: "items",
          fields: [],
          body: {
              query: {
                  filtered: {
                      query: searchterms.getElasticsearchQuery(q.text),
                      filter: filter
                  }
              }
          }
      };
      //kip.prettyPrint(fuzzyQuery)

      return es.search(fuzzyQuery)
          .then(function(results) {
              var ids = results.hits.hits.map(function(r) {
                  return r._id;
              });

              var users = db.Users.find({
                  $or: [{
                      'profileID': q.text
                  }, {
                      'local.email': q.text
                  }, {
                      'facebook.email': q.text
                  }, {
                      'name': q.text
                  }]
              }).select('-local.password -local.confirmedEmail -contact -bubbleRole -permissions').exec()

              var items = db.Landmarks.find({
                  _id: {
                      $in: ids
                  }
              }).exec();

              return Promise.settle([users, items]).then(function(arry) {
                  var u = arry[0];
                  var i = arry[1];

                  if (u.isFulfilled() && i.isFulfilled()) {
                      var results = u.value().concat(i.value().map(function(i) {
                          return db.Landmark.itemLocationHack(i, q.loc);
                      }));
                      return results
                  } else if (i.isFulfilled() && !u.isFulfilled()) {
                      return i.value().map(function(i) {
                          return db.Landmark.itemLocationHack(i, q.loc);
                      });
                  } else if (u.isFulfilled() && !i.isFulfilled()) {
                      return u.value()
                  }
              })

          }, kip.err);

  }



if (!module.parent) {
  app.listen(8080, function(e) {
    if(e) {
      console.log(e);
      process.exit(1);
    }
    console.log("kip style search listening on 8080")
  })
} else {
  module.exports = app;
}
