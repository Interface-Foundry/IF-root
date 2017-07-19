var Waterline = require('waterline')

var rawHtmlCollection = Waterline.Collection.extend({
  identity: 'raw_html',
  connection: 'default',
  migrate: 'safe',
  attributes: {

    /** original html scraped from wherever */
    raw_html: {
      type: 'text'
    },

    /** original url we scraped from */
    original_url: {
      type: 'string'
    },

    /** domain of the merchant we are scraping */
    domain: {
      type: 'string'
    },

    /** item created in the db based on the scraping */
    item: Waterline.isA('items')
  }
})

module.exports = rawHtmlCollection
