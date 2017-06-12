const CreateCart = require('./CartFactory').CreateCart
const GetCart = require('./CartFactory').GetCart
const GetStore = require('./StoreFactory').GetStore
const co = require('co')

co(function * () {
  //
  // Example store usage
  //
  var store = GetStore({store: 'amazon_us'})
  var searchResults = yield store.search({
    text: 'vintage paperweight'
  })
  console.log('example search results:', searchResults)


  //
  // Example Cart usage
  //

  // create am amazon us cart, but the user is in korea (so display totals in korean won or whatever)
  var cart = yield CreateCart({
    store: 'amazon_us', // tells the factory to create an AmazonCart
    user_locale: 'KR' // all carts need a user_locale, which can be different than the locale that a store is usually available from
  })

  // or if you are fetching a cart
  var cart = yield GetCart('12345')

  // example looking for stuff
  searchResults = yield cart.store.search({
    text: 'red hat satire'
  })
  console.log('example search results:', searchResults)

  yield cart.add(searchResults[0])

  console.log(cart)
}).catch(console.error.bind(console))
