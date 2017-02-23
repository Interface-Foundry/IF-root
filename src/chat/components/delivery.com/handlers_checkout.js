var _ = require('lodash')
var phone = require('phone')
var request = require('request-promise')
var validator = require('isemail')
var co = require('co')

var coupon = require('../../../coupon/couponUsing.js')
var cardTemplates = require('../slack/card_templates.js')
var utils = require('../slack/utils.js')
var Menu = require('./Menu')
var email_utils = require('./email_utils')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

/* S12B
*
*
*/
handlers['food.admin.order.checkout.address2'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1310, foodSession._id, message.user_id, {original_text: message.original_text})

  var response = {
    'title': `Whats your apartment or floor number at ${foodSession.chosen_location.address_1}`,
    'text': `Type your apartment or floor number below`,
    'fallback': 'Type your apartment or floor number below',
    'callback_id': `admin_order_checkout_address2`,
    'attachments': [{
      'fallback': `Type your apartment or floor number below`,
      'callback_id': `admin_order_checkout_address2`,
      'attachment_type': `default`,
      'actions': [{
        'name': `food.admin.order.checkout.confirm`,
        'text': `None`,
        'type': `button`,
        'value': `none`
      }]
    }]
  }

  // if (feedbackOn && response) {
  //   response.attachments[0].actions.push({
  //     name: 'food.feedback.new',
  //     text: '⇲ Send feedback',
  //     type: 'button',
  //     value: 'food.feedback.new'
  //   })
  // }

  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.address2', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.name'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1311, foodSession._id, message.user_id, {original_text: message.original_text})

  var response = {
    'text': `Hey ${foodSession.convo_initiater.name} what's the full name of the person who will be receiving this order\n` +
            `>Type their name below`,
    'fallback': `Hey ${foodSession.convo_initiater.name} what's the full name of the person who will be receiving this order\n` +
            `>Type their name below`,
    'callback_id': 'food.admin.order.checkout.name'
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.name', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.phone_number'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  // process user name from previous message

  db.waypoints.log(1313, foodSession._id, message.user_id, {original_text: message.original_text})

  var response = {
    'text': `What's your phone number?`,
    'fallback': 'Type your phone number below',
    'callback_id': 'food.admin.order.checkout.phone_number',
    'attachments': [{
      'fallback': 'example',
      'text': `✎ Example: _555 555 5555_`,
      'mrkdwn_in': ['text']
    }]
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.phone_number', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1320, foodSession._id, message.user_id, {original_text: message.original_text})

  var prevMessage = yield db.Messages.find({thread_id: message.thread_id, incoming: false}).sort('-ts').limit(1).exec()
  prevMessage = prevMessage[0]
  if (_.get(prevMessage, 'reply')) {
    logging.info('heerrr', prevMessage.reply)
  }

  var editInfo = {}

  editInfo['admin.order.checkout.address2'] = function * (message) {
    db.waypoints.log(1321, foodSession._id, message.user_id, {original_text: message.original_text})

    if (_.get(message, 'source.actions[0].value') === 'none') {
      foodSession.chosen_location.address_2 = ' '
    } else {
      logging.info('saving apartment number: ', message.text)
      foodSession.chosen_location.address_2 = message.text
    }
    foodSession.markModified('chosen_location')
    yield foodSession.save()
  }

  editInfo['admin.order.checkout.name'] = function * (message) {
    db.waypoints.log(1322, foodSession._id, message.user_id, {original_text: message.original_text})

    if (!_.get(message, 'text')) {
      logging.error('message was undefined but we got a handler', message, prevMessage)
      return yield handlers['food.admin.order.checkout.name'](message)
    }
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
    db.waypoints.log(1323, foodSession._id, message.user_id, {original_text: message.original_text})

    var num = message.text.replace(/<tel:([^|]*)\|.*/, '$1')
    var phoneParsed = phone(num)
    if (phoneParsed[0] === undefined) {
      // not a valid number
      $replyChannel.send(
        message,
        'food.admin.order.checkout.phone_number',
        {
          type: message.origin,
          data: {'text': `hmm there was an error with that number, try again?`}
        })
      return yield handlers['food.admin.order.checkout.phone_number'](message)
    }
    logging.info('saving phone number: ', num, 'from', message.text)
    foodSession.chosen_location.phone_number = phoneParsed[0]
    foodSession.convo_initiater.phone_number = phoneParsed[0]
    foodSession.markModified('chosen_location')
    yield foodSession.save()
  }

  if (_.get(prevMessage, 'reply.textFor') && _.includes(_.keys(editInfo), prevMessage.reply.textFor)) {
    yield editInfo[prevMessage.reply.textFor](message)
  }

  if (!foodSession.chosen_location.address_2) {
    return yield handlers['food.admin.order.checkout.address2'](message)
  }
  if (!foodSession.convo_initiater.last_name) {
    return yield handlers['food.admin.order.checkout.name'](message)
  }
  if (!foodSession.convo_initiater.phone_number) {
    return yield handlers['food.admin.order.checkout.phone_number'](message)
  } else {
    foodSession.chosen_location.phone_number = foodSession.convo_initiater.phone_number
    yield foodSession.save()
  }

  var deliveryInstructionsText = foodSession.instructions || ''
  var response = {
    text: `Great, please confirm your contact and delivery details:`,
    fallback: `Great, please confirm your contact and delivery details`,
    callback_id: `food.admin.order.checkout.confirm`,
    attachments: [
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'fallback': ''
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Name:*\n` +
                `${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name}`,
        'fallback': `*Name:*\n` +
                `${foodSession.convo_initiater.first_name} ${foodSession.convo_initiater.last_name}`,
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
        'mrkdwn_in': ['text'],
        'text': `*Email:*\n` +
                `${foodSession.convo_initiater.email}`,
        'fallback': `*Email:*\n` +
                `${foodSession.convo_initiater.email}`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.email`,
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
                `${foodSession.chosen_location.address_1} ${foodSession.chosen_location.city}, ${foodSession.chosen_location.state} ${foodSession.chosen_location.zip_code}`,
        'fallback': `*Address:*\n` +
                `${foodSession.chosen_location.address_1} ${foodSession.chosen_location.city}, ${foodSession.chosen_location.state} ${foodSession.chosen_location.zip_code}`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Apt/Floor#:*\n` +
                `${foodSession.chosen_location.address_2}`,
        'fallback': `*Apt/Floor#:*\n` +
                `${foodSession.chosen_location.address_2}`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'food.admin.order.checkout.address2',
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
        'fallback': `*Phone Number:*\n` +
                `${foodSession.chosen_location.phone_number}`,
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
        'text': `*Delivery Instructions:*\n` + deliveryInstructionsText,
        'fallback': `*Delivery Instructions:*\n` + deliveryInstructionsText,
        'callback_id': `food.admin.order.checkout.confirm`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.delivery_instructions`,
            'text': `✎ Edit`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': ``,
        'fallback': `✓ Confirm Address`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'attachment_type': `default`,
        'actions': [{
          'name': `food.admin.order.pay`,
          'text': `✓ Confirm Address`,
          'type': `button`,
          'style': `primary`,
          'value': `confirm`
        }]
      }
    ]
  }
  $replyChannel.send(message, 'food.admin.order.pay', {type: message.origin, data: response})
}

handlers['food.admin.order.checkout.delivery_instructions'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  console.log(foodSession.instructions)

  var msg = {
    text: (foodSession.instructions ? `Edit Instructions` : `Add Special Instructions`),
    attachments: [{
      text: '✎ Type your instructions below (Example: _The door is next to the electric vehicle charging stations behind helipad 6A_)',
      fallback: '✎ Type your instructions below (Example: _The door is next to the electric vehicle charging stations behind helipad 6A_)',
      mrkdwn_in: ['text']
    }]
  }

  //var response =
  yield $replyChannel.sendReplace(message, 'food.admin.order.checkout.delivery_instructions.submit', {type: message.origin, data: msg})
}

handlers['food.admin.order.checkout.delivery_instructions.submit'] = function * (message, foodSession) {
  if (typeof foodSession === 'undefined')
    foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1301, foodSession._id, message.user_id, {original_text: message.original_text})

  yield db.Delivery.update({_id: foodSession._id}, {$set: {'instructions': message.text || ''}}).exec()
  var msg = _.merge({}, message, {
    text: ''
  })
  return yield handlers['food.admin.order.checkout.confirm'](msg)
}

handlers['food.admin.order.checkout.email'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  console.log(foodSession.convo_initiater.email)

  var msg = {
    text: `Edit Email Address`,
    attachments: [{
      text: '✎ Type your email address below (Example: _kipthepenguin@kipthis.com_)',
      fallback: '✎ Type your instructions below (Example: _The door is next to the electric vehicle charging stations behind helipad 6A_)',
      mrkdwn_in: ['text']
    }]
  }

  yield $replyChannel.sendReplace(message, 'food.admin.order.checkout.email.submit', {type: message.origin, data: msg})
}

handlers['food.admin.order.checkout.email.submit'] = function * (message, foodSession) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  // db.waypoints.log(1301, foodSession._id, message.user_id, {original_text: message.original_text})
  logging.debug("MESSAGE.TEXT", message.text)
  var email = (message.text ? message.text.split('|') : '')
  if (email.length > 1) email = email[1].split('>')[0]
  var valid = validator.validate(email)
  if (!valid) {
    // not a valid email
    yield $replyChannel.send(
      message,
      'food.admin.order.checkout.email',
      {
        type: message.origin,
        data: {
          'text': '',
          'attachments': [{
            text: `Unfortunately that email wasn't valid. Please try again!`,
            mrkdwn_in: ['text'],
            color: '#fc9600'
          }]
        }
      }
    )
    return yield handlers['food.admin.order.checkout.email'](message)
  }

  if (valid) foodSession.convo_initiater.email = email;
  yield foodSession.save();
  // yield db.Delivery.update({team_id: message.source.team, active: true}, {$set: {'convo_initiater.email': message.text || foodSession.convo_initiater.email}}).exec()
  var msg = _.merge({}, message, {
    text: ''
  })
  return yield handlers['food.admin.order.checkout.confirm'](msg)
}

handlers['food.admin.order.pay'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  db.waypoints.log(1330, foodSession._id, message.user_id, {original_text: message.original_text})

  // base response
  var response = {
    text: `Checkout for ${foodSession.chosen_restaurant.name} - ${foodSession.calculated_amount.$}`,
    fallback: `Checkout for ${foodSession.chosen_restaurant.name} - ${foodSession.calculated_amount.$}`,
    callback_id: `admin_order_pay`,
    attachments: [{
      'title': '',
      'mrkdwn_in': ['text'],
      'text': ``,
      'fallback': `+ Add New Card or < Change Order`,
      'callback_id': `admin.order.pay`,
      'color': `#3AA3E3`,
      'attachment_type': `default`,
      'actions': [{
        'name': `food.admin.add_new_card`,
        'text': `+ Add New Card`,
        'type': `button`,
        'value': `add`
      }, {
        'name': `food.admin.order.confirm`,
        'text': `< Change Order`,
        'type': `button`,
        'value': `change`
      }]
    }]
  }
  // if (feedbackOn && response) {
  //   response.attachments[0].actions.push({
  //     name: 'food.feedback.new',
  //     text: '⇲ Send feedback',
  //     type: 'button',
  //     value: 'food.feedback.new'
  //   })
  // }

  if (_.get(slackbot.meta, 'payments')) {
    // we already have a card source, present cards

    var cardImages = {
      visa: `https://storage.googleapis.com/kip-random/visa.png`,
      mastercard: `https://storage.googleapis.com/kip-random/mastercard.png`
    }

    var cardsAttachment = slackbot.meta.payments.map((c) => {
      return {
        'title': `${c.card.brand}`,
        'text': `Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
        'fallback': `Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
        'callback_id': `food.admin.order.select_card`,
        'color': `#3AA3E3`,
        'attachment_type': `default`,
        'thumb_url': _.get(c, 'card.brand') ? cardImages[c.card.brand.toLowerCase()] : '',
        'actions': [{
          'name': `food.admin.order.select_card`,
          'text': `✓ Select Card`,
          'type': `button`,
          'style': `primary`,
          'value': c.card.card_id
        }, {
          name: 'food.admin.order.remove_card',
          text: 'Remove Card',
          type: 'button',
          style: 'default',
          value: c.card.card_id,
          confirm: {
            title: 'Confirm Remove Card',
            text: `Are you sure you want to remove the card ending in ${c.card.last4} from your list of saved credit cards?`,
            ok_text: 'Remove Card',
            dismiss_text: 'Keep Card'
          }
        }]
      }
    })
    // cardsAttachment[0].pretext = `Payment Information`
    response.attachments = response.attachments.concat(cardsAttachment)
  }
  $replyChannel.sendReplace(message, 'food.admin.order.select_card', {type: message.origin, data: response})
}

handlers['food.admin.order.remove_card'] = function * (message) {
  if (!message.data.value) {
    return logging.error('could not remove card because card_id was undefined')
  }

  var slackbot = yield db.Slackbots.update({team_id: message.source.team}, {
    $pull: {'meta.payments': {'card.card_id': message.data.value}}
  }).exec()

  yield handlers['food.admin.order.pay'](message)
}

handlers['food.admin.add_new_card'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()

  db.waypoints.log(1331, foodSession._id, message.user_id, {original_text: message.original_text})

  // add various shit to the foodSession
  foodSession.payment_post = {
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
      'phone_number': foodSession.chosen_location.phone_number,
      'special_instructions': foodSession.instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': foodSession.calculated_amount * 100,
      'tip': foodSession.tip.amount,
      'order_type': foodSession.fulfillment_method
    }
  }

  try {
    foodSession.payment = yield request({
      uri: kip.config.kipPayURL + `/charge`,
      method: `POST`,
      json: true,
      body: foodSession.payment_post
    })
    yield foodSession.save()
  } catch (err) {
    logging.error('error doing kip pay while adding new card', err)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'Couldnt submit to Kip Pay, try again'}})
    return yield handlers['food.admin.order.pay'](message)
  }

  var response = {
    'text': `You're all set to add a new card and check-out!`,
    'fallback': `You're all set to add a new card and check-out!`,
    'callback_id': `food.admin.add_new_card`,
    'color': `#3AA3E3`,
    'attachment_type': `default`,
    'attachments': [
      {
        'title': '',
        'image_url': 'http://tidepools.co/kip/stripe_powered.png'
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `Great, <${foodSession.payment.url}|➤ Click to pay with Stripe>`,
        'fallback': `Great, <${foodSession.payment.url}|➤ Click to pay with Stripe>`,
        'callback_id': `food.admin.add_new_card`,
        'color': `#49d63a`,
        'attachment_type': `default`
      }]
  }
  $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: response})
}

handlers['food.admin.order.select_card'] = function * (message) {
  // immediately remove payment options
  yield $replyChannel.sendReplace(message, 'food.admin.processing_card', {type: message.origin, data: {text: 'processing...'}})
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var card = _.find(slackbot.meta.payments, {
    'card': {'card_id': message.source.actions[0].value}
  })

  // add various shit to the foodSession
  foodSession.payment_post = {
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
      'phone_number': foodSession.chosen_location.phone_number,
      'special_instructions': foodSession.instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': foodSession.calculated_amount * 100,
      'tip': foodSession.tip.amount,
      'order_type': foodSession.fulfillment_method
    },
    'saved_card': {
      'vendor': card.vendor,
      'customer_id': card.customer_id,
      'card_id': card.card.card_id
    }
  }

  try {
    // make post to our own kip pay server
    foodSession.payment = yield request({
      uri: kip.config.kipPayURL + `/charge`,
      method: `POST`,
      json: true,
      body: foodSession.payment_post
    })

    foodSession.save()
    var response = {
      'text': 'Order was successful! You should get an email confirmation from `Delivery.com` soon',
      'fallback': 'Order was successful! You should get an email confirmation from `Delivery.com` soon',
      'callback_id': `food.admin.select_card`,
      'attachments': [{
        'fallback': 'Home',
        'callback_id': 'Home',
        'color': 'grey',
        'attachment_type': 'default',
        'actions': [{
          'name': 'passthrough',
          'text': 'Home',
          'type': 'button',
          'value': 'food.exit.confirm'
        }]
      }]
    }

    $replyChannel.sendReplace(message, 'food.admin.order.pay.confirm', {type: message.origin, data: response})
  } catch (e) {
    logging.error('error doing kip pay in food.admin.order.select_card', e)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'couldnt submit to kip pay'}})
  }
}

handlers['food.admin.order.pay.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var c = _.find(slackbot.meta.payments, {'card': {'card_id': message.source.actions[0].value}})
  var response = {
    text: ``,
    fallback: `Confirm pay`,
    callback_id: `food.admin.order.pay.confirm`,
    attachments: [{
      'title': `Checkout for ${foodSession.chosen_restaurant.name}`,
      'attachment_type': `default`,
      'mrkdwn_in': ['text'],
      'text': `${c.card.brand} - Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
      'fallback': `${c.card.brand} - Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
      'callback_id': `food.admin.order.pay.confirm`,
      'color': `#3AA3E3`,
      'actions': [{
        'name': `food.admin.order.select_card`,
        'text': `✓ Order - \$${foodSession.calculated_amount}`,
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
  $replyChannel.send(message, 'food.done', {type: message.origin, data: response})
  return yield handlers['food.done'](message)
}

handlers['food.admin.save_info'] = function * (message, foodSession) {
  // final area to save and reset stuff
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false})

  logging.info('saving phone_number... ')
  user.phone_number = foodSession.chosen_location.phone_number
  user.first_name = foodSession.convo_initiater.first_name
  user.last_name = foodSession.convo_initiater.last_name
  yield user.save()

  // slackbot save info
  // logging.info('saving location... ')
  // try {
  //   yield db.Slackbot.update({
  //     'team_id': message.source.team,
  //     'meta.locations.address_1': foodSession.chosen_location.address_1
  //   }, {
  //     $set: {'meta.locations.$': foodSession.chosen_location}
  //   }, {
  //     upsert: true
  //   })
  // } catch (err) {
  //   logging.error('error updating slackbot.meta.locations', err)
  // }
}

handlers['food.done'] = function * (message) {
  logging.info('saving users info to slackbots and peripheral cleanup')
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  db.waypoints.log(1332, foodSession._id, message.user_id, {original_text: message.source})
  yield handlers['food.admin.save_info'](message, foodSession)
  yield handlers['food.payments.done'](message, foodSession)
}

handlers['food.payments.done'] = function * (message, foodSession) {
  if (foodSession === undefined) {
    logging.warn('foodSession wasnt passed into food.done')
    foodSession = yield db.Delivery.findOne({'team_id': message.source.team, 'active': true}).exec()
  }

  var payment = yield db.Payment.findOne({'order.guest_token': foodSession.guest_token})
  if (_.get(payment, 'charge.status') === 'succeeded') {
    logging.info('charge succeeded')
    foodSession.active = false
    foodSession.completed_payment = true
    foodSession.coupon.used = true

    yield foodSession.save()
    yield handlers['food.payments.done.team'](message, foodSession)

    logging.debug('foodSession.email_users', foodSession.email_users)
    yield foodSession.email_users.map(function * (email) {
      console.log('email:', email)
      var full_eu = yield db.email_users.findOne({email: email})
      if (foodSession.confirmed_orders.indexOf(full_eu.id) > -1) {
        yield email_utils.sendEmailUserConfirmations(foodSession, email)
      }
    })
    logging.debug('about to send confirmation email')
    yield email_utils.sendConfirmationEmail(foodSession)
    // save coupon info but needed to wait for payments thing
    if (_.get(foodSession, 'coupon.code')) {
      logging.info('saving coupon code stuff')
      yield coupon.updateCouponForCafe(foodSession)
    }
  } else {
    logging.info('payment or charge not found yet')
  }
}

handlers['food.payments.done.team'] = function * (message, foodSession) {
  // send message to everyone in team with their order and home buttons here

  var banner = {
    title: '',
    image_url: 'https://storage.googleapis.com/kip-random/cafe_success.gif'
  }

  try {
    var team = yield db.Slackbots.findOne({'team_id': message.source.team}).exec()
    var menu = Menu(foodSession.menu)
    // send message to all the ppl that ordered food
    var uniqOrders = _.uniq(foodSession.confirmed_orders)
    yield uniqOrders.map(function * (userId) {
      var user = _.find(foodSession.team_members, {'id': userId}) // find returns the first one
      if (user) {
        var itemNames = foodSession.cart
          .filter(i => i.user_id === userId && i.added_to_cart)
          .map(i => menu.getItemById(i.item.item_id).name)
          .map(name => '*' + name + '*') // be bold

        if (itemNames.length > 1) {
          var foodString = itemNames.slice(0, -1).join(', ') + ', and ' + itemNames.slice(-1)
        } else {
          foodString = itemNames[0]
        }

        var isAdmin = team.meta.office_assistants.includes(userId)
        var msg = _.merge({}, {
          'incoming': false,
          'mode': 'food',
          'action': 'payment_info',
          'thread_id': user.dm,
          'source': {
            'type': 'message',
            'user': user.id,
            'channel': user.dm,
            'team': foodSession.team_id
          }
        })
        var couponText = yield utils.couponText(message.source.team)
        var json = {
          'text': `Your order of ${foodString} is on the way 😊`,
          'callback_id': 'food.charge_succeeded',
          'fallback': `Your order is on the way`,
          'attachment_type': 'default',
          'attachments': [banner].concat(cardTemplates.home_screen(isAdmin, user.id, couponText).attachments)
        }

        yield $replyChannel.send(msg, 'food.payments.done.team', {type: message.origin, data: json})
      }
    })
  } catch (err) {
    logging.error('on success messages broke', err)
  }
}

handlers['food.new_credit_card.success'] = function * (guestToken) {
  var foodSession = yield db.Delivery.findOne({'guest_token': guestToken}).exec()
  var lastMsg = yield db.Messages.find({
    'mode': 'food',
    'incoming': true,
    'user_id': foodSession.convo_initiater.id
  }).sort({ts: -1}).limit(1).exec()
  lastMsg = lastMsg[0]

  // logging.debug('heres the lastMsg', lastMsg)
  yield $replyChannel.sendReplace(lastMsg, 'food.new_credit_card.success', {
    type: 'slack',
    data: {'text': 'New card worked!'}
  })
  yield handlers['food.done'](lastMsg)
}

handlers['food.previous_credit_card.success'] = function * (guestToken) {
  logging.debug('replacing admins message of selecting card here')
  var foodSession = yield db.Delivery.findOne({'guest_token': guestToken}).exec()
  var lastMsg = yield db.Messages.find({
    mode: 'food',
    incoming: true,
    user_id: foodSession.convo_initiater.id
  }).sort({ts: -1}).limit(1).exec()
  lastMsg = lastMsg[0]

  yield $replyChannel.sendReplace(lastMsg, 'food.previous_credit_card.success', {
    type: 'slack',
    data: {'text': 'Previously used card worked!'}
  })
  yield handlers['food.done'](lastMsg)
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
