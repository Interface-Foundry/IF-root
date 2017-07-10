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
  constructor(name, domain, country) {
    super(name)
    this.country = country
    this.domain = domain
  }

  getSearchType () {
    return 'urlSearch'
  }

  async urlSearch (options) {
    logging.info('optionsss', options)
    const uri = options.text
    // make sure this is a url from the right merchant
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }

    // get tentative item data from the scraper
    // uri, user country, user locale, store country, domain
    var itemData = await UrlScraper(uri, options.user_country, options.user_locale, this.country, this.domain)
    logging.info('got item data')
    return itemData
  }

  async processSearchItems (itemData) {
    logging.info('process search items called')
    // logging.info('itemdata', itemData)

    //we're getting an array from the generic search and will never process more than one item
    var itemData = itemData[0]

    // flag this item as unverified, so the front-end will display a form
    itemData.verified = false;

    // create options
    var options = []

    if (itemData.options) {
      // because apparently async/await doesn't work with HoF
      for (var i = 0; i < itemData.options.length; i++) {
        logging.info('new option')
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
        options.push(opt)
      }
      // logging.info('options:', options)

      delete itemData.options
    }

    // logging.info('original_name', itemData.original_name)
    // create the item translations
    var itemName  = await db.Translations.create(itemData.original_name)
    // var itemName = await db.Translations.create({})
    itemName.translated_value = itemData.name
    await itemName.save()
    delete itemData.original_name
    // logging.info('item name done', itemName.id)

    // logging.info('description', itemData.original_description)
    var itemDescription  = await db.Translations.create(itemData.original_description)
    // var itemDescription = await db.Translations.create({})
    itemDescription.translated_value = itemData.description
    await itemDescription.save()
    delete itemData.original_description
    // logging.info('item description done', itemDescription.id)

    // create conversion
    var originalPrice = await db.Conversions.create(itemData.original_price)
    originalPrice.converted_value = itemData.price * 1.0
    await originalPrice.save()
    delete itemData.original_price
    // logging.info('original price done', originalPrice.id)

    //create item & associate it w details objects
    var item = await db.Items.create(itemData)
    //tous les meme
    logging.info('itemName, itemDescription, originalPrice', itemName.id, itemDescription.id, originalPrice.id)
    item.original_name = itemName.id
    item.original_description = itemDescription.id
    item.original_price = originalPrice.id
    options.map(op => {
      item.options.add(op.id)
    })
    // logging.info('about to save item')
    await item.save()
    logging.info('saved item')

    item = await db.Items.findOne({id: item.id}).populate('options')

    // return item
    return [item];
  }
}

module.exports = UrlStore

//dummy url scraper for testing
async function UrlScraper (url, user_country, user_locale, store_country, domain) {
  logging.info('scraping ' + url + ' for someone in ' + user_country + ' / ' + user_locale)
  return await {
  /** @type {string} original link posted */
  original_link: 'string',

  quantity: 1,

  // raw_html: 'string', //relational DB id for the saved raw html

  //translated product name into user language
  name: 'Swatch',

  //non-translated product name from original site
  original_name: {
    type:'string', //language locale, i.e. ko_KR
    value:'the Blair Witch Projekt', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on: new Date(), //date of translation
    translate_to:'fr' //i.e. translated to en-us locale
  },

  /** generalized ASIN-style unique ID for the product**/
  product_id: '' + Math.floor(100000000 * Math.random()), //i.e. muji: 4549738522515

  /** some product codes are options (i.e. blue size 10) inside parent product (i.e. shirt). default it repeats product_code **/
  parent_id: Math.floor(Math.random() * 100000), //i.e. muji: 38522515

  /** translated description text */
  description: 'I describe this very fine item',

  original_description: {
    type:'string', //language locale, i.e. ko_KR
    value:'description', //original text in ko_KR
    translate_src:'string', // source of translation (i.e. GC Translation API)
    translate_on: new Date(), //date of translation
    translate_to:'string' //i.e. translated to en-us locale
  },

  //currency converted price into user currency
  price: 6.66,

  //non-currency converted price from original site
  original_price: {
    type:'string', //currency type, i.e. SKW
    value: 1.11, //original value in SKW
    fx_rate: 1.11, // foreign exchange rate
    fx_rate_src:'string', //fx rate source, i.e. fixer.io
    fx_on: new Date(), //date of conversion
    fx_to:'string' //i.e. converted to USD
  },

  /** @type {string} product small image */
  thumbnail_url: 'string',

  /** @type {string} product larger image */
  main_image_url: 'hi, I am an image'//,

  // options: [{
  //   type:'string', //color, size, etc.
  //   name:'string',
  //   original_name:{
  //     type:'string', //language locale, i.e. ko_KR
  //     value:'string', //original text in ko_KR
  //     translate_src:'string', // source of translation (i.e. GC Translation API)
  //     translate_on: new Date(), //date of translation
  //     translate_to:'string' //i.e. translated to en-us locale
  //   },
  //   description:'string',
  //   original_description:{
  //     type:'string', //language locale, i.e. ko_KR
  //     value:'string', //original text in ko_KR
  //     translate_src:'string', // source of translation (i.e. GC Translation API)
  //     translate_on: new Date(), //date of translation
  //     translate_to:'string' //i.e. translated to en-us locale
  //   },
  //   url:'string',
  //   product_id: Math.floor(Math.random() * 100000),
  //   parent_id: Math.floor(Math.random() * 100000),
  //   price_difference: 1.11,
  //   thumbnail_url:'string',
  //   main_image_url:'string',
  //   available: true,
  //   quantity_left: 666,
  //   selected: true
  // }]
}
}

module.exports = UrlStore
