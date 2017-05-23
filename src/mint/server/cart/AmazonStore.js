const Store = require('./Store')
const co = require('co')

class AmazonStore extends Store {
  constructor(locale) {
    super(`Amazon (${locale})`)
    this.locale = locale
  }

  /**
   * Text Search
   * @param  {Object} options {text: "search string", page: 1}
   * @return {[type]}         Promise for Array
   */
  textSearch(options) {
    // First call super to some basic stuff like logging and setting default params
    super.textSearch(options)

    // now perform the amazon search asynchronously
    return co(function * () {
      return [
        {name: 'Sunscreen', price: '15.00'},
        {name: 'Generic Sunscreen', price: '14.00'}
      ]
    }).then(items => super.cleanSearchResults(items)) // when items are ready, we can call some common function to clean them
  }
}

module.exports = AmazonStore
