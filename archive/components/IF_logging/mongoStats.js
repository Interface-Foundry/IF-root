var db = require('db');
var log = require('./if_logger')();

db.map(function(schema) {
    schema.collection.stats(function(e, s) {
        if (typeof s !== 'undefined') {
            // collapse some data into single strings because it's annoying in kibana
            if (s.indexDetails) {
                s.indexDetails = JSON.stringify(s.indexDetails);
            }

            if (s.wiredTiger) {
                s.wiredTiger = JSON.stringify(s.wiredTiger);
            }

            log(s)
        }
    })
});
