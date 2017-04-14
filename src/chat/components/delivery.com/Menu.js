var _ = require('lodash')

/**
 * Menu class
 *
 * usage:
 * var data = yield request('https://api.delivery.com/merchant/66030/menu?client_id=brewhacks2016')
 * var menu = Menu(data)
 * console.log(menu.allItems())
 * console.log(menu.query("spring rolls"))
 *
 * @class
 * @param {Object} data the menu document returnd by the delivery.com api
 */
function Menu (data,localTime) {
  if (!(this instanceof Menu)) {
    return new Menu(data,localTime)
  }

  this._data = data

  this.flattenedMenu = flattenMenu(data,localTime)
}

// an array of all the items, aka top-level things you can add to your cart
Menu.prototype.allItems = function () {
  return _.values(this.flattenedMenu).filter(i => i.type === 'item')
}

// the ID needs to be a node's unique_id
Menu.prototype.getItemById = function (id) {
  return this.flattenedMenu[Number.isInteger(id) ? String(id) : id]
}

// gets the price for a cartItem, which is one of the objects in the delivery_schema cart array
Menu.prototype.getCartItemPrice = function (cartItem) {
  var menu = this
  var item = this.getItemById(cartItem.item.item_id)
  cartItem.item.option_qty = cartItem.item.option_qty || {}
  var basePrice
  var hasPriceGroup = item.children.map(c => c.type).includes('price group')
  if (hasPriceGroup) {
    var priceGroup = item.children.filter(c => c.type === 'price group')[0]
    var priceOption = priceGroup.children.filter(p => !!cartItem.item.option_qty[p.id])[0]
    basePrice = _.get(priceOption, 'price', item.price)
  } else {
    basePrice = item.price
  }

  return cartItem.item.item_qty * (basePrice + Object.keys(cartItem.item.option_qty).reduce((sum, optionId) => {
      if (!cartItem.item.option_qty.hasOwnProperty(optionId)) {
        return sum
      }

      if (optionId === _.get(priceOption, 'id', -1).toString()) {
        return sum
      }

      var optionPrice = menu.getItemById(optionId).price
      var optionQuantity = cartItem.item.option_qty[optionId]

      if (optionPrice && typeof optionQuantity === 'number') {
        return sum + optionQuantity * optionPrice
      }

      return sum
    }, 0)
  )
}

// turns the menu into a single object with keys as item ids
function flattenMenu (data,localTime) {
  var out = {}
  var schedules = data.schedule
  if (localTime){
    var now = localTime
  }else {
    var now = new Date()
  }
  function flatten (node, out) {

    if (node.type === 'menu' && _.get(node, 'schedule[0]')) {
      var isAvailable = false
      node.schedule.map(id => _.find(schedules, {id: id}))[0].times.map(t => {
        if (now > new Date(t.from) && now < new Date(t.to)) {
          isAvailable = true
        }
      })

      if (!isAvailable) {
        logging.debug(node.name.cyan, 'is not available'.red)
        return
      }
    }

    out[node.id] = node
    _.get(node, 'children', []).map(c => {
      c.parentId = node.id
      flatten(c, out)
    })
  }
  data.menu.map(m => flatten(m, out))
  return out
}

Menu.prototype.generateJsonForItem = function (cartItem, validate, message) {
  var menu = this
  var item = this.getItemById(cartItem.item.item_id)
  cartItem.item.option_qty = cartItem.item.option_qty || {}

  // Price for the Add To Cart button
  var fullPrice = menu.getCartItemPrice(cartItem)
  var parentName = _.get(menu, `flattenedMenu.${item.parentId}.name`)
  var parentDescription = _.get(menu, `flattenedMenu.${item.parentId}.description`)

  //lol
  if (item.description) {
    var des = `- _${item.description.replace('\n', '_\n_')}_`
  } else {
    des = ''
  }
  //lol
  if(parentDescription){
    var h = '-'
  }else {
    var h = ''
  }

  var json = {
    text: `*${item.name}* ${des}`,
    attachments: [{
      image_url: (item.images.length>0 ? 'https://res.cloudinary.com/delivery-com/image/fetch/w_300,h_240,c_fit/' + encodeURIComponent(item.images[0].url) : ''),
      fallback: item.name + ' - ' + item.description,
      callback_id: 'quantity',
      color: 'grey',
      attachment_type: 'default',
      actions: [
        {
          name: 'food.item.quantity.subtract',
          text: '—',
          type: 'button',
          value: cartItem.item.item_id
        },
        {
          name: 'food.null',
          text: cartItem.item.item_qty,
          type: 'button',
          value: 'food.null'
        },
        {
          name: 'food.item.quantity.add',
          text: '+',
          type: 'button',
          value: cartItem.item.item_id
        }
      ]
    }]
  }

  // options, like radios and checkboxes
  var options = nodeOptions(item, cartItem, validate, message)
  json.attachments = json.attachments.concat(options)

  if (_.keys(cartItem.item.option_qty).length > 0) {
    var optionsText = _.keys(cartItem.item.option_qty).map((opt) => {
      if (this.getItemById(String(opt)).price > 0) {
        var specificItem = `${this.getItemById(String(opt)).name} - \$${this.getItemById(String(opt)).price.toFixed(2)}`
      } else {
        specificItem = this.getItemById(String(opt)).name
      }
      return specificItem
    })
    optionsText = `*Options:* _${optionsText.join(', ')}_`
    json.attachments.push({
      'text': optionsText,
      'fallback': optionsText,
      'attachment_type': 'default',
      'mrkdwn_in': ['text']
    })
  }

  json.attachments.push({
    'text': `*Special Instructions:* ${cartItem.item.instructions || "_None_"} \n *Total:* `+fullPrice.$,
    'fallback': 'Special Instructions: ${cartItem.item.instructions || "_None_"}',
    'callback_id': 'menu_quickpicks',
    'color': '#49d63a',
    'attachment_type': 'default',
    'mrkdwn_in': ['text'],
    'actions': [{
        'name': 'food.item.add_to_cart',
        'text': '✓ Add to Order',
        'type': 'button',
        'style': 'primary',
        'value': cartItem.item.item_id
      }, {
        'name': 'food.item.instructions',
        'text': '✎ Special Instructions',
        'type': 'button',
        'value': cartItem.item.item_id
      }, {
        'name': 'food.menu.quickpicks',
        'text': '< Back',
        'type': 'button',
        'value': 0
      }]
  })
  return json
}

function nodeOptions (node, cartItem, validate, message) {
  var attachments = node.children.filter(c => c.type.includes('group')).reduce((all, g) => {
    var a = {
      fallback: 'Meal option',
      callback_id: g.id,
      color: '#3AA3E3',
      attachment_type: 'default',
      mrkdwn_in: ['text'],
      text: ''
    }
    if (g.name === 'Meal Additions') {
      a.text = '*Would you like a meal addition?*'
      a.color = 'grey'
    } else {
      a.text = `*${g.name}*`
    }
    var optionIndices = _.get(message, 'data.value.optionIndices') ? _.get(message, 'data.value.optionIndices') : {}
    var required = false
    var allowMultiple = true
    var numSelected = g.children.filter(option => Object.keys(cartItem.item.option_qty).includes(option.id)).length
    if (g.min_selection === 0) {
      if (g.max_selection >= g.children.length) {
        a.text += '\n Optional - Choose as many as you like.'
        a.color = 'grey'
      } else {
        a.text += `
 Optional - Choose up to ${g.max_selection}.`
        if (numSelected > g.max_selection) {
          a.text += '\n`Maximum number of options exceeded`'
          a.color = '#fa951b'
        } else {
          a.color = 'grey'
        }
      }
    } else {
      required = true
      if (g.min_selection === g.max_selection) {
        allowMultiple = g.min_selection !== 1
        a.text += `
 Required - Choose exactly ${g.min_selection}.`
        if (numSelected > g.min_selection) {
          a.text += `\n\`Too many options selected\``
          a.color = '#fa951b'
        } else if (validate && numSelected < g.min_selection) {
          a.text += `\n\`${g.min_selection - numSelected} more selection(s) required\``
          a.color = '#fa951b'
        }
      } else {
        a.text += `
 Required - Choose at least ${g.min_selection} and up to ${g.max_selection}.`
        if (numSelected > g.max_selection) {
          a.text += '\n`Maximum number of options exceeded`'
          a.color = '#fa951b'
        } else if (validate && numSelected < g.min_selection) {
          a.text += '\n`Minimum number of options not met`'
          a.color = '#fa951b'
        }
      }
    }

    a.actions = g.children.map(option => {
      var checkbox, price
      if (g.type === 'price group') {
        // price groups are like 'small, medium or large' and so each one is the base price
        price = ' $' + option.price
      } else if (g.type === 'option group' && option.price) {
        // option groups are add-ons or required choices which can add to the item cost
        price = ' +$' + option.price
      } else {
        price = ''
      }

      if (cartItem.item.option_qty[option.id]) {
        checkbox = allowMultiple ? '✓ ' : '◉ '
      } else {
        checkbox = allowMultiple ? '☐ ' : '○ '
      }
      return {
        name: 'food.option.click',
        text: checkbox + option.name + price,
        type: 'button',
        value: {
          item_id: cartItem.item.item_id,
          option_id: option.id,
          optionIndices: optionIndices
        }
      }
    })

    all.push(a)

    // Submenu part
    g.children.map(option => {
      if (cartItem.item.option_qty[option.id] && _.get(option, 'children.0')) {
        var submenuAttachments = nodeOptions(option, cartItem, validate, message)
        all = all.concat(submenuAttachments)
      }
    })

    return all
  }, [])

  // spread out the buttons to multiple attachments if needed
  attachments = attachments.reduce((all, a) => {

    var optionIndices = _.get(message, 'data.value.optionIndices') ? _.get(message, 'data.value.optionIndices') : {}
    var groupId = Number(a.callback_id.split('-').slice(-1)[0])
    var optionIndex = optionIndices[groupId] ? optionIndices[groupId] : 1
    var isRequired = a.text ? a.text.indexOf('Required') !== -1 : false
    var rowCount = 0
    if (_.get(a, 'actions.length', 0) <= 3) {
      all.push(a)
      return all
    } else {
      var actions = a.actions
      var numActionRows = Math.ceil(actions.length/3)
      a.actions = actions.splice(0, 3)
      rowCount++
      all.push(a)
      if(isRequired) { //if option is required, show all
        while (actions.length > 0) {
          all.push({
            color: a.color,
            fallback: a.fallback,
            callback_id: 'even more actions',
            attachment_type: 'default',
            actions: actions.splice(0, 3)
          })
        }
      } else { //if option is optional, display 3 at a time.
        while (rowCount < optionIndex) {
          all.push({
            color: a.color,
            fallback: a.fallback,
            callback_id: 'even more actions',
            attachment_type: 'default',
            actions: actions.splice(0, 3)
          })
          rowCount++
        }
        if(numActionRows > optionIndex){
          all.push({
            'name': 'More Options',
            'fallback': 'More Options',
            'callback_id': 'More Options',
            'actions': [{
              'name': 'food.item.loadmore',
              'text': 'More Options',
              'type': 'button',
              'value': {
                'item_id': cartItem.item.item_id,
                'group_id': groupId ,
                'optionIndices': optionIndices,
                'row_count': numActionRows
              }
            }]
          })
        }
      }
      return all
    }
  }, [])

  return attachments
}

// Check a cartItem for errors
// (a cartItem is one thing from the foodSession.cart array)
Menu.prototype.errors = function (cartItem) {
  // the way we'll do this is to build the options with the validation flag
  // and then check the outputted json for errors.
  var submenu = this.generateJsonForItem(cartItem, true)
  var ok = !JSON.stringify(submenu).includes('fa951b')

  if (!ok) {
    return submenu
  }
}

module.exports = Menu

if (!module.parent) {
  var fs = require('fs')
  try {
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
  } catch (err) {
    console.log('error in Menu.js area')
  }
}
