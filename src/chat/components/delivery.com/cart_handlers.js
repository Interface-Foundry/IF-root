'use strict'
var _ = require('lodash')
var request = require('request-promise')

var mongoose = require('mongoose')
var Menu = require('./Menu')
var api = require('./api-wrapper')
var sleep = require('co-sleep')

// injected dependencies
var $replyChannel
var $allHandlers // this is how you can access handlers from other methods

// exports
var handlers = {}

// allow mongoose ._id to be used as button things
String.prototype.toObjectId = function() {
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
  foodSession.order = yield api.createCartForSession(foodSession)
  foodSession.markModified('order')
  yield foodSession.save()

  var menu = Menu(foodSession.menu)
  var response = {
    text: `*Confirm Team Order* for <${foodSession.chosen_restaurant.url}|${foodSession.chosen_restaurant.name}>`,
    attachments: [
      {
        'title': '',
        'image_url': `https://storage.googleapis.com/kip-random/kip-team-cafe-cart.png`
      }]
  }

  response.attachments = response.attachments.concat(foodSession.cart.map((item) => {
    var foodInfo = menu.getItemById(String(item.item.item_id))

    var descriptionString = _.keys(item.item.option_qty).map((opt) => menu.getItemById(String(opt)).name).join(', ')
    var textForItem = `*${foodInfo.name} - ${menu.getCartItemPrice(item).$}*\n`
    textForItem += descriptionString.length > 0 ? `*Options:* ${descriptionString}\n` + `*Added by:* <@${item.user_id}>` : `*Added by:* <@${item.user_id}>`
    return {
      text: textForItem,
      callback_id: foodInfo.id,
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
  }))
  // tip stuff

  var tipButtons = [`15%`, `20%`, `25%`, `Cash`].map((t) => {
    var baseTipButton = (foodSession.tip === t) ? `◉ ${t}` : `￮ ${t}`
    return {
      'name': 'food.admin.cart.tip',
      'text': baseTipButton,
      'type': `button`,
      'value': t.toLowerCase()
    }
  })
  var tipAmount
  if (foodSession.tip.toLowerCase() === 'cash') {
    tipAmount = `Will tip with cash`
  } else {
    tipAmount = String(Number(foodSession.tip.slice(0, 2)) * 0.01 * foodSession.order.subtotal)
  }

  response.attachments.push({
    'title': `*Tip:* ${tipAmount}`, // need tip amount,
    'callback_id': 'food.admin.cart.tip',
    'color': '#3AA3E3',
    'attachment_type': 'default',
    'mrkdwn_in': ['text'],
    'actions': tipButtons
  })

  // final attachment
  response.attachments.push({
    text: `*Delivery Fee:* ${foodSession.order.delivery_fee.$}\n` +
          `*Taxes:* ${foodSession.order.tax.$}\n` +
          `*Team Cart Total:* ${foodSession.order.total.$}`,
    fallback: 'Confirm Choice',
    callback_id: 'foodConfrimOrder_callbackID',
    color: '#3AA3E3',
    attachment_type: 'default',
    mrkdwn_in: ['text'],
    actions: [{
      'name': `food.admin.order.checkout.confirm`,
      'text': `Checkout ${foodSession.order.total.$}`,
      'type': `button`,
      'style': `primary`,
      'value': `checkout`
    }]
  })

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
  foodSession.tip = message.source.actions[0].value
  foodSession.save()
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

/* S12B
*
*
*/
handlers['food.admin.order.checkout.address'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var response = {
    'text': `Whats your apartment or floor number at ${foodSession.chosen_location.address_1}\n` +
          `>Type your apartment or floor number below`,
    'fallback': 'Unable to get address',
    'callback_id': `food.admin.order.checkout.address`
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.address', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.name'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var response = {
    'text': `Hey ${foodSession.convo_initiater.name} what's the full name of the person who will be receiving this order\n` +
            `>Type their name below`,
    'fallback': 'Unable to get name',
    'callback_id': 'food.admin.order.checkout.name'
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.name', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.phone_number'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  // process user name from previous message
  var response = {
    'text': `Whats your phone number ${foodSession.convo_initiater.name}\n` +
            `>Type your phone number below:`,
    'fallback': 'Unable to get phone',
    'callback_id': 'food.admin.order.checkout.phone_number'
  }

  // can check to see if we already have phone number
  // if (foodSession.convo_initiater.phone_number) {
  //   // retrieve users phone number
  //   response = {
  //     text: `Should we use a phone number from your previous order? ${foodSession.convo_initiater.phone_number}`,
  //     fallback: `unable to confirm phone number`,
  //     callback_id: `food.admin.order.checkout.phone_number`,
  //     color: `#3AA3E3`,
  //     attachments: [{
  //       'title': '',
  //       'text': ``,
  //       'fallback': `You are pay for this order`,
  //       'callback_id': `food.admin.order.checkout.phone_number`,
  //       'color': `#3AA3E3`,
  //       'attachment_type': `default`,
  //       'actions': [{
  //         'name': `food.admin.order.checkout.phone_number`,
  //         'text': `Confirm`,
  //         'style': `primary`,
  //         'type': `button`,
  //         'value': `edit`
  //       }, {
  //         'name': `food.admin.order.checkout.phone_number`,
  //         'text': `Edit`,
  //         'type': `button`,
  //         'value': `edit`
  //       }]
  //     }]
  //   }
  // }
  // get users phone number
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.phone_number', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var prevMessage = yield db.Messages.find({thread_id: message.thread_id, incoming: false}).sort('-ts').limit(1)
  prevMessage = prevMessage[0]
  console.log('heerrr', prevMessage.reply.textFor)
  var editInfo = {}

  editInfo['admin.order.checkout.address'] = function * (message) {
    logging.info('saving apartment number: ', message.text)
    foodSession.chosen_location.address_2 = message.text
    foodSession.markModified('chosen_location')
    yield foodSession.save()
  }

  editInfo['admin.order.checkout.name'] = function * (message) {
    logging.info('saving name of person receiving order: ', message.text)
    if (message.text.split(' ').length > 1) {
      foodSession.convo_initiater.first_name = message.text.split(' ')[0]
      foodSession.convo_initiater.last_name = message.text.split(' ')[1]
      foodSession.markModified('convo_initiater')
      yield foodSession.save()
    } else {
      // throw error in replyChannel
      $replyChannel.sendReplace(message, 'food.admin.order.checkout.confirm', {type: message.origin, data: {text: 'hmm there was an issue, can you redo that?'}})
      return
    }
  }

  editInfo['admin.order.checkout.phone_number'] = function * (message) {
    var num = message.text.replace(/<tel:([^|]*)\|.*/, '$1')
    logging.info('saving phone number: ', num, 'from', message.text)
    foodSession.chosen_location.phone_number = num
    foodSession.markModified('chosen_location')
    yield foodSession.save()
  }

  if (_.get(prevMessage, 'reply.textFor') && _.includes(_.keys(editInfo), prevMessage.reply.textFor)) {
    yield editInfo[prevMessage.reply.textFor](message)
  }

  if (!foodSession.chosen_location.address_2) {
    return yield handlers['food.admin.order.checkout.address'](message)
  }
  if (!foodSession.convo_initiater.last_name) {
    return yield handlers['food.admin.order.checkout.name'](message)
  }
  if (!foodSession.chosen_location.phone_number) {
    return yield handlers['food.admin.order.checkout.phone_number'](message)
  }

  var response = {
    text: `Great, please confirm your contact and delivery details:`,
    fallback: `Unable to get address`,
    callback_id: `food.admin.order.checkout.confirm`,
    attachments: [
      {
        'title': '',
        'mrkdwn_in': ['text']
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Name:*\n` +
                `${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name}`,
        'fallback': `You are unable to change name`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.name`,
            'text': `Edit`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': [`text`],
        'text': `*Address:*\n` +
                `${foodSession.chosen_location.address_1}`,
        'fallback': `You are unable to change address`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.address`,
            'text': `Edit`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Apt/Floor#:*\n` +
                `${foodSession.chosen_location.address_2}`,
        'fallback': `You are unable to confirm this order`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'food.admin.order.checkout.address_2',
            'text': `Edit`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Phone Number:*\n` +
                `${foodSession.chosen_location.phone_number}`,
        'fallback': `You are unable to choose a game`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.phone_number`,
            'text': `Edit`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Delivery Instructions:*\n` +
                `${foodSession.data.instructions}`,
        'fallback': `You are unable to edit instructions`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#49d63a`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.pay`,
            'text': `✓ Confirm Address`,
            'type': `button`,
            'style': `primary`,
            'value': `confirm`
          },
          {
            'name': `food.admin.order.checkout.deliver_instructions`,
            'text': `+ Delivery Instructions`,
            'type': `button`,
            'value': `edit`
          }
        ]
      }
    ]
  }
  $replyChannel.send(message, 'food.admin.order.pay', {type: message.origin, data: response})
}

handlers['food.admin.order.pay'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  // base response
  var response = {
    text: `Checkout for ${foodSession.chosen_restaurant.name} - $${foodSession.order.total}`,
    fallback: `Unable to pay for order`,
    callback_id: `food.admin.order.pay`,
    attachments: [{
      'title': '',
      'mrkdwn_in': ['text'],
      'text': ``,
      'fallback': `You are unable to add a card`,
      'callback_id': `food.admin.order.pay`,
      'color': `#3AA3E3`,
      'attachment_type': `default`,
      'actions': [{
        'name': `food.admin.add_new_card`,
        'text': `+ Add new Card`,
        'type': `button`,
        'value': `add`
      },{
        'name': `food.admin.order.confirm`,
        'text': `< Change Order`,
        'type': `button`,
        'value': `change`
      }]
    }]
  }

  if (_.get(slackbot.meta, 'payments')) {
    // we already have a card source, present cards

    var cardImages = {
      visa: `https://storage.googleapis.com/kip-random/visa.png`,
      mastercard: `https://storage.googleapis.com/kip-random/mastercard.png`
    }

    var cardsAttachment = slackbot.meta.payments.map((c) => {
      return {
        'title': `${c.card.brand}`,
        'text': `Ending in ${c.card.last_4}, exp ${c.card.exp_date}`,
        'fallback': `You are unable to pick this card`,
        'callback_id': `food.admin.order.select_card`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'thumb_url': _.get(c, 'card.card_type') ? cardImages[c.card.card_type.toLowerCase()] : '',
        'actions': [{
          'name': `food.admin.order.select_card`,
          'text': `✓ Select Card`,
          'type': `button`,
          'style': `primary`,
          'value': c.card.card_id
        }]
      }
    })
    // cardsAttachment[0].pretext = `Payment Information`
    response.attachments = response.attachments.concat(cardsAttachment)
  }
  $replyChannel.sendReplace(message, 'food.admin.order.select_card', {type: message.origin, data: response})
}

handlers['food.admin.add_new_card'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // add various shit to the foodSession
  var postBody = {
    '_id': foodSession._id,
    'kip_token': `mooseLogicalthirteen$*optimumNimble!Cake`,
    'active': foodSession.active,
    'team_id': foodSession.team_id,
    'chosen_location': {
      'addr': {
        'address_1': foodSession.chosen_location.address_1,
        'address_2': foodSession.chosen_location.address_2,
        'city': foodSession.chosen_location.city,
        'state': foodSession.chosen_location.state,
        'zip_code': foodSession.chosen_location.zip_code,
        'coordinates': []
      },
      'special_instructions': foodSession.data.special_instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': foodSession.order.total * 100,
      'tip': 0,
      'order_type': foodSession.fulfillment_method
    }
  }

  try {
    foodSession.payment = yield request({
      uri: `https://pay.kipthis.com/charge`,
      method: `POST`,
      json: true,
      body: postBody
    })
    foodSession.save()
  } catch (e) {
    logging.error('error doing kip pay lol', e)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'ok couldnt submit to kippay'}})
  }

  var response = {
    'text': `You're all set to add a new card and check-out!`,
    'fallback': `You are unable to complete payment`,
    'callback_id': `food.admin.add_new_card`,
    'color': `#3AA3E3`,
    'attachment_type': `default`,
    'attachments': [{
      'title': '',
      'mrkdwn_in': ['text'],
      'text': `Cool, <${foodSession.payment.url}|➤ Click Here to add cart and pay>`,
      'fallback': `You are unable to follow this link to confirm order`,
      'callback_id': `food.admin.add_new_card`,
      'color': `#3AA3E3`,
      'attachment_type': `default`
    }]
  }
  $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: response})
}

handlers['food.admin.order.select_card'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var card = _.find(slackbot.meta.payments, {
    'card': {'card_id': message.source.actions[0].value}
  })

    // add various shit to the foodSession
  var postBody = {
    '_id': foodSession._id,
    'kip_token': `mooseLogicalthirteen$*optimumNimble!Cake`,
    'active': foodSession.active,
    'team_id': foodSession.team_id,
    'chosen_location': {
      'addr': {
        'address_1': foodSession.chosen_location.address_1,
        'address_2': foodSession.chosen_location.address_2,
        'city': foodSession.chosen_location.city,
        'state': foodSession.chosen_location.state,
        'zip_code': foodSession.chosen_location.zip_code,
        'coordinates': []
      },
      'special_instructions': foodSession.data.special_instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': foodSession.order.total * 100,
      'tip': 0,
      'order_type': foodSession.fulfillment_method
    },
    'saved_card': {
      'vendor': card.vendor,
      'customer_id': card.customer_id,
      'card_id': card.card.card_id
    }
  }

  try {
    foodSession.payment = yield request({
      uri: `https://pay.kipthis.com/charge`,
      method: `POST`,
      json: true,
      body: postBody
    })
    foodSession.save()
    var response = {
      'text': ``,
      'fallback': `You are unable to complete payment`,
      'callback_id': `food.admin.select_card`,
      'color': `#3AA3E3`,
      'attachment_type': `default`,
      'attachments': [{
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `Cool, <${foodSession.payment.url}|➤ Click Here to Checkout>`,
        'fallback': `You are unable to follow this link to confirm order`,
        'callback_id': `food.admin.add_new_card`,
        'color': `#3AA3E3`,
        'attachment_type': `default`
      }]
    }
  } catch (e) {
    logging.error('error doing kip pay lol', e)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'couldnt submit to kippay'}})
  }
  $replyChannel.sendReplace(message, 'food.admin.order.pay.confirm', {type: message.origin, data: response})
}

handlers['food.admin.order.pay.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var c = _.find(slackbot.meta.payments, {'card': {'card_id': message.source.actions[0].value}})
  var response = {
    text: ``,
    fallback: `You are unable to complete payment`,
    callback_id: `food.admin.order.pay.confirm`,
    attachments: [{
      'title': `Checkout for ${foodSession.chosen_restaurant.name}`,
      'attachment_type': `default`,
      'mrkdwn_in': ['text'],
      'text': `${c.card.brand} - Ending in ${c.card.last_4}, exp ${c.card.exp_date}`,
      'fallback': `You are unable to follow this link to confirm order`,
      'callback_id': `food.admin.order.pay.confirm`,
      'color': `#3AA3E3`,
      'actions': [{
        'name': `food.admin.order.select_card`,
        'text': `✓ Order - $${foodSession.order.total}`,
        'type': `button`,
        'style': `primary`,
        'value': c.card.card_id
      }, {
        'name': `food.admin.order.select_card`,
        'text': `< Change Card`,
        'type': `button`,
        'value': 'change'
      }]
    }]
  }
  $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: response})
}

handlers['food.done'] = function * (message) {
  // final area to save and reset stuff
  logging.error('do cleanup and stuff here in the future')
  // var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  // var slackbot = db.Salckbots.findOne({team_id: message.source.team}).exec()
  // retrieve users phone number
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
