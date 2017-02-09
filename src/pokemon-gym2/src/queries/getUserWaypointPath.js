const getUserWaypointPath = (waypoints,user) =>
  new Promise((resolve, reject) => {
    waypoints.aggregate([
      {
        $match:
        {
          'user_id': user,
          'waypoint': { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            delivery_id: '$delivery_id',
            waypoint: '$waypoint',
            timestamp: '$timestamp',
            user_id: '$user_id',
          },
        },
      },
      {
        $sort: {'_id.timestamp': 1}
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const waypoints = result.map(waypoint => {
        return {
          waypoint: waypoint._id.waypoint,
          timestamp: waypoint._id.timestamp,
          user_id: waypoint._id.user_id,
          delivery_id: waypoint._id.delivery_id,
        };
      });
      resolve(waypoints);
    });
  });

module.exports = getUserWaypointPath;
if (!module.parent) {
  require('../../../kip')
  getUserWaypointPath(db.waypoints, 'U3620AA5T').then(console.log.bind(console)) //waypoints of past 2 weeks
}
