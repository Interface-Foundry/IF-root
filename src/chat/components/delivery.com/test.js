var co = require('co')
var request = require('request-promise')

var options = {
  method: 'POST',
  url: `https://api.delivery.com/customer/cart/86`,
  body: {
    'client_id': '65bec4d2e965b5dda80665adabdec5e358001fbf5b8ab2.76381520~67',
    'order_type': 'delivery',
    'instructions': 'Some instructions',
    'items': [
      {
        'option_qty': {
          '329': 1,
          '334': 1,
          '906': 1,
          '907': 1
        },
        'item_id': '410',
        'item_qty': 1,
        'instructions': '',
        'item_label': ''
      },
      {
        'option_qty': {
          '29': 1,
          '32': 1
        },
        'item_id': '24',
        'item_qty': 1,
        'instructions': '',
        'item_label': ''
      },
      {
        'option_qty': {
          '28': 1,
          '32': 1
        },
        'item_id': '24',
        'item_qty': 2,
        'instructions': '',
        'item_label': ''
      }
    ]
  },
  json: true
}

co(function * () {
  var client_id = 'brewhacks2016'
  var token = yield request({url: `https://api.delivery.com/customer/auth/guest?client_id=${client_id}`, json: true})
  console.log('using client token, ', token['Guest-Token'])
  options.body['client_id'] = token['Guest-Token']
  var resp = yield request(options)
  console.log(resp)
}).catch(function (err) {
  console.log(err)
})
