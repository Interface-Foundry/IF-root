const date = require('../../helpers/date');
const getOrderTimePlaceFrequencies = (delivery) =>
  new Promise((resolve, reject) => {
    delivery.aggregate([
      {
        $group: {
          _id: {
            time: {
              $hour: '$time_started',
            },
            location: '$chosen_location',
            prov: '$source.origin',
          },
          count: { $sum: 1 },
        },
      },
        { $group: {
          _id: {
            time: '$_id.time',
            location: '$_id.location'
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
      const orders = result.map(order => {
        const sources = order.sources.filter(source => source.source);
        const total = order.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          ordertime: order._id.time,
          orderlocation: order._id.location,
          total,
        };
      });
      resolve(orders);
    });
  });

module.exports = getOrderTimePlaceFrequencies;
if (!module.parent) {
  require('../../../kip')
  getOrderTimePlaceFrequencies(db.delivery).then(console.log.bind(console))
}
