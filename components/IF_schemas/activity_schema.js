var mongoose = require('mongoose');
var Promise = require('bluebird');

/**
 * Log activity for activity feeds
 */
var activitySchema = mongoose.Schema({
  // mongoIds of all users involved
  userIds: [String],

  // mongoIds of all landmarks involved
  landmarkIds: [String],

  activityTime: {
    type: Date,
    default: Date.now
  },

  // an identifier such as fave, follow, etc
  activityAction: String,

  // free-form data
  data: {},

  // can others see it
  publicVisible: {
    type: Boolean,
    default: true
  },
  privateVisible: {
    type: Boolean,
    default: true
  },

  // which users have seen this
  seenBy: [String]
});

/**
 * Adds a specified userMongoId to the array.  Does not save it, so you should call save() yourself.
 * @param userMongoId
 */
activitySchema.methods.addUser = function(userMongoId) {
  if (this.userIds.indexOf(userMongoId) < 0) {
    this.userIds.push(userMongoId);
  }
};


var Activity = mongoose.model('Activity', activitySchema);

/**
 * Finds all the activity for a specified user
 * @param userId
 * @param callback
 */
Activity.findByUserId = function(userId, callback) {
  var query = Activity.find({
    userIds: userId
  });

  if (typeof callback === 'function') {
    query.exec(callback);
  } else {
    return query;
  }
};

/**
 * Finds all the activity for a specified landmark
 * @param landmarkId
 * @param callback
 */
Activity.findByLandmarkId = function(landmarkId, callback) {
  var query = Activity.find({
    landmarkIds: landmarkId
  });

  if (typeof callback === 'function') {
    query.exec(callback);
  } else {
    return query;
  }
};

module.exports = Activity;