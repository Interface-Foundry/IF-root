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
} else if (process.env.NODE_ENV === 'production') {
  var stripeID = payConst.stripe_production_id
} else if (process.env.NODE_ENV !== 'production') {
  stripeID = payConst.stripe_test_id
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


// import kip cc
var payUtils = require('./pay_utils.js')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-direct')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

app.use(bodyParser.json())
app.use('/', express.static(path.join(__dirname, 'web')))
logging.info('running kip pay from: ', __dirname)
logging.info('running in NODE_ENV', process.env.NODE_ENV)


app.get('/test', (req, res) => co(function * () {
  res.status(200).send({'test': 'passed'})
}))


// post a new charge for kip user
app.post('/charge', (req, res) => co(function * () {
  // include KEY with new POST req to /charge to verify authentic kip request
  var kipSecret = 'mooseLogicalthirteen$*optimumNimble!Cake'

  // NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM
  if ((_.get(req, 'body.kip_token') === kipSecret) && _.get(req, 'body.order.total')) {
    var body = req.body

    // .000001 prevention
    body.order.total = Math.round(body.order.total)

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
      if (_.get(body, 'saved_card.card_id')) {
        yield chargeById(payment)
        logging.info('SAVED CHARGE RESULT ')

        var respMessage = {
          newAcct: false,
          processing: true,
          msg: 'Processing charge...'
        }

        res.status(200).send(respMessage)
        yield payUtils.onSuccess(payment, false)
      } else {
        // NEED A CARD ID!
        logging.info('NEED CARD ID!')
        respMessage = {
          newAcct: false,
          processing: false,
          msg: 'Error: Card ID Missing!'
        }
        res.status(500).send(respMessage)
      }
    } else {
      profOak.say(`using new card for team:${payment.order.team_id}`)
      // NEW STRIPE USER
      // return checkout LINK
      respMessage = {
        newAcct: true,
        processing: false,
        token: payment.session_token,
        url: kipPayURL + '?k=' + payment.session_token
      }

      res.status(200).send(respMessage)
    }
  } else {
    logging.error('catching error in /charge', req)
    res.status(401).send('😅')
  }
}))

// get session by token
app.post('/session', (req, res) => co(function * () {
  if (_.get(req, 'body') && _.get(req, 'body.session_token')) {
    var token = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char
    try {
      var pay = yield Payment.findOne({session_token: token})
      res.send(pay)
    } catch (err) {
      logging.error('catching error in /session', err)
    }
  }
}))

// this is the call back from the new credit card to do the charge
app.post('/process', (req, res) => co(function * () {
  // error checking fisrt
  if (!_.has(req, 'body.token')) {
    logging.error('req.body missing token', req.body)
    return res.sendStatus(500)
  }

  if (!_.has(req, 'body.session_token')) {
    logging.error('req.body missing session_token', req.body)
    return res.sendStatus(500)
  }

  logging.info('processing new card')
  logging.data('__NEW CARD__', req.body)
  res.sendStatus(200)

  // this is a stripe token for the user inputted credit card details
  var token = req.body.token.replace(/[^\w\s]/gi, '') // clean special char
  // LOOK UP USER BY HASH TOKEN
  var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char

  var payment = yield Payment.findOne({session_token: t})

  if (!_.get(payment, 'order.team_id')) {
    logging.data('payment.order keys', _.keys(payment.order))
    return logging.error('payment has no order.team_id', payment)
  }

  if (!_.get(payment, 'order.order.total')) {
    logging.data('payment.order.order keys', _.keys(payment.order.order))
    return logging.error('payment has no order.order.total', payment)
  }

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

  // already have coupon
  var total = Math.round(payment.order.order.total)

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
  if (charge.status !== 'succeeded') {
    profOak.say('if statement for status===succeeded failed, might want to check logs @graham')
    logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
    logging.error('OUTCOME: ', charge.outcome)
    logging.error('total error related to ', charge)
    return
  }

  try {
    // complicated for testing purposes
    if (!process.env.NODE_ENV) {
      throw new Error('you need to run kip-pay with NODE_ENV')
    } else if (process.env.NODE_ENV === 'production') {
      // if production we actually submit to
      profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
      payment.delivery_response = yield payUtils.payDeliveryDotCom(payment)
    } else if (process.env.NODE_ENV !== 'production') {
      // if its not production we are running locally or on another system to test
      profOak.say(`we are doing a test order im assuming for team:${payment.order.team_id}`)
      payment.delivery_response = 'test_success'
    }
    yield payment.save()
  } catch (err) {
    logging.error('error trying to storeCard', err)
    return
  }

  // store card since its presumably new
  try {
    yield payUtils.storeCard(payment, charge)
  } catch (err) {
    logging.error('error trying to storeCard', err)
    return
  }

  // look up user and the last message sent to us in relation to this order
  try {
    var foodSession = yield db.Delivery.findOne({guest_token: payment.order.guest_token}).exec()
    foodSession.order['completed_payment'] = true
    yield foodSession.save()
  } catch (err) {
    logging.error('error trying to send message to user', err)
    return
  }

  try {
    // send success messages to order members
    yield payUtils.onSuccess(payment, true)
    profOak.say(`order completed for team: ${payment.order.team_id}`)
  } catch (err) {
    logging.error('error onSuccess of payment', err)
  }
}))

function * chargeById (payment) {
  // make a charge by saved card ID
  try {
    profOak.say(`creating stripe charge for ${payment.order.saved_card.saved_card}`)
    logging.info('creating charge by ID ')

    var total = Math.round(payment.order.order.total)

    var charge = yield stripe.charges.create({
      amount: total, // Amount in cents
      currency: 'usd',
      customer: payment.order.saved_card.customer_id, // Previously stored, then retrieved
      card: payment.order.saved_card.card_id
    })

    profOak.say(`succesfully created new stripe charge for team: ${payment.order.team_id} in amount ${(total / 100.0).$}`)
  } catch (err) {
    logging.error('error in chargeById', err)
  }

  if (charge) {
    payment.charge = charge
    yield payment.save()
  }

  // fired on re-used cards charged ONLY
  if (charge.status === 'succeeded') {
    // POST TO MONGO QUEUE SUCCESS PAYMENT
    try {
      profOak.say(`succesfully paid for stripe for team ${payment.order.team_id}`)
      profOak.say(`paying for delivery.com order for ${payment.order.team_id}`)

      // complicated for testing purposes
      if (!process.env.NODE_ENV) {
        throw new Error('you need to run kip-pay with NODE_ENV')
      } else if (process.env.NODE_ENV === 'production') {
        payment.delivery_response = yield payUtils.payDeliveryDotCom(payment)
        profOak.say(`paid for delivery.com on \`production\` for team:${payment.order.team_id}`)
      } else {
        payment.delivery_response = 'test_success'
        profOak.say(`not on \`production\`, so doing a fake charge.  test_success.`)
      }

      yield payment.save()
      // yield payUtils.onSuccess(payment)
    } catch (err) {
      logging.error('error after charging stripe but attempting to charge delivery.com', err)
    }
  } else {
    logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge)
  }
}

var port = process.env.PORT || 8080
app.listen(port, function () {
  logging.info('Listening on ' + port)
})

// to allow for testing
module.exports.kipPay = app
