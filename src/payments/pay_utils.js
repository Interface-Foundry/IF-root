require('../logging')
var request = require('request-promise')
var _ = require('lodash')

var payConst = require('./pay_const.js')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

if (process.env.NODE_ENV === 'production') {
  var cc = require('./secrets/kip_cc.js')
} else {
  cc = payConst.cc
}

/**
 * post request to pay for delivery.com with kip credit card
 * @param {object} session - session info with address/names/etc
 * @param {string} guestToken - guestToken associated with the delivery.com cart
 * @returns {object} response - response from delivery.com with info about order. if it returns 'development', running in test mode
 */
function * payForItemFromKip (session, guestToken) {
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
      var response = yield request(opts)
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
 * pays for delivery.com using various smaller functionality, uses cc from kubernetes secrets in prod
 * @param {object} pay - session info with address/names/etc
 * @returns {object} response - response we get from payForItemFromKip function
 */
function * payDeliveryDotCom (pay) {
  // payment amounts should match
  // total already includes tip

  logging.info(`PAY TOTAL: ${pay.order.order.total}, PAY CHARGED ${pay.charge.amount}`)

  // check for coupon
  var total = Math.round(pay.order.order.total)

  if (pay.charge.amount !== total) {
    logging.error('ERROR: Charge amounts dont match D:', pay, total)
    return
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
    var response = yield payForItemFromKip(guestCheckout, pay.order.guest_token)
    logging.info('Delivery.com Guest Checkout Res: ', response)
    pay.delivery_raw_response = response
    pay.save()
    return response
  } catch (err) {
    logging.error('error paying for items')
  }
}

/**
 * this will save a new card into the slackbot.meta.payments area with who used it and stripe details
 * @param {object} pay - session info with address/names/etc
 * @param {object} charge - charge object from stripe
 */
function * storeCard (pay, charge) {
  // save stripe card token and info to slack team
  try {
    var slackbot = yield db.Slackbot.findOne({team_id: pay.order.team_id})
  } catch (err) {
    logging.error('error: cant find team to save stripe info')
    return
  }

  var companyCard = (slackbot.meta.office_assistants.find(u => u === pay.order.convo_initiater.id)) ? true : false

  // update stripe / push cards into array
  if (!slackbot.meta.payments) {
    slackbot.meta.payments = []
    yield slackbot.save()
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
  yield slackbot.save()
}

/**
 * communicate to slack to close up messages after stripe charge and delivery.com payment
 * @param {object} payment - object with guest_token related to the charge
 * @param {boolean} newCard - whether new card was used
 */
function * onSuccess (payment, newCard) {
  var status = newCard ? 'new_credit_card' : 'previous_credit_card'
  try {
    var opts = {
      method: `POST`,
      uri: `${kip.config.slack.internal_host}/cafeorder`,
      json: true,
      body: {
        'status': status,
        'guest_token': payment.order.guest_token
      }
    }
    logging.debug('posting to ', kip.config.slack.internal_host)
    yield request(opts)
  } catch (err) {
    logging.error('on success messages broke', err)
  }
}

module.exports = {
  onSuccess: onSuccess,
  payDeliveryDotCom: payDeliveryDotCom,
  storeCard: storeCard
}
