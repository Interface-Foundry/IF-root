'use strict'
var _ = require('lodash')
var Menu = require('./Menu')
var async = require('async')
var api = require('./api-wrapper')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

// exports
var handlers = {}

//
// Show the user their personal cart
//
handlers['food.cart.personal'] = function * (message, replace) {
  console.log('message.user_id', message.user_id)
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  var menu = Menu(foodSession.menu)
  var myItems = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)
  var totalPrice = myItems.reduce((sum, i) => {
    return sum + menu.getCartItemPrice(i)
  }, 0).toFixed(2)

  var banner = {
    title: '',
    image_url: 'https://storage.googleapis.com/kip-random/kip-my-cafe-cart.png'
  }

  var lineItems = myItems.map((i, index) => {
    var item = menu.flattenedMenu[i.item.item_id]
    var quantityAttachment = {
      title: item.name + ' – $' + menu.getCartItemPrice(i).toFixed(2),
      text: item.description,
      callback_id: item.unique_id,
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
          value: item.unique_id
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
      quantityAttachment.actions[2].confirm = {
        title: 'Remove Item',
        text: `Are you sure you want to remove "${item.name}" from your personal cart?`,
        ok_text: 'Remove it',
        dismiss_text: 'Keep it'
      }
    }

    return quantityAttachment
  })

  var bottom = {
    'text': '',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'wopr_game',
    'color': '#49d63a',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.cart.personal.confirm',
        'text': '✓ Confirm: $' + totalPrice,
        'type': 'button',
        'value': 'chess',
        'style': 'primary'
      },
      {
        'name': 'chess',
        'text': '< Back',
        'type': 'button',
        'value': 'chess'
      }
    ]
  }

  var json = {
    text: `*Confirm Your Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    attachments: [banner].concat(lineItems).concat([bottom])
  }

  if (replace) {
    $replyChannel.sendReplace(message, 'food.cart.personal.confirm', {type: 'slack', data: json})
  } else {
    $replyChannel.send(message, 'food.cart.personal.confirm', {type: 'slack', data: json})
  }
}

// Handles editing the quantity by using the supplied array index, the nth item in the user's personal cart
handlers['food.cart.personal.quantity.add'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var index = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)[index]
  userItem.item.item_qty++
  foodSession.markModified('cart')
  yield foodSession.save()
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
  } else {
    userItem.item.item_qty--
  }
  foodSession.markModified('cart')
  yield foodSession.save()
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
    user.history.orders.push({user_id: user._id, session_id: foodSession._id, chosen_restaurant: foodSession.chosen_restaurant, deliveryItem: deliveryItem,cartItem: JSON.stringify(cartItem), ts: Date.now()});
  })
  yield user.save(function (err, saved) {
    if (err) kip.debug('\n\n\n\n\ncart_handlers.js line 152, err:', err, ' \n\n\n\n\n')
  })

  yield handlers['food.admin.order.confirm'](message, foodSession)
}

/* S12A
*
*/
handlers['food.admin.order.confirm'] = function * (message, foodSession) {
  foodSession = typeof foodSession === 'undefined' ? yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec() : foodSession
  foodSession.confirmed_orders.push(message.source.user)
  foodSession.markModified('confirmed_orders')
  $replyChannel.sendReplace(message, '.', {type: 'slack', data: {text: `Thanks for your order, waiting for the rest of the users to finish their orders`}})
  if (foodSession.confirmed_orders.length < foodSession.team_members.length) {
    logging.warn('Not everyone has confirmed their food orders yet still need: ', _.difference(_.map(foodSession.team_members, 'id'), foodSession.confirmed_orders))
    foodSession.save()
    return
  }
  var order = yield api.createCartForSession(foodSession)
  var admin = yield db.Chatusers.findOne({id: foodSession.convo_initiater.id}).exec()
  foodSession.order = order
  foodSession.save()

  var menu = Menu(foodSession.menu)


  var resp = {
    mode: 'food',
    action: 'admin.restaurant.pick',
    thread_id: admin.dm,
    origin: message.origin,
    source: {
      team: admin.team_id,
      user: admin.id,
      channel: admin.dm
    }
  }

  var response = {
    text: `*Confirm Team Order* for <${foodSession.chosen_location.url}|${foodSession.chosen_location.name}>`,
    attachments: [
      {
        'title': '',
        'image_url': 'https://storage.googleapis.com/kip-random/kip-team-cafe-cart.png'
      }]
  }

  response.attachments.concat(foodSession.cart.map((item) => {
    var foodInfo = menu.getItemById(String(item.item.item_id))
    var descriptionString = _.reduce(_.keys(item.item.option_qty), function (curr, n) { return curr + ', ' + menu.getItemById(String(n)).name }, '')
    return {
      text: `*${foodInfo.name} - $${menu.getCartItemPrice(item)}*
*Options:* ${descriptionString}
*Added by:* <@${item.user_id}>`,
      fallback: 'Meal Choice',
      callback_id: foodInfo.id,
      color: '#3AA3E3',
      attachment_type: 'default',
      mrkdwn_in: [ 'text' ],
      actions: [{
        'name': 'food.cart.decrease',
        'text': '-',
        'type': 'button',
        'value': item.item_id
      }, {
        'name': 'food.null',
        'text': String(item.item_qty),
        'type': 'button',
        'value': item.item_id
      }, {
        'name': 'food.cart.increase',
        'text': '+',
        'type': 'button',
        'value': item.item_id
      }]
    }
  }))
  // attachments with all the food
  response.attachments.push({
    'title': ''
  })
  // final attachment
  response.attachments.push({
    text: `*Delivery Fee:* ${foodSession.order.delivery_fee}
*Taxes:* ${foodSession.order.tax}
*Team Cart Total:* ${foodSession.order.total}`,
    fallback: 'Confirm Choice',
    callback_id: 'foodConfrimOrder_callbackID',
    color: '#3AA3E3',
    attachment_type: 'default',
    mrkdwn_in: [ 'text' ],
    actions: [{
      'name': 'food.admin.confirm_order',
      'text': `Checkout $${foodSession.order.total}`,
      'type': 'button',
      'style': 'primary',
      'value': 'checkout'
    }]
  })

  $replyChannel.send(resp, 'food.admin.order.checkout.address', {type: message.origin, data: response})
}

handlers['food.member.order.view'] = function * (message) {
  // would be S12 stuff for just member here
}

/* S12B
*
*
*/
handlers['food.admin.order.checkout.address'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var response = {
    text: `Whats your apartment or floor number at ${foodSession.addr.address_1}
>Type your apartment or floor number below`,
    fallback: 'Unable to get address',
    callback_id: 'food.admin.order.checkout.address',
    color: '#3AA3E3'
  }
  $replyChannel.send(message, 'food.admin.order.checkout.phone_number', {type: message.origin, data: response})
}

handlers['food.admin.order.checkout.phone_number'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.chosen_location['floor_or_apartment'] = message.text
  foodSession.save()
  var response = {
    text: `Whats your phone number ${foodSession.convo_initiater.name}
>Type your phone number below`,
    fallback: 'Unable to get phone',
    'callback_id': 'wopr_game',
    color: '#3AA3E3'
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {type: message.origin, data: response})
}

handlers['food.admin.order.checkout.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.chosen_location['phone_number'] = message.text
  foodSession.save()
  var response = {
    text: 'Great, please confirm your contact and delivery details:',
    fallback: 'Unable to get address',
    callback_id: 'food.admin.order.checkout.confirm',
    attachments: [
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ]
      },
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ],
        'text': '*Name:* \n ${foodSession.convo_initiater.name}',
        'fallback': 'You are unable to confirm your order',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': 'Edit',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ],
        'text': '*Address:* \n ${foodSession.chosen_location.addr.address_1}',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': 'Edit',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ],
        'text': '*Apt/Floor#:* \n ${foodSession.chosen_location.floor_or_apartment}',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': 'Edit',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ],
        'text': '*Phone Number:* \n ${foodSession.chosen_location.phone_number}',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': 'Edit',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': [

          'text'

        ],
        'text': '*Delivery Instructions:* ${foodSession.data.instructions}',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#49d63a',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '✓ Confirm Address',
            'type': 'button',
            'style': 'primary',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '+ Deliver Instructions',
            'type': 'button',
            'value': 'chess'
          }
        ]
      }
    ]
  }
  $replyChannel.send(message, 'food.admin.order.done', {type: message.origin, data: response})
}

handlers['food.admin.order.done'] = function * (message) {
  var response = {
    'text': "You're all set to check-out!",
    'attachments': [
      {
        'title': '',
        'mrkdwn_in': ['text']
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': 'would be foodSession.checkout_url|➤ Click Here to Checkout>',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default'
      }
    ]
  }
  $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: response})
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
