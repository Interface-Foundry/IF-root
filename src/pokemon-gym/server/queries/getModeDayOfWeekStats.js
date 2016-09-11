const date = require('../../helpers/date');
const getSearchCounts = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match:
        {
          execute: { $exists: true },
        },
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
              name: '$_id.prov',
              num: '$count',
            },
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); return; }
      const days = result.map(day => {
        const sources = day.sources.filter(source => source.name);
        const total = day.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          idString: date.daysOfWeek[day._id.day],
          idNumber: day._id.day,
          total,
          sources: [...sources, {
            name: 'total',
            num: total,
          }],
        };
      });
      resolve(days);
    });
  });

module.exports = getSearchCounts;
