'use strict';
var _ = require('lodash');
var stable = require('stable');
var striptags = require('striptags');

var config = require('../../../config');
var Menu = require('./Menu');
var Cart = require('./Cart');
var utils = require('./utils.js');
var menu_utils = require('./menu_utils');
var preferences = require('../../../preferences/preferences.js');

// injected dependencies
var $replyChannel;
var $allHandlers; // this is how you can access handlers from other files

/**@namespace*/
var handlers = {}

/**
* Displays most popular menu items for the user to order
* @param message
*/
handlers['food.menu.quickpicks'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec();

  var menu = Menu(foodSession.menu);
  var sortedMenu = menu.allItems();

  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec();
  var previouslyOrderedItemIds = [];
  var recommendedItemIds = [];
  var preferencesItems = [];
  var matchingItems = [];

  // paging
  var index = parseInt(_.get(message, 'data.value.index')) || 0;
  var keyword = _.get(message, 'data.value.keyword');

  if (keyword) db.waypoints.log(1211, foodSession._id, message.user_id, {original_text: message.original_text});
  else db.waypoints.log(1210, foodSession._id, message.user_id, {original_text: message.original_text});

  // the keyword match bumps stuff up in the sort order
  if (keyword) {
    // search for item if not presented but they type somethin
    logging.info('searching for', keyword.cyan);
    matchingItems = yield utils.matchText(keyword, sortedMenu, {
      shouldSort: true,
      location: 0,
      distance: 0,
      threshold: 0.3,
      tokenize: true,
      keys: ['name']
    });

    if (matchingItems !== null) {
      logging.info('we possibly found a food match, hmm');
    } else {
      logging.info('todo send "couldnot find anything matching text" message to user');
      matchingItems = [];
    }
    matchingItems = matchingItems.map(i => i.id);
  }

  previouslyOrderedItemIds = _.get(user, 'history.orders', [])
    .filter(order => _.get(order, 'chosen_restaurant.id') === _.get(foodSession, 'chosen_restaurant.id', 'not undefined'))
    .reduce((allIds, order) => {
      allIds.push(order.deliveryItem.id);
      return allIds;
    }, []);

  recommendedItemIds = _.keys(_.get(foodSession, 'chosen_restaurant_full.summary.recommended_items', {}));
  recommendedItemIds = recommendedItemIds.map(i => Number(i));
  //
  // adding the thing where you show 3 at a time
  // need to show a few different kinds of items.
  // Items that you have ordered before appear first, and should say something like "Last ordered Oct 5"
  // Items that are in the recommended items array should appear next, say "Recommended"
  // THen the rest of the menu in any order i think
  //
  var sortOrder = {
    searched: 7,
    preferences: 6,
    orderedBefore: 5,
    recommended: 4,
    none: 3,
    indifferent: 2,
    last: 1
  };

  // create preferences via random suggestions

  if (kip.config.preferences.suggestions && (kip.config.preferences.users.includes(message.user_id))) {
    // returns array of unique_ids to suggest to user
    preferencesItems = yield preferences.createPreferences(user, sortedMenu, 1, 'cafe_suggestions', true);
    preferencesItems = preferencesItems.map(i => i.unique_id);
    logging.debug('random preferences.length~: ', preferencesItems);
  }

  /*
  not really any good way to order items atm so just going to throw
  everything in last til have some actual way to order things w/ sortOrder
  */
  var lastItems = ['beverage', 'beverages', 'desserts', 'dessert', 'cold appetizer', 'hot appetizer', 'appetizers', 'appetizers from the kitchen', 'soup', 'soups', 'drinks', 'salads', 'side salads', 'side menu', 'bagged snacks', 'snacks'];

  sortedMenu = menu.allItems().map(i => {
    // inject the sort order stuff
    if (matchingItems.includes(i.id)) {
      i.sortOrder = sortOrder.searched + matchingItems.length - matchingItems.findIndex(x => { return x === i.id; });
      // i.infoLine = 'Returned from search term'
    } else if (previouslyOrderedItemIds.includes(i.id)) {
      i.sortOrder = sortOrder.orderedBefore;
      i.infoLine = '_You\'ve ordered this before_';
    } else if (recommendedItemIds.includes(Number(i.unique_id))) {
      i.sortOrder = sortOrder.recommended;
      // i.infoLine = 'Popular Item'
    } else if (_.includes(lastItems, menu.flattenedMenu[String(i.parentId)].name.toLowerCase())) {
      i.sortOrder = sortOrder.last;
    } else if (preferencesItems.includes(Number(i.unique_id))) {
      i.sortOrder = sortOrder.preferences;
      i.infoLine = '*_This is a suggested item_*';
    } else {
      i.sortOrder = sortOrder.none;
    }

    return i;
  }).sort((a, b) => b.sortOrder - a.sortOrder);

  // ~~~~~
  // move items that do not meet the user's current budget to after those that
  // do using a stable sort, to preserve the order of the previous sort within
  // those two categories
  if (foodSession.budget) {
    var current_ub = foodSession.user_budgets[message.user_id] * 1.25;
    stable.inplace(sortedMenu, function (a, b) { //sorts b before a if true
      // if b is under-budget and a is not, sort b before a
      if (a.price > current_ub && b.price < current_ub) return true;
      else return false;
      // but otherwise maintain already-sorted order
    });
  }

  var menuItems = sortedMenu.slice(index, index + 3).reverse().map(i => {
    var parentName = _.get(menu, `flattenedMenu.${i.parentId}.name`);
    var parentDescription = _.get(menu, `flattenedMenu.${i.parentId}.description`);
    var desc = [parentName, i.description].filter(Boolean).join(' - ');

    // console.log('popular item??', i)

    var attachment = {
      thumb_url: (i.images.length > 0 ? i.images[0].url : 'http://tidepools.co/kip/icons/' + i.name.match(/[a-zA-Z]/i)[0].toUpperCase() + '.png'),
      title: i.name + ' – ' + (_.get(i, 'price') ? i.price.$ : 'price varies'),
      fallback: i.name + ' – ' + (_.get(i, 'price') ? i.price.$ : 'price varies'),
      color: '#3AA3E3',
      attachment_type: 'default',
      mrkdwn_in: ['text'],
      'actions': [
        {
          'name': 'food.item.submenu',
          'text': '+ Add to Order',
          'type': 'button',
          'style': 'primary',
          'value': i.id
        }
      ]
    };
    desc = (desc.split(' ').length > 26 ? desc.split(' ').slice(0,26).join(' ')+'…' : desc);
    parentDescription = (parentDescription.split(' ').length > 26 ? parentDescription.split(' ').slice(0,26).join(' ')+'…' : parentDescription);

    //clean out html from descriptions
    desc = striptags(desc)
    parentDescription = striptags(parentDescription)
    attachment.text = [desc, parentDescription, i.infoLine].filter(Boolean).join('\n')
    return attachment
  })

  var backButton = {
    name: 'food.menu.quickpicks',
    text: '<',
    type: 'button',
    value: {
      index: Math.max(index - 3, 0),
      keyword: keyword
    }
  };

  var moreButton = {
    'name': 'food.menu.quickpicks',
    'text': keyword ? `More "${keyword}" >` : 'More >',
    'type': 'button',
    'value': {
      index: index + 3,
      keyword: keyword
    }
  };

  if (!keyword && index > 0) {
    menuItems[menuItems.length-1].actions.push(backButton);
  }

  if (!keyword && sortedMenu.length >= index + 4) {
    menuItems[menuItems.length-1].actions.push(moreButton);
  }

  var msg_json = {
    'text': '',
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
      'actions': []
    }])
  };

  // place buttons in a separate attachment if the user is searching for a keyword
  if (keyword) {
    msg_json.attachments[msg_json.attachments.length - 1].actions.push({
      name: 'food.menu.quickpicks',
      type: 'button',
      text: '× Clear'
    });
    if (index > 0) {
      msg_json.attachments[msg_json.attachments.length - 1].actions.push(backButton);
    }

    if (sortedMenu.length >= index + 4) {
      msg_json.attachments[msg_json.attachments.length - 1].actions.push(moreButton);
    }
  }

  // if the popout system isn't working, use the delivery.com url instead of (failing to) generate our own
  if (config.menuURL) var url = yield menu_utils.getUrl(foodSession, message.source.user);
  else var url = foodSession.chosen_restaurant.url;

  var resto = yield db.merchants.findOne({id: foodSession.chosen_restaurant.id});

  msg_json.attachments.push({
    'fallback': 'Search the menu',
    'text': `*${foodSession.chosen_restaurant.name}*`,
    'color': '#49d63a',
    'fields': [ // first field would be budget
      {
        'short': true,
        'value': `*<${!url.error ? url : foodSession.chosen_restaurant.url}|View Full Menu ${menu_utils.cuisineEmoji(resto.data.summary.cuisines[0])}>*`
      }
    ],
    'mrkdwn_in': ['text', 'fields'],
    'actions': []
  });

  if (foodSession.cart.filter(function (item) { return item.user_id === message.user_id; }).length) {
    msg_json.attachments[msg_json.attachments.length-1].actions.push({
      name: 'food.cart.personal',
      type: 'button',
      text: 'View My Cart'
    });
  }

  if (foodSession.budget && foodSession.convo_initiater.id != message.source.user) {
    if (Number(foodSession.user_budgets[message.user_id]) >= 2) {
      var text = `Aim to spend around $${Math.round(foodSession.user_budgets[message.user_id])}!`;
    }
    else {
      var text = `_You have already exhausted your budget!_`
    }
    msg_json.attachments[msg_json.attachments.length-1].fields.unshift({
      'short': true,
      'value': text
    });
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

/**
* After a user clicks on a menu item, this shows the options, like beef or tofu
*/
handlers['food.item.submenu'] = function * (message) {

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  db.waypoints.log(1220, foodSession._id, message.user_id, {original_text: message.original_text})

  var cart = Cart(message.source.team)
  yield cart.pullFromDB()

  // user clicked button
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  var json = cart.menu.generateJsonForItem(userItem, false, message)
  $replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: json})
}

handlers['food.item.loadmore'] = function * (message){
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value.item_id, message.source.user)
  var optionIndices = _.get(message, 'data.value.optionIndices') ? _.get(message, 'data.value.optionIndices') :  {}
  var groupId = parseInt(_.get(message, 'data.value.group_id'))
  var rowCount = parseInt(_.get(message, 'data.value.row_count'))
  optionIndices[groupId] = rowCount

  var json = cart.menu.generateJsonForItem(userItem, false, message)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
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
  //var optionGroupId = optionNode.id.split('-').slice(-2, -1) // get the parent id, which is the second to last number in the id string. (id strings are dash-delimited ids of the nesting order)
  var optionGroupId = optionNode.parentId
  var optionGroup = cart.menu.getItemById(optionGroupId)
  // Radio buttons, can only toggle one at a time
  // so delete any other selected radio before the next step will select it
  if (optionGroup.min_selection === optionGroup.max_selection && optionGroup.min_selection === 1) {
    optionGroup.children.map(radio => {
      if (userItem.item.option_qty[radio.id]) {
        delete userItem.item.option_qty[radio.id]
        deleteChildren(optionNode, userItem, cart.foodSession._id)
        db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$unset: {['cart.$.item.option_qty.' + radio.id]: ''}}).exec()
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

  var json = cart.menu.generateJsonForItem(userItem, false, message)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

function deleteChildren(node, cartItem, deliveryId) {
  (node.children || []).map(c => {
    if (_.get(cartItem, 'item.option_qty.' + c.id)) {
      kip.debug('deleting', c.id)
      delete cartItem.item.option_qty[c.id]
      db.Delivery.update({_id: deliveryId, 'cart._id': cartItem._id}, {$unset: {['cart.$.item.option_qty.' + c.id]: ''}}).exec()
    }
    deleteChildren(c, cartItem, deliveryId)
  })
}

/**
*  Increments the quantity of ~only~ the item the user is currently in the process of editing.
*/
handlers['food.item.quantity.add'] = function * (message) {
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)
  userItem.item.item_qty++
  db.Delivery.update({_id: cart.foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': 1}}).exec()
  var json = cart.menu.generateJsonForItem(userItem, false, message)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

/**
*  Decrements the quantity of ~only~ the item the user is currently in the process of editing.
*/
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
  var json = cart.menu.generateJsonForItem(userItem, false, message)
  $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: json})
}

/**
* Allow the user to add instructions for a specific food item
* @param message
*/
handlers['food.item.instructions'] = function * (message) {

  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  db.waypoints.log(1221, foodSession._id, message.user_id, {original_text: message.original_text})

  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var itemId = message.data.value
  var item = cart.menu.getItemById(itemId)
  var msg = {
    text: `Add Special Instructions for *${item.name}*`,
    attachments: [{
      text: '✎ Type your instructions below (Example: _Extra chili on side_)',
      fallback: '✎ Type your instructions below',
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
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var cart = Cart(message.source.team)
  yield cart.pullFromDB()
  var userItem = yield cart.getItemInProgress(message.data.value, message.source.user)

  var errJson = cart.menu.errors(userItem)
  if (errJson) {
    kip.debug('validation errors, user must fix some things')
    return $replyChannel.sendReplace(message, 'food.menu.submenu', {type: 'slack', data: errJson})
  }
  else {
    if (foodSession.budget && foodSession.convo_initiater.id != message.source.user) {
      var budgets = foodSession.user_budgets;
      var menu = Menu(foodSession.menu);
      var itemPrice = menu.getCartItemPrice(userItem);

      if (itemPrice > (budgets[userItem.user_id]) * 1.125) {
        yield db.Delivery.update({team_id: message.source.team, active: true}, {$unset: {}});
        return $replyChannel.sendReplace(message, 'food.menu.quickpicks', {
          type: 'slack',
          data: {
          //   text: `Please choose something cheaper`,
          //   mrkdwn_in: ['text'],
          //   color: '#fc9600'
            attachments: [{
              color: '#fc9600',
              fallback: 'the unfrugal are the devils\'s playthings',
              text: 'Please choose something cheaper'
            }]
          },
        })
      }

      budgets[userItem.user_id] -= itemPrice;

      yield db.Delivery.update(
        {team_id: message.source.team, active: true},
        {$set: {
          user_budgets: budgets
        }}
      );
    }
  }

  logging.debug('userItem', userItem)
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
