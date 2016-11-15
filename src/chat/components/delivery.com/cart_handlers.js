'use strict'

var _ = require('lodash')
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
  console.log('message.user_id', message.user_id)
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
    var quantityAttachment = {
      title: item.name + ' – ' + menu.getCartItemPrice(i).$,
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
    'text': '',
    'fallback': 'You are unable to choose a game',
    'callback_id': 'wopr_game',
    'color': '#49d63a',
    'attachment_type': 'default',
    'actions': [
      {
        'name': 'food.cart.personal.confirm',
        'text': '✓ Confirm: ' + totalPrice.$,
        'type': 'button',
        'value': 'chess',
        'style': 'primary'
      },
      {
        'name': 'food.menu.quick_picks',
        'text': '< Back',
        'type': 'button',
        'value': ''
      }
    ]
  }

  var json = {
    text: `*Confirm Your Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    attachments: [banner].concat(lineItems).concat([bottom])
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
  userItem.item.item_qty++
  yield db.Delivery.update({_id: foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': 1}}).exec()
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
    yield db.Delivery.update({_id: cart.foodSession._id}, {$pull: { cart: {_id: userItem._id }}}).exec()
  } else {
    userItem.item.item_qty--
    yield db.Delivery.update({_id: foodSession._id, 'cart._id': userItem._id}, {$inc: {'cart.$.item.item_qty': -1}}).exec()
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
  foodSession.confirmed_orders.push(message.source.user)
  foodSession.markModified('confirmed_orders')
  yield foodSession.save()

  if (message.source.user !== foodSession.convo_initiater.id && !_.get(foodSession.tracking, 'confirmed_orders_msg')) {
    // user has confirmed but admin has not

    $replyChannel.sendReplace(message, '.', {type: message.origin, data: {text: `Thanks for your order, waiting for the rest of the users to finish their orders`}})
  } else {
    // admin has already confirmed or admin is confirming their vote rn

    var confirmedUsersString = _.reduce(foodSession.confirmed_orders, function (all, user) {
      return all + ', ' + _.filter(foodSession.team_members, {id: user})[0].name
    }, ``).slice(2)

    if (_.get(foodSession.tracking, 'confirmed_orders_msg')) {
      // user has confirmed and admin has already confirmed as well

      // users response
      $replyChannel.sendReplace(message, '.', {type: message.origin, data: {text: `Thanks for your order, waiting for the rest of the users to finish their orders`}})

      // replace admins message
      var msgToReplace = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_orders_msg})
      $replyChannel.sendReplace(msgToReplace, '.', {
        type: msgToReplace.origin,
        data: {text: `Thanks for your order, these users have submitted orders so far: ${confirmedUsersString}, waiting for the rest`}
      })
    } else {
      // admin is confirming, replace their message
      $replyChannel.sendReplace(message, '.', {
        type: message.origin,
        data: {text: `Thanks for your order, these users have submitted orders so far: ${confirmedUsersString}, waiting for the rest`}
      })
      foodSession.tracking.confirmed_orders_msg = message._id
      foodSession.markModified('tracking')
      yield foodSession.save()
    }
  }

  // yield in case it takes a second for foodSession array takes time
  if (foodSession.confirmed_orders.length >= foodSession.team_members.length) {
    // take admin to order confirm, not sure if i need to look this up again but doing it for assurance
    var adminMsg = yield db.Messages.findOne({_id: foodSession.tracking.confirmed_orders_msg})
    yield handlers['food.admin.order.confirm'](adminMsg, true)
  } else {
    logging.warn('Not everyone has confirmed their food orders yet still need: ', _.difference(_.map(foodSession.team_members, 'id'), foodSession.confirmed_orders))
    return
  }
}

handlers['food.admin.order.confirm'] = function * (message, replace) {
  // show admin final confirm of ting
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // check for minimum price
  var menu = Menu(foodSession.menu)
  var totalPrice = foodSession.cart.reduce((sum, i) => {
    return sum + menu.getCartItemPrice(i)
  }, 0)

  var mainAttachment = {
    'title': '',
    'image_url': `https://storage.googleapis.com/kip-random/kip-team-cafe-cart.png`
  }

  // ------------------------------------
  // set up final attachment and tip stuff if total price isnt enough
  var finalAttachment
  var tipAmount
  if (totalPrice < foodSession.chosen_restaurant.minimum) {
    if (foodSession.tipPercent === 'cash') {
      foodSession.tipAmount = 0.00
    } else {
      // set up tip stuff since we dont have order submitted
      foodSession.tipAmount = (Number(foodSession.tipPercent.slice(0, 2)) / 100 * totalPrice).toFixed(2)
    }
    yield foodSession.save()
      // food order minimum not met, let admin add more items i guess
    finalAttachment = {
      text: 'final amount not enough, add more',
      fallback: 'Confirm Choice',
      callback_id: 'foodConfrimOrder_callbackID',
      attachment_type: 'default'
    }
  } else {
    try {
      foodSession.order = yield api.createCartForSession(foodSession)
      foodSession.markModified('order')

      if (foodSession.tipPercent === 'cash') {
        foodSession.tipAmount = 0.00
        tipAmount
      } else {
        foodSession.tipAmount = (Number(foodSession.tipPercent.slice(0, 2)) / 100 * totalPrice).toFixed(2)
      }
      yield foodSession.save()

      // final attachment with everything
      finalAttachment = {
        text: `*Delivery Fee:* ${foodSession.order.delivery_fee.$}\n` +
              `*Taxes:* ${foodSession.order.tax.$}\n` +
              `*Tip:* ${foodSession.tipAmount.$}\n` +
              `*Team Cart Total:* ${foodSession.order.total.$}`,
        fallback: 'Confirm Choice',
        callback_id: 'foodConfrimOrder_callbackID',
        color: '#49d63a',
        attachment_type: 'default',
        mrkdwn_in: ['text'],
        actions: [{
          'name': `food.admin.order.checkout.confirm`,
          'text': `Checkout ${(foodSession.order.total + foodSession.tipAmount).$}`,
          'type': `button`,
          'style': `primary`,
          'value': `checkout`
        }]
      }
    } catch (err) {
      logging.error('error with creating cart payment for some reason', err)
    }
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

  // ------------------------------------
  // tip attachment
  var tipTitle = (foodSession.tipPercent === 'cash') ? `Will tip in cash` : `$${foodSession.tipAmount.toFixed(2)}`
  var tipAttachment = {
    'title': `Tip: ${tipTitle}`,
    'callback_id': 'food.admin.cart.tip',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'mrkdwn_in': ['text'],
    'actions': [`15%`, `20%`, `25%`, `Cash`].map((t) => {
      var baseTipButton = (foodSession.tipPercent.toLowerCase() === t.toLowerCase()) ? `◉ ${t}` : `￮ ${t}`
      return {
        'name': 'food.admin.cart.tip',
        'text': baseTipButton,
        'type': `button`,
        'value': t.toLowerCase()
      }
    })
  }

  // ------------------------------------
  // combine it all
  var response = {
    text: `*Confirm Team Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    fallback: 'You are unable to confirm.',
    callback_id: 'address_confirm',
    attachments: [mainAttachment].concat(itemAttachments).concat([tipAttachment]).concat([finalAttachment])
  }

  if (replace) {
    $replyChannel.sendReplace(message, 'food.admin.order.confirm', {type: message.origin, data: response})
  } else {
    $replyChannel.send(message, 'food.admin.order.confirm', {type: message.origin, data: response})
  }
}

handlers['food.member.order.view'] = function * (message) {
  // would be S12 stuff for just member here
}

handlers['food.admin.cart.tip'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  foodSession.tipPercent = message.source.actions[0].value
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
  if (item.cart[0].item.item_qty === 0) {
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
