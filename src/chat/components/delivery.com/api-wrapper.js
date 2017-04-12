var _ = require('lodash')
var co = require('co')
var fs = require('fs')
var request = require('request-promise')
var utils = require('./utils')
var address_utils = require('./address_utils')
var client_id = 'ZTM0ZmNjOWRhNGMyNzkyYmI5NWVhMmM1ZmU2Njg3M2E3'

var defaultParams = {}

defaultParams.searchNearby = {
  pickup: false,
  addr: ''
}

function * getGuestToken () {
  var token = yield request({url: `https://api.delivery.com/customer/auth/guest?client_id=${client_id}`, json: true})
  return token['Guest-Token']
}

module.exports.createCartForSession = function * (session) {
  session.guest_token = yield getGuestToken()
  var opts = {
    'method': `POST`,
    'uri': `https://api.delivery.com/customer/cart/${session.chosen_restaurant.id}`,
    'headers': {'Guest-Token': session.guest_token},
    'json': true,
    'body': {
      'client_id': client_id,
      'order_type': `delivery`,
      'instructions': session.instructions || '',
      'items': session.cart.filter(i => i.added_to_cart === true).map(i => i.item)
    }
  }
  session.delivery_post = opts
  session.markModified('delivery_post')
  try {
    yield session.save()
  } catch (err) {
    logging.error('error while trying to save session or something for admin cart', err, session.delivery_post)
  }
  try {
    var response = yield request(opts)
    logging.info('got cart from delivery.com')
    return response
  } catch (err) {
    session.delivery_error = JSON.stringify(err.error.message)
    yield session.save()
    logging.error('error submitting to delivery.com', err.error)
    return null
  }
}

module.exports.searchNearby = function * (params) {
  params = _.merge({}, defaultParams.searchNearby, params)
  logging.info('searching delivery.com for restaurants with params', params)

  try {
    var allNearby = yield request({
      url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`,
      json: true
    })
  } catch (err) {
    // possible errors: 'invalid_address',
    logging.error('error with address search for address')
    if (_.get(err, 'message[0].code') === 'invalid_address') {
      // invalid address, have user try again
      return 'invalid_address'
    } else {
      //
      return 'address_error'
    }
  }

  if (allNearby.merchants === undefined) {
    params.addr = yield address_utils.cleanAddress(params.addr)
    try {
      allNearby = yield request({
        url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`,
        json: true
      })
    } catch (err) {
      if (_.get(err, 'error.code') === 'ENOTFOUND') {
        logging.error('delivery.com api is down, or returned no results for specified address...')
        return 'address_error'
      }
    }
  }
  // make sure we have all the merchants in the db
  saveMerchants(allNearby.merchants)

  if (params.q) {
    allNearby.merchants = allNearby.merchants.filter(r => {
      return JSON.stringify(r).match(new RegExp(params.q, 'i'))
    })
  }

  return allNearby
}

var definitelyExistingMerchants = []
function saveMerchants (merchants) {
  co(function * () {
    for (var i = 0; i < merchants.length; i++) {
      if (definitelyExistingMerchants.indexOf(merchants[i].id) >= 0) {
        continue
      }
      var m = yield db.Merchants.findOne({
        id: merchants[i].id
      }).select('id').exec()
      if (!m) {
        logging.info('saving new merchant %s', merchants[i].summary.name)
        m = new db.Merchant({
          id: merchants[i].id,
          data: merchants[i]
        })
        yield m.save()
        logging.info('saved')
        definitelyExistingMerchants.push(m.id)
      }
    }
  }).catch(kip.err)
}

//
// get all the menu items for a merchant
//
module.exports.getMenu = function * (merchant_id) {
  logging.info('getting menu for merchant id', merchant_id)
  // var data = yield db.Menus.findOne({merchant_id: merchant_id})
  var data = yield request({
    url: `https://api.delivery.com/merchant/${merchant_id}/menu?client_id=${client_id}`,
    json: true
  })
  return data
}

module.exports.getMerchant = function * (merchant_id) {
  var url = `https://api.delivery.com/merchant/${merchant_id}/?client_id=${client_id}`
  var merchantInfo = yield request({url: `https://api.delivery.com/merchant/${merchant_id}/?client_id=${client_id}`, json: true})
    kip.debug('getting merchant info for merchant id', merchant_id, url)

  return merchantInfo.merchant
}

// retrieves all the options for a menu item.
// flattens out the options to be just one layer deep.
function get_options (item) {
  var children = item.children || []
  return children.map(c => {
    return {
      name: c.name,
      required: c.min_selection > 0,
      values: c.children.map(o => {
        return {
          name: o.name,
          price: o.price,
          id: o.id
        }
      })
    }
  })
}


if (!module.parent) {
  // wow such test
  co(function * () {
    // var menu = yield module.exports.getMenu(64549)
    // console.log(JSON.stringify(menu, null, 2))
    // return
    var addr = '21 Essex St 10002'
    var results = yield module.exports.searchNearby({
      pickup: false,
      addr: addr
    })
  // console.log('writing file')
  // fs.writeFileSync('extra/results.json', JSON.stringify(results), 'utf-8')
  // console.log(results)
  }).catch(kip.err)
}
