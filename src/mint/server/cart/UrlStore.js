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

    // create options
    // because apparently async/await doesn't work with HoF
    for (var i = 0; i < itemData.options.length; i++) {
      var option = itemData.options[i]
      // create translations
      var original_name = await db.Translations.create(option.original_name)
      original_name.translated_value = option.name
      await original_name.save()
      delete option.original_name

      var original_description = await db.Translations.create(option.original_description)
      original_description.translated_value = option.description
      await original_description.save()
      delete option.original_description

      // create option
      // logging.info('OPTION', option)
      var opt = await db.ItemOptions.create(option)
      // logging.info('OPT', opt)
      opt.original_name = original_name.id
      opt.original_description = original_description.id
      await opt.save()
      return opt
    }

    logging.info('OPTIONS:', options)
    delete itemData.options

    // create the item translations
    var itemName  = await db.Translations.create(itemData.original_name)
    itemName.translated_value = itemData.name
    await itemName.save()
    delete itemData.original_name

    var itemDescription  = await db.Translations.create(itemData.original_description)
    itemDescription.translated_value = itemData.description
    await itemDescription.save()
    delete itemData.original_description

    // create conversion
    var originalPrice = await db.Conversions.create(itemData.original_price)
    originalPrice.converted_value = itemData.price
    await originalPrice.save()
    delete itemData.original_price

    //create item & associate it w details objects
    var item = await db.Items.create(itemData)
    item.original_name = itemName.id
    item.original_description = itemDescription.id
    item.original_price = originalPrice.id
    await item.save()

    // return item
    return []
  }

  async processSearchItems () {
    //TODO, I assume -- or, the front-end can just call update
  }
}

module.exports = UrlStore

//dummy url scraper for testing
async function UrlScraper (url, options) {
  return {
  /** @type {string} original link posted */
  original_link: 'string',

  raw_html_id: 'string', //relational DB id for the saved raw html

  //translated product name into user language
  name: 'string',

  //non-translated product name from original site
  original_name: {
    type:'string', //language locale, i.e. ko_KR
    value:'string', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on:'date', //date of translation
    translate_to:'string' //i.e. translated to en-us locale
  },

  /** generalized ASIN-style unique ID for the product**/
  product_id: 'string', //i.e. muji: 4549738522515

  /** some product codes are options (i.e. blue size 10) inside parent product (i.e. shirt). default it repeats product_code **/
  parent_id: 'string', //i.e. muji: 38522515

  /** translated description text */
  description: 'string',

  original_description: {
    type:'string', //language locale, i.e. ko_KR
    value:'string', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on:'date', //date of translation
    translate_to:'string' //i.e. translated to en-us locale
  },

  //currency converted price into user currency
  price: 'float',

  //non-currency converted price from original site
  original_price: {
    type:'string', //currency type, i.e. SKW
    value:'float', //original value in SKW
    fx_rate:'float', // foreign exchange rate
    fx_rate_src:'string', //fx rate source, i.e. fixer.io
    fx_on:'date', //date of conversion
    fx_to:'string' //i.e. converted to USD
  },

  /** @type {string} product small image */
  thumbnail_url: 'string',

  /** @type {string} product larger image */
  main_image_url: 'string',

  options: [{
    type:'string', //color, size, etc.
    name:'string',
    original_name:{
      type:'string', //language locale, i.e. ko_KR
      value:'string', //original text in ko_KR
      translate_src:'string', // source of translation (i.e. GC Translation API)
      translate_on: new Date(), //date of translation
      translate_to:'string' //i.e. translated to en-us locale
    },
    description:'string',
    original_description:{
      type:'string', //language locale, i.e. ko_KR
      value:'string', //original text in ko_KR
      translate_src:'string', // source of translation (i.e. GC Translation API)
      translate_on: new Date(), //date of translation
      translate_to:'string' //i.e. translated to en-us locale
    },
    url:'string',
    product_id:'string',
    parent_id:'string',
    price_difference: 1.11,
    thumbnail_url:'string',
    main_image_url:'string',
    available: true,
    quantity_left: 666,
    selected: true
  }]}
}

module.exports = UrlStore
