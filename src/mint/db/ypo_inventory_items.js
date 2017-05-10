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
    code: 'string',

    /**@type {string} item name*/
    name: 'string',

    /**@type {number} item price*/
    price: 'string',

    /**@type {string} unit by which this item is sold / which this item
    represents. e.g. "pack". */
    unit_type: 'string',

    /**@type {string} TODO*/
    description: 'string',

    /**@type {string} TODO*/
    unspsc_code: 'string',

    /**@type {string} TODO*/
    category_1: 'string',

    /**@type {string} TODO*/
    category_2: 'string',

    /**@type {string} TODO*/
    keywords: 'string',

    /**@type {string} TODO*/
    image_url: 'string',

    /**@type {string} TODO*/
    product_url: 'string'
  }
});

module.exports = ypoInventoryItemsCollection;
