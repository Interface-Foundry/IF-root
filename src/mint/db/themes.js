var Waterline = require('waterline');

var themesCollection = Waterline.Collection.extend({
  identity: 'themes',
  connection: 'default',
  migrate: 'safe',
  attributes: {

    /**
     * The name of the theme
     * @type {String}
     */
    name: 'string',

    /**
     * The color associated with the theme
     * @type {String}
     */
    color: 'string'
  }
});

module.exports = themesCollection;
