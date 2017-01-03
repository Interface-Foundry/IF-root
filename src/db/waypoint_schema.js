var mongoose = require('mongoose');

var waypointsSchema = mongoose.Schema({

  delivery_id: String,
  user_id: String,
  waypoint: Number,

  data: {},

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Waypoints', waypointsSchema);

module.exports.log = function (wp, delivery_id, user_id, data) {
  var obj = {
    waypoint: wp,
    delivery_id: delivery_id,
    user_id: user_id,
    data: data
  };

  (new module.exports(obj)).save();
};
