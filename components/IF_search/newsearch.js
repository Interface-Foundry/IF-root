var db = require('db');
var express = require('express');
var app = express();
var kip = require('kip');
var geolib = require('geolib');
var searchterms = require('./searchterms');


// parse user if we're running this on it's own server
if (!module.parent) {
  app.use(require('../IF_auth/new_auth.js'));
}


app.get('/search', function(req, res, next) {
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
})

/**
 * Search implementation for a query that has text
 * Need to use elasticsearch for this
 * @param q query (must contain at least "text" and "loc" properties)
 * @param page
 */
function textSearch(q, page) {

      console.log('text search', q);

      //split up the search terms into their categories.
      var buckets = searchterms.split(q.text);



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
                      query: {
                          multi_match: {
                              query: q.text,
                              fuzziness: fuzziness,
                              prefix_length: 1,
                              type: "best_fields",
                              fields: ["name^4", "id^3", "parentName^3", "tags^3", "categories^2", "description^2", "miscText"],
                              tie_breaker: 0.2,
                              minimum_should_match: "30%"
                          }
                      },
                      filter: filter
                  }
              }
          }
      };
      kip.prettyPrint(fuzzyQuery)

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
}
