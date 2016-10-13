var _ = require('lodash')

/**
 * Menu class
 *
 * usage:
 * var data = yield request('https://api.delivery.com/merchant/66030/menu?client_id=brewhacks2016')
 * var menu = Menu(data)
 * console.log(menu.allItems())
 * console.log(menu.query("spring rolls"))
 */
function Menu(data) {
  if (!(this instanceof Menu)) {
    return new Menu(data)
  }

  this._data = data

  this.flattenedMenu = flattenMenu(data)

}

// an array of all the items, aka top-level things you can add to your cart
Menu.prototype.allItems = function() {
  return _.values(this.flattenedMenu).filter(i => i.type === 'item')
}

// the ID needs to be a node's unique_id
Menu.prototype.getItemById = function(id) {
  return this.flattenedMenu[id]
}

// gets the price for a cartItem, which is one of the objects in the delivery_schema cart array
Menu.prototype.getCartItemPrice = function(cartItem) {
  var menu = this
  var item = this.getItemById(cartItem.item.item_id)

  return item.price * cartItem.item.item_qty + Object.keys(cartItem.item.option_qty).reduce((sum, optionId) => {
    if (!cartItem.item.option_qty.hasOwnProperty(optionId)) {
      return sum
    }

    var optionPrice = menu.getItemById(optionId).price
    var optionQuantity = cartItem.item.option_qty[optionId]

    if (optionPrice && typeof optionQuantity === 'number') {
      return sum + optionQuantity * optionPrice
    }

    return sum
  }, 0)
}

// turns the menu into a single object with keys as item ids
function flattenMenu(data) {
  var out = {}
  function flatten(node, out) {
    out[node.unique_id] = node
    _.get(node, 'children', []).map(c => flatten(c, out))
  }
  data.menu.map(m => flatten(m, out))
  return out
}

Menu.prototype.generateJsonForItem = function(cartItem) {
  var menu = this
  var item = this.getItemById(cartItem.item.item_id)

  // Price for the Add To Cart button
  var fullPrice = menu.getCartItemPrice(cartItem)

  var json = {
    text: `*${item.name}* \n ${item.description}`,
    attachments: [{
      fallback: 'Quantity: ' + cartItem.item.item_qty,
      callback_id: 'quantity',
      color: 'grey',
      attachment_type: 'default',
      actions: [
        {
          name: 'food.item.quantity.subtract',
          text: '—',
          type: 'button',
          value: 'food.item.quantity.subtract'
        },
        {
          name: 'food.item.quantity',
          text: cartItem.item.item_qty,
          type: 'button',
          value: 'food.item.quantity'
        },
        {
          name: 'food.item.quantity.add',
          text: '+',
          type: 'button',
          value: 'food.item.quantity.add'
        }
      ]
    }]
  }

  // options, like radios and checkboxes
  var options = nodeOptions(item, cartItem)
  json.attachments = json.attachments.concat(options)
  json.attachments.push({
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
        'name': 'food.item.add_to_cart',
        'text': '✓ Add to Cart: $' + fullPrice.toFixed(2),
        'type': 'button',
        'style': 'primary',
        'value': cartItem.item.item_id
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
  })
  return json
}

function nodeOptions(node, cartItem) {
  var attachments = node.children.filter(c => c.type === 'option group').map(g => {
    var a = {
      fallback: 'Meal option',
      callback_id: g.id,
      color: '#3AA3E3',
      attachment_type: 'default',
      mrkdwn_in: ['text']
    }
    if (g.name === 'Meal Additions') {
      a.text = '*Would you like a meal addition?*'
      a.color = 'grey'
    } else {
      a.text = `*${g.name}*`
    }

    var required = false
    var allowMultiple = true
    if (g.min_selection === 0) {
      if (g.max_selection > 4) {
        a.text += '\n Optional - Choose as many as you like.'
      } else {
        a.text += `\n Optional - Choose up to ${g.max_selection}.`
      }
    } else {
      required = true
      if (g.min_selection === g.max_selection) {
        allowMultiple = false
        a.text += `\n Required - Choose exactly ${g.min_selection}.`
      } else {
        a.text += `\n Required - Choose at least ${g.min_selection} and up to ${g.max_selection}.`
      }
    }

    a.actions = g.children.map(option => {
      var checkbox
      var price = option.price ? ' +$' + option.price : ''
      if (cartItem.item.option_qty[option.unique_id]) {
        checkbox = allowMultiple ? '✓ ' : '◉ '
      } else {
        checkbox = allowMultiple ? '☐ ' : '￮ '
      }
      return {
        name: 'food.option.click',
        text: checkbox + option.name + price,
        type: 'button',
        value: option.unique_id
      }
    })
    return a
  })

  return attachments
}



module.exports = Menu


if (!module.parent) {
  var fs = require('fs')
  var json = fs.readFileSync('./merchant_66030_menu.json', 'utf8')
  var data = JSON.parse(json)
  var menu = Menu(data)
  var mock_item = {
    user_id: '12345',
    added_to_cart: false,
    item: {
      item_id: 193,
      item_qty: 1,
      option_qty: {'229': 1}
    }
  }
  console.log(menu.flattenedMenu[228])
  var json = menu.generateJsonForItem(mock_item)
  console.log(JSON.stringify(json, null, 2))
}
