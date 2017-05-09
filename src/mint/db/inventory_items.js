var Waterline = require('waterline');
var uuid = require('uuid');

var inventoryItemsCollection = Waterline.Collection.extend({
  identity: 'item_options'
})
