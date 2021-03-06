var co = require('co')
var db
const dbReady = require('../../db')
const xml2js = require('xml2js')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const ypoConstants = require('./ypo_constants')



dbReady.then((models) => { db = models })

/**
 * çreates item that can be generalized to add to cart
 *
 * @param      {item id}  the item id for ypo item
 */
module.exports.addItem = function * (itemId) {
  console.log(itemId)
  let item
  if (itemId.includes('ypo.co.uk')) {
    itemId = itemId.match(/[0-9]{6}/)[0]
    item = yield db.YpoInventoryItems.findOne({item_code: itemId})
  } else {
    item = yield db.YpoInventoryItems.findOne({_id: itemId})
  }
  return item
}

function createYpoItem (item) {
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

/**
 * get info for an item based on description
 *
 * @param      {<type>}   query   The query
 * @return     {Promise}  { description_of_the_return_value }
 */
module.exports.itemPreview = function (query, locale, page, category) {
  return co(function * () {
    // see if they pasted url or itemcode
    logging.info('looking for query: ', query, locale, page, category)

    // If the query is an exact category name, then return some number of items
    // from that category
    if (ypoConstants.categories[query]) {
      logging.info('matched ypo category: ', query)
      let items = yield db.YpoInventoryItems.find({category: query})
        .skip(10 * (page - 1))
        .limit(10)
      items = yield items.map(createYpoItem)
      return items
    } else if (query.match(/\b[a-zA-Z0-9]{1}[0-9]{5}\b/)) {
      // the query matches an id
      logging.info('matched ypo id', query)
      const itemCode = query.match(/\b[a-zA-Z0-9]{1}[0-9]{5}\b/)[0]
      item = yield db.YpoInventoryItems.findOne({item_code: itemCode})
      return yield createYpoItem(item)
    } else {
      // continue on to text search below
      logging.info('performing text search for', query)
    }

    // get a raw db connection to do a text index search
    var ypoRawCollection = yield new Promise((resolve, reject) => {
      db.YpoInventoryItems.native((e, r) => e ? reject(e) : resolve(r))
    })

    // Query mongodb using the native connection, which allows text index search
    var ypoItems = yield ypoRawCollection.find({
        $text: {
          $search: `\"${query}\"`
        }
      },
      {
        createdAt: false,
        updatedAt: false
      })
      .limit(10)
      .toArray()

    // transform the YPO catalog items into kip cart items
    items = yield ypoItems.map(createYpoItem)
    return items
  })
}

/**
 * create the xml stuff for a cart
 *
 * @param      {cart}  argument  The argument
 * example output
 * <?xml version="1.0" encoding="UTF-8" ?>
 * <cart>
 * <items>
 *     <item>
 *         <store>YPO</store>
 *         <name>A6 Homework Diary - Pack of 20</name>
 *         <code>332100</code>
 *         <price>5.75</price>
 *         <quantity>2</quantity>
 *         <original_link>https://www.ypo.co.uk/product/detail/103950</original_link>
 *         <cart>100e59657b0d</cart>
 *     </item>
 *     <item>
 *         <store>YPO</store>
 *         <name>Left Hand Radial Eye Workstation - 720(H) x 800-1200(D) x 1800mm(W)</name>
 *         <code>213415</code>
 *         <price>6.63</price>
 *         <quantity>1</quantity>
 *         <original_link>https://www.ypo.co.uk/product/detail/D20364</original_link>
 *         <cart>100e59657b0d</cart>
 *     </item>
 * </items>
 * <name>Blue Team's Basket</name>
 * <cart_id>100e59657b0d</cart_id>
 * <orderedBy>
 *     <username>alyx</username>
 *     <email>alyx@kipthis.com</email>
 *     <orderedAt>2017-05-06T17:54:37.461Z</orderedAt>
 * </orderedBy>
 * <YPO_delivery_details>
 *     <account_number>39299011</account_number>
 *     <account_name>Sheffield Springs Academy</account_name>
 *     <address_1>87 Hurlfield Road</address_1>
 *     <address_2>10th Floor</address_2>
 *     <town>Sheffield</town>
 *     <postcode>S12 2SF</postcode>
 *     <delivery_message>Please drop off supplies with Kelly +44 3069 990689</delivery_message>
 *     <voucher_code>841bEc9c</voucher_code>
 * </YPO_delivery_details>
 * </cart>
 */
module.exports.checkout = function * (cart, req, res) {
  // leader not showing up atm
  const leader = yield db.UserAccounts.findOne({id: cart.leader})
  const address = yield db.Addresses.findOne({user_account: leader.id})
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
