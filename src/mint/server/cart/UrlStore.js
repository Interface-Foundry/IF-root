const Store = require('./Store')

// get the waterline mint database
var db
const dbReady = require('../../db')
dbReady.then((models) => {
  db = models
})

/**
 * UrlStore class to build a store for any retailers
 * we have not integrated with, but are just scraping URLs for
 */
class UrlStore extends Store {
  constructor(name, locale) {
    super(name)
    this.locale = locale
  }

  getSearchType () {
    return 'urlSearch'
  }

  async urlSearch () {
    //TODO make sure is actually Url
    //TODO
  }

  async processSearchItems () {
    //TODO, I assume
  }
}

module.exports = UrlStore
