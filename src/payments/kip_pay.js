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

var pay_const = require('./pay_const.js')

// base URL for pay.kipthis.com linking
if (process.env.NODE_ENV == 'development_alyx') {
  var baseURL = 'https://b75f53de.ngrok.io'
  var stripe_id = pay_const.stripe_test_id
} else {
  var baseURL = 'https://pay.kipthis.com'
  var stripe_id = pay_const.stripe_production_id
}

// See keys here: https://dashboard.stripe.com/account/apikeys
var stripe = require('stripe')(stripe_id) // NOTE: change to production key
var path = require('path')
var _ = require('lodash')
var crypto = require('crypto')
var co = require('co')

var Payment = db.Payment
var Slackbot = db.Slackbot

var bodyParser = require('body-parser')
var express = require('express')
var app = express()
var jsonParser = bodyParser.json()

// import kip cc
var cc = require('./secrets/kip_cc.js')
var pay_utils = require('./pay_utils.js')

// this serves the checkout page for new credit card
// app.get("/", function(req, res) {
//  //GENERATE LINK that has amount
//  res.sendFile(path.join(__dirname + '/web', 'index.html'))

// })

app.use('/', express.static(path.join(__dirname, 'web')))
console.log('heheh', __dirname)

// post a new charge for kip user
app.post('/charge', jsonParser, function (req, res) {

  // include KEY with new POST req to /charge to verify authentic kip request
  var kip_secret = 'mooseLogicalthirteen$*optimumNimble!Cake'

  // SAMPLE BODY:
  var prunedPay = {
    _id: String,
    active: Boolean,
    team_id: String,
    chosen_location: {
      addr: {
        address_1: String,
        address_2: String,
        city: String,
        state: String,
        zip_code: String,
        coordinates: []
      }
    },
    time_started: Date,
    convo_initiater: {
      id: String,
      name: String,
      email: String,
      phone_number: String,
      first_name: String,
      last_name: String
    },
    chosen_restaurant: {
      id: String,
      name: String, // restaurant name
      url: String // link to delivery.com menu
    },
    guest_token: String,
    order: {
      total: Number,
      order_type: String // delivery or pickup
    // ETC...
    },
    saved_card: {
      vendor: 'stripe',
      customer_id: String,
      card_id: String
    }
  }

  var tester = {
    '_id': 'PAY ID',
    'active': true,
    'team_id': 'test123',
    'chosen_location': {
      'addr': {
        'address_1': '902 Broadway 10010',
        'address_2': '6F',
        'city': 'New York',
        'state': 'NY',
        'zip_code': '10010',
        'coordinates': []
      },
      'special_instructions': 'Go to the 12th floor and call 714 330 9056'
    },
    'time_started': 'somedate',
    'convo_initiater': {
      'id': 'USER_ID',
      'name': 'Alyx',
      'email': 'asdf@asdfkipsun.com',
      'phone_number': '723433321',
      'first_name': 'Alyx',
      'last_name': 'Baldwin'
    },
    'chosen_restaurant': {
      'id': '134234',
      'name': 'Molcajete Taqueria',
      'url': 'http://delivery.com'
    },
    'guest_token': 'GUEST_TOKEN_123123123',
    'order': {
      'total': 5000,
      'tip': 1000,
      'order_type': 'delivery'
    }
  }

  // SAVED CARD
  // "saved_card": {
  //     "vendor": "stripe",
  //     "customer_id": "cus_9RcJXBqg6vR4tx",
  //     "card_id": "card_198j4tI2kQvuYJlV9jt11NLz"
  //    }

  // params:
  // stripe ID
  // if stripe ID + CC card select, return confirmed payment
  // else return URL to checkout: click here to add credit card (you only need to do this once)

  // NEED TO IP RESTRICT TO ONLY OUR ECOSYSTEM

  if (req.body && (req.body.kip_token === kip_secret) && req.body.order && req.body.order.total) {
    var o = req.body
    // new payment
    var p = new Payment({
      session_token: crypto.randomBytes(256).toString('hex'), // gen key inside object
      order: o
    })
    p.save(function (err, data) {
      if (err) console.log(err)
    })

    // ALREADY A STRIPE USER
    if (o.saved_card && o.saved_card.customer_id) {
      // we have card to charge
      if (o.saved_card.card_id) {
        charge_by_id(p, function (r) {
          console.log('SAVED CHARGE RESULT ', r)
        })
        var v = {
          newAcct: false,
          processing: true,
          msg: 'Processing charge...'
        }

        res.status(200).send(JSON.stringify(v))
      } else {
        // NEED A CARD ID!
        console.log('NEED CARD ID!')
        var v = {
          newAcct: false,
          processing: false,
          msg: 'Error: Card ID Missing!'
        }
        res.status(500).send(JSON.stringify(v))
      }
    }

    // NEW STRIPE USER
    else {
      // return checkout LINK
      var v = {
        newAcct: true,
        processing: false,
        url: baseURL + '?k=' + p.session_token
      }

      res.status(200).send(JSON.stringify(v))
    }
  } else {
    res.status(401).send('😅')
  }
})

// get session by token
app.post('/session', jsonParser, function (req, res) {
  if (req.body && req.body.session_token) {
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char
    Payment.findOne({session_token: t}, function (err, obj) {
      res.send(JSON.stringify(obj))
    })
  }
})

// this is the call back from the new credit card to do the charge
app.post('/process', jsonParser, function (req, res) {
  if (req.body && req.body.token && req.body.session_token) {
    res.sendStatus(200)

    // this is a stripe token for the user inputted credit card details
    var token = req.body.token.replace(/[^\w\s]/gi, '') // clean special char
    // LOOK UP USER BY HASH TOKEN
    var t = req.body.session_token.replace(/[^\w\s]/gi, '') // clean special char

    Payment.findOne({session_token: t}, function (err, pay) {
      if (err) {
        console.log(err)
      }else {
        var customer_id
        // create stripe customer
        stripe.customers.create({
          source: token,
          description: 'Delivery.com & Kip: ' + pay.order.chosen_restaurant.name
        }).then(function (customer) {
          customer_id = customer.id
          return stripe.charges.create({
            amount: pay.order.order.total + roundUp(pay.order.tipAmount * 100, 10), // Amount in cents + tip
            currency: 'usd',
            customer: customer.id
          })
        }).then(function (charge) {
          if (charge) {
            pay.charge = charge
            pay.save(function (err, x) {
              if (err) {
                console.error('ERROR!')
              }
            })
          }

          if (charge.status == 'succeeded') {

            // pay delivery.com
            pay_delivery_com(pay)

            // save stripe info to slack team
            Slackbot.findOne({team_id: pay.order.team_id}, function (err, obj) {

              // update stripe / push cards into array
              if (err) {
                console.error('error: cant find team to save stripe info')
              }else {
                if (!obj.meta.payments) {
                  obj.meta.payments = []
                }
                // save card / stripe acct to slack team
                obj.meta.payments.push({
                  vendor: 'stripe',
                  customer_id: customer_id,
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
                obj.save(function (err, z) {
                  if (err) {
                    console.error('ERROR!')
                  }
                })
              }
            })
          }else {
            console.log('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
            console.log('OUTCOME: ', charge.outcome)
          }
        })
      }
    })
  }else {
    res.status(500).send('charge token missing')
  }
})

// make a charge
function charge_by_id (p) {

  // STRIPE CHARGE BY ID
  // When it's time to charge the customer again, retrieve the customer ID!
  stripe.charges.create({
    amount: p.order.order.total, // Amount in cents
    currency: 'usd',
    customer: p.order.saved_card.customer_id, // Previously stored, then retrieved
    card: p.order.saved_card.card_id
  }).then(function (charge) {
    if (charge) {
      p.charge = charge
      p.save(function (err, z) {
        if (err) {
          console.error('ERROR!')
        }
      })
    }

    if (charge.status == 'succeeded') {
      // POST TO MONGO QUEUE SUCCESS PAYMENT
      pay_delivery_com(p)
    }else {
      console.log('DIDNT PROCESS STRIPE CHARGE: ', charge.status)
      console.log('OUTCOME: ', charge.outcome)
    }
  })
}

// pay delivery.com
function pay_delivery_com (pay, callback) {
  var err = null // lol idk

  // payment amounts should match
  // NOTE: THIS MUST BE THE TOTAL PAYMENT + TOP TO COMPARE TO CHARGE VAL
  if (pay.charge.amount == pay.order.order.total + roundUp(pay.order.tipAmount * 100, 10)) {
    if (!pay.order.chosen_location.addr.special_instructions) {
      pay.order.chosen_location.addr.special_instructions = ''
    }

    // build guest checkout obj
    var guestCheckout = {
      'client_id': pay_const.delivery_com_client_id,
      'order_type': pay.order.order.order_type,
      'order_time': new Date().toISOString(),
      'payments': [
        {
          'type': 'credit_card',
          'card': {
            'cc_number': cc.cc_number,
            'exp_year': cc.exp_year,
            'exp_mon': cc.cc_month,
            'cvv': cc.cvv,
            'billing_zip': cc.billing_zip,
            'save': false
          }
        }
      ],
      'sms_notify': true,
      'isOptingIn': false,
      'phone_number': pay.order.convo_initiater.phone_number,
      'merchant_id': pay.order.chosen_restaurant.id,
      'first_name': pay.order.convo_initiater.first_name,
      'last_name': pay.order.convo_initiater.last_name,
      'email': pay.order.convo_initiater.email,
      'uhau_id': 'kipthis-dot-com'
    }

    // convert tips to double if exists
    if (_.get(pay, 'order.tipAmount')) {
      guestCheckout.tip = pay.order.order.tipAmount
    }

    // limit special delivery instructions to 100 char
    if (pay.order.chosen_location.special_instructions) {
      var si = pay.order.chosen_location.special_instructions
      if (si.length > 100) {
        si = si.substring(0, 100)
      }
      guestCheckout.instructions = si
    }else {
      guestCheckout.instructions = ''
    }

    // for physical delivery
    if (pay.order.chosen_location.addr) {
      guestCheckout.street = pay.order.chosen_location.addr.address_1 + ', ' + pay.order.chosen_location.addr.address_2
      guestCheckout.city = pay.order.chosen_location.addr.city
      guestCheckout.state = pay.order.chosen_location.addr.state
      guestCheckout.zip_code = pay.order.chosen_location.addr.zip_code
    }

    // pos to delivery
    co(function * () {
      var response = yield pay_utils.payForItemFromKip(guestCheckout, pay.order.guest_token)
      if (response !== null) {
        yield pay_utils.sessionSuccesfullyPaid(pay)
      }
    }).catch(function (err) {
      console.error(err.stack)
    })
  }else {
    console.error('ERROR: Charge amounts dont match D:')
    err = 'ERROR: Charge amounts dont match D:'
    callback(err)
  }
}

// precision is 10 for 10ths, 100 for 100ths, etc.
function roundUp(number, precision) {
  Math.ceil(num * precision) / precision
}

var port = process.env.PORT || 8080
app.listen(port, function () {
  console.log('Listening on ' + port)
})
