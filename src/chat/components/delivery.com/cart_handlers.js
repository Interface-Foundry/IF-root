'use strict'

var _ = require('lodash')
var coupon = require('./payments.coupon.js')
var Menu = require('./Menu')
var api = require('./api-wrapper')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

// exports
var handlers = {}

// allow mongoose ._id to be used as button things
String.prototype.toObjectId = function () {
  var ObjectId = (require('mongoose').Types.ObjectId)
  return new ObjectId(this.toString())
}

//
// Show the user their personal cart
//
handlers['food.cart.personal'] = function * (message, replace) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  var menu = Menu(foodSession.menu)
  var myItems = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)
  var totalPrice = myItems.reduce((sum, i) => {
    return sum + menu.getCartItemPrice(i)
  }, 0)

  var banner = {
    title: '',
    image_url: 'https://storage.googleapis.com/kip-random/kip-my-cafe-cart.png'
  }

  var lineItems = myItems.map((i, index) => {
    var item = menu.flattenedMenu[i.item.item_id]
    var instructions = i.item.instructions ? `\n_Special Instructions: ${i.item.instructions}_` : ''
    var quantityAttachment = {
      title: item.name + ' – ' + menu.getCartItemPrice(i).$,
      text: item.description + instructions,
      fallback: item.description + instructions,
      mrkdwn_in: ['text'],
      callback_id: item.id,
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [
        {
          name: 'food.cart.personal.quantity.subtract',
          text: '—',
          type: 'button',
          value: index
        },
        {
          name: 'food.null',
          text: i.item.item_qty,
          type: 'button',
          value: item.id
        },
        {
          name: 'food.cart.personal.quantity.add',
          text: '+',
          type: 'button',
          value: index
        }
      ]
    }

    if (i.item.item_qty === 1) {
      quantityAttachment.actions[0].confirm = {
        title: 'Remove Item',
        text: `Are you sure you want to remove "${item.name}" from your personal cart?`,
        ok_text: 'Remove it',
        dismiss_text: 'Keep it'
      }
    }

    return quantityAttachment
  })

  var bottom = {
    'text': '*My Order Total:* '+totalPrice.$,
    'mrkdwn_in': ['text'],
    'fallback': 'Confirm personal cart',
    'callback_id': 'wopr_game',
    'color': '#49d63a',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.cart.personal.confirm',
        'text': '✓ Finish My Order',
        'type': 'button',
        'value': 'food.cart.personal.confirm',
        'style': 'primary'
      },
      {
        'name': 'food.menu.quickpicks',
        'text': '< Order More',
        'type': 'button',
        'value': ''
      }
    ]
  }

  var json = {
    text: `*Confirm Your Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    attachments: [banner].concat(lineItems).concat([bottom])
  }

  if (foodSession.budget && foodSession.user_budgets[message.user_id] >= foodSession.budget*0.125) {
    json.attachments.push({
      'text': `You have around $${Math.round(foodSession.user_budgets[message.user_id])}-ish left`,
      'mrkdwn_in': ['text']
    });
  }

  if (replace) {
    $replyChannel.sendReplace(message, 'food.item.submenu', {type: 'slack', data: json})
  } else {
    $replyChannel.send(message, 'food.item.submenu', {type: 'slack', data: json})
  }
}

// Handles editing the quantity by using the supplied array index, the nth item in the user's personal cart
handlers['food.cart.personal.quantity.add'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var index = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)[index]
  //decrement user budget by item price
  foodSession.user_budgets[message.user_id] += menu.getCartItemPrice(userItem);
  userItem.item.item_qty++;
  foodSession.user_budgets[message.user_id] -= menu.getCartItemPrice(userItem);
  //increment user budget by (new) item price
  console.log('personal budget: ', foodSession.user_budgets[message.user_id]);
  yield db.Delivery.update({_id: foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': 1}, $set: {user_budgets: foodSession.user_budgets}}).exec()
  yield handlers['food.cart.personal'](message, true)
}

// Handles editing the quantity by using the supplied array index
handlers['food.cart.personal.quantity.subtract'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var index = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)[index]
  if (userItem.item.item_qty === 1) {
    // don't let them go down to zero
    userItem.deleteMe = true
    foodSession.cart = foodSession.cart.filter(i => !i.deleteMe)
    foodSession.user_budgets[message.user_id] += menu.getCartItemPrice(userItem);
    yield db.Delivery.update({_id: foodSession._id}, {$pull: { cart: {_id: userItem._id }}, $set: {user_budgets: foodSession.user_budgets}}).exec()
  } else {
    foodSession.user_budgets[message.user_id] += menu.getCartItemPrice(userItem);
    userItem.item.item_qty--
    foodSession.user_budgets[message.user_id] -= menu.getCartItemPrice(userItem);
    yield db.Delivery.update({_id: foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': -1}, $set: {user_budgets: foodSession.user_budgets}}).exec()
  }

  yield handlers['food.cart.personal'](message, true)
}

//
// The user has just clicked the confirm button on their personal cart
//
handlers['food.cart.personal.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var myItems = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)

  // save their items in their order history
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec()
  user.history.orders = user.history.orders || []
  yield myItems.map(function * (cartItem) {
    var deliveryItem = menu.getItemById(cartItem.item.item_id)
    user.history.orders.push({user_id: user._id, session_id: foodSession._id, chosen_restaurant: foodSession.chosen_restaurant, deliveryItem: deliveryItem, cartItem: JSON.stringify(cartItem), ts: Date.now()})
  })
  yield user.save(function (err, saved) {
    if (err) kip.debug('\n\n\n\n\ncart_handlers.js line 152, err:', err, ' \n\n\n\n\n')
  })

  yield handlers['food.admin.waiting_for_orders'](message, foodSession)
}

/*
* Confirm all users have voted for s12
*/
handlers['food.admin.waiting_for_orders'] = function * (message, foodSession) {
  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession

  console.log('####', foodSession.confirmed_orders)

  //
  // Reply to the user who either submitted their personal cart or said "no thanks"
  //
  if (message.data.value === 'no thanks') {
    yield foodSession.update({$pull: {team_members: {id: message.user_id}}}).exec()
    foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
    $replyChannel.sendReplace(message, 'shopping.initial', {type: message.origin, data: {text: `Ok, maybe next time :blush:`}})
  } else {
    foodSession.confirmed_orders.push(message.source.user)
    $replyChannel.sendReplace(message, '.', {type: message.origin, data: {text: `Thanks for your order, waiting for the rest of the users to finish their orders`}})
    yield foodSession.save()
  }

  //
  // Admin Order Dashboard
  //
  var menu = Menu(foodSession.menu)
  var allItems = foodSession.cart
    .filter(i => i.added_to_cart && foodSession.confirmed_orders.includes(i.user_id))
    .map(i => menu.getItemById(i.item.item_id).name)
    .join(', ')

  // Show which team members are not in the votes array
  var full_email_members = [];
  for (var i = 0; i < foodSession.email_users.length; i++) {
    var full_eu = yield db.email_users.findOne({email: foodSession.email_users[i]});
    full_email_members.push(full_eu);
  }
  console.log('full_email_members', full_email_members, foodSession.confirmed_orders)

  var slackers = _.difference(foodSession.team_members.map(m => m.id), _.difference(foodSession.confirmed_orders, full_email_members.map(m => m.id)))
    .map(id => `<@${id}>`)

  var emailer_ids = _.difference(full_email_members.map(m => m.id), _.difference(foodSession.confirmed_orders, slackers))
  var emailers = [];

  if (emailer_ids) emailer_ids.map(function (eid) {
    for (var i = 0; i < full_email_members.length; i++) {
      if (full_email_members[i].id == eid) emailers.push(full_email_members[i].email)
    }
  })

  console.log('emailers', emailers)

  var dashboard = {
    text: `Collecting orders for *${foodSession.chosen_restaurant.name}*`,
    attachments: [{
      color: '#3AA3E3',
      mrkdwn_in: ['text'],
      text: `*Collected so far* 👋\n_${allItems}_`,
      'fallback': `*Collected so far* 👋\n_${allItems}_`
    }]
  }

  if ((slackers || emailers.length) && message.source.user == foodSession.convo_initiater.id) {
    dashboard.attachments.push({
      color: '#49d63a',
      mrkdwn_in: ['text'],
      text: `*Waiting for order(s) from:*\n${slackers.concat(emailers).join(', ')}`,
      actions: [{
        name: 'food.admin.order.confirm',
        text: 'Finish Order Early',
        style: 'default',
        type: 'button',
        value: 'food.admin.order.confirm',
        confirm: {
            "title": "Finish Order Early?",
            "text": "This will finish the order. Members that haven't ordered yet won't be able to.",
            "ok_text": "Yes",
            "dismiss_text": "No"
        }
      }]
    })
  }

  if (_.get(foodSession.tracking, 'confirmed_orders_msg')) {
    // replace admins message
    var msgToReplace = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_orders_msg})
    $replyChannel.sendReplace(msgToReplace, 'food.admin.waiting_for_orders', {
      type: msgToReplace.origin,
      data: dashboard
    })
  } else {
    // create the dashboard for the first time
    foodSession.team_members.map(m => {
      if(foodSession.confirmed_orders.includes(m.id)){
        var admin = foodSession.convo_initiater
        var user = message.source.user
        var channel = message.source.channel
        var msg = {
          mode: 'food',
          action: 'food.admin.waiting_for_orders',
          thread_id: m.dm,
          origin: message.origin,
          source: {
            team: foodSession.team_id,
            user: m.id,
            channel: m.dm
          }
        }
        var sentMessage = $replyChannel.sendReplace(msg, 'food.admin.waiting_for_orders', {
          type: msg.origin,
          data: dashboard
        })
        sentMessage.then(function(result) {
          if(result.source.user === admin.id){
            foodSession.tracking.confirmed_orders_msg = result._id
            foodSession.save()
          }
        })
      }
    })
  }

  //
  // Move on to the TEAM CART (omigosh almost there)
  //
  if (foodSession.confirmed_orders.length >= foodSession.team_members.length) {
    // take admin to order confirm, not sure if i need to look this up again but doing it for assurance

    var adminMsg = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_orders_msg})
    if(!adminMsg){
      adminMsg = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_orders_msg})  //there should be a better way to handle the race condition with the above foodSession.save()
    }
    yield handlers['food.admin.order.confirm'](adminMsg, true)
  } else {
    logging.warn('Not everyone has confirmed their food orders yet still need: ', _.difference(_.map(foodSession.team_members, 'id'), foodSession.confirmed_orders))
    return
  }
}

handlers['food.admin.order.confirm'] = function * (message, replace) {
  // show admin final confirm of ting
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)

  var totalPrice = foodSession.cart.reduce((sum, i) => {
    return sum + menu.getCartItemPrice(i)
  }, 0)
  // ------------------------------------
  // main response and attachment
  var response = {
    text: `*Confirm Team Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    fallback: `*Confirm Team Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    callback_id: 'address_confirm',

  }

  var mainAttachment = {
    'title': '',
    'image_url': `https://storage.googleapis.com/kip-random/kip-team-cafe-cart.png`
  }

  // ------------------------------------
  // item attachment with items and prices
  var itemAttachments = foodSession.cart.filter(i => i.added_to_cart).map((item) => {
    var foodInfo = menu.getItemById(String(item.item.item_id))
    var descriptionString = _.keys(item.item.option_qty).map((opt) => menu.getItemById(String(opt)).name).join(', ')
    var textForItem = `*${foodInfo.name} - ${menu.getCartItemPrice(item).$}*\n`
    textForItem += descriptionString.length > 0 ? `*Options:* ${descriptionString}\n` + `*Added by:* <@${item.user_id}>` : `*Added by:* <@${item.user_id}>`
    return {
      text: textForItem,
      fallback: textForItem,
      callback_id: 'foodInfoItems_wopr',
      color: '#3AA3E3',
      attachment_type: 'default',
      mrkdwn_in: ['text'],
      actions: [{
        'name': `food.admin.cart.quantity.subtract`,
        'text': `—`,
        'type': `button`,
        'value': item._id.toString()
      }, {
        'name': `food.null`,
        'text': String(item.item.item_qty),
        'type': `button`,
        'value': item.item.item_id
      }, {
        'name': `food.admin.cart.quantity.add`,
        'text': `+`,
        'type': `button`,
        'value': item._id.toString()
      }]
    }
  })



  if (foodSession.tip.percent === 'cash') foodSession.tip.amount = 0.00

  try {
    var order = yield api.createCartForSession(foodSession)
    if (order !== null) {
      // order is successful
      foodSession.order = order
      foodSession.markModified('order')
      yield foodSession.save()

      if (foodSession.tip.percent !== 'cash') {
        foodSession.tip.amount = (Number(foodSession.tip.percent.replace('%', '')) / 100.0 * foodSession.order.subtotal).toFixed(2)
        foodSession.save()
      }

      /*
      --------- create/explain values here -----------------------
      notes:
      - service_fee = $.99 for kip
      - subtotal = the subtotal from delivery.com for the items
      - delivery_fee = delivery_fee from delivery.com
      - convenience_fee = possible value from delivery.com
      - order.discount_percent = discount from delivery.com, include as note on total/subtotal maybe
      - taxes = taxes from order.taxes
      - total = the total from delivery.com (subtotal + taxes - discount)
      - tip = {
          amount: fixed dollar amount with cents (calculated on the order.subtotal tho)
          percent: string with value to use on order.total
      }

      - main_amount = (order.total + service_fee + taxes + tip + delivery_fee + convenience_fee)
      - discount_amount = (main_amount) * tip.percent
      - calculated_amount (total we are charging user) = main_amount - discount_amount

      - calculated_amount will be the value passed to payments that is a value in cents
      - tip.amount will be passed to payments as well for delivery.com payment.  its already included in calculated_amount so just leave it

      -----
      other:
      dont let orders over 510 go through w/ 99% discount
      order.subtotal will be incorrect if delivery.com is using built in discount (i.e. 10% off for 30$ or more)
      possibly remove service fee from coupon stuff but do
      */

      // check if team has any hardcoded coupons
      var discountAvail = _.find(coupon.couponTeams, function (discounts) {
        return _.includes(discounts.teams, foodSession.team_id)
      })

      foodSession.main_amount = order.total + foodSession.service_fee + order.delivery_fee + order.convenience_fee

      if (discountAvail) {
        // this is literally needed to prevent rounding errors
        if (foodSession.coupon.used === false) {
          foodSession.coupon.used = true
          foodSession.coupon.percent = discountAvail.couponDiscount
        }

        foodSession.discount_amount = Number((Math.round(((discountAvail.couponDiscount * (foodSession.main_amount)) * 1000) / 10) / 100).toFixed(2))
      } else {
        foodSession.discount_amount = 0.00
      }
      foodSession.calculated_amount = Number((Math.round(((foodSession.main_amount - foodSession.discount_amount) * 1000) / 10) / 100).toFixed(2))

      if (foodSession.calculated_amount < 0.50) {
        foodSession.calculated_amount = 0.50 // stripe thing
      }

      // check for order over $510 (pre coupon) not processing over $510 (pre coupon)
      if (_.get(discountAvail, 'couponDiscount', 0) === 0.99 && foodSession.order.total > 510.00) {
        $replyChannel.send(message, 'food.exit', {
          type: message.origin,
          data: {
            'text': 'Eep this order size is too large for the 99% off coupon. Please contact hello@kipthis.com with questions'
          }
        })
        return
      }
      yield foodSession.save()

      // ----- done with the calculations of values
      var finalAttachment = {
        text: `*Order Total:* ${foodSession.calculated_amount.$}`,
        fallback: `*Order Total:* ${foodSession.calculated_amount.$}`,
        callback_id: 'admin_order_confirm',
        color: '#49d63a',
        attachment_type: 'default',
        mrkdwn_in: ['text'],
        footer: 'Powered by Delivery.com',
        footer_icon: 'http://tidepools.co/kip/dcom_footer.png'
      }

      var instructionsButton = {
        name: 'food.order.instructions',
        text: '✎ Add Instructions',
        type: 'button',
        value: ''
      }

      if (totalPrice < foodSession.chosen_restaurant.minimum) {
        finalAttachment.text += `\n*Minimum Not Yet Met:* Minimum Order For Restaurant is: *_\$${foodSession.chosen_restaurant.minimum}_*`
        finalAttachment.actions = [{
          'name': 'food.feedback.new',
          'text': '⇲ Send feedback',
          'type': 'button',
          'value': 'food.feedback.new'
        }]
      } else {
        finalAttachment.actions = [{
          'name': `food.admin.order.checkout.confirm`,
          'text': `✓ Checkout ${foodSession.calculated_amount.$}`,
          'type': `button`,
          'style': `primary`,
          'value': `checkout`
        },
        instructionsButton
        ]
      }
      // if (feedbackOn && finalAttachment) {
      //   finalAttachment.actions.push({
      //     name: 'food.feedback.new',
      //     text: '⇲ Send feedback',
      //     type: 'button',
      //     value: 'food.feedback.new'
      //   })
      // }
      // ------------------------------------
      // tip attachment
      var tipTitle = (foodSession.tip.percent === 'cash') ? `Will tip in cash` : `$${foodSession.tip.amount.toFixed(2)}`
      var tipAttachment = {
        'title': `Tip: ${tipTitle}`,
        'fallback': `Tip: ${tipTitle}`,
        'callback_id': 'food.admin.cart.tip',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'mrkdwn_in': ['text'],
        'actions': [`15%`, `20%`, `25%`, `Cash`].map((t) => {
          var baseTipButton = (foodSession.tip.percent.toLowerCase() === t.toLowerCase()) ? `◉ ${t}` : `￮ ${t}`
          return {
            'name': 'food.admin.cart.tip',
            'text': baseTipButton,
            'type': `button`,
            'value': t.toLowerCase()
          }
        })
      }

      var deliveryDiscount = (_.get(foodSession, 'order.discount_percent') > 0.00) ? ` _Included ${foodSession.order.discount_percent * 100}% discount from delivery.com_` : ``
      var convenienceFee = (_.get(foodSession, 'order.convenience_fee') > 0.00) ? ` _This restaurant also has a convience fee of ${foodSession.order.convenience_fee}_` : ``

      var infoAttachment = {
        fallback: 'Checkout Total',
        text: `*Cart Subtotal:* ${foodSession.order.subtotal.$}${deliveryDiscount}\n` +
              `*Taxes:* ${foodSession.order.tax.$}\n` +
              `*Delivery Fee:* ${foodSession.order.delivery_fee.$}${convenienceFee}\n`,
        'callback_id': 'food.admin.cart.info',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'mrkdwn_in': ['text']
      }

       var infoAttachment2 = {
        fallback: 'Checkout Total2',
        text: `*Service Fee:* ${foodSession.service_fee.$}\n` +
              `*Tip:* ${foodSession.tip.amount.$}\n`,
        'callback_id': 'food.admin.cart.info',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'mrkdwn_in': ['text']
      }

      if (discountAvail) {
        infoAttachment2.text += `\n*Coupon:* -${foodSession.discount_amount.$}`
      }

      if (foodSession.instructions) {
        infoAttachment2.text = infoAttachment2.text + `*Delivery Instructions*: _${foodSession.instructions}_\n`
      }

      response.attachments = _.flatten([mainAttachment, itemAttachments, tipAttachment, infoAttachment, infoAttachment2, finalAttachment]).filter(Boolean)
    } else {
      // some sort of error
      foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
      var deliveryError = JSON.parse(foodSession.delivery_error)
      var errorMsg = `Looks like there are ${deliveryError.length} total errors including: ${deliveryError[0].user_msg}`
      finalAttachment = {
        text: errorMsg,
        fallback: errorMsg,
        callback_id: 'foodConfrimOrder_callbackID',
        attachment_type: 'default'
      }
      response.attachments = _.flatten([mainAttachment, itemAttachments, finalAttachment]).filter(Boolean)
      response.attachments.push({
        'text': 'Do you want to restart the order or end the order?',
        'fallback': 'Do you want to restart the order or end the order?',
        'attachment_type': 'default',
        'mrkdwn_in': ['text'],
        'actions': [{
          'name': 'food.admin.select_address',
          'text': 'Restart Order',
          'type': 'button',
          'style': 'primary',
          'value': 'food.admin.select_address'
        }, {
          'name': 'food.exit.confirm_end_order',
          'text': 'End Order',
          'type': 'button',
          'value': 'food.exit.confirm_end_order'
        }]
       })
    }
  } catch (err) {
    logging.error('error with creating cart payment for some reason', err)
  }

  //if (replace) {
  //  $replyChannel.sendReplace(message, 'food.admin.order.confirm', {type: message.origin, data: response})
  //} else {
    $replyChannel.send(message, 'food.admin.order.confirm', {type: message.origin, data: response})
  //}
}

handlers['food.order.instructions'] = function * (message) {
  var msg = {
    text: `*Add Special Instructions*`,
    attachments: [{
      text: '✎ Type your instructions below (Example: _The door is next to the electric vehicle charging stations behind helipad 6A_)',
      fallback: '✎ Type your instructions below (Example: _The door is next to the electric vehicle charging stations behind helipad 6A_)',
      mrkdwn_in: ['text']
    }]
  }

  var response = yield $replyChannel.sendReplace(message, 'food.order.instructions.submit', {type: message.origin, data: msg})
}

handlers['food.order.instructions.submit'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  yield db.Delivery.update({_id: foodSession._id}, {$set: {'instructions': message.text || ''}}).exec()
  var msg = _.merge({}, message, {
    text: ''
  })
  return yield handlers['food.admin.order.confirm'](msg)
}

handlers['food.member.order.view'] = function * (message) {
  // would be S12 stuff for just member here
}

handlers['food.admin.cart.tip'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.tip.percent = message.source.actions[0].value
  yield foodSession.save()
  yield handlers['food.admin.order.confirm'](message, true)
}

handlers['food.admin.cart.quantity.add'] = function * (message) {
  logging.info('attempting to increase quantity of item')
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var itemObjectID = message.source.actions[0].value
  yield db.Delivery.update({_id: foodSession._id, 'cart._id': itemObjectID.toObjectId()}, {$inc: {'cart.$.item.item_qty': 1}}).exec()
  yield handlers['food.admin.order.confirm'](message, true)
}

handlers['food.admin.cart.quantity.subtract'] = function * (message) {
  logging.info('attempting to decrease quantity of item')
  var itemObjectID = message.source.actions[0].value
  var item = yield db.Delivery.findOne({team_id: message.source.team, active: true}, {'cart': itemObjectID.toObjectId()}).exec()
  if (item.cart[0].item.item_qty === 1) {
    // delete item
    logging.info('deleting this item')
    yield db.Delivery.update({_id: item._id}, {$pull: {cart: {_id: itemObjectID.toObjectId()}}}).exec()
  } else {
    yield db.Delivery.update({_id: item._id, 'cart._id': itemObjectID.toObjectId()}, {$inc: {'cart.$.item.item_qty': -1}}).exec()
  }
  yield handlers['food.admin.order.confirm'](message, true)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
