const StoreFactory = require('../server/cart/StoreFactory')
const co = require('co')
const assert = require('assert')
require('should')
var db
const dbReady = require('../db')
dbReady.then((models) => { db = models }).catch(e => console.error(e))

var stores = [{
  skip: true,
  name: 'amazon_us',
  searches: [
    {
      skip: false,
      options: {
        text: 'https://www.amazon.com/HiLetgo-Version-NodeMCU-Internet-Development/dp/B010O1G1ES/ref=sr_1_3?ie=UTF8&qid=1490217410&sr=8-3&keywords=nodemcu'
      },
      check(results) {
        results.length.should.equal(1)
        results[0].name.should.equal('HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
      }
    },{
      skip: false,
      options: {
        text: 'shorts',
      },
      check(results) {
        results.length.should.equal(10)
      }
    },{
      skip: false,
      options: {
        text: 'B010O1G1ES'
      },
      check(results) {
        results.length.should.equal(1)
        results[0].name.should.equal('HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
      }
    },{
      options: {
        text: 'B01GF5ACUG'
      },
      check(results) {
        results.length.should.equal(1)
        results[0].name.should.equal('HiLetgo New Version NodeMCU LUA WiFi Internet ESP8266 Development')
      }
    }
  ]
}, {
  skip: false,
  name: 'ypo_uk',
  searches: [
    {
      options: {
        text: 'notebooks',
      },
      check(results) {
        results.length.should.equal(10)
      }
    },{
      options: {
        text: 'Home and Office'
      },
      check(results) {
        results.length.should.equal(10)
      }
    }
  ]
}]

/**
 * Run tests for all the stores
 */
describe('Stores', () => {
  before(() => co(function * () {
    yield dbReady
  }))

  stores.filter(store => !store.skip).map(store => {
    describe(store.name, () => {
      store.searches.filter(search => !search.skip).map(search => {
        var search_description = 'search'
        if (search.options.category) search_description += ' category:' + search.options.category
        if (search.options.text) search_description += ' text:' + search.options.text
        it(search_description, async function () {
          var storeInstance = StoreFactory.GetStore({store: store.name})
          var results = await storeInstance.search(search.options)
          search.check(results)
        })
      })
    })
  })
})
