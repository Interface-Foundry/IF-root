const getExecSearchCounts = messages =>
  new Promise((resolve, reject) => {
    messages.aggregate([
      { $unwind: '$execute' },
      {
        $match:
        {
          'execute.mode': 'shopping',
          'execute.action': { $in: ['initial', 'modify.one', 'modify.all'] },
        },
      },
        { $group: {
          _id: {
            action: '$execute.action',
            prov: '$origin',
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
      if (err) { reject(err); return;}
      const searchCounts = {};
      result.forEach(type => {
        const typeString = type._id === 'initial' ? type._id : 'modify';
        searchCounts[typeString] = searchCounts[typeString] || {};
        searchCounts[typeString].total = searchCounts[typeString].total ?
          searchCounts[typeString].total + type.count : type.count;
        type.sources.forEach(source => {
          searchCounts[typeString][source.source] = searchCounts[typeString][source.source] ?
            searchCounts[typeString][source.source] + source.count : source.count;
        });
      });
      resolve(searchCounts);
    });
  });

module.exports = getExecSearchCounts;
