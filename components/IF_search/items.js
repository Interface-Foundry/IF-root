var express = require('express');
var app = express.Router();

var defaultResultCount = 20;
var searchItemsUrl = '/api/items/search';

var mockItems = require('./mock_items.js');

app.post(searchItemsUrl, function(req, res) {
  console.log(req.body);
  // page is 0-indexed
  var page = parseInt(req.query.page) || 0;

  // make some links
  var links = {
    self: req.originalUrl,
    next: searchItemsUrl + '?page=' + (page + 1),
    prev: page == 0 ? null : searchItemsUrl + '?page=' + (page - 1),
    first: searchItemsUrl,
    last: null
  };

  res.send({
    query: req.body,
    links: links,
    results: [{a:12}]
  });
});

module.exports = app;