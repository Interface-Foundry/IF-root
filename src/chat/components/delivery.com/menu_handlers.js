'use strict'
var _ = require('lodash')

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
          'value': i.id
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

handlers['food.item.submenu'] = function * (message) {
  var msgJson = {
    'text': '*Tacos – $8.04* \n Double corn tortillas with your choice of meat or vegetable, topped with fresh cilantro.',
    'attachments': [
      {
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': 'grey',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '—',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '1',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '+',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'text': '*Choose Toppings* \n Required - Choose as many as you like.',
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '☐ Lettuce',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Sour Cream',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Pico de Gallo',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Corn Salsa',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'mrkdwn_in': [
          'text'
        ],
        'actions': [
          {
            'name': 'chess',
            'text': '☐ Rice',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Cilantro',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Queso Fresco',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Guacamole +$1.75',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'text': '*Choose Tortilla* \n Required - Choose 1.',
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#3AA3E3',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '￮ Plain',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '￮ Whole Wheat',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'text': '*Would you like a meal addition?* \n Optional - Choose as many as you like.',
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': 'grey',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '☐ Tortilla Soup +$6.50',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Chips +$1.65',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Jarritos +$2.75',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Extra Salsa +$1.25',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'text': '*Would you prefer the salsa on the side?* \n Optional - Choose a maximum of 2.',
        'mrkdwn_in': [
          'text'
        ],
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': 'grey',
        'attachment_type': 'default',
        'actions': [
          {
            'name': 'chess',
            'text': '☐ Salsa on the Side',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ Salsa on top',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '☐ No Salsa',
            'type': 'button',
            'value': 'chess'
          }
        ]
      },
      {
        'text': 'Special Instructions: _None_',
        'fallback': 'You are unable to choose a game',
        'callback_id': 'wopr_game',
        'color': '#49d63a',
        'attachment_type': 'default',
        'mrkdwn_in': [
          'text'
        ],
        'actions': [
          {
            'name': 'chess',
            'text': '✓ Add to Cart: $8.04',
            'type': 'button',
            'style': 'primary',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '+ Special Instructions',
            'type': 'button',
            'value': 'chess'
          },
          {
            'name': 'chess',
            'text': '< Back',
            'type': 'button',
            'value': 'chess'
          }
        ]
      }
    ]
  }
  replyChannel.send(message, 'food.menu.submenu', {type: 'slack', data: msgJson})
}

module.exports = function($replyChannel) {
  replyChannel = $replyChannel
  return handlers
}
