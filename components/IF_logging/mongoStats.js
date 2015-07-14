var db = require('db');
var logger = require('./if_logger');

db.map(function(schema) {
    schema.collection.stats(function(e, s) {
        if (typeof s !== 'undefined') {
            logger.log(s)
        }
    })
});