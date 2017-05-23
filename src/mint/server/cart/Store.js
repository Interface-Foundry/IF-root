/**
 * The basic Store class
 * @type {[type]}
 */
class Store {
  constructor(name) {
    console.log('initializing store ' + name)
    this.name = name
  }

  /**
   * Text Search
   * @param  {[type]} options {text: "search string", page: 1}
   * @return {[type]}         Nothing
   */
  textSearch(options) {
    // set the page
    options.page = options.page || 1

    // clean incoming text
    options.text = (options.text || '').trim()

    // do some logging
    console.log(`text search ${this.name} for "${options.text}" page ${options.page}`)
  }

  /**
   * Cleans and post-processes the search results, handling logging
   * @param  {[type]} items [description]
   * @return {[type]}       [description]
   */
  cleanSearchResults(items) {
    // asynchronously clean the items
    return Promise.resolve(items)
  }
}

module.exports = Store
