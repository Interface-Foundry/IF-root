'use strict'
var _ = require('lodash')
var Menu = require('./Menu')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

// exports
var handlers = {}

handlers['food.menu.quick_picks'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec();
  var previouslyOrderedItems = [];
  if (_.get(user,'history.orders') && _.get(user,'history.orders').length > 0) {
    _.get(user,'history.orders').map((order) => {
        if (order.chosen_restaurant.id == foodSession.chosen_restaurant.id) {
          var item = {
            title: order.deliveryItem.name + ' – ' + (_.get(order.deliveryItem, 'price') ? '$' + order.deliveryItem.price : 'price varies'),
            text: order.deliveryItem.description,
            fallback: 'i.name',
            color: '#3AA3E3',
            attachment_type: 'default',
            actions: [
              {
                'name': 'food.item.submenu',
                'text': 'Add to Cart',
                'type': 'button',
                'style': 'primary',
                'value': order.deliveryItem.unique_id
              }
            ]
          };
          previouslyOrderedItems.push(item)
        }
    })
  }
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

  if (previouslyOrderedItems.length > 0) {
    previouslyOrderedItems.map((item) => {
         _.remove(recommendedItems, function(i) {
          kip.debug('\n\nmenu_handlers:96:splicing recommendedItems',  _.get(i, 'actions[0].value'),_.get(item, 'actions[0].value') ,'\n\n');

          return _.get(i, 'actions[0].value')== _.get(item, 'actions[0].value');
        });
    })
    recommendedItems = previouslyOrderedItems.concat(recommendedItems);
  }

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
  debugger;
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

module.exports = function(replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
