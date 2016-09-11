const date = require('../../helpers/date');
const getSearchCounts = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: '$ts',
            },
            prov: '$source.origin',
          },
          count: { $sum: 1 },
        },
      },
        { $group: {
          _id: {
            month: '$_id.month',
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
      const months = result.map(month => {
        const sources = month.sources.filter(source => source.name);
        const total = month.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          idString: date.months[month._id.month],
          idNumber: month._id.month,
          total,
          sources: [...sources, {
            name: 'total',
            num: total,
          }],
        };
      });
      resolve(months);
    });
  });

module.exports = getSearchCounts;
