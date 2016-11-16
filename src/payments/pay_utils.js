require('kip')
var request = require('request-promise')
var _ = require('lodash')

var pay_const = require('./pay_const.js')
var cc = require('./secrets/kip_cc.js')

var UserChannel = require('../chat/components/delivery.com/UserChannel')
var queue = require('../chat/components/queue-mongo')
var replyChannel = new UserChannel(queue)

/*
*
*/
function * sessionSuccesfullyPaid (foodSession) {
  // var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var lastMessageByUser = yield db.Messages.find({user_id: foodSession.order.convo_initiater.id, incoming: true}).sort({ts: -1}).limit(1).exec()
  lastMessageByUser = lastMessageByUser[0]
  foodSession.order['completed_payment'] = true
  foodSession.save()
  replyChannel.send(lastMessageByUser, 'food.done', {type: 'slack', data: {text: 'thanks, order successfully paid and submitted'}})
}

/* this would be for kip to pay for an order once the user has successfully paid stripe
*
*
*/
function * payForItemFromKip (session, guestToken) {
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/api/guest/cart/${session.merchant_id}/checkout`,
    'headers': {'Guest-Token': guestToken},
    'json': true,
    'body': session
  }

  logging.info('SENDING TO DELIVERY NOW ', JSON.stringify(opts))

  if ((process.env.NODE_ENV !== 'canary') || (process.env.NODE_ENV !== 'production' )) {
    logging.info('not going to pay for actual item outside of production')
    return 'development'
  } else {
    try {
      var response = yield request(opts)
      return response
    } catch (e) {
      response = null
      logging.error('couldnt submit payment uh oh ', JSON.stringify(e))
      return null
    }
  }
}

// pay delivery.com
module.exports.payDeliveryDotCom = function * (pay) {
  // payment amounts should match
  // total already includes tip
  if (pay.charge.amount !== Math.round(pay.order.order.total)) {
    logging.error('ERROR: Charge amounts dont match D:')
    return
  }
  // add special instructions
  pay.order.chosen_location.special_instructions = _.get(pay, 'order.chosen_location.special_instructions') ? pay.order.chosen_location.special_instructions : ''
  // build guest checkout obj

  var guestCheckout = {
    'client_id': pay_const.delivery_com_client_id,
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
    'uhau_id': 'kipthis-dot-com'
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
    guestCheckout.instructions = pay.order.chosen_location.addr.address_2
    guestCheckout.unit_number = pay.order.chosen_location.addr.address_2 || ``
    guestCheckout.city = pay.order.chosen_location.addr.city
    guestCheckout.state = pay.order.chosen_location.addr.state
    guestCheckout.zip_code = pay.order.chosen_location.addr.zip_code
  }

  logging.info('PAY OBJ ', pay)
  logging.info('GUEST CHECKOUT OBJ ', guestCheckout)

  // pos to delivery
  try {
    var response = yield payForItemFromKip(guestCheckout, pay.order.guest_token)
    return response
  } catch (err) {
    logging.error('error paying for items')
  }
}

module.exports.storeCard = function * (pay, charge) {
  // save stripe card token and info to slack team
  try {
    var slackbot = yield db.Slackbot.findOne({team_id: pay.order.team_id})
  } catch (err) {
    logging.error('error: cant find team to save stripe info')
    return
  }

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
    }
  })
  yield slackbot.save()
}
