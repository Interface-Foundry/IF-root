var express = require('express');
var app = express.Router();
var db = require('../IF_schemas/db');

/**
 * This should be mounted at /api/items
 */

var mockItems = require('./mock_items.js');
var USE_MOCK_DATA = true;

var defaultResponse = {
  err: null,
  status: '(⌒‿⌒)'
};

// All of these actions require an item to be present in the database
app.use('/:mongoId/:action', function(req, res, next) {
  db.Landmarks.findById(req.params.mongoId, function(err, item) {
    if (err && !global.config.isProduction) {
      return res.send({err: err});
    } else if (item) {
      return next();
    } else {
      return res.send({err: 'Could not find item'})
    }
  });
});

app.post('/:mongoId/like', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/unlike', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/comment', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/deletecomment', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/tag', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/deletetag', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/fav', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/unfav', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/reject', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/unreject', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/snap', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/deletesnap', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

app.post('/:mongoId/report', function(req, res) {
  if (USE_MOCK_DATA) {
    return res.send(defaultResponse);
  }
});

module.exports = app;