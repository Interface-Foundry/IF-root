const co = require('co')
const assert = require('assert')
require('should')

const ypo = require('../server/cart/ypo_cart')

/**
 * We will use the db to circumvent the whole email checking process
 */
var db
const dbReady = require('../db')
dbReady.then((models) => { db = models }).catch(e => console.error(e))

describe('ypo cart', () => {
  before(() => dbReady)

  it('itemPreview', () => co(function * () {
    var items = yield ypo.itemPreview('notebooks')
    var example = {
      store: 'ypo',
      name: 'Europa Notemakers',
      asin: '131268',
      description: 'Pressboard covers in assorted colours 120 perforated pages of 90gsm paper with 8mm ruling. A4 - Pack of 10 ',
      price: 16.3,
      thumbnail_url: 'http://dl.ypo.co.uk/product_images/131268.jpg',
      main_image_url: 'http://dl.ypo.co.uk/product_images/131268.jpg',
      quantity: 1,
      locked: false,
      id: '3b7b6238-df74-4e23-addb-1303c64d1a9b'
    }
    items.map(i => {
      Object.keys(example).map(k => {
        assert.equal(typeof i[k], typeof example[k], 'Expected ' + k + ' to be ' + typeof example[k])
      })
    })
  }))
})
