const date = require('../../helpers/date');
const getWaypointCounts = (waypoints) =>
  new Promise((resolve, reject) => {
    waypoints.aggregate([
      {
        $group: {
          _id: {
            waypoint: '$waypoint',
            //user_id: '$user_id',
            //delivery_id: '$delivery_id',
          },
          count: { $sum: 1 },
        },
      },
      { 
        $group: {
          _id: {
            waypoint: '$_id.waypoint',
          },
          sources: {
            $addToSet: {
              source: '$_id.prov',
              num: '$count',
            },
          },
        },
      },
      {
        $sort: {'_id.waypoint': 1}
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const waypoints = result.map(waypoint => {
        const sources = waypoint.sources.filter(source => source.source);
        const total = waypoint.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          waypoint: waypoint._id.waypoint,
          total,
        };
      });
      resolve(hours);
    });
  });

module.exports = getWaypointCounts;
if (!module.parent) {
  require('../../../kip')
  getWaypointCounts(db.waypoints).then(console.log.bind(console))
}
