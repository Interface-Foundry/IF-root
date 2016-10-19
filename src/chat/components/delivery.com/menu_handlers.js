'use strict'
var _ = require('lodash')
var Menu = require('./Menu')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.menu.quick_picks'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec()
  var previouslyOrderedItemIds = []
  var recommendedItemIds = []
  
  // paging
  var index = parseInt(_.get(message, 'data.value')) || 0


  var previouslyOrderedItemIds = _.get(user, 'history.orders', [])
    .filter(order => _.get(order, 'chosen_restaurant.id') === _.get(foodSession, 'chosen_restaurant.id', 'not undefined'))    
    .reduce((allIds, order) => {
      allIds.push(order.deliveryItem.unique_id)      
      return allIds
    }, [])

  var recommendedItemIds = Object.keys(_.get(foodSession, 'chosen_restaurant_full.summary.recommended_items', {}))

  //
  // adding the thing where you show 3 at a time
  // nned to show a few different kinds of itesm. 
  // Items that you have ordered before appear first, and should say something like "Last ordered Oct 5"
  // Items that are in the recommended items array should appear next, say "Recommended"
  // THen the rest of the menu in any order i think
  //
  var sortOrder = {
    orderedBefore: 1,
    recommended: 2,
    none: 3
  }

  var menu = Menu(foodSession.menu)
  var sortedMenu = menu.allItems().map(i => {
    // inject the sort order stuff
    if (previouslyOrderedItemIds.includes(i.unique_id)) {
      i.sortOrder = sortOrder.orderedBefore
      i.infoLine = "You ordered this before"
    } else if (recommendedItemIds.includes(i.unique_id)) {
      i.sortOrder = sortOrder.recommended
      i.infoLine = "Popular Item"
    } else {
      i.sortOrder = sortOrder.none
    }

    return i
  }).sort((a, b) => a.sortOrder - b.sortOrder).slice(index, index + 3).map(i => {
    var attachment = {
      title: i.name + ' – ' + (_.get(i, 'price') ? '$' + i.price : 'price varies'),
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

    attachment.text = [i.description, i.infoLine].filter(Boolean).join('\n')

    return attachment
  })

  var msg_json = {
    'text': `<${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}> - <${foodSession.chosen_restaurant.url}|View Full Menu>`,
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ]
      }].concat(sortedMenu).concat([{
      'text': '',
      'fallback': 'You are unable to choose a game',
      'callback_id': 'wopr_game',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': [
        {
          'name': 'food.menu.quick_picks',
          'text': 'More >',
          'type': 'button',
          'value': index + 3
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

  $replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: msg_json})
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
  $replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
}

//
// This handles actions
//
handlers['food.option.click'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var option = message.source.actions[0].value
  var optionNode = menu.getItemById(option)
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart)[0]
  userItem.item.option_qty = userItem.item.option_qty || {}

  var optionGroupId = optionNode.id.split('-').slice(-2, -1) // get the parent id, which is the second to last number in the id string. (id strings are dash-delimited ids of the nesting order)
  var optionGroup = menu.getItemById(optionGroupId)

  // Radio buttons, can only toggle one at a time
  // so delete any other selected radio before the next step will select it
  if (optionGroup.min_selection === optionGroup.max_selection && optionGroup.min_selection === 1) {
    optionGroup.children.map(radio => {
      delete userItem.item.option_qty[radio.unique_id]
    })
  }

  // toggle behavior
  if (userItem.item.option_qty[option]) {
    delete userItem.item.option_qty[option]
  } else {
    userItem.item.option_qty[option] = 1
  }
  foodSession.markModified('cart')
  foodSession.save()

  var json = menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

// Handles only the current item the user is editing
handlers['food.item.quantity.add'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var itemId = message.source.actions[0].value
  debugger
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart && i.item.item_id === itemId)[0]
  userItem.item.item_qty++
  foodSession.markModified('cart')
  foodSession.save()
  var json = menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

// Handles only the current item the user is editing
handlers['food.item.quantity.subtract'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var itemId = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart && i.item.item_id === itemId)[0]
  if (userItem.item.item_qty === 1) {
    // don't let them go down to zero
    return
  }
  userItem.item.item_qty--
  foodSession.markModified('cart')
  foodSession.save()
  var json = menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

handlers['food.item.add_to_cart'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var menu = Menu(foodSession.menu)
  var option = message.source.actions[0].value
  var userItem = foodSession.cart.filter(i => i.user_id === message.user_id && !i.added_to_cart)[0]

  userItem.added_to_cart = true
  foodSession.markModified('cart')
  yield foodSession.save()

  // check for errors
  // if errors, highlight errors
  // otherwise go to S11 confirm personal order
  // replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: {text: 'neat-o, thanks'}})
  return yield $allHandlers['food.cart.personal'](message, true)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
