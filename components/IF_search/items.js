var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');
var elasticsearch = require('elasticsearch');

var defaultResultCount = 20;

var mockItems = require('./../../test/KipAPI/mock_items.js');
var USE_MOCK_DATA = true;

/**
 * Item Search
 */
var searchItemsUrl = '/api/items/search';
app.post(searchItemsUrl, function(req, res) {
  // page is 0-indexed
  var page = parseInt(req.query.page) || 0;

  // make some links which allow easy page traversal on the client
  var links = {
    self: req.originalUrl,
    next: searchItemsUrl + '?page=' + (page + 1),
    prev: page == 0 ? null : searchItemsUrl + '?page=' + (page - 1),
    first: searchItemsUrl,
    last: null // there's no such thing as a last search result.  we have a long tail of non-relevant results
  };

  if (USE_MOCK_DATA) {
    return res.send({
      query: req.body,
      links: links,
      results: mockItems.getResultsArray(defaultResultCount)
    });
  }

  // elasticsearch impl


  // mongo impl
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
app.post(trendingItemsUrl, function(req, res) {
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

  if (USE_MOCK_DATA) {
    return res.send({
      query: req.body,
      links: links,
      results: [{
        category: 'Trending in Neighborhood1',
        results: mockItems.getResultsArray(defaultResultCount)
      }, {
        category: 'Trending in Neighborhood2',
        results: mockItems.getResultsArray(defaultResultCount)
      }, {
        category: 'Related to Holiday1',
        results: mockItems.getResultsArray(defaultResultCount)
      }, {
        category: 'Other Snaps Near You',
        results: mockItems.getResultsArray(defaultResultCount)
      }]
    });
  }

  var loc = {
    type: 'Point',
    coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lon)]
  };

  //Get neighborhood name based on coordinates
  var options = {
    method: 'GET'
  };

  request(global.config.neighborhoodServer.url + '/findArea?lat=' + loc.coordinates[0] + '&lon=' + loc.coordinates[1], options, function(error, response, body) {
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

      landmark.geoNear(loc, query, function(err, items) {
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