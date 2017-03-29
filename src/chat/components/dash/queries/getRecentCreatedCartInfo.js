const getRecentCreatedCartInfo = (carts) =>
  new Promise((resolve, reject) => {
    carts.aggregate([
      {
        $project: {
          year: { $year: new Date(new Date().setDate(new Date().getDate())) },
          cart_size: { $size: { "$ifNull": [ "$items", [] ] } },
          items: '$items',
          created_date: '$created_date',
          created_date_year: { $year: '$created_date'},
          slack_id: '$slack_id',
          is_from_current_year: {$cmp: ['$created_date_year', '$year']}
        }
      },
      {
        $sort: {created_date_year: -1}
      },
      {
        $match : { 
          is_from_current_year: { $gte: 0 },
        },
      },
      /*
      {
        $match : { 
          purchased_date: { $exists: true, $gte: year, $lte: new Date(new Date().setDate(new Date().getDate())) },
        },
      },
      {
        $group: {
          _id: {
            items: '$amazon.CartItems',
            id: '$slack_id'
          },
        },
      },

      { 
        $group: {
          _id: {
            items: '$_id.items',
            id: '$_id.id'
          },
        },
      }, 
*/

    ], (err, result) => {
      if (err) { reject(err); }
      const carts = result.map(cart => {
        return {
          year: cart.year,
          cart_size: cart.cart_size,
          items: cart.items,
          created_date: cart.created_date,
          created_date_year: cart.created_date_year,
          slack_id: cart.slack_id,
          is_from_current_year: cart.is_from_current_year,
        };
      });
      resolve(carts);
    });
  });

module.exports = getRecentCreatedCartInfo;
if (!module.parent) {
  require('../../../../kip')
  getRecentCreatedCartInfo(db.carts).then(console.log.bind(console)) //cart of past year
}
