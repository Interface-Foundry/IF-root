const Store = require('./Store')
const scrape = require('../scraper/scrape_convert')
logging.info('scrape', typeof(scrape))

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
    const uri = options.text
    // make sure this is a url from the right merchant
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }

    // get tentative item data from the scraper
    // uri, user country, user locale, store country, domain
    var itemData = await scrape(uri, options.user_country, options.user_locale, this.country, this.domain.slice(4))
    logging.info('itemData', itemData)
    return itemData
  }

  async processSearchItems (itemData) {
    logging.info('process search items called')
    // logging.info('itemdata', itemData)

    //we're getting an array from the generic search and will never process more than one item
    var itemData = itemData[0]
    delete itemData.domain
    delete itemData.user

    // flag this item as unverified, so the front-end will display a form
    itemData.verified = false;

    // create options
    var options = []

    // if (itemData.options) {
    //   // because apparently async/await doesn't work with HoF
    //   for (var i = 0; i < itemData.options.length; i++) {
    //     logging.info('new option')
    //     var option = itemData.options[i]
    //     // create translations
    //     var original_name = await db.Translations.create(option.original_name)
    //     original_name.translated_value = option.name
    //     await original_name.save()
    //     delete option.original_name
    //
    //     var original_description = await db.Translations.create(option.original_description)
    //     original_description.translated_value = option.description
    //     await original_description.save()
    //     delete option.original_description
    //
    //     // create option
    //     // logging.info('OPTION', option)
    //     var opt = await db.ItemOptions.create(option)
    //     // logging.info('OPT', opt)
    //     opt.original_name = original_name.id
    //     opt.original_description = original_description.id
    //     await opt.save()
    //     options.push(opt)
    //   }
    //   // logging.info('options:', options)
    //
      delete itemData.options
    // }

    logging.info('original_name', itemData.original_name)
    // create the item translations
    // var itemName  = await db.Translations.create(itemData.original_name)
    // // var itemName = await db.Translations.create({})
    // itemName.translated_value = itemData.name
    // await itemName.save()
    delete itemData.original_name
    // logging.info('item name done', itemName.id)

    // logging.info('description', itemData.original_description)
    // var itemDescription  = await db.Translations.create(itemData.original_description)
    // // var itemDescription = await db.Translations.create({})
    // itemDescription.translated_value = itemData.description
    // await itemDescription.save()
    delete itemData.original_description
    // logging.info('item description done', itemDescription.id)

    // create conversion
    // logging.info('itemData.original_price', itemData.original_price)
    // var originalPrice = await db.Conversions.create(itemData.original_price)
    // logging.info('original price', originalPrice)
    // originalPrice.converted_value = itemData.price * 1.0
    // await originalPrice.save()
    delete itemData.original_price
    // if (!Number(itemData.price)) {
      // logging.info('failed to scrape price')
      // delete itemData.price
    // }
    // logging.info('original price done', originalPrice.id)

    //create item & associate it w details objects
    logging.info('about to create the item', itemData)
    var item = await db.Items.create(itemData)
    //tous les meme
    // logging.info('itemName, itemDescription, originalPrice', itemName.id, itemDescription.id, originalPrice.id)
    // item.original_name = itemName.id
    // item.original_description = itemDescription.id
    // item.original_price = originalPrice.id <--
    // options.map(op => {
      // item.options.add(op.id)
    // })
    // logging.info('about to save item')
    await item.save()
    logging.info('saved item')

    item = await db.Items.findOne({id: item.id}).populate('options')

    // return item
    return [item];
  }
}

module.exports = UrlStore
