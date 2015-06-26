var mongoose = require('mongoose');
var config = global.config || require('config');

if (mongoose.connection.readyState == 0) {
  mongoose.connect(config.mongodb.url);
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
var schemas = [
  {filename: 'activity_schema', single: 'Activity', plural: 'Activities'},
  {filename: 'analytics_schema', single: 'Analytic', plural: 'Analytics'},
  {filename: 'announcements_schema', single: 'Announcement', plural: 'Announcements'},
  {filename: 'anon_user_schema', single: 'AnonUser', plural: 'AnonUsers'},
  {filename: 'contest_schema', single: 'Contest', plural: 'Contests'},
  {filename: 'contestEntry_schema', single: 'ContestEntry', plural: 'ContestEntries'},
  {filename: 'geozip_schema', single: 'GeoZip', plural: 'GeoZips'},
  {filename: 'instagram_schema', single: 'Instagram', plural: 'Instagrams'},
  {filename: 'landmark_schema', single: 'Landmark', plural: 'Landmarks'},
  {filename: 'project_schema', single: 'Project', plural: 'Projects'},
  {filename: 'serverwidgets_schema', single: 'ServerWidget', plural: 'ServerWidgets'},
  {filename: 'sticker_schema', single: 'Sticker', plural: 'Stickers'},
  {filename: 'style_schema', single: 'Style', plural: 'Styles'},
  {filename: 'twitter_schema', single: 'Twitter', plural: 'Twitters'},
  {filename: 'user_schema', single: 'User', plural: 'Users'},
  {filename: 'visit_schema', single: 'Visit', plural: 'Visits'},
  {filename: 'worldchat_schema', single: 'Worldchat', plural: 'Worldchats'}
];

module.exports = {
  connection: mongoose.connection
};

/**
 * Expose all the single and plural versions
 */
schemas.map(function(schema) {
  var model = require('./'  + schema.filename);
  module.exports[schema.single] = model;
  module.exports[schema.plural] = model;
});
