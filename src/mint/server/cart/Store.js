const emoji_utils = require('../utilities/emoji_utils');

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
   * Perform a search, text, cateogry, or url
   * @param  {Object} options {text: string (optional), cateogry: string (optional), page: number (optional)}
   * @return {Promise([Items])}         promise for an array of items
   */
  search(options) {
    console.log('Store search options', options)
    // set the page
    options.page = options.page || 0
    options.page = parseInt(options.page)

    // clean incoming text
    if (options.text) {
      options.text = emoji_utils(options.text.trim())
    }

    // clean incoming category
    if (options.category) {
      options.category = options.category.trim()
    }

    // figure out the type of search
    if (typeof this.getSearchType === 'function') {
      var searchType = this.getSearchType(options)
    } else {
      searchType = 'textSearch'
    }

    // make sure the class can perform that type of search
    if (typeof this[searchType] !== 'function') {
      throw new Error(`Cannot perform search of type "${searchType}" for store ${this.name}`)
    }

    // do some pre-search debug logging
    console.log(`performing ${searchType} on ${this.name} for "${options.text}" page ${options.page}`)

    // call out to the appropriate search function to perform the actual search
    return this[searchType](options)
      .then(items => {
        if (!items) {
          return []
        } else if (!(items instanceof Array)) {
          return [items]
        } else {
          return items
        }
      })
      .then(items => {
        // catch the common mistake where developers return an array of promises\
        return Promise.all(items)
      })
      .then(this.processSearchItems.bind(this)) // and some optional post-processing
      .then(items => {
        // do some post-search analytics logging
        console.log('analyitics', {
          search_options: options,
          store_name: this.name,
          number_results: items.length
        })
        return items
      })

  }

  /**
   * The default processSearchItems function does nothing, you should override
   * in your class if you need to do something for all searches. Like AmazonStore
   * uses processSearchItems to convert amazon's item schema to db item schema.
   * @param  {[Any]}  items whatever is returned from the search function
   * @return {Promise}       [description]
   */
  async processSearchItems(items) {
    return items
  }

  // async sync () {
  //
  // }
}

module.exports = Store
