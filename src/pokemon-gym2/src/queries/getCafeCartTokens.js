const getSuccessfulCafePayments = require('./getSuccessfulCafePaymentsTokens');

const getCafeCartToken = (delivery, start, end) =>
  new Promise((resolve, reject) => {
    delivery.aggregate([
      {
        $match : { 
          time_started: { $exists: true, $gte: start, $lte: end },
          guest_token: { $exists: true, }
        },
      },
      {
        $group: {
          _id: {
            guest_token: '$guest_token',
            //items: '$order.cart'
          },
          
        },
      },
/*
      {
        $unwind: "$_id.items", 
      },
*/
    ], (err, result) => {
      if (err) { reject(err); }
      const carts = result.map(cart => {
        return {
          //item: cart._id.items,
          cartToken: cart._id.guest_token,

        };
      });
      
      resolve(carts);
    });
  });

module.exports = getCafeCartToken;
if (!module.parent) {
  require('../../../kip')
  getCafeCartToken(db.delivery, new Date(new Date().setDate(new Date().getDate()-28)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //cart of past half year
 
}

