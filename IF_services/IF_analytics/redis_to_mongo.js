/**
 * This file should be run under lower kernel priority than the webserver
 * all it does is log analytics data to the db.  boooooorring.
 * http://www.cyberciti.biz/faq/change-the-nice-value-of-a-process/
 */

var mongoose = require('mongoose');
var analyticsdb = process.env.ANALYTICS_DB || 'mongodb://localhost:27017/if';
var Analytics = require('_if_/components/IF_schemas/analytics_schema.js');
var redis = require('redis');

mongoose.connect(analyticsdb, function(err) {
  if (err) {
    console.error(err);
  }
});

// periodically dump the redis cache into the analytics db
setTimeout(function() {
  redis.lrange('analytics', function (err, docs) {
    docs.map(function(doc) {
      new Analytics(doc).save(function (err) {
        if (err) {
          console.error(err);
        }
      });
    });
  });
}, 10);