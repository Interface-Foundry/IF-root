require('../logging')
var request = require('request-promise')
var _ = require('lodash')

var ObjectId = require('mongodb').ObjectID;

var payConst = require('./pay_const.js')

var cardTemplates = require('../chat/components/slack/card_templates');
var slackUtils = require('../chat/components/slack/utils')

// tracking for food into cafe-tracking
var Professor = require('../monitoring/prof_oak.js')
var profOak = new Professor.Professor('C33NU7FRC')

// various utils
// kip emailer
var mailer_transport = require('../mail/IF_mail.js')
var Menu = require('../chat/components/delivery.com/Menu')

// VARIOUS STUFF TO POST BACK TO USER EASILY
// --------------------------------------------
var queue = require('../chat/components/queue-direct')
var UserChannel = require('../chat/components/delivery.com/UserChannel')
var replyChannel = new UserChannel(queue)
// --------------------------------------------

if (process.env.NODE_ENV === 'production') {
  var cc = require('./secrets/kip_cc.js')
} else {
  cc = payConst.cc
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
  var banner = {
    title: '',
    image_url: 'https://storage.googleapis.com/kip-random/cafe_success.gif'
  }

  try {
    // look up user and the last message sent to us in relation to this order
    var foodSession = yield db.Delivery.findOne({'guest_token': payment.order.guest_token}).exec()

    var finalFoodMessage = yield db.Messages.find({
      'source.user': foodSession.convo_initiater.id,
      'mode': 'food',
      'incoming': false
    }).sort('-ts').limit(1).exec()

    finalFoodMessage = finalFoodMessage[0]
    var team = yield db.Slackbots.findOne({'team_id': finalFoodMessage.source.team}).exec()
    var menu = Menu(foodSession.menu)
    // send message to all the ppl that ordered food
    var uniqOrders = _.uniq(foodSession.confirmed_orders)
    uniqOrders.map(userId => {
      var user = _.find(foodSession.team_members, {'id': userId}) // find returns the first one

      var itemNames = foodSession.cart
        .filter(i => i.user_id === userId && i.added_to_cart)
        .map(i => menu.getItemById(i.item.item_id).name)
        .map(name => '*' + name + '*') // be bold

      if (itemNames.length > 1) {
        var foodString = itemNames.slice(0, -1).join(', ') + ', and ' + itemNames.slice(-1)
      } else {
        foodString = itemNames[0]
      }

      var isAdmin = team.meta.office_assistants.includes(user.id)
      var msg = _.merge(finalFoodMessage, {
        'incoming': false,
        'mode': 'food',
        'action': 'payment_info',
        'thread_id': user.dm,
        'source': {
          'type': 'message',
          'user': user.id,
          'channel': user.dm,
          'team': foodSession.team_id
        }
      })

      var json = {
        'text': `Your order of ${foodString} is on the way 😊`,
        'callback_id': 'food.payment_info',
        'fallback': `Your order is on the way`,
        'attachment_type': 'default',
        'attachments': [banner].concat(cardTemplates.home_screen(isAdmin, user.id).attachments)
      }

      replyChannel.send(msg, 'food.payment_info', {
        'type': finalFoodMessage.origin,
        'data': json
      })
    })

    var htmlForItem = `Thank you for your order. Here is the list of items.\n<table border="1"><thead><tr><th>Menu Item</th><th>Item Options</th><th>Price</th><th>Recipient</th></tr></thead>`

    //constants
    var br = '<br/>'
    var header = '<img src="http://tidepools.co/kip/oregano/cafe.png">'
    var slackbot = yield db.slackbots.findOne({team_id: foodSession.team_id}).exec()
    var date = new Date()
    var kip_blue = '#47a2fc'
    var ryan_grey = '#F5F5F5'

    var formatTime = function (date) {
      var minutes = date.getMinutes()
      var hours = date.getHours()
      return (hours > 9 ? '' + hours : '0' + hours) + ':' + (minutes > 9 ? '' + minutes : '0' + minutes)
    }

    var formatDate = function (date) {
      var month = date.getMonth() + 1
      var day = date.getDate()
      var year = date.getFullYear()
      return (month > 9 ? '' + month : '0' + month) + '/' + (day > 9 ? '' + day: '0' + day) + '/' + year
    }

    //header

    var html = `<html>${header}` + br;
    html += `<h1 style="font-size:2em;">Order Receipt</h1>`
    html += `<p>${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name} from ${slackbot.team_name} ordered from <a href="${foodSession.chosen_restaurant.url}" style="text-decoration:none;color:${kip_blue}">${foodSession.chosen_restaurant.name}</a> at ${formatTime(date)} on ${formatDate(date)}</p>`
    html += `\nHere is a list of items:\n`

    //column headings
    html += `<table border="0" style="margin-top:4px;width:600px;border-spacing:5.5px;"><thead style="color:white;background-color:${kip_blue}"><tr><th>Menu Item</th>`
    html += `<th>Item Options</th>`
    html += `<th>Price</th>`
    html += `<th>Recipient</th></tr></thead>`

    //items ordered
    foodSession.cart.filter(i => i.added_to_cart).map((item) => {
      var foodInfo = menu.getItemById(String(item.item.item_id))
      var descriptionString = _.keys(item.item.option_qty).map((opt) => menu.getItemById(String(opt)).name).join(', ')
      var user = foodSession.team_members.filter(j => j.id === item.user_id)

      console.log('suntne instructions?', item.item)

      html += `<tr><td style="background-color:${ryan_grey};"><b>${foodInfo.name}</b></td>`
      html += `<td style="background-color:${ryan_grey};"><p>${descriptionString}</p>`
      html += `${(item.item.instructions ? '<p><i>' + item.item.instructions + '</i></p>': '')}</td>`
      html += `<td style="background-color:${ryan_grey};"><b>${menu.getCartItemPrice(item).toFixed(2)}</b></td>`
      html += `<td style="background-color:${ryan_grey};"><p>${user[0].first_name} ${user[0].last_name}</p>`
      html += `<p><a href="https://${slackbot.team_name}.slack.com/messages/@${user[0]}" style="text-decoration:none;color:${kip_blue}">@${user[0].name}</a></p></td></tr>`
    })

    html += `</thead></table>` + br + br

    //itemized charges

    var line_item_style = `padding:0 0 0 8px;margin:2px;`

    html += `<table border="0"><tr><td style="width:300px;">`

    html += `<div style="border-left:4px solid ${kip_blue};">`
    html += `<p style="${line_item_style}">Cart Subtotal: ${foodSession.order.subtotal.$}</p>`
    html += `<p style="${line_item_style}">Tax: ${foodSession.order.tax.$}</p>`
    html += `<p style="${line_item_style}">Delivery Fee: ${foodSession.order.delivery_fee.$}</p>`
    html += `<p style="${line_item_style}">Service Fee: ${foodSession.service_fee.$}</p>`
    if (foodSession.discount_amount) html += `🎉 Kip Coupon: -${foodSession.discount_amount.$}`
    html += `<p style="${line_item_style}">Tip: ${(foodSession.tip.percent === 'cash') ? '$0.00 (Will tip in cash)' : foodSession.tip.amount.$}</p>`
    html += `<p style="${line_item_style}"><b>Order Total: ${foodSession.calculated_amount.$}</b></p></div>`

    //misc Information
    html += `</td style="width=300px;"><td>`
    html += `<p style="${line_item_style}"><b>Delivery Address:</b></p><br/><p style="${line_item_style}">${foodSession.chosen_location.address_1}</p>`
    if (foodSession.chosen_location.address_2) html += `<p style="${line_item_style}">${foodSession.chosen_location.address_2}</p>`
    html += `<p style="${line_item_style}">${foodSession.chosen_location.city}, ${foodSession.chosen_location.state} </p>`
    html += `<p style="${line_item_style}">${foodSession.chosen_location.zip_code}</p>` + br
    if (foodSession.instructions) html += `<p style="${line_item_style}"><i>${foodSession.instructions}</i></p>`
    html += `</td></tr></table>`

    //footer
    html += `<p style="text-decoration:none;color:grey;"><img height="16" width="16" alt="delivery.com" src="http://tidepools.co/kip/dcom_footer.png">Powered by delivery.com</p>`

    // send confirmation email to admin
    var mailOptions = {
      to: `${foodSession.convo_initiater.name} <${foodSession.convo_initiater.email}>`,
      from: `Kip Café <hello@kipthis.com>`,
      subject: `Your Order Receipt for ${foodSession.chosen_restaurant.name}`,
      html: `${html}</html>`
    }

    logging.info('mailOptions', mailOptions)

    try {
      mailer_transport.sendMail(mailOptions)
    } catch (e) {
      logging.error('error mailing after payment submitted', e)
    }
    yield foodSession.save()
  } catch (err) {
    logging.error('on success messages broke', err)
  }
}

module.exports = {
  onSuccess: onSuccess,
  payDeliveryDotCom: payDeliveryDotCom,
  storeCard: storeCard
}
