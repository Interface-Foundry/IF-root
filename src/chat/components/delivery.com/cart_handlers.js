'use strict'
var _ = require('lodash')
var Menu = require('./Menu')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

// exports
var handlers = {}

//
// Show the user their personal cart
//
handlers['food.cart.personal'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var myItems = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)

  var banner = {
    title: '',
    image_url: 'https://storage.googleapis.com/kip-random/kip-my-cafe-cart.png'
  }

  var lineItems = myItems.map(i => {
    var item = menu.flattenedMenu[i.item.item_id]
    return {
      title: item.name + ' – $10.79',
      text: item.description,
      callback_id: item.unique_id,
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: [
        {
          name: 'food.cart.personal.quantity.add',
          text: '+',
          type: 'button',
          value: item.unique_id
        },
        {
          name: 'food.cart.personal.quantity.add',
          text: i.item.item_qty,
          type: 'button',
          value: item.unique_id
        },
        {
          name: 'food.cart.personal.quantity.subtract',
          text: '—',
          type: 'button',
          value: item.unique_id
        }
      ]
    }
  })

  var bottom = {
    "text": "",
    "fallback": "You are unable to choose a game",
    "callback_id": "wopr_game",
    "color": "#49d63a",
    "attachment_type": "default",
    "actions": [
        {
            "name": "food.cart.personal.confirm",
            "text": "✓ Confirm: $13.54",
            "type": "button",
            "value": "chess",
            "style": "primary"
        },
        {
            "name": "chess",
            "text": "< Back",
            "type": "button",
            "value": "chess"
        }
    ]
  }

  var json = {
    text: `*Confirm Your Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    attachments: [banner].concat(lineItems).concat([bottom])
  }

  $replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
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

module.exports = function(replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
