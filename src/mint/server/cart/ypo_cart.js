var db
const dbReady = require('../../db')
const xml2js = require('xml2js')

dbReady.then((models) => { db = models })


function getCart(argument) {
    // body...
}

function syncCart(argument) {
    // body...
}



function removeItemFromCart(argument) {
    // body...
}

function clearCart(argument) {
    // body...
}


/**
 * creat the xml stuff for a cart
 *
 * @param      {<type>}  cartId  The cartesian identifier
 */
module.exports.checkoutCart = function * (cartId) {
  const builder = new xml2js.Builder()
  let cart = yield db.Carts.findOne({_id: cartId})
  const xml = builder.buildObject(cart)
  return xml
}


/**
 * çreates item that can be generalized to add to cart
 *
 * @param      {item id}  the item id for ypo item
 */
module.exports.addItem = function * (itemId) {
  let item
  if (itemId.includes('ypo.co.uk')) {
    itemId = itemId.match(/[0-9]{6}/)[0]
    item = yield db.YpoInventoryItems.findOne({item_code: itemId})
  } else {
    item = yield db.YpoInventoryItems.findOne({_id: itemId})
  }
  return item
}

/**
 * get info for an item based on description
 *
 * @param      {<type>}   query   The query
 * @return     {Promise}  { description_of_the_return_value }
 */
module.exports.itemPreview = function * (query) {
  const items = yield new Promise((resolve, reject) => {
    db.YpoInventoryItems.native((err, collection) => {
      if (err) reject(err)
      else {
        collection.find({
          $text: {
            $search: `\"${query}\"`
          }
        }, {
          createdAt: false,
          updatedAt: false
        })
        .limit(10)
        .toArray((err, results) => {
          if (err) reject(err)
          else resolve(results)
        });
      }
    })
  })
  return items
}

/**
 * Creates a cartesian.
 *
 * @param      {<type>}  argument  The argument
 * example out put
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
module.exports.createCart = function * (argument) {
  // body
}

