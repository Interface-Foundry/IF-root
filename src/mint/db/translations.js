var Waterline = require('waterline')

var translationsCollection = Waterline.Collection.extend({
  identity: 'translations',
  connection: 'default',
  migrate: 'safe',
  attributes: {

    /** @type {string} language locale of the original, e.g. ko_KR */
    type: 'string',

    /** @type {text} original text in ko_KR */
    value: 'text',

    /** @type {string} source of translation (i.e. GC Translation API) */
    translate_src: 'string',

    /** @type {date} date of the translation */
    translate_on: 'date',

    /** @type {string} language locale of the translation, e.g. ko_KR */
    translate_to: 'string',

    /** @type {text} content of our the translation */
    traslated_value: 'text'
  }
})

module.exports = translationsCollection
