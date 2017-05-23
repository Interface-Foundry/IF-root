const CreateCart = require('./CartFactory').CreateCart
const GetCart = require('./CartFactory').GetCart
const AmazonStore = require('./AmazonStore')
const co = require('co')

//
// Example Store usage
//
const amazon_us = new AmazonStore('US')

// Example function to get the right store for a cart
function StoreFor(cart) {
  console.log(cart)
  switch (cart.store) {
    case 'amazon_us':
      return amazon_us
  }
}

co(function * () {
  //
  // Example store usage
  //
  var searchResults = yield amazon_us.textSearch({
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
  searchResults = yield StoreFor(cart).textSearch({
    text: 'red hat satire'
  })

  yield cart.add(searchResults[0])
}).catch(console.error.bind(console))
