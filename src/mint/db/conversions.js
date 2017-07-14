var Waterline = require('waterline')

/** currency conversion events */
var conversionsCollection = Waterline.Collection.extend({
  identity: 'conversions',
  connection: 'default',
  migrate: 'safe',
  attributes: {

    /** @type {float} value we've converted from */
    value: 'float',

    /** @type {float} value we've converted to */
    converted_value: 'float',

    /** @type {float} original currency type */
    type: 'string',

    /** @type {float} foreign exchange rate */
    fx_rate: 'float',

    /** @type {float} fx rate source, i.e. fixer.io */
    fx_rate_src: 'string',

    /** @type {date} date of conversion */
    fx_on: 'date',

    /** @type {float} currency type we've converted to */
    fx_to: 'string',

  }
})

module.exports = conversionsCollection
