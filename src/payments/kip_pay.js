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
require('kip')
require('colors')
var payConst = require('./pay_const.js')

const kipPayURL = kip.config.kipPayURL
// base URL for pay.kipthis.com linking

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
var pay_utils = require('./pay_utils.js')

// kip emailer
var mailer_transport = require('../mail/IF_mail.js')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-mongo')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var Menu = require('../chat/components/delivery.com/Menu')
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
        yield chargeById(payment)
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
    logging.error('kip token didnt match up or body total thing ', req.body)
    res.status(401).send('😅')
  }
}))

// get session by token
app.post('/session', jsonParser, (req, res) => co(function * () {
  if (_.get(req, 'body') && _.get(req, 'body.session_token')) {
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char
    try {
      var pay = yield Payment.findOne({session_token: t})
      res.send(JSON.stringify(pay))
    } catch (err) {
      logging.error('catching error in session ', err)
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
        description: 'Delivery.com & Kip: ' + payment.order.chosen_restaurant.name
      })
      var charge = yield stripe.charges.create({
        amount: Math.round(payment.order.order.total),
        currency: 'usd',
        customer: customer.id
      })
      profOak.say(`succesfully created new stripe card and charge for team:${payment.order.team_id} in amount ${(payment.order.order.total / 100.0).toFixed(2).$}`)
    } catch (err) {
      logging.error('had an error creating customer and card', err)
    }

    payment.charge = charge
    payment.save()

    //fired on new cards charged ONLY
    if (charge.status === 'succeeded') {
      try {

        //complicated for testing purposes
        if (!process.env.NODE_ENV) {
          throw new Error('you need to run kip-pay with NODE_ENV')
        } else if (process.env.NODE_ENV !== 'canary') {
          payment.delivery_response = 'test_success'
          yield payment.save()
        } else if (process.env.NODE_ENV === 'canary') {
          payment.delivery_response = yield pay_utils.payDeliveryDotCom(payment)
          profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
          yield payment.save()
        } else {
          payment.delivery_response = yield pay_utils.payDeliveryDotCom(payment)
          profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
          yield payment.save()
        }

        yield pay_utils.storeCard(payment, charge)

        // look up user and the last message sent to us in relation to this order
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
              text: `Your order was successful and you should receive an email from Delivery.com soon!`
            }
          })
        profOak.say(`order completed for team: ${payment.order.team_id}`)
      } catch (err) {
        logging.error('woah shit we just charged money but had an issue paying delivery.com', err)
      }
    } else {
      logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
      logging.error('OUTCOME: ', charge.outcome)
    }
  } else {
    res.status(500).send('charge token missing')
  }
}))

function * chargeById (payment) {
  // make a charge

  // STRIPE CHARGE BY ID
  // When it's time to charge the customer again, retrieve the customer ID!

  try {
    profOak.say(`creating stripe charge for ${payment.order.saved_card.saved_card}`)
    logging.info('creating charge by ID')
    var charge = yield stripe.charges.create({
      amount: Math.round(payment.order.order.total), // Amount in cents
      currency: 'usd',
      customer: payment.order.saved_card.customer_id, // Previously stored, then retrieved
      card: payment.order.saved_card.card_id
    })

    profOak.say(`succesfully created new stripe charge for team:${payment.order.team_id} in amount ${(payment.order.order.total / 100.0).toFixed(2).$}`)
  } catch (err) {
    logging.error('error creating stripe charge')
  }

  if (charge) {
    payment.charge = charge
    yield payment.save()
  }

  //fired on re-used cards charged ONLY
  if (charge.status === 'succeeded') {
    // POST TO MONGO QUEUE SUCCESS PAYMENT
    try { 
      profOak.say(`succesfully paid for stripe for team ${payment.order.team_id}`)
      profOak.say(`paying for delivery.com order for ${payment.order.team_id}`)

      //complicated for testing purposes
      if (!process.env.NODE_ENV) {
        throw new Error('you need to run kip-pay with NODE_ENV')
      } else if (process.env.NODE_ENV !== 'canary') {
        payment.delivery_response = 'test_success'
        yield payment.save()
      } else if (process.env.NODE_ENV === 'canary') {
        payment.delivery_response = yield pay_utils.payDeliveryDotCom(payment)
        profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
        yield payment.save()
      } else {
        payment.delivery_response = yield pay_utils.payDeliveryDotCom(payment)
        profOak.say(`paid for delivery.com for team:${payment.order.team_id}`)
        yield payment.save()
      }
    
      // look up user and the last message sent to us in relation to this order
      var foodSession = yield db.Delivery.findOne({guest_token: payment.order.guest_token}).exec()
      var finalFoodMessage = yield db.Messages.find({'source.user': foodSession.convo_initiater.id, mode: `food`, incoming: false}).sort('-ts').limit(1)
      finalFoodMessage = finalFoodMessage[0]
      var menu = Menu(foodSession.menu)


      logging.info('WHAHAHT ',finalFoodMessage.origin)

      //send message to user
      replyChannel.send(
        finalFoodMessage,
        'food.payment_info',
        {
          type: finalFoodMessage.origin,
          data: {
            'text': 'Order was successful! You should get an email confirmation from `Delivery.com` soon',
            'fallback': `Order Success!`,
            'callback_id': `food.admin.select_card`
          }
        })

      // send message to all the ppl that ordered food
      foodSession.confirmed_orders.map(userId => {       

        var user = _.find(foodSession.team_members, {id: userId}) // find returns the first one

        var msg = _.merge({}, finalFoodMessage, {
          thread_id: user.dm,
          source: {
            user: user.id,
            team: foodSession.team_id,
            channel: user.dm
          }
        })

        var itemNames = foodSession.cart
          .filter(i => i.user_id === userId)
          .map(i => menu.getItemById(i.item.item_id).name)
          .map(name => '*' + name + '*') // be bold

        if (itemNames.length > 1) {
          var foodString = itemNames.slice(0, -1).join(', ') + ', and ' + itemNames.slice(-1)
        } else {
          foodString = itemNames[0]
        }

        replyChannel.send(
          msg,
          'food.payment_info',
          {
            type: finalFoodMessage.origin,
            data: {
              text: `Your order of ${foodString} is on the way 😊`
            }
          })
      })

      // logging.info('CONFIRMED ORDERS: ',foodSession.confirmed_orders)
      // logging.info('CONVO INIT: ',foodSession.convo_initiater)

    
      // //send confirmation email to admin
      // var mailOptions = {
      //   to: 'Kip Server <hello@kipthis.com>',
      //   from: 'Kip Café <server@kipthis.com>',
      //   subject: '['+source.callback_id+'] Kip Café Feedback',
      //   text: '- Feedback: '+message.text + ' \r\n - Context:'+JSON.stringify(source)
      // }
      // mailer_transport.sendMail(mailOptions, function (err) {
      //   if (err) console.log(err)
      // })

    } catch (err) {
      logging.error('woah shit we just charged money but had an issue paying delivery.com', err)
    }
  } else {
    logging.error('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
    logging.error('OUTCOME: ', charge.outcome)
  }
}


function * onSuccess (payment) {

}

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Listening on ' + port)
})
