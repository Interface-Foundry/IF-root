const getSuccessfulCafePaymentTokens = (payments, start, end) =>
  new Promise((resolve, reject) => {
    payments.aggregate([
      {
        $match : { 
          "charge.status": "succeeded",
          ts: { $exists: true, $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            //order: '$order',
            //ts: '$ts',
            //charge: '$charge',
            guest_token: '$order.guest_token',
          },
        },
      },

      { 
        $group: {
          _id: {
            //order: '$_id.order',
            //ts: '$_id.ts',
            //charge: '$_id.charge',
            guest_token: '$_id.guest_token',
          },
        },
      }, 
      
    ], (err, result) => {
      if (err) { reject(err); }
      const payments = result.map(payment => {
        return {
          //order: payment._id.order,
          //ts: payment._id.ts,
          //charge: payment._id.charge,
          paymentToken: payment._id.guest_token,
        };
      });
      resolve(payments);
    });
  });

module.exports = getSuccessfulCafePaymentTokens;
if (!module.parent) {
  require('../../../kip')
  getSuccessfulCafePaymentTokens(db.payments, new Date(new Date().setDate(new Date().getDate()-365)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //cart of past year
}
