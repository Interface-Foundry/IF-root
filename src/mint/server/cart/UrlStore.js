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
  constructor(name, domain, locale) {
    super(name)
    this.locale = locale
    this.domain = domain
  }

  getSearchType () {
    return 'urlSearch'
  }

  async urlSearch () {
    const uri = options.text
    // make sure this is a url from the right merchant
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }

    //TODO check to see if we've already scraped, verified, and stored this item

    // get tentative item data from the scraper
    const itemData = await UrlScraper(uri)

    //create an item in the db and return it
    return await db.Items.create(itemData)
  }

  async processSearchItems () {
    //TODO, I assume
  }
}

module.exports = UrlStore

//dummy url scraper for testing
async function UrlScraper (url) {
  return {
    store: 'Muji',
    original_link: 'www.google.com',
    quantity: 1,
    description: 'small toy cement mixer for children ages 6-10',
    price: 6
  }
}
