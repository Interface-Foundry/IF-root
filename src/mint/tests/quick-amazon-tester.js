const StoreFactory = require('../server/cart/StoreFactory')

const store = StoreFactory.GetStore({
  store: 'Amazon',
  store_locale: 'US'
})

async function test() {
  var result = await store.search({
    text: 'https://www.amazon.com/GW-M1618-8-Fashion-Sneaker-13/dp/B01MZ2SL55?psc=1&SubscriptionId=AKIAIQWK3QCI5BOJTT5Q&tag=motorwaytoros-20&linkCode=xm2&camp=2025&creative=165953&creativeASIN=B01MZ2SL55'
  })

  console.log(result)
}

test().catch(console.error.bind(console))
