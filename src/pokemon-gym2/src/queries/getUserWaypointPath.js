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
        $sort: {'timestamp': 1}
      },
      {
        $group: {
          _id: {
            delivery_id: '$delivery_id',
            //waypoint: '$waypoint',
            //timestamp: '$timestamp',
            user_id: '$user_id',
          },
          waypoints: { $push: '$waypoint' }
        },
      },
      
    ], (err, result) => {
      if (err) { reject(err); }
      const waypoints = result.map(waypoint => {
        return {
          //timestamp: waypoint._id.timestamp,
          user_id: waypoint._id.user_id,
          delivery_id: waypoint._id.delivery_id,
          waypoints: waypoint.waypoints.join('\u27A1 '),
        };
      });
      resolve(waypoints);
    });
  });

module.exports = getUserWaypointPath;
if (!module.parent) {
  require('../../../kip')
  getUserWaypointPath(db.waypoints, 'U3620AA5T').then(console.log.bind(console)) 
}
