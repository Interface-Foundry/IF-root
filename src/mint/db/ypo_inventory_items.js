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
    unit_type: 'string'
  }
});

module.exports = ypoInventoryItemsCollection;
