const constants = require('../payments/payment_constants.js')
const logging = require('../../../logging.js')

var db
const dbReady = require('../../db')
dbReady.then((models) => { db = models; })

/**
 * create a charge for Stripe
 *
 * @param      {<type>}   payment  The payment
 * @return     {Promise}  { description_of_the_return_value }
 */


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
//
//
//
/**
 * post request to pay for delivery.com with kip credit card
 * @param {object} session - session info with address/names/etc
 * @param {string} guestToken - guestToken associated with the delivery.com cart
 * @returns {object} response - response from delivery.com with info about order. if it returns 'development', running in test mode
 */
async function payDeliveryDotCom (session, guestToken) {
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/api/guest/cart/${session.merchant_id}/checkout`,
    'headers': {'Guest-Token': guestToken},
    'json': true,
    'body': session
  }

  logging.info('SENDING TO DELIVERY NOW ', opts)

  if (process.env.NODE_ENV === 'production') {
    try {
      var response = await request(opts)
      return response
    } catch (err) {
      logging.error('couldnt submit payment to delivery.com', err)
      return null
    }
  } else {
    logging.error('NOT GOING TO PAY FOR ORDER IN DEV OR TEST MODE, SWITCH TO NODE_ENV=production')
    return 'development'
  }
}


/**
 * pays for delivery.com using various smaller functionality, uses cc from
 * kubernetes secrets in prod
 *
 * @param      {object}  pay     - session info with address/names/etc
 * @return     {object}  response - response we get from payForItemFromKip
 *                       function
 */
async function payCafeOrder (pay) {
  // payment amounts should match
  // total already includes tip

  logging.info(`PAY TOTAL: ${pay.order.order.total}, PAY CHARGED ${pay.charge.amount}`)

  // check for coupon
  var total = Math.round(pay.order.order.total)

  if (pay.charge.amount !== total) {
    logging.error('ERROR: Charge amounts dont match D:', pay, total)
    throw new Error('ERROR: Charge amounts dont match')
  }

  // add special instructions
  pay.order.chosen_location.special_instructions = _.get(pay, 'order.chosen_location.special_instructions') ? pay.order.chosen_location.special_instructions : ''
  // build guest checkout obj

  var guestCheckout = {
    'client_id': payConst.delivery_com_client_id,
    'order_type': pay.order.order.order_type,
    'order_time': new Date().toISOString(),
    'payments': [
      {
        'type': 'credit_card',
        'card': {
          'cc_number': cc.kip.cc_number,
          'exp_year': cc.kip.exp_year,
          'exp_month': cc.kip.exp_month,
          'cvv': cc.kip.cvv,
          'billing_zip': cc.kip.billing_zip,
          'save': false
        }
      }
    ],
    'sms_notify': true,
    'isOptingIn': false,
    'phone_number': pay.order.chosen_location.phone_number,
    'merchant_id': pay.order.chosen_restaurant.id,
    'first_name': pay.order.convo_initiater.first_name,
    'last_name': pay.order.convo_initiater.last_name,
    'email': pay.order.convo_initiater.email,
    'uhau_id': 'kipthis-dot-com',
    'tip': pay.order.order.tip
  }

  // limit special delivery instructions to 100 char
  if (pay.order.chosen_location.special_instructions) {
    var si = pay.order.chosen_location.special_instructions
    if (si.length > 100) {
      si = si.substring(0, 100)
    }
    guestCheckout.instructions = si
  } else {
    guestCheckout.instructions = ''
  }

  // for physical delivery
  if (pay.order.chosen_location.addr) {
    guestCheckout.street = pay.order.chosen_location.addr.address_1
    guestCheckout.unit = pay.order.chosen_location.addr.address_2 || ``
    guestCheckout.city = pay.order.chosen_location.addr.city
    guestCheckout.state = pay.order.chosen_location.addr.state
    guestCheckout.zip_code = pay.order.chosen_location.addr.zip_code
  }

  // pos to delivery
  try {
    pay.delivery_post = guestCheckout
    pay.save()
    profOak.say(`paying for delivery.com for team:${pay.order.team_id} total amount: ${pay.order.order.total} with tip ${pay.delivery_post.tip}`)
    var response = await payForItemFromKip(guestCheckout, pay.order.guest_token)
    logging.info('Delivery.com Guest Checkout Res: ', response)
    pay.delivery_raw_response = response
    pay.save()
    return response
  } catch (err) {
    logging.error('error paying for items')
  }
}



/**
 * this will save a new card into the slackbot.meta.payments area with who used
 * it and stripe details
 *
 * @param      {object}   pay     - session info with address/names/etc
 * @param      {object}   charge  - charge object from stripe
 * @return     {Promise}  { description_of_the_return_value }
 */
async function sendBackToStoreOnSlackbot (pay, charge) {
  // save stripe card token and info to slack team

  try {
    var slackbot = await db.Slackbot.findOne({team_id: pay.order.team_id})
  } catch (err) {
    logging.error('error: cant find team to save stripe info')
    return
  }

  var companyCard = (slackbot.meta.office_assistants.find(u => u === pay.order.convo_initiater.id)) ? true : false

  // update stripe / push cards into array
  if (!slackbot.meta.payments) {
    slackbot.meta.payments = []
    await slackbot.save()
  }

  // save card / stripe acct to slack team
  slackbot.meta.payments.push({
    vendor: 'stripe',
    customer_id: charge.source.customer,
    card: {
      card_id: charge.source.id,
      brand: charge.source.brand, // visa, mastercard, etc
      exp_month: charge.source.exp_month,
      exp_year: charge.source.exp_year,
      last4: charge.source.last4,
      address_zip: charge.source.address_zip,
      email: charge.source.name // this should work...
    },
    added_by: pay.order.convo_initiater.id,
    company_card: companyCard,
    date_added: Date.now()
  })
  await slackbot.save()
}

async function sendInternalCheckoutEmail (invoice, baseUrl) {
  logging.info('all payments complete')
  var paidEmail = await db.Emails.create({
    recipients: 'hannah.katznelson@gmail.com',
    sender: 'hello@kipthis.com',
    subject: 'Payment Collected!',
    template_name: 'kip_order_process',
    cart: invoice.cart
  })

  const cart = await db.Carts.findOne({id: invoice.cart.id}).populate('items').populate('members').populate('leader').populate('address')

  var itemsByUser = {}
  cart.items.map(function (item) {
    if (!itemsByUser[item.added_by]) itemsByUser[item.added_by] = [item]
    else itemsByUser[item.added_by].push(item)
  })
  var nestedItems = []
  Object.keys(itemsByUser).map(function (k) {
    nestedItems.push(itemsByUser[k])
  })

  var totalItems = cart.items.reduce(function (a, b) {
    return a + b.quantity
  }, 0)

  await paidEmail.template('kip_order_process', {
    username: cart.leader.name || cart.leader.email_address,
    baseUrl: baseUrl,
    id: cart.id,
    items: nestedItems,
    total: '$' + invoice.total.toFixed(2),
    cart: cart,
    totalItems: totalItems,
    date: paidEmail.sent_at,
    users: cart.members,
    checkoutUrl: cart.affiliate_checkout_url || www.kipthis.com,
    address: cart.address
  })
  logging.info('sending checkout email to hello@kipthis.com')
  await paidEmail.send()
}

module.exports = {
  sendInternalCheckoutEmail: sendInternalCheckoutEmail
}
