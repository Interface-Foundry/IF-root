var Waterline = require('waterline');
var uuid = require('uuid');

/**
 * Session collection is the database side of the node-client-session cookie
 */
var feedbackCollection = Waterline.Collection.extend({
  identity: 'feedback',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when user is added for the first time */

    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      defaultsTo: function () {
        return uuid.v4()
      }
    },

    // know which user, if logged in
    user: Waterline.isA('user_accounts'),

    // know what session the user had the problem
    session: Waterline.isA('sessions'),

    // put all the request headers and ip and everything in here for reference
    request_json: 'string',

    rating: {
      type: 'string',
      // enum: [
      //   'good',
      //   'ok',
      //   'bad'
      // ]
    },

    text: 'string'
  }
});

module.exports = feedbackCollection;
