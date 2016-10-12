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


Menu.prototype.allItems = function() {
  return _.values(this.flattenedMenu).filter(i => i.type === 'item')
}

// the ID can either be a number like 36 (like the unique_id from the recommended_items array in a merchat doc)
// of the id can be tha actual full id as referenced in the menu, like "PE-66030-8-220"
Menu.prototype.getItemById = function(id) {
  return this.flattenedMenu[id] || this.allItems().filter(i => i.id.split('-').pop() === id)[0]
}

// turns the menu into a single object with keys as item ids
function flattenMenu(data) {
  var out = {}
  function flatten(node, out) {
    out[node.id] = node
    _.get(node, 'children', []).map(c => flatten(c, out))
  }
  data.menu.map(m => flatten(m, out))
  return out
}

Menu.prototype.generateJsonForItem = function(id) {
  var item = this.getItemById(id)
  var quantity = 1
  var json = {
    text: `*${item.name}* \n ${item.description}`,
    attachments: [{
      fallback: 'Quantity: ' + quantity,
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
          text: quantity,
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

  var options = nodeOptions(item)
  json.attachments = json.attachments.concat(options)
  return json
}

function nodeOptions(node) {
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
      return {
        name: 'food.option.click',
        text: (allowMultiple ? '☐ ' : '￮ ') + option.name,
        type: 'button',
        value: option.id
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
  var json = menu.generateJsonForItem('PE-66030-495-3-30')
  console.log(json)
}
