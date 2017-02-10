const date = {
  1: 'Sunday',
  2: 'Monday',
  3: 'Tuesday',
  4: 'Wednesday',
  5: 'Thursday',
  6: 'Friday',
  7: 'Saturday',
};

const getDayOfWeekStats = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match: {
          ts: {$gte: new Date(new Date().setDate(new Date().getDate()-7)) },
          incoming: {$ne: true}
        }
      },
      {
        $group: {
          _id: {
            day: {
              $dayOfWeek: '$ts',
            },
            prov: '$source.origin',
          },
          count: { $sum: 1 },
        },
      },
        { $group: {
          _id: {
            day: '$_id.day',
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
        $sort: {'_id.day': 1}
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const days = result.map(day => {
        const sources = day.sources.filter(source => source.source);
        const total = day.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          dayString: date[day._id.day],
          dayNumber: day._id.day,
          total,
          /*
          sources: [...sources, {
            source: 'total',
            num: total,
          }],
          */
        };
      });
      resolve(days);
    });
  });

module.exports = getDayOfWeekStats;
if (!module.parent) {
  require('../../../kip')
  getDayOfWeekStats(db.messages).then(console.log.bind(console))
}
