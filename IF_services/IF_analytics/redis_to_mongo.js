/**
 * This file should be run under lower kernel priority than the webserver
 * all it does is log analytics data to the db.  boooooorring.
 * http://www.cyberciti.biz/faq/change-the-nice-value-of-a-process/
 */

var mongoose = require('mongoose');
var analyticsdb = process.env.ANALYTICS_DB || 'mongodb://localhost:27017/if';
var Analytics = require('_if_/components/IF_schemas/analytics_schema.js');
var redis = require('redis');
var client = redis.createClient();

mongoose.connect(analyticsdb, function(err) {
  if (err) {
    console.error(err);
  }
});

// periodically dump the redis cache into the analytics db
setTimeout(function() {

  // get all the documents
  client.lrange('analytics', 0, -1, function (err, docs) {
    docs.map(function(doc_str) {
      var doc;
      try {
        doc = JSON.parse(doc_str);
      }
      catch (e){
        console.error('Error JSON.parsing analytics doc' + doc);
      }

      // save to db
      new Analytics(doc).save(function (err) {
        if (err) {
          console.error(err);
        }

        // remove from processing queue
        client.lrem('analytics', 1, doc_str, redis.print);
      });
    });
  });
}, 10);