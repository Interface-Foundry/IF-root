const getBucketSearchCounts = messages =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      {
        $match:
        {
          bucket: 'search',
          action: {
            $in: ['initial', 'modify'],
          },
        },
      },
        { $group: {
          _id: {
            action: '$action',
            prov: '$source.origin',
          },
          count: {
            $sum: 1,
          },
        },
      },
        { $group: {
          _id: '$_id.action',
          count: {
            $sum: '$count',
          },
          sources: {
            $addToSet: {
              source: '$_id.prov', count: '$count',
            },
          },
        },
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const searchCounts = {};
      result.forEach(type => {
        searchCounts[type._id] = searchCounts[type._id] || {};
        searchCounts[type._id].total = type.count;
        type.sources.forEach(source => {
          searchCounts[type._id][source.source] = source.count;
        });
      });
      resolve(searchCounts);
    });
  });

module.exports = getBucketSearchCounts;
