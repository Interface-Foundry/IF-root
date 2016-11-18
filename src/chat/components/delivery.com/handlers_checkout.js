require('kip')
var _ = require('lodash')
var phone = require('phone')
var request = require('request-promise')

// injected dependencies
var $replyChannel
var $allHandlers

// exports
var handlers = {}

/* S12B
*
*
*/
handlers['food.admin.order.checkout.address_2'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var response = {
    'title': `Whats your apartment or floor number at ${foodSession.chosen_location.address_1}`,
    'text': `Type your apartment or floor number below`,
    'fallback': 'Unable to get address',
    'callback_id': `food.admin.order.checkout.address_2`,
    'attachments': [{
      'fallback': `You are unable to add address`,
      'callback_id': `food.admin.order.checkout.address_2`,
      'attachment_type': `default`,
      'actions': [{
        'name': `food.admin.order.checkout.address_2`,
        'text': `None`,
        'type': `button`,
        'value': `none`
      }]
    }]
  }
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.address_2', type: message.origin, data: response})
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
  $replyChannel.send(message, 'food.admin.order.checkout.confirm', {textFor: 'admin.order.checkout.phone_number', type: message.origin, data: response})
}

handlers['food.admin.order.checkout.confirm'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var prevMessage = yield db.Messages.find({thread_id: message.thread_id, incoming: false}).sort('-ts').limit(1)
  prevMessage = prevMessage[0]
  console.log('heerrr', prevMessage.reply.textFor)
  var editInfo = {}

  editInfo['admin.order.checkout.address_2'] = function * (message) {
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
    foodSession.markModified('chosen_location')
    yield foodSession.save()
  }

  if (_.get(prevMessage, 'reply.textFor') && _.includes(_.keys(editInfo), prevMessage.reply.textFor)) {
    yield editInfo[prevMessage.reply.textFor](message)
  }

  if (!foodSession.chosen_location.address_2) {
    return yield handlers['food.admin.order.checkout.address_2'](message)
  }
  if (!foodSession.convo_initiater.last_name) {
    return yield handlers['food.admin.order.checkout.name'](message)
  }
  if (!foodSession.chosen_location.phone_number) {
    return yield handlers['food.admin.order.checkout.phone_number'](message)
  }


  var deliveryInstructionsText = _.get(foodSession, 'data.instructions') ? foodSession.data.instructions : ``
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
                `${foodSession.chosen_location.address_1} ${foodSession.chosen_location.city}, ${foodSession.chosen_location.state} ${foodSession.chosen_location.zip_code}`,
        'fallback': `You are unable to change address`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'color': `#3AA3E3`,
        'attachment_type': `default`

        // doesnt make sense to have this since if we allow the user to edit order it negates a large portion of our system
        // 'actions': [{
        //   'name': `food.admin.order.checkout.address_1`,
        //   'text': `Edit`,
        //   'type': `button`,
        //   'value': `edit`
        // }]
      },
      {
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `*Apt/Floor#:*\n` +
                `${foodSession.chosen_location.address_2}`,
        'fallback': `You are unable to confirm this order`,
        'callback_id': `food.admin.order.checkout.confirm`,
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
        'text': `*Delivery Instructions:*\n` + deliveryInstructionsText,
        'fallback': `You are unable to edit instructions`,
        'callback_id': `food.admin.order.checkout.confirm`,
        'attachment_type': `default`,
        'actions': [
          {
            'name': `food.admin.order.checkout.delivery_instructions`,
            'text': `+ Add`,
            'type': `button`,
            'value': `edit`
          }
        ]
      },
      {
        'title': ``,
        'fallback': `You are unable to confirm address`,
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

handlers['food.admin.order.pay'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()

  // check tip amount???
  if (Number(foodSession.tipAmount).toFixed(2) !== (Number(foodSession.tipPercent.replace('%', '')) / 100.0 * foodSession.order.subtotal).toFixed(2)) {
    logging.error('tipAmount not correct')
    logging.error(`expected tip: ${(Number(foodSession.tipPercent.replace('%', '')) / 100.0 * foodSession.order.subtotal).toFixed(2)}`)
    logging.error(`actual tip: ${foodSession.tipAmount}`)
  }

  // base response
  var response = {
    text: `Checkout for ${foodSession.chosen_restaurant.name} - ${(foodSession.order.total + foodSession.tipAmount).$}`,
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
      }, {
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
        'text': `Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
        'fallback': `You are unable to pick this card`,
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
      'special_instructions': foodSession.data.special_instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': (foodSession.order.total * 100) + (foodSession.tipAmount * 100),
      'tip': foodSession.tipAmount,
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
    logging.error('error doing kip pay lol', err)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'ok couldnt submit to kippay try again'}})
    yield handlers['food.admin.order.pay'](message)
    return
  }

  var response = {
    'text': `You're all set to add a new card and check-out!`,
    'fallback': `You are unable to complete payment`,
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
        'fallback': `You are unable to follow this link to confirm order`,
        'callback_id': `food.admin.add_new_card`,
        'color': `#49d63a`,
        'attachment_type': `default`
      }]
  }
  $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: response})
  yield handlers['food.done'](message)
}

handlers['food.admin.order.select_card'] = function * (message) {
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  var card = _.find(slackbot.meta.payments, {
    'card': {'card_id': message.source.actions[0].value}
  })

  logging.info('FOOD SESSION: ', foodSession.data)
  logging.info('FOOD SESSION: ', foodSession.chosen_location)

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
      'special_instructions': foodSession.data.special_instructions || ''
    },
    'time_started': foodSession.time_started,
    'convo_initiater': foodSession.convo_initiater,
    'chosen_restaurant': foodSession.chosen_restaurant,
    'guest_token': foodSession.guest_token,
    'order': {
      'total': (foodSession.order.total * 100) + (foodSession.tipAmount * 100),
      'tip': foodSession.tipAmount,
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
      'text': ``,
      'fallback': `You are unable to complete payment`,
      'callback_id': `food.admin.select_card`,
      'color': `#3AA3E3`,
      'attachment_type': `default`,
      'attachments': [{
        'title': '',
        'mrkdwn_in': ['text'],
        'text': `Cool, looks like everything went through`,
        'fallback': `You are unable to follow this link to confirm order`,
        'callback_id': `food.admin.add_new_card`,
        'color': `#3AA3E3`,
        'attachment_type': `default`
      }]
    }
    $replyChannel.sendReplace(message, 'food.admin.order.pay.confirm', {type: message.origin, data: response})
  } catch (e) {
    logging.error('error doing kip pay lol idk what to do', e)
    $replyChannel.sendReplace(message, 'food.done', {type: message.origin, data: {text: 'couldnt submit to kip pay'}})
  }
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
      'text': `${c.card.brand} - Ending in ${c.card.last4}, exp ${c.card.exp_month}/${c.card.exp_year.slice(2)}`,
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
  $replyChannel.send(message, 'food.done', {type: message.origin, data: response})
  yield handlers['food.done'](message)
}

handlers['food.done'] = function * (message) {
  logging.error('saving users info to slackbots and peripheral cleanup')
  var foodSession = yield db.Delivery.findOne({team_id: message.source.team, active: true}).exec()


  //logging.info('FOOD SESSION FOOD.DONE: ',foodSession)

  //MESSAGE ALL MEMBERS OF ORDER ---> food is on the way! (send kip food gif). at some point let's point a game here

  //Email receipt to admin here

  // final area to save and reset stuff
  logging.info('saving phone_number... ', foodSession.convo_initiater.phone_number)
  var user = yield db.Chatusers.findOne({id: message.user_id, is_bot: false}).exec()
  user.phone_number = foodSession.convo_initiater.phone_number
  user.first_name = foodSession.convo_initiater.first_name
  user.last_name = foodSession.convo_initiater.last_name
  yield user.save()

  // slackbot save info
  logging.info('saving location... ', foodSession.chosen_location)
  var slackbot = yield db.Slackbots.findOne({team_id: message.source.team}).exec()
  if (!_.find(slackbot.meta.locations, {'address_1': foodSession.chosen_location.address_1})) {
    slackbot.meta.locations.push(foodSession.chosen_location)
  }
  yield slackbot.save()
}

module.exports = function (replyChannel, allHandlers) {
  $replyChannel = replyChannel
  $allHandlers = allHandlers

  // merge in our own handlers
  _.merge($allHandlers, handlers)
}
