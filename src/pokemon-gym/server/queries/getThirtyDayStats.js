const getSearchCounts = (messages) =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match: {
          ts: {
            $gt: new Date(new Date() - 31 * 24 * 3600 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$ts' },
            month: { $month: '$ts' },
            day: { $dayOfMonth: '$ts' },
            prov: '$source.origin',
          },
          count: { $sum: 1 },
        },
      },
        { $group: {
          _id: {
            year: '$_id.year',
            day: '$_id.day',
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
      if (err) { reject(err); }
      const dates = result.map(messageDate => {
        const date = new Date(messageDate._id.year, messageDate._id.month - 1, messageDate._id.day)
        const sources = messageDate.sources.filter(source => source.name);
        const total = messageDate.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          idString: date.toDateString(),
          idNumber: date,
          total,
          sources: [...sources, {
            name: 'total',
            num: total,
          }],
        };
      });
      resolve(dates);
    });
  });

module.exports = getSearchCounts;
