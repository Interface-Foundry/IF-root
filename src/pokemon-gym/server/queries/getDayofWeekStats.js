const date = require('../../helpers/date');
const getSearchCounts = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
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
    ], (err, result) => {
      if (err) { reject(err); }
      const days = result.map(day => {
        const sources = day.sources.filter(source => source.source);
        const total = day.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          dayString: date.daysOfWeek[day._id.day],
          dayNumber: day._id.day,
          total,
          sources: [...sources, {
            source: 'total',
            num: total,
          }],
        };
      });
      resolve(days);
    });
  });

module.exports = getSearchCounts;
