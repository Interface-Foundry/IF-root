'use strict'
var _ = require('lodash')
var Menu = require('./Menu')
var Cart = require('./Cart')
var utils = require('./utils.js')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other files

// exports
var handlers = {}

handlers['food.menu.quickpicks'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec()
  var previouslyOrderedItemIds = []
  var recommendedItemIds = []

  // paging
  var index = parseInt(_.get(message, 'data.value.index')) || 0
  var keyword = _.get(message, 'data.value.keyword')

  // the keyword match bumps stuff up in the sort order
  if (keyword) {
    // search for item if not presented but they type somethin
    logging.info('searching for', keyword.cyan)
    var menu = Menu(foodSession.menu)
    var sortedMenu = menu.allItems()
    var matchingItems = yield utils.matchText(keyword, sortedMenu, {
      // seems to work better for matching
      shouldSort: true,
      threshold: 0.8,
      tokenize: true,
      matchAllTokens: true,
      keys: ['name']
    })

    if (matchingItems !== null) {
      logging.info('we possibly found a food match, hmm')
    } else {
      logging.info('todo send "couldnot find anything matching text" message to user')
      matchingItems = []
    }
  } else {
    matchingItems = []
  }
  matchingItems = matchingItems.map(i => i.unique_id)


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
    orderedBefore: 3,
    recommended: 2,
    none: 1
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

    if (matchingItems.includes(i.unique_id)) {
      i.sortOrder += 10 + (matchingItems.length - matchingItems.indexOf(i.unique_id))/matchingItems.length
    }

    return i
  }).sort((a, b) => b.sortOrder - a.sortOrder)

  var menuItems = sortedMenu.slice(index, index + 3).map(i => {

    var parentName = _.get(menu, `flattenedMenu.${i.parentId}.name`)
    var parentDescription = _.get(menu, `flattenedMenu.${i.parentId}.description`)
    var desc = [parentName, i.description].filter(Boolean).join(' - ')

    var attachment =
      {
      thumb_url: (i.images.length>0 ? i.images[0].url : 'http://tidepools.co/kip/icons/' + (i.parentId%20 + 1) + i.name.match(/[a-zA-Z]/i)[0].toUpperCase() + '.jpg'),
      title: i.name + ' – ' + (_.get(i, 'price') ? i.price.$ : 'price varies'),
      fallback: i.name + ' – ' + (_.get(i, 'price') ? i.price.$ : 'price varies'),
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

    attachment.text = [desc, parentDescription, i.infoLine].filter(Boolean).join('\n')
    return attachment
  })

  var msg_json = {
    'text': `<${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}> - <${foodSession.chosen_restaurant.url}|View Full Menu>`,
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ]
      }].concat(menuItems).concat([{
      'text': '',
      'fallback': 'Food option',
      'callback_id': 'menu_quickpicks',
      'color': '#3AA3E3',
      'attachment_type': 'default',
      'actions': [{
        name: 'food.feedback.new',
        text: '⇲ Send feedback',
        type: 'button',
        value: 'food.feedback.new'
      }]
    }])
  }

  if (sortedMenu.length >= index + 4) {
    msg_json.attachments[msg_json.attachments.length - 1].actions.splice(0, 0, {
      'name': 'food.menu.quickpicks',
      'text': keyword ? `More "${keyword}" >` : 'More >',
      'type': 'button',
      'value': {
        index: index + 3,
        keyword: keyword
      }
    })
  }

  // add the Back button to clear the keyword
  if (keyword) {
    msg_json.attachments[msg_json.attachments.length - 1].actions.push({
      name: 'food.menu.quickpicks',
      type: 'button',
      text: '× Clear'
    })
  }

  if (index > 0) {
    msg_json.attachments[msg_json.attachments.length - 1].actions.splice(0, 0, {
      name: 'food.menu.quickpicks',
      text: '<',
      type: 'button',
      value: {
        index: Math.max(index - 3, 0),
        keyword: keyword
      }
    })
  }

  $replyChannel.sendReplace(message, 'food.menu.search', {type: 'slack', data: msg_json})
}

// just like pressing a category button
handlers['food.menu.search'] = function * (message) {
  message.data = {
    value: {
      index: 0,
      keyword: message.text
    }
  }

  return yield handlers['food.menu.quickpicks'](message)
}

//
// After a user clicks on a menu item, this shows the options, like beef or tofu
//
handlers['food.item.submenu'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()

  // user clicked button
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  var json = cart.menu.generateJsonForItem(userItem)
  $replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
}

//
// This handles actions
//
handlers['food.option.click'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var option_id = message.data.value.option_id
  var item_id = message.data.value.item_id
  var userItem = yield cart.getItemInProgress(item_id, message.source.user)
  var optionNode = cart.menu.getItemById(option_id)
  userItem.item.option_qty = userItem.item.option_qty || {}

  var optionGroupId = optionNode.id.split('-').slice(-2, -1) // get the parent id, which is the second to last number in the id string. (id strings are dash-delimited ids of the nesting order)
  var optionGroup = cart.menu.getItemById(optionGroupId)

  // Radio buttons, can only toggle one at a time
  // so delete any other selected radio before the next step will select it
  if (optionGroup.min_selection === optionGroup.max_selection && optionGroup.min_selection === 1) {
    optionGroup.children.map(radio => {
      if (userItem.item.option_qty[radio.unique_id]) {
        delete userItem.item.option_qty[radio.unique_id]
        deleteChildren(optionNode, userItem, cart.foodSession._id)
        db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$unset: {['cart.$.item.option_qty.' + radio.unique_id]: ''}}).exec()
      }
    })
  }

  // toggle behavior for checkboxes and radio
  if (userItem.item.option_qty[option_id]) {
    delete userItem.item.option_qty[option_id]
    deleteChildren(optionNode, userItem, cart.foodSession._id)
    db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$unset: {['cart.$.item.option_qty.' + option_id]: ''}}).exec()
  } else {
    userItem.item.option_qty[option_id] = 1
    db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$set: {['cart.$.item.option_qty.' + option_id]: 1}}).exec()
  }

  kip.debug('option_qty', userItem.item.option_qty)

  var json = cart.menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

function deleteChildren(node, cartItem, deliveryId) {
  (node.children || []).map(c => {
    if (_.get(cartItem, 'item.option_qty.' + c.unique_id)) {
      kip.debug('deleting', c.unique_id)
      delete cartItem.item.option_qty[c.unique_id]
      db.Delivery.update({_id: deliveryId, 'cart._id': cartItem._id}, {$unset: {['cart.$.item.option_qty.' + c.unique_id]: ''}}).exec()
    }
    deleteChildren(c, cartItem, deliveryId)
  })
}

// Handles only the current item the user is editing
handlers['food.item.quantity.add'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  userItem.item.item_qty++
  db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': 1}}).exec()
  var json = cart.menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

// Handles only the current item the user is editing
handlers['food.item.quantity.subtract'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  if (userItem.item.item_qty === 1) {
    // if it's zero here, go back to the menu view
    message.data = {}
    return yield handlers['food.menu.quickpicks'](message)
  }
  userItem.item.item_qty--
  db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': -1}}).exec()
  var json = cart.menu.generateJsonForItem(userItem)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

handlers['food.item.instructions'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var itemId = message.data.value
  var item = cart.menu.getItemById(itemId)
  var msg = {
    text: `Add Special Instructions for *${item.name}*`,
    attachments: [{
      text: '✎ Type your instructions below (Example: _Hold the egg, no gluten or other farm based products. I eat shadows only. Extra Ranch Dressing!!_)',
      fallback: '✎ Type your instructions below (Example: _Hold the egg, no gluten or other farm based products. I eat shadows only. Extra Ranch Dressing!!_)',
      mrkdwn_in: ['text']
    }]
  }

  var response = yield $replyChannel.sendReplace(message, 'food.item.instructions.submit', {type: message.origin, data: msg})
  db.Messages.update({_id: response._id}, {$set: {'data.item_id': itemId}}).exec()
}

handlers['food.item.instructions.submit'] = function * (message) {
  var itemId = message.history.map(m => _.get(m, 'data.item_id')).filter(Boolean)[0]

  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(itemId, message.source.user)

  yield db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$set: {'cart.$.item.instructions': message.text || ''}}).exec()
  var msg = _.merge({}, message, {
    text: '',
    data: {value: itemId}
  })
  return yield handlers['food.item.submenu'](msg)
}

handlers['food.item.add_to_cart'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  var errJson = cart.menu.errors(userItem)
  if (errJson) {
    kip.debug('validation errors, user must fix some things')
    return $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: errJson})
  }
  userItem.added_to_cart = true
  yield db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$set: {'cart.$.added_to_cart': true}}).exec()

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
