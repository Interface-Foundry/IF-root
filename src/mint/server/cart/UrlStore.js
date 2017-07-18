const Store = require('./Store')
const scrape = require('../scraper/scrape_convert')
const Invoice = require('../payments/Invoice')

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
    this.global_direct = true
  }

  getSearchType () {
    return 'urlSearch'
  }

  async urlSearch (options) {
    var uri = options.text
    // make sure this is a url from the right merchant
    if (!uri || !uri.match(new RegExp(this.domain))) {
      throw new Error(`Can only handle uris from "${this.domain}" but got "${uri}"`)
    }
    // get tentative item data from the scraper
    // uri, user country, user locale, store country, domain
    var itemData = await scrape(uri, options.user_country, options.user_locale, this.country, this.domain)
    return itemData
  }

  async processSearchItems (itemData) {
    logging.info('process search items called')

    //we're getting an array from the generic search and will never process more than one item
    var itemData = itemData[0]
    delete itemData.domain
    delete itemData.user

    // flag this item as unverified, so the front-end will display a form
    itemData.verified = false;

    // create options
    var options = []

    if (itemData.options) {
      // because apparently async/await doesn't work with HoF
      for (var i = 0; i < itemData.options.length; i++) {
        // logging.info('new option')
        var option = itemData.options[i]
        // logging.info('OPTION:', option) //the
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
        var opt = await db.ItemOptions.create(option)
        opt.original_name = original_name.id
        opt.original_description = original_description.id
        await opt.save()
        options.push(opt)
      }

      delete itemData.options
    }
    logging.info('created options')
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
    itemData.original_price.fx_rate = itemData.original_price.fx_rate[itemData.original_price.fx_to]
    var originalPrice = await db.Conversions.create(itemData.original_price)
    originalPrice.converted_value = itemData.price * 1.0
    delete itemData.original_price
    await originalPrice.save()
    if (!Number(itemData.price)) {
      delete itemData.price
    }

    //create item & associate it w details objects
    var item = await db.Items.create(itemData)
    item.original_name = itemName.id
    item.original_description = itemDescription.id
    item.original_price = originalPrice.id
    options.map(op => {
      item.options.add(op.id)
    })
    await item.save()
    logging.info('about to create item')
    item = await db.Items.findOne({id: item.id}).populate('options').populate('original_description').populate('original_price')

    return [item];
  }

  async checkout (cart) {
    logging.info('checkout called')
    // var cart = await Cart.GetById()

    // Calculate cart total
    var total = 0;
    cart.items.map(function (item) {
      total += (Number(item.price) * Number(item.quantity || 1));
    });
    cart.subtotal = (Math.round(total * 100))/100
    await cart.save()

    // Create invoice
    var invoice = await Invoice.CreateByCartId(cart.id)
    // Send out collection email
    await invoice.sendCollectionEmail()
    return invoice
  }

  sync (items) {
    return {}
  }

  updateCart(cart_id, newCart) {
    return
  }
}

module.exports = UrlStore
