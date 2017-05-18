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
    name: 'string'

  }
});

module.exports = themesCollection;
