var express = require('express');
var app = express.Router();

var defaultResultCount = 20;
var searchItemsUrl = '/api/items/search';

var mockItems = require('./../IF_apiroutes/mock_items.js');
var USE_MOCK_DATA = true;

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



});

module.exports = app;