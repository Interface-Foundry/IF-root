const Store = require('./Store')
const _ = require('lodash')
const xml2js = require('xml2js')
const fs = require('fs')
const path = require('path')
const ypoConstants = require('./ypo_constants')
const LRU = require('lru-cache')
const soap = require('soap')
const svcUrl11 = 'https://edigateway-test.ypo.co.uk/EdiServiceSoap11/WebXmlDataServiceLayer.YpoService.asmx'
const svcUrl12 = 'https://edigateway-test.ypo.co.uk/EdiService/WcfXmlDataServiceLibrary.YpoService.svc'
const username = 'kip'
const password = 'K1p0rdering'
const logging = require('../../../logging.js')

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
    // first check if there is a cateogry that matches the search query
    var matchedCategory = ypoConstants.categories.filter(c => c.category === options.text)
    if (matchedCategory.length === 1) {
      options.category = matchedCategory[0].category
    }

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
      .skip(10 * (options.page ? options.page - 1 : 1))
      .limit(10)

    logging.info('options.page', options.page)

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
      .skip(10 * (options.page ? options.page - 1 : 1))
      .toArray()
    logging.info('ypoItems', ypoItems)
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

  async checkout(cart) {
    if (cart.locked) {
      return {
        ok: false,
        redirect: `/cart/${cart.id}?toast="Order submitted successfully"&status=success`,
        message: 'Order already submitted'
      }
    }

    if (typeof cart.leader === 'object') {
      var leader = cart.leader
    } else if (typeof cart.leader === 'string') {
      leader = await db.UserAccounts.findOne({id: cart.leader})
    }
    const address = await db.Addresses.findOne({user_account: leader.id})

    const itemsXML = cart.items.map(item => {
        return `<item>
            <store>YPO</store>
            <code>${item.code}</code>
            <quantity>${item.quantity}</quantity>
        </item>`
    })

    const cartXML = `
    <cart>
      <name>${cart.name}</name>
      <items>
        ${itemsXML}
      </items>
      <orderedBy>
          <username>${leader.name}</username>
          <email>${leader.email}</email>
          <orderedAt>${new Date().toISOString()}</orderedAt>
      </orderedBy>
      <order_number>${cart.order_number}</order_number>
      <delivery_details>
          <account_number>${cart.account_number}</account_number>
          <delivery_message>${cart.delivery_message}</delivery_message>
          <voucher_code>${cart.voucher_code}</voucher_code>
      </delivery_details>
    </cart>`.trim()

    // name = kip cart name
    // code = the product code from YPO inventory
    // username = kip username of order submitter
    // email = email of order submitter
    //
    // order_number = this field will be optional on kip front-end. if they don't fill it in, we need to generate an order number to send to YPO
    // account_number = this is a required field for user to fill in, we can't process order without it
    // delivery_message = optional text field
    // voucher_code = optional field

    await new Promise((resolve, reject) => {
      soap.createClient(svcUrl11 + '?WSDL', {
        forceSoap12Headers: false
      }, function(err, client) {
        if (err) {
          return reject(err)
        }

        const args = {
          CustomerKey: username,
          Password: password,
          cXmlOrder: cartXML
        }

        client.SendOrderToYpo(args, function(err, result) {
          if (err) {
            return reject(err)
          }

          console.log(result)
          resolve({
            ok: true,
            message: 'Order submitted successfully'
          })
        });
      })
    });

    await super.checkout(cart)

    return {
      ok: true,
      redirect: `/cart/${cart.id}?toast="Order submitted successfully"&status=success`,
      message: 'Order submitted successfully'
    }
  }
}

function createYpoItem (item) {
  logging.info('create YPO item called')
  delete item.id
  delete item._id
  return db.Items.create({
    store: 'YPO',
    name: item.name,
    asin: item.item_code.toString(),
    description: item.description,
    price: item.price,
    thumbnail_url: item.image_url,
    main_image_url: item.image_url
  })
}

module.exports = YPOStore
