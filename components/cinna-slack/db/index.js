var promisify = require('promisify-node');
var mongoose = promisify(require('mongoose'));
mongoose.Promise = global.Promise;
var ensureIndexes = require('mongoose-hook-ensure-indexes')
var config = require('../config');
var kip = require('../kip');

if (mongoose.connection.readyState == 0) {
    mongoose.connect(config.mongodb.url);
    var db_conn = mongoose.connection;
    db_conn.on('error', function(err) {
        kip.error(err);
    });
    db_conn.on('open', function() {
        console.log('connected to mongodb', config.mongodb.url);
    });
}

/**
 * This file lets us do things like:
 * db.Users.find({})
 * var user = new db.User()
 */

/**
 * Schema definition
 * @type {{filename: string, single: string, plural: string}[]}
 */
var schemas = [{
    filename: 'analytics_schema',
    single: 'Analytic',
    plural: 'Analytics'
}, {
    filename: 'cart_schema',
    single: 'Cart',
    plural: 'Carts'
}, {
    filename: 'chatuser_schema',
    single: 'Chatuser',
    plural: 'Chatusers'
}, {
    filename: 'email_schema',
    single: 'Email',
    plural: 'Emails'
}, {
    filename: 'item_schema',
    single: 'Item',
    plural: 'Items'
}, {
    filename: 'job_schema',
    single: 'Job',
    plural: 'Jobs'
}, {
    filename: 'message_schema',
    single: 'Message',
    plural: 'Messages'
}, {
    filename: 'pubsub_schema',
    single: 'PubSub',
    plural: 'PubSubs'
}, {
    filename: 'slackbot_schema',
    single: 'Slackbot',
    plural: 'Slackbots'
}];

module.exports = {
    connection: mongoose.connection,
    collection: mongoose.collection
};

/**
 * Expose all the single and plural versions
 */
schemas.map(function(schema) {
    try {
    	var model = require('./' + schema.filename);
    } catch(e) {
      console.error('Error setting up schema ' + schema.filename);
      console.error(e);
      return;
    }
    module.exports[schema.single] = model;
    module.exports[schema.plural] = model;
    module.exports[schema.plural.toLowerCase()] = model;
    model.schema.plugin(ensureIndexes, {
        mongoose: mongoose
    });
});


/**
 * Expose a function called "map" which iterates over each collection.
 */
module.exports.map = function(cb) {
    schemas.map(function(schema) {
        return module.exports[schema.single];
    }).map(cb);
};
