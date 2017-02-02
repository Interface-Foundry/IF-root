const getOrderTimePlaceFrequencies = (delivery, start, end) =>
  new Promise((resolve, reject) => {
    delivery.aggregate([
      {
        $match:
        {
          'time_started': { $exists: true, $gte: start, $lte: end },
          'chosen_location.address_1': { $exists: true}
          
        },
      },
      {
        $group: {
          _id: {
            hour: {
              $hour: '$time_started',
            },
            address: '$chosen_location.address_1',
            city: '$chosen_location.city',
            state: '$chosen_location.state',
            zip: '$chosen_location.zip_code',
            prov: '$source.origin',
            //latitude: '$chosen_location.latitude',
            //longitude: '$chosen_location.longitude',
          },
          count: { $sum: 1 },
        },
      },
      { $group: {
          _id: {
            hour: '$_id.hour',
            address: '$_id.address',
            city: '$_id.city',
            state: '$_id.state',
            zip: '$_id.zip',
            //latitude: '$_id.latitude',
            //longitude: '$_id.longitude',
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
        $sort: {'_id.hour': 1}
      },
    ], (err, result) => {
      if (err) { reject(err); }
      const orders = result.map(order => {
        const sources = order.sources.filter(source => source.source);
        const total = order.sources.reduce((prevSource, source) =>
          ({ num: prevSource.num + source.num })).num;

        return {
          hour: order._id.hour,
          address: order._id.address,
          city: order._id.city,
          state: order._id.state,
          zip: order._id.zip,
          //latitude: order._id.latitude,
          //longitude: order._id.longitude,
          total,
        };
      });
      resolve(orders);
    });
  });

module.exports = getOrderTimePlaceFrequencies;
if (!module.parent) {
  require('../../../kip')
  getOrderTimePlaceFrequencies(db.delivery, new Date(new Date().setDate(new Date().getDate()-7)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //orders of past week
}
