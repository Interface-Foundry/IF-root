const getModeBanterCounts = messages =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match:
        {
          'execute.mode': { $exists: false },
        },
      },
        { $group: {
          _id: {
            source: '$origin',
          },
          count: {
            $sum: 1,
          },
        },
      },
        { $group: {
          _id: '$_id.source',
          count: {
            $sum: '$count',
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const banterCounts = {};
      banterCounts.total = 0;
      result.filter(source => source._id)
        .forEach(source => {
          banterCounts[source._id] = source.count;
          banterCounts.total = banterCounts.total + source.count;
        });
      resolve(banterCounts);
    });
  });

module.exports = getModeBanterCounts;
