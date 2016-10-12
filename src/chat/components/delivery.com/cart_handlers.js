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

  $replyChannel.send(message, 'food.cart.personal.confirm', {type: 'slack', data: json})
}

//
// The user has just clicked the confirm button on their personal cart
//
handlers['food.cart.personal.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var myItems = foodSession.cart.filter(i => i.user_id === message.user_id && i.added_to_cart)

  myItems.map(cartItem => {
    var deliveryItem = menu.getItemById(cartItem.item.item_id)
    /** Mitsu add your code here
    cartItem looks like this:
    { added_to_cart: true,
       item: { item_label: '', instructions: '', item_qty: 1, item_id: '265' },
       _id: 57febae8aca1125d7e5435a9,
       user_id: 'U1JU56UG1'
     }

     deliveryItem looks like this:
     {  images: [],
        children:
         [ { unique_id: 288,
             children: [Object],
             type: 'option group',
             sel_dep: 0,
             max_selection: 14,
             min_selection: 0,
             description: '',
             name: 'Meal Additions',
             id: 'PE-68709-43-265-288' } ],
        type: 'item',
        laundry_type: null,
        price_compare_item: false,
        popular_rank: 4,
        popular_flag: true,
        increment: 1,
        max_price: 15.95,
        price: 15.95,
        max_qty: 25,
        min_qty: 1,
        available: null,
        unique_id: 265,
        description: 'Grilled cottage cheese cooked with long grain basmati rice.',
        name: '6. Paneer Tikka Biryani',
        id: 'PE-68709-43-265'
     }
  */
  })
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

module.exports = function(replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
