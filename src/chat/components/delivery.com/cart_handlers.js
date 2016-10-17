'use strict'
var _ = require('lodash')
var Menu = require('./Menu')
var async = require('async')
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
          name: 'food.cart.personal.quantity.add',
          text: '+',
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
          name: 'food.cart.personal.quantity.subtract',
          text: '—',
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
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec();
  user.history.orders = [];
  yield myItems.map(function * (cartItem){
    user.history.orders.push({user_id: user._id, session_id: foodSession._id, item: JSON.stringify(cartItem), ts: Date.now()});
  })
  yield user.save(function(err, saved){
    if (err) kip.debug('\n\n\n\n\ncart_handlers.js line 152, err:', err,' \n\n\n\n\n')
  });
  $replyChannel.send(message, 'food.cart.personal.confirm', {type: 'slack', data: {text: 'neat-o, thanks'}})
}

//
// After a user clicks on a menu item, this shows the options, like beef or tofu
//
// handlers['food.item.submenu'] = function * (message) {
// var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
// var menu = Menu(foodSession.menu)
// var item = menu.getItemById(message.source.actions[0].value)
//
//   // check to see if they already have one of these items "in progress"
//   var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart)[0]
//   debugger
//
//   if (!userItem) {
//     userItem = {
//       user_id: message.user_id,
//       added_to_cart: false,
//       item: {
//         item_id: item.unique_id,
//         item_qty: 1,
//         option_qty: {}
//       }
//     }
//
//     foodSession.cart.push(userItem)
//     foodSession.markModified('cart')
//     foodSession.save()
//   }
//
//   var json = menu.generateJsonForItem(userItem)
//   replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
// }

/* S12A
*
* TODO:
*/
handlers['food.admin.order.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
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
        'text': 'Add to Cart',
        'type': 'button',
        'value': item.item_id
      }, {
        'name': 'food.null',
        'text': String(item.item_qty),
        'type': 'button',
        'value': item.item_id
      }, {
        'name': 'food.cart.increase',
        'text': String(item.item_qty),
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
    text: `*Delivery Fee:* ${foodSession.order.deliveryFee}
*Taxes:* ${foodSession.order.taxes}
*Team Cart Total:* ${foodSession.order.taxes}`,
    fallback: 'Confirm Choice',
    callback_id: 'foodConfrimOrder_callbackID',
    color: '#3AA3E3',
    attachment_type: 'default',
    mrkdwn_in: [ 'text' ],
    actions: [{
      'name': 'food.admin.confirm_order',
      'text': 'Some $ amnt',
      'type': 'button',
      'style': 'primary',
      'value': 'checkout'
    }]
  })
}

handlers['food.member.order.view'] = function * (message) {
  // would be S12 stuff for just member here
}

/* S12B
*
*
*/
handlers['food.admin.order.checkout'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
