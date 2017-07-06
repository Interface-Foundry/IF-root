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

  async urlSearch (options) {
    logging.info('UrlStore urlSearch called')
    const uri = options.text
    // make sure this is a url from the right merchant
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }

    //TODO check to see if we've already scraped, verified, and stored this item

    // get tentative item data from the scraper
    const itemData = await UrlScraper(uri)

    logging.info('performed "scraping"')
    logging.info(itemData)

    //TODO: create options; delete off data
    //TODO: create item
    //TODO: associate item with options
    //TODO: associate HTML with item [should already work the other way?]

    //create an item in the db and return it
    // const item = await db.Items.create(itemData)
    return
  }

  async processSearchItems () {
    //TODO, I assume -- or, the front-end can just call update
  }
}

module.exports = UrlStore

//dummy url scraper for testing
//options: { // hard-coded for now; literally dw about it
//  user_country: 'US',
//  user_locale: 'US'
//}
async function UrlScraper (url, options) {
  return {
    store: 'Muji',
    original_link: 'www.google.com',
    quantity: 1,
    description: 'small toy cement mixer for children ages 6-10',
    price: 6,
    options: [{
      name: 'option one',
      available: true
    }, {
      name: 'option two',
      available: false
    }],
    raw_html: '787998idnumber342342'
  }
}

module.exports = UrlStore
