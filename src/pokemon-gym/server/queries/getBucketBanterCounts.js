const getBanterCounts = messages =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match:
        {
          bucket: 'banter',
        },
      },
      {
        $group: {
          _id: '$source.origin',
          count: {
            $sum: 1,
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); return; }
      const banterCounts = {};
      banterCounts.total = 0;
      result.forEach(source => {
        banterCounts[source._id] = source.count;
        banterCounts.total = banterCounts.total + source.count;
      });
      resolve(banterCounts);
    });
  });

module.exports = getBanterCounts;
