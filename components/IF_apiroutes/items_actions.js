var express = require('express');
var app = express.Router();

var mockItems = require('./mock_items.js');
var USE_MOCK_DATA = true;

app.post('/like', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.sendStatus(200);
  }
});

module.exports = app;