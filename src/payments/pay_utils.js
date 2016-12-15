require('../logging')
var request = require('request-promise')
var _ = require('lodash')

var payConst = require('./pay_const.js')
var cc = require('./secrets/kip_cc.js')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

// various utils
// kip emailer
var mailer_transport = require('../mail/IF_mail.js')
var Menu = require('../chat/components/delivery.com/Menu')

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-mongo')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

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

  if (process.env.NODE_ENV === 'production') {
    try {
      var response = yield request(opts)
      return response
    } catch (e) {
      response = null
      logging.error('couldnt submit payment uh oh ', JSON.stringify(e))
      return null
    }
  } else {
    logging.error('NOT GOING TO PAY FOR ORDER IN DEV OR TEST MODE, SWITCH TO NODE_ENV=production')
    return 'development'
  }
}

// pay delivery.com
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

function * storeCard (pay, charge) {
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

/*
* communicate to user and tie up all things
* @param {Object} payment object
*/
function * onSuccess (payment) {
  try {
    // look up user and the last message sent to us in relation to this order
    var foodSession = yield db.Delivery.findOne({guest_token: payment.order.guest_token}).exec()
    var finalFoodMessage = yield db.Messages.find({'source.user': foodSession.convo_initiater.id, mode: `food`, incoming: false}).sort('-ts').limit(1)
    finalFoodMessage = finalFoodMessage[0]
    var menu = Menu(foodSession.menu)
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
        .filter(i => i.user_id === userId && i.added_to_cart)
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
            text: `Your order of ${foodString} is on the way 😊`,
            attachments: [{
              image_url: 'http://tidepools.co/kip/kip_menu.png',
              text: 'Click a mode to start using Kip',
              color: '#3AA3E3',
              callback_id: 'wow such home',
              actions: [{
                name: 'passthrough',
                value: 'food',
                text: 'Kip Café',
                type: 'button'
              }, {
                name: 'passthrough',
                value: 'shopping',
                text: 'Kip Store',
                type: 'button'
              }]
            }]
          }
        })
    })
    var htmlForItem = `Thank you for your order. Here is the list of items.\n<table border="1"><thead><tr><th>Menu Item</th><th>Item Options</th><th>Price</th><th>Recipient</th></tr></thead>`

    var orders = foodSession.cart.filter(i => i.added_to_cart).map((item) => {
      var foodInfo = menu.getItemById(String(item.item.item_id))
      var descriptionString = _.keys(item.item.option_qty).map((opt) => menu.getItemById(String(opt)).name).join(', ')
      var user = foodSession.team_members.filter(j => j.id === item.user_id)
      htmlForItem += `<tr><td>${foodInfo.name}</td><td>${descriptionString}</td><td>${menu.getCartItemPrice(item).toFixed(2)}</td><td>${user[0].real_name}</td></tr>`
    })

    // send confirmation email to admin
    var mailOptions = {
      to: `${foodSession.convo_initiater.name} <${foodSession.convo_initiater.email}>`,
      from: `Kip Café <hello@kipthis.com>`,
      subject: `Kip Café Order Receipt for ${foodSession.chosen_restaurant.name}`,
      html: `${htmlForItem}</thead></table>`
    }

    logging.info('mailOptions', mailOptions)
    mailer_transport.sendMail(mailOptions, function (err) {
      if (err) console.log(err)
    })
  } catch (err) {
    logging.error('on success messages broke', err)
  }
}

module.exports = {
  onSuccess: onSuccess,
  payDeliveryDotCom: payDeliveryDotCom,
  storeCard: storeCard
}
