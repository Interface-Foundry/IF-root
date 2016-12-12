/*
  Kip Pay module

      =()=
  ,/'\_||_
  ( (___  `.
  `\./  `=='
         |||
         |||
       , |||   ,                                     ,,,,,,,,,,,
      ;';' ''''' ;,;        ______;;;;______       ,'' ;  ;  ;  ''|||\///
     ,'  ________  ',      |______|;;|______|      ',,_;__;__;__;,'''/\\\
     ;,;'        ';,'        |    |;;|    |         |            |
       '.________.'           '.__|;;|__.'           '.________.'

          Mirugai                Tamago                   Ebi
       (Giant Clam)            (Cooked Egg)             (Shrimp)
*/
require('colors')
require('../kip')
require('../logging')
var payConst = require('./pay_const.js')

// base URL for pay.kipthis.com linking
const kipPayURL = kip.config.kipPayURL

if (!process.env.NODE_ENV) {
  throw new Error('you need to run kip-pay with NODE_ENV')
} else if (process.env.NODE_ENV !== 'canary') {
  var stripeID = payConst.stripe_test_id
} else if (process.env.NODE_ENV === 'canary') {
  stripeID = payConst.stripe_production_id
} else {
  stripeID = payConst.stripe_production_id
}

logging.info('using base url: ', (kip.config.kipPayURL).yellow)

// See keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require('stripe')(stripeID) // NOTE: change to production key
var path = require('path')
var _ = require('lodash')
var crypto = require('crypto')
var co = require('co')

var Payment = db.Payment

var bodyParser = require('body-parser')
var express = require('express')
var app = express()
var jsonParser = bodyParser.json()

// import kip cc
var payUtils = require('./pay_utils.js')
var coupon = require('./coupon.js')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-mongo')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

app.use('/', express.static(path.join(__dirname, 'web')))
logging.info('running kip pay from: ', __dirname)
logging.info('running in NODE_ENV', process.env.NODE_ENV)

// post a new charge for kip user
app.post('/charge', jsonParser, (req, res) => co(function * () {
  // include KEY with new POST req to /charge to verify authentic kip request
  var kipSecret = 'mooseLogicalthirteen$*optimumNimble!Cake'

  // NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM
  if ((_.get(req, 'body.kip_token') === kipSecret) && _.get(req, 'body.order.total')) {
    var body = req.body

    // get coupon %
    body = yield coupon.getCoupon(body)

    // check for order over $510 (pre coupon) not processing over $510 (pre coupon)
    if (body.order.coupon === 0.99 && body.order.total > 51000) {
      var v = {
        msg: 'Eep this order size is too large for the 99% off coupon. Please contact hello@kipthis.com with questions',
        newAcct: false,
        processing: false
      }
      res.status(500).send(v)
      return
    }

    // new payment
    var payment = new Payment({
      session_token: crypto.randomBytes(256).toString('hex'), // gen key inside object
      order: body
    })
    profOak.say(`creating new payment for team:${payment.order.team_id}`)

    yield payment.save()

    // ALREADY A STRIPE USER
    if (_.get(body, 'saved_card.customer_id')) {
      profOak.say(`paying with saved card for ${payment.order.team_id}`)
      logging.info('using saved card')
      // we have card to charge
      if (body.saved_card.card_id) {
        yield payUtils.chargeById(payment)
        logging.info('SAVED CHARGE RESULT ')

        var v = {
          newAcct: false,
          processing: true,
          msg: 'Processing charge...'
        }

        res.status(200).send(JSON.stringify(v))
      } else {
        // NEED A CARD ID!
        logging.info('NEED CARD ID!')
        v = {
          newAcct: false,
          processing: false,
          msg: 'Error: Card ID Missing!'
        }
        res.status(500).send(JSON.stringify(v))
      }
    } else {
      profOak.say(`using new card for team:${payment.order.team_id}`)
      // NEW STRIPE USER
      // return checkout LINK
      v = {
        newAcct: true,
        processing: false,
        url: kipPayURL + '?k=' + payment.session_token
      }

      res.status(200).send(JSON.stringify(v))
    }
  } else {
    logging.error('catching error in /charge', req)
    res.status(401).send('😅')
  }
}))

// get session by token
app.post('/session', jsonParser, (req, res) => co(function * () {
  if (_.get(req, 'body') && _.get(req, 'body.session_token')) {
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char
    try {
      var pay = yield Payment.findOne({session_token: t})

      // check for coupon
      if (pay.order && pay.order.order && pay.order.order.coupon) {
        pay.order.order.total = payUtils.calCoupon(pay.order.order.total, pay.order.order.coupon)
      }

      res.send(JSON.stringify(pay))
    } catch (err) {
      logging.error('catching error in /session', err)
    }
  }
}))

// this is the call back from the new credit card to do the charge
app.post('/process', jsonParser, (req, res) => co(function * () {
  if (_.get(req, 'body.token') && _.get(req, 'body.session_token')) {
    logging.info('processing new card')
    res.sendStatus(200)

    // this is a stripe token for the user inputted credit card details
    var token = req.body.token.replace(/[^\w\s]/gi, '') // clean special char
    // LOOK UP USER BY HASH TOKEN
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char

    var payment = yield Payment.findOne({session_token: t})
    profOak.say(`processing new card for team:${payment.order.team_id}`)

    // create stripe customer
    try {
      logging.info(`creating new customer and charge for, ${token}`)
      var customer = yield stripe.customers.create({
        source: token,
        description: 'Delivery.com & Kip: ' + payment.order.team_id
      })
    } catch (err) {
      logging.error('error creating stripe.customers.create', err)
    }

    // check for coupon
    if (payment.order && payment.order.order && payment.order.order.coupon) {
      var total = payUtils.calCoupon(payment.order.order.total, payment.order.order.coupon)
      total = Math.round(total)
    } else {
      total = Math.round(payment.order.order.total)
    }

    try {
      var charge = yield stripe.charges.create({
        amount: total,
        currency: 'usd',
        customer: customer.id
      })
      profOak.say(`succesfully created new stripe card and charge for team:${payment.order.team_id} in amount ${(total / 100.0).$}`)
    } catch (err) {
      logging.error('error creating charge in stripe.charges.create', err)
    }

    payment.charge = charge
    payment.save()

    // fired on new cards charged ONLY
    if (charge.status === 'succeeded') {
      try {
        // complicated for testing purposes
        if (!process.env.NODE_ENV) {
          throw new Error('you need to run kip-pay with NODE_ENV')
        } else if (process.env.NODE_ENV === 'canary') {
          // if canary we actually submit
          profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
          payment.delivery_response = yield payUtils.payDeliveryDotCom(payment)
        } else if (process.env.NODE_ENV !== 'canary') {
          // if its not canary we are running locally or on another system to test
          profOak.say(`we are doing a test order im assuming for team:${payment.order.team_id}`)
          payment.delivery_response = 'test_success'
        }
        yield payment.save()
      } catch (err) {
        logging.error('error trying to storeCard', err)
      }

      // store card since its presumably new
      try {
        yield payUtils.storeCard(payment, charge)
      } catch (err) {
        logging.error('error trying to storeCard', err)
      }

      // look up user and the last message sent to us in relation to this order
      try {
        var foodSession = yield db.Delivery.findOne({guest_token: payment.order.guest_token}).exec()
        foodSession.order['completed_payment'] = true
        yield foodSession.save()

        var finalFoodMessage = yield db.Messages.find({'source.user': foodSession.convo_initiater.id, mode: `food`, incoming: false}).sort('-ts').limit(1)
        finalFoodMessage = finalFoodMessage[0]

        // send message to user
        replyChannel.send(
          finalFoodMessage,
          'food.payment_info',
          {
            type: finalFoodMessage.origin,
            data: {
              text: 'Your order was successful and you should receive an email from `Delivery.com` soon!'
            }
          })
      } catch (err) {
        logging.error('error trying to send message to user', err)
      }

      try {
        // send success messages to order members
        yield payUtils.onSuccess(payment)
        profOak.say(`order completed for team: ${payment.order.team_id}`)
      } catch (err) {
        logging.error('error onSuccess of payment', err)
      }
    } else {
      profOak.say('if statement for status===succeeded failed, might want to check logs @graham')
      logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
      logging.error('OUTCOME: ', charge.outcome)
      logging.error('total error related to ', charge)
    }
  } else {
    res.status(500).send('charge token missing')
  }
}))

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Listening on ' + port)
})
