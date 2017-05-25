const _ = require('lodash')
const stripeTestID = 'sk_test_3dsHoF4cErzMfawpvrqVa9Mc'
const stripe = require('stripe')(stripeTestID)

const logging = require('../../../logging.js')

/**
 * create a charge for Stripe
 *
 * @param      {<type>}   payment  The payment
 * @return     {Promise}  { description_of_the_return_value }
 */
async function stripeChargeById (payment) {
  const total = Math.round(payment.order.order.total)

  try {
    const charge = await stripe.charges.create({
      amount: total, // Amount in cents
      currency: 'usd',
      customer: payment.order.saved_card.customer_id, // Previously stored, then retrieved
      card: payment.order.saved_card.card_id
    })
  } catch (err) {
    logging.error('error creating stripe charge', err)
  }
  return charge
}


//   if (charge) {
//     payment.charge = charge
//     yield payment.save()
//   }

//   // fired on re-used cards charged ONLY
//   if (charge.status === 'succeeded') {
//     // POST TO MONGO QUEUE SUCCESS PAYMENT
//     try {
//       profOak.say(`succesfully paid for stripe for team ${payment.order.team_id}`)
//       profOak.say(`paying for delivery.com order for ${payment.order.team_id}`)

//       // complicated for testing purposes
//       if (!process.env.NODE_ENV) {
//         throw new Error('you need to run kip-pay with NODE_ENV')
//       } else if (process.env.NODE_ENV === 'production') {
//         payment.delivery_response = yield payUtils.payDeliveryDotCom(payment)
//         profOak.say(`paid for delivery.com on \`production\` for team:${payment.order.team_id}`)
//       } else {
//         payment.delivery_response = 'test_success'
//         profOak.say(`not on \`production\`, so doing a fake charge.  test_success.`)
//       }

//       yield payment.save()
//       // yield payUtils.onSuccess(payment)
//     } catch (err) {
//       logging.error('error after charging stripe but attempting to charge delivery.com', err)
//     }
//   } else {
//     logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge)
//   }
// }
//
//
//
//
//
//
// /*
  // NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM
//   if ((_.get(req, 'body.kip_token') === kipSecret) && _.get(req, 'body.order.total')) {
//     var body = req.body

//     // .000001 prevention
//     body.order.total = Math.round(body.order.total)

//     // new payment
//     var payment = new Payment({
//       session_token: crypto.randomBytes(256).toString('hex'), // gen key inside object
//       order: body
//     })
//     profOak.say(`creating new payment for team:${payment.order.team_id}`)

//     yield payment.save()

//     // ALREADY A STRIPE USER
//     if (_.get(body, 'saved_card.customer_id')) {
//       profOak.say(`paying with saved card for ${payment.order.team_id}`)
//       logging.info('using saved card')
//       // we have card to charge
//       if (_.get(body, 'saved_card.card_id')) {
//         yield chargeById(payment)
//         logging.info('SAVED CHARGE RESULT ')

//         var respMessage = {
//           newAcct: false,
//           processing: true,
//           msg: 'Processing charge...'
//         }

//         res.status(200).send(respMessage)
//         yield payUtils.onSuccess(payment, false)
//       } else {
//         // NEED A CARD ID!
//         logging.info('NEED CARD ID!')
//         respMessage = {
//           newAcct: false,
//           processing: false,
//           msg: 'Error: Card ID Missing!'
//         }
//         res.status(500).send(respMessage)
//       }
//     } else {
//       profOak.say(`using new card for team:${payment.order.team_id}`)
//       // NEW STRIPE USER
//       // return checkout LINK
//       respMessage = {
//         newAcct: true,
//         processing: false,
//         token: payment.session_token,
//         url: kipPayURL + '?k=' + payment.session_token
//       }

//       res.status(200).send(respMessage)
//     }
//   } else {
//     logging.error('catching error in /charge', req)
//     res.status(401).send('😅')
//   }
// */