require('co-mocha')
var _ = require('lodash')
var chai = require('chai')
var expect = require('chai').expect
var chaiHttp = require('chai-http');

require('../../src/db/')

var app

describe('testing for kip pay', () => {
  before('set up kip pay and payments', () => {
    chai.should()
    chai.use(chaiHttp)
    // actual app
    app = require('../../src/payments/kip_pay.js').kipPay
    // create fake card and team
  })

  after('remove payments and etc', () => {

    // delete all the fake payments
    db.Payment.remove({'order.team_id': 'TEST_ING'})
  })

  it('hit /charge with new card', function * () {

    var res = yield chai.request(app).post('/charge').send({
      '_id': '_testing',
      'kip_token': 'mooseLogicalthirteen$*optimumNimble!Cake',
      'active': true,
      'team_id': 'TEST_ING',
      'chosen_location': {
        'addr': {
          'address_1': '902 Broadway Ave',
          'address_2': 'Apt 5',
          'city': 'New York City',
          'state': 'NY',
          'zip_code': '10010',
          'coordinates': []
        },
        'phone_number': '+15555555555',
        'special_instructions': 'extra something'
      },
      'time_started': Date.now(),
      'convo_initiater': 'TEST_USER_123',
      'chosen_restaurant': 'FAKE_RESTAURANT',
      'guest_token': 'FAKE_GUEST_TOKEN',
      'order': {
        'total': 36.30 * 100,
        'tip': 5.00,
        'order_type': `delivery`
      }
    })
    res = JSON.parse(res.res.text)
    expect(res).to.have.property('newAcct')
    expect(res).to.have.property('processing')
    expect(res).to.have.property('url')
    expect(res).to.have.property('token')
  })

  it.skip('hit /charge with previously used card', function * () {

    var res = yield chai.request(kipPay).post('/charge').send({
      '_id': '_testing',
      'kip_token': 'mooseLogicalthirteen$*optimumNimble!Cake',
      'active': true,
      'team_id': 'TEST_ING',
      'chosen_location': {
        'addr': {
          'address_1': '902 Broadway Ave',
          'address_2': 'Apt 5',
          'city': 'New York City',
          'state': 'NY',
          'zip_code': '10010',
          'coordinates': []
        },
        'phone_number': '+15555555555',
        'special_instructions': 'extra something'
      },
      'time_started': Date.now(),
      'convo_initiater': 'TEST_USER_123',
      'chosen_restaurant': 'FAKE_RESTAURANT',
      'guest_token': 'FAKE_GUEST_TOKEN',
      'order': {
        'total': 36.30 * 100,
        'tip': 5.00,
        'order_type': `delivery`
      },
      'saved_card': {
        'vendor': 'VISA',
        'customer_id': '123456',
        'card_id': card.card.card_id
      }
    })
    res = JSON.parse(res.res.text)
    expect(res).to.have.property('newAcct')
    expect(res).to.have.property('processing')
    expect(res).to.have.property('url')
  })

})

