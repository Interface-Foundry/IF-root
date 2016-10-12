'use strict'
var _ = require('lodash')
var Menu = require('./Menu')

// injected dependencies
var replyChannel

// exported
var handlers = {}

handlers['food.menu.quick_picks'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var recommendedItems = _.values(_.get(foodSession, 'chosen_restaurant_full.summary.recommended_items', {})).map(i => {
    return {
      title: i.name + ' – ' + (_.get(i, 'price') ? '$' + i.price : 'price varies'),
      text: i.description,
      fallback: 'i.name',
      color: '#3AA3E3',
      attachment_type: 'default',
      'actions': [
        {
          'name': 'food.item.submenu',
          'text': 'Add to Cart',
          'type': 'button',
          'style': 'primary',
          'value': i.unique_id
        }
      ]
    }
  })

  var msg_json = {
    'text': `<${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}> - <${foodSession.chosen_restaurant.url}|View Full Menu>`,
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ]
      }].concat(recommendedItems).concat([{
      'text': '',
      'fallback': 'You are unable to choose a game',
      'callback_id': 'wopr_game',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': [
        {
          'name': 'chess',
          'text': 'More >',
          'type': 'button',
          'value': 'chess'
        },
        {
          'name': 'chess',
          'text': 'Category',
          'type': 'button',
          'value': 'chess'
        }
      ]
    }])
  }

  replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: msg_json})
}

//
// After a user clicks on a menu item, this shows the options, like beef or tofu
//
handlers['food.item.submenu'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var item = menu.getItemById(message.source.actions[0].value)

  // check to see if they already have one of these items "in progress"
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart)[0]
  debugger

  if (!userItem) {
    userItem = {
      user_id: message.user_id,
      added_to_cart: false,
      item: {
        item_id: item.unique_id,
        item_qty: 1,
        option_qty: {}
      }
    }

    foodSession.cart.push(userItem)
    foodSession.markModified('cart')
    foodSession.save()
  }

  var json = menu.generateJsonForItem(userItem)
  replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
}

//
// This handles actions
//
handlers['food.option.click'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var option = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart)[0]

  // toggle behavior
  userItem.item.option_qty = userItem.item.option_qty || {}
  if (userItem.item.option_qty[option]) {
    delete userItem.item.option_qty[option]
  } else {
    userItem.item.option_qty[option] = 1
  }
  foodSession.markModified('cart')
  foodSession.save()

  var json = menu.generateJsonForItem(userItem)
  replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

module.exports = function($replyChannel) {
  replyChannel = $replyChannel
  return handlers
}
