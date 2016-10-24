require('kip')
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
      'instructions': '',
      'items': _.map(session.cart, 'item')
    }
  }

  try {
    var response = yield request(opts)
    return response
  } catch (e) {
    logging.error('error lol', e)
  }
}


module.exports.searchNearby = function * (params) {
  params = _.merge({}, defaultParams.searchNearby, params)
  logging.info('searching delivery.com for restaurants with params', params)
  try {
    var allNearby = yield request({url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`, json: true})
  } catch(err) {
    if (_.get(err,'error.code') == 'ENOTFOUND') kip.debug('delivery.com api is down, or returned no results for specified address...')
    params.addr = yield address_utils.cleanAddress(params.addr);
    kip.debug('api-wrapper 86: searchNearBy err: ', err,'cleaned string: ', params.addr)
    try {
      var allNearby = yield request({url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`, json: true})
    } catch(err) {
      if (_.get(err,'error.code') == 'ENOTFOUND') kip.debug('delivery.com api is down, or returned no results for specified address...')
      return false
    }
  }
   if ((allNearby.merchants == undefined)) {
    params.addr = yield address_utils.cleanAddress(params.addr);
     try {
      var allNearby = yield request({url: `https://api.delivery.com/merchant/search/delivery?client_id=${client_id}&address=${params.addr}&merchant_type=R`, json: true})
    } catch(err) {
      if (_.get(err,'error.code') == 'ENOTFOUND') kip.debug('delivery.com api is down, or returned no results for specified address...')
      return false
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
        console.log('saving new merchant', merchants[i].summary.name)
        m = new db.Merchant({
          id: merchants[i].id,
          data: merchants[i]
        })
        yield m.save()
        console.log('saved')
        definitelyExistingMerchants.push(m.id)
      }
    }
  }).catch(kip.err)
}

//
// get all the menu items for a merchant
//
module.exports.getMenu = function * (merchant_id) {
  kip.debug('getting menu for merchant id', merchant_id)
  // var data = yield db.Menus.findOne({merchant_id: merchant_id})
  var data = yield request({url: `https://api.delivery.com/merchant/${merchant_id}/menu?client_id=${client_id}`, json: true})
  var menu = data.menu; // should i return this or a better data model?
  return unfuck_menu(menu)
}

module.exports.getMerchant = function * (merchant_id) {
  kip.debug('getting merchant info for merchant id', merchant_id)
  var merchantInfo = yield request({url: `https://api.delivery.com/merchant/${merchant_id}/?client_id=${client_id}`, json: true})
  return merchantInfo.merchant
}

/*
  okay so the menu format returned from delivery.com is suuuuuuper complicated.
  it has like a gazillion menus attached. like lunch menu, dinner menu, whatever.
  really we just want to group things into categories. lunch is just a category, not a different menu

  ALSO there's like a million levels of depth in the menu items themselves, like option after option after option.
  i just want to flatten all these options out. because like seriously. so many levels of choice.
  i'm just trying to eat some food.
*/
function unfuck_menu (menu) {
  return menu
  // first flatten out all the menus so lunch just becomes part of the lunch category not a separate menu
  console.log(menu)
  var categories = menu.reduce((categories, m) => {
    return categories.concat(m.children.map(i => i.name))
  }, [])

  var items = menu.reduce((categories, m) => {
    return categories.concat(m.children.map(i => {
      return i.children.map(i => {
        return {
          name: i.name,
          description: i.description,
          price: i.price,
          id: i.id,
          options: get_options(i)
        }
      })
    }))
  }, []).reduce((list, items) => {
    return list.concat(items)
  }, [])

  kip.debug('categories', categories)
  kip.debug('returning unfucked menu')

  return {
    categories: categories,
    items: items
  }
}

// retrieves all the options for a menu item.
// flattens out the options to be just one layer deep.
function get_options (item) {
  var children = item.children || []
  return children.map(c => {
    // console.log(JSON.stringify(c, null, 2))
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


// var definitelyExistingLocations = []
// function saveLocations (locations) {
//   co(function * () {
//     for (var i = 0; i < locations.length; i++) {
//       if (definitelyExistingLocations.indexOf(locations[i].id) >= 0) {
//         continue
//       }
//       var m = yield db.Merchants.findOne({
//         id: merchants[i].id
//       }).select('id').exec()
//       if (!m) {
//         console.log('saving new merchant', merchants[i].summary.name)
//         m = new db.Merchant({
//           id: merchants[i].id,
//           data: merchants[i]
//         })
//         yield m.save()
//         console.log('saved')
//         definitelyExistingMerchants.push(m.id)
//       }
//     }
//   }).catch(kip.err)
// }




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
