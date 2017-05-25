var Waterline = require('waterline');

var imagesCollection = Waterline.Collection.extend({
  identity: 'images',
  connection: 'default',
  migrate: 'safe',
  attributes: {
    /** @type {Item} item this image corresponds to */
    item: Waterline.isA('items'),

    /** @type {String} url for a thumbnail image */
    thumbnail_url: 'string',

    /** @type {String} url for the (larger) main image */
    main_image_url: 'string'
  }
})

module.exports = imagesCollection;
