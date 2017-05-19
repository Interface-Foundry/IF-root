var Waterline = require('waterline');
var uuid = require('uuid');

var ypoInventoryItemsCollection = Waterline.Collection.extend({
  identity: 'ypo_inventory_items',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** Generated when an item is added for the first time */
    id: {
      type: 'string',
      primaryKey: true,
      unique: true,
      index: true,
      uuidv4: true,
      defaultsTo: () => uuid.v4()
    },
    /**@type {string} item id internal to YPO*/
    item_code: 'string',

    /**@type {string} item name*/
    name: 'string',

    /**@type {number} item price*/
    price: 'float',

    /**@type {string} unit by which this item is sold / which this item
    represents. e.g. "pack". */
    unit_type: 'string',

    /**@type {string} description of the item (e.g. color, size, etc)*/
    description: 'string',

    /**@type {string} UNSPSC code*/
    unspsc_code: 'string',

    /**@type {string} item category */
    category_1: 'string',

    /**@type {string} another item category */
    category_2: 'string',

    /**@type {string} keywords*/
    keywords: 'string',

    /**@type {string} url to item image*/
    image_url: 'string',

    /**@type {string} url for item view on YPO site*/
    product_url: 'string'
  }
});

module.exports = ypoInventoryItemsCollection;
