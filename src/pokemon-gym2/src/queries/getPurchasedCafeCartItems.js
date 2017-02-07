const getSuccessfulCafePaymentTokens = require('./getSuccessfulCafePaymentTokens');

const getPurchasedCafeCartItems = (delivery, start, end) =>
  new Promise((resolve, reject) => {
    var successfulPayments = getSuccessfulCafePaymentTokens(db.payments, start, end)
    var paymentTokens = []
    successfulPayments.then(function(paymentArray){
      paymentTokens = paymentArray.map((payment) => payment.paymentToken)
      delivery.aggregate([
        {
          $match : { 
            time_started: { $exists: true, $gte: start, $lte: end },
            guest_token: { $exists: true, $in: paymentTokens}
          },
        },
        {
          $group: {
            _id: {
              guest_token: '$guest_token',
              items: '$order.cart',
              team_id: '$team_id',
            },
            
          },
        },
        {
          $unwind: "$_id.items",
        }
      ], (err, result) => {
        if (err) { reject(err); }
        const carts = result.map(cart => {
          return {
            item: cart._id.items,
            cartToken: cart._id.guest_token,
            team_id: cart._id.team_id,
          };
        });
        
        resolve(carts);
      });
    })
    
  });

module.exports = getPurchasedCafeCartItems;
if (!module.parent) {
  require('../../../kip')
  getPurchasedCafeCartItems(db.delivery, new Date(new Date().setDate(new Date().getDate()-365)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //cart of past year
}

