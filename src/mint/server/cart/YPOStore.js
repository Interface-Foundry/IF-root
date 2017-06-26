const Store = require('./Store')
const _ = require('lodash')
const xml2js = require('xml2js')
const fs = require('fs')
const path = require('path')
const ypoConstants = require('./ypo_constants')
const LRU = require('lru-cache')

var db
const dbReady = require('../../db')
dbReady.then((models) => {
  db = models
})

/**
 * YPOStore class to build a ypo store
 * @type {YPOStore}
 */
class YPOStore extends Store {
  constructor() {
    super('YPO (GB)')
    this.locale = 'GB'
  }

  /**
   * returns the type of search
   * @param  {Object}  options the search options
   */
  getSearchType(options) {
    if (_.get(options, 'category')) {
      return 'categorySearch'
    } else if (options.text && options.text.match(/\b[a-zA-Z0-9]{1}[0-9]{5}\b/)) {
      return 'catalogLookup'
    } else {
      return 'textSearch'
    }
  }

  /**
   * Return an array with one amazonItem that corresponds to the url
   * @param  {Object} options search options, text = url
   * @return {[amazonItem]}         the amazon item response
   */
  async categorySearch(options) {
    const category = options.category
    const items = await db.YpoInventoryItems.find({category_2: category})
    logging.info('options.page', options.page)
      .skip(10 * (options.page ? options.page - 1 : 1))
      .limit(10)

    return items
  }

  /**
   * Return an array with one item that corresponds to the asin
   * @param  {Object} options search options, text = asin
   * @return {[amazonItem]}         the amazon item response for the asin
   */
  async catalogLookup(options) {
    const itemCode = options.text.match(/\b[a-zA-Z0-9]{1}[0-9]{5}\b/)[0]
    const item = await db.YpoInventoryItems.findOne({item_code: itemCode})
    return item
  }

  /**
  * Text Search
  * @param  {Object} options {text: "search string", page: 1}
  * @return {[type]}         Promise for Array
  */
  async textSearch(options) {
    // get a raw db connection to do a text index search
    var ypoRawCollection = await new Promise((resolve, reject) => {
      db.YpoInventoryItems.native((e, r) => e ? reject(e) : resolve(r))
    })

    // Query mongodb using the native connection, which allows text index search
    var ypoItems = await ypoRawCollection.find({
        $text: {
          $search: `\"${options.text}\"`
        }
      },
      {
        createdAt: false,
        updatedAt: false
      })
      .limit(10)
      .skip(10 * (options.page - 1))
      .toArray()
    return ypoItems
  }

  /**
  * Post-process search items, in this case turning amazonItems into db.Item instances.
  * @param  {[type]}  items [description]
  * @return {Promise}       [description]
  */
  async processSearchItems(amazonItems) {
    const items = await Promise.all(amazonItems.map(createYpoItem))
    return items
  }

  async checkout(cart, req, res) {
    const leader = await db.UserAccounts.findOne({id: cart.leader})
    const address = await db.Addresses.findOne({user_account: leader.id})
    let cartFinal = {
      items: cart.items.map(item => {
        return {
          'store': item.store,
          'name': item.name,
          'code': item.asin,
          'price': item.price,
          'quantity': item.quantity,
          'cart': cart.id
        }
      }),
      name: cart.name,
      cart_id: cart.id,
      ordered_by: {
        'username': leader.name || leader.email_address.split('@')[0],
        'email': leader.email_address,
        'orderedAt': (new Date()).toString()
      },
      ypo_delivery_details: {
        'account_number': leader.account_number,
        'account_name': leader.account_name,
        'address_1': address.line_1 || '',
        'address_2': address.line_1 || '',
        'town': address.city,
        'region': address.state,
        'postcode': address.zip,
        'delivery_message': address.delivery_message,
        'voucher_code': leader.ypo_voucher_code
      }
    }
    const builder = new xml2js.Builder()
    const xml = builder.buildObject(cartFinal)
    res.set('Content-Type', 'text/xml');
    return res.send(xml)
  }
}

function createYpoItem (item) {
  delete item.id
  delete item._id
  return db.Items.create({
    store: 'ypo',
    name: item.name,
    asin: item.item_code.toString(),
    description: item.description,
    price: item.price,
    thumbnail_url: item.image_url,
    main_image_url: item.image_url
  })
}

module.exports = YPOStore
