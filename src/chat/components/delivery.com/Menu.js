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
  debugger;
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

/*
Menu Parsing

Parsers handle specific types of nodes in the menu
for example,
{
    "id": "PE-66030-495",
    "name": "Lunch Menu",
    "description": "",
    "unique_id": 495,
    "schedule": [
      1
    ],
    "type": "menu",
    "children": [...]
  },
has type "menu", so it should be parsed with parsers['menu']
*/
function parse(node) {
  if (typeof node === undefined) {
    return
  }

  if (!parsers[node.type]) {
    throw new Error('cannot parse node of type', node.type, node)
  }

  return parsers[node.type].bind()(node)
}

var parsers = {}
parsers.menu = function (node) {
  _.get(node, 'children', []).map(parse.bind({parent: node}))
}

parsers.item = function (node) {

}

module.exports = Menu


if (!module.parent) {
  var fs = require('fs')
  var json = fs.readFileSync('./merchant_66030_menu.json', 'utf8')
  var data = JSON.parse(json)
  var menu = Menu(data)
  console.log(menu.allItems())
  debugger;
}
