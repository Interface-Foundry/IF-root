var Promise = require("bluebird");
var mongoose = Promise.promisifyAll(require('mongoose'));
mongoose.Promise = global.Promise;
var ensureIndexes = require('mongoose-hook-ensure-indexes')
var config = require('config');
var log = require('../IF_logging/if_logger')();

if (mongoose.connection.readyState == 0) {
    mongoose.connect(config.mongodb.url, config.mongodb.options);
    var db_conn = mongoose.connection;
    db_conn.on('error', function(err) {
        log.error({
            message: 'error connecting to mongodb',
            err: err,
            config: config.mongodb
        });
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
    filename: 'activity_schema',
    single: 'Activity',
    plural: 'Activities'
}, {
    filename: 'analytics_schema',
    single: 'Analytic',
    plural: 'Analytics'
}, {
    filename: 'announcements_schema',
    single: 'Announcement',
    plural: 'Announcements'
}, {
    filename: 'anon_user_schema',
    single: 'AnonUser',
    plural: 'AnonUsers'
}, {
    filename: 'cart_schema',
    single: 'Cart',
    plural: 'Carts'
}, {
    filename: 'chatuser_schema',
    single: 'Chatuser',
    plural: 'Chatusers'
}, {
    filename: 'contest_schema',
    single: 'Contest',
    plural: 'Contests'
}, {
    filename: 'contestEntry_schema',
    single: 'ContestEntry',
    plural: 'ContestEntries'
}, {
    filename: 'email_schema',
    single: 'Email',
    plural: 'Emails'
}, {
    filename: 'instagram_schema',
    single: 'Instagram',
    plural: 'Instagrams'
}, {
    filename: 'item_schema',
    single: 'Item',
    plural: 'Items'
}, {
    filename: 'job_schema',
    single: 'Job',
    plural: 'Jobs'
}, {
    filename: 'justvisual_schema',
    single: 'JustVisual',
    plural: 'JustVisuals'
}, {
    filename: 'landmark_schema',
    single: 'Landmark',
    plural: 'Landmarks'
}, {
    filename: 'look_schema',
    single: 'Look',
    plural: 'Looks'
}, {
    filename: 'message_schema',
    single: 'Message',
    plural: 'Messages'
}, {
    filename: 'metric_schema',
    single: 'Metric',
    plural: 'Metrics'
}, {
    filename: 'product_schema',
    single: 'Product',
    plural: 'Products'
}, {
    filename: 'project_schema',
    single: 'Project',
    plural: 'Projects'
}, {
    filename: 'serverwidgets_schema',
    single: 'ServerWidget',
    plural: 'ServerWidgets'
}, {
    filename: 'slackbot_schema',
    single: 'Slackbot',
    plural: 'Slackbots'
}, {
    filename: 'group_schema',
    single: 'Group',
    plural: 'Groups'
}, {
    filename: 'sticker_schema',
    single: 'Sticker',
    plural: 'Stickers'
}, {
    filename: 'style_schema',
    single: 'Style',
    plural: 'Styles'
}, {
    filename: 'training_schema',
    single: 'TrainingData',
    plural: 'TrainingDatas'
}, {
    filename: 'twitter_schema',
    single: 'Twitter',
    plural: 'Twitters'
}, {
    filename: 'user_schema',
    single: 'User',
    plural: 'Users'
}, {
    filename: 'visit_schema',
    single: 'Visit',
    plural: 'Visits'
}, {
    filename: 'worldchat_schema',
    single: 'Worldchat',
    plural: 'Worldchats'
}, {
    filename: 'zipcode_schema',
    single: 'Zipcode',
    plural: 'Zipcodes'
}, {
    filename: 'ebayCategories_schema',
    single: 'EbayCategory',
    plural: 'EbayCategories'
}, {
    filename: 'ebayItem_schema',
    single: 'EbayItem',
    plural: 'EbayItems'
}, {
    filename: 'feed_data_schema',
    single: 'FeedData',
    plural: 'FeedData'
}, {
    filename: 'credentials_schema',
    single: 'Credential',
    plural: 'Credentials'
}];

module.exports = {
    connection: mongoose.connection,
    collection: mongoose.collection
};

/**
 * Expose all the single and plural versions
 */
schemas.map(function(schema) {
    var model = require('./' + schema.filename);
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
