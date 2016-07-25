var mongoose = require('mongoose');

/**
 * pub sub stuff for Exactly Once message queue
 * This works because "In MongoDB, a write operation is atomic on the level of a single document, even if the operation modifies multiple embedded documents within a single document."
 * https://docs.mongodb.com/v3.0/core/write-operations-atomicity/
 * also because we can upsert

here is a subway car.

 __________________________________________________________________________
|___   _____     ____     _____     ____     _____     ____     _____   ___|
|| |  |__|__|   |____|   |__|__|   |____|   |__|__|   ||---|   |__|__|  | ||
|| |  |||||||   |    |   |||||||   |    |   |||||||   |----|   |||||||  | ||
||_|  |||||||   |____|   |||||||   |____|   |||||||   |____|   |||||||  |_||
|     |--|--|            |--|--|            |--|--|            |--|--|     |
|     |  |  |            |  |  |            |  |  |            |  |  |     |
|     |  |  |            |  |  |            |  |  |            |  |  |     |
|_____|__|__|____________|__|__|____________|__|__|____________|__|__|_____|
    /-\----/-\                                                /-\----/-\
    | |    | |                                                | |    | |
    \-/----\-/                                                \-/----\-/
R-68, R-68a (1986-8, 1988-9)
 */
var pubSubSchema = mongoose.Schema({
    _id: String,  // 🚨 not ObjectId 🚨 this is so we have control over ids to implement only-once queue logic

    topic: {
      type: String,
      required: true,
      index: true
    },

    data: {},

    //
    // Meta data
    //

    // has the message been dispatched for processing?
    dispatched: {
      type: Boolean,
      default: false,
      index: true
    },

    // When was it dispatched (need it to re-try if message not handled in 10 seconds or something)
    dispatch_time: {
      type: Date
    },

    // Number of time to re-try dispatching
    retries: {
      type: Number,
      default: 0
    },

    // the message has been processed.  This can be safely archived now.
    done: {
      type: Boolean,
      default: false
    }
});

pubSubSchema.methods.ack = function() {
  this.done = true;
  return this.save();
}

var PubSub = mongoose.model('PubSub', pubSubSchema, 'pubsubs');

module.exports = PubSub;
