const getWaypointCounts = (waypoints,start,end) =>
  new Promise((resolve, reject) => {
    waypoints.aggregate([
      {
        $match:
        {
          'timestamp': { $exists: true, $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            waypoint: '$waypoint',
            user_id: '$user_id',
            //delivery_id: '$delivery_id',
          },
          count: { $sum: 1 },
        },
      },
      { 
        $group: {
          _id: {
            waypoint: '$_id.waypoint',
            //user_id: '$_id.user_id',
          },
          sources: {
            $addToSet: {
              source: '$_id.prov',
              num: '$count',
            },
          },
          users: { $addToSet: '$_id.user_id' }
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
          users:waypoint.users,
          total,
        };
      });
      resolve(waypoints);
    });
  });

module.exports = getWaypointCounts;
if (!module.parent) {
  require('../../../kip')
  getWaypointCounts(db.waypoints,new Date(new Date().setDate(new Date().getDate()-14)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //waypoints of past 2 weeks
}
